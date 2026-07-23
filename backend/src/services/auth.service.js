// Auth service — business logic only. Never touches req/res (that's the
// controller's job) and never calls Prisma directly (that's the
// repository's job) — this layer just orchestrates the two.

import bcrypt from "bcrypt";
import { userRepository } from "../repositories/user.repository.js";
import { refreshTokenRepository } from "../repositories/refreshToken.repository.js";
import { phoneOtpRepository } from "../repositories/phoneOtp.repository.js";
import { ApiError } from "../utils/ApiError.js";
import { signToken, verifyToken } from "../utils/jwt.js";
import { generateRefreshToken, hashRefreshToken, REFRESH_TOKEN_EXPIRES_IN_MS } from "../utils/refreshToken.js";
import { generateMfaSecret, verifyMfaCode, generateMfaQrCode } from "../utils/mfa.js";
import { generateOtp, hashOtp, OTP_EXPIRES_IN_MS, OTP_RESEND_COOLDOWN_MS, MAX_OTP_ATTEMPTS } from "../utils/otp.js";
import { smsService } from "./sms.service.js";
import { isSmsConfigured } from "../config/sms.js";

// 12 is the current recommended minimum for bcrypt (10 was the older
// default) — configurable via env in case infra constraints call for a
// different value later, without a code change.
const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;

// The MFA-pending token's own lifetime — long enough to type a 6-digit
// code, short enough that a leaked one is useless shortly after.
const MFA_PENDING_EXPIRES_IN = "5m";

// Strips passwordHash and mfaSecret (and anything else sensitive, going
// forward) before a user record is ever handed back toward a
// controller/response. mfaEnabled (just a boolean) stays — the frontend
// needs it to know whether to prompt for a code.
function sanitizeUser(user) {
  const { passwordHash, mfaSecret, ...safeUser } = user; // eslint-disable-line no-unused-vars
  return safeUser;
}

// Issues both tokens for a freshly-authenticated user: a short-lived
// access token (JWT, verified statelessly) and a long-lived refresh token
// (opaque, DB-backed, revocable — see utils/refreshToken.js). Shared by
// register/login/refresh so all three ever only mint tokens one way.
async function issueTokens(userId) {
  const accessToken = signToken({ sub: userId });

  const rawRefreshToken = generateRefreshToken();
  await refreshTokenRepository.create({
    userId,
    tokenHash: hashRefreshToken(rawRefreshToken),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN_MS),
  });

  return { accessToken, refreshToken: rawRefreshToken };
}

export const authService = {
  async register({ fullName, email, password, phone }) {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new ApiError(409, "An account with this email already exists");
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    let user;
    try {
      user = await userRepository.create({ fullName, email, passwordHash, phone });
    } catch (err) {
      // Covers two edge cases the findByEmail check above can't catch:
      // (1) a race — two requests for the same new email arriving at once,
      // (2) a soft-deleted user whose email is still reserved by the
      //     database's unique constraint even though our queries exclude
      //     soft-deleted rows. Either way, Prisma's error code is P2002.
      if (err.code === "P2002") {
        throw new ApiError(409, "An account with this email already exists");
      }
      throw err;
    }

    // Auto-authenticate immediately after registration, per requirements.
    const tokens = await issueTokens(user.id);

    return { user: sanitizeUser(user), ...tokens };
  },

  // `identifier` must be an email — phone accounts sign in via
  // requestPhoneOtp/verifyPhoneOtp instead (see below). This isn't an
  // anti-enumeration concern (it reveals which *method* is valid, not
  // which accounts exist), so a specific, helpful message is fine here.
  async login({ identifier, password }) {
    if (!identifier.includes("@")) {
      throw new ApiError(
        400,
        'Phone accounts sign in with a one-time code sent by SMS. Use "Sign in with Phone" instead.'
      );
    }

    const user = await userRepository.findByEmail(identifier);

    // Deliberately identical error for "no such user" and "wrong password" —
    // a different message for each would let an attacker enumerate which
    // emails have accounts.
    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new ApiError(401, "Invalid email or password");
    }

    // Password alone isn't enough for an MFA-enabled account — hand back a
    // single-purpose "pending" token instead of a real session. No
    // access/refresh/CSRF cookie exists yet at this point; the client
    // must call verifyMfaLogin with the code from their authenticator app
    // before a real session is issued.
    if (user.mfaEnabled) {
      const mfaPendingToken = signToken({ sub: user.id, purpose: "mfa" }, undefined, MFA_PENDING_EXPIRES_IN);
      return { mfaRequired: true, mfaPendingToken };
    }

    const tokens = await issueTokens(user.id);

    return { mfaRequired: false, user: sanitizeUser(user), ...tokens };
  },

  async verifyMfaLogin(mfaPendingToken, code) {
    if (!mfaPendingToken) {
      throw new ApiError(401, "Authentication required");
    }

    let payload;
    try {
      payload = verifyToken(mfaPendingToken);
    } catch {
      throw new ApiError(401, "Invalid or expired session");
    }
    if (payload.purpose !== "mfa") {
      throw new ApiError(401, "Invalid or expired session");
    }

    const user = await userRepository.findById(payload.sub);
    if (!user || !user.mfaEnabled) {
      throw new ApiError(401, "Invalid or expired session");
    }

    const isValidCode = await verifyMfaCode(user.mfaSecret, code);
    if (!isValidCode) {
      throw new ApiError(401, "Invalid verification code");
    }

    const tokens = await issueTokens(user.id);
    return { user: sanitizeUser(user), ...tokens };
  },

  // Always creates a PhoneOtp row and always responds the same way,
  // whether or not `phone` belongs to a real account — the SMS itself is
  // the only part that's conditional. A naive "only create a row if the
  // account exists" design would leak account existence through the
  // cooldown check below (a real account's second rapid request hits the
  // cooldown; a fake number's never would), so the cooldown and response
  // must behave identically either way.
  async requestPhoneOtp(phone) {
    const existing = await phoneOtpRepository.findLatestByPhone(phone);
    if (existing && !existing.consumedAt && Date.now() - existing.createdAt.getTime() < OTP_RESEND_COOLDOWN_MS) {
      throw new ApiError(429, "Please wait before requesting another code");
    }

    const code = generateOtp();
    await phoneOtpRepository.create({
      phone,
      codeHash: hashOtp(code),
      expiresAt: new Date(Date.now() + OTP_EXPIRES_IN_MS),
    });

    const user = await userRepository.findByPhone(phone);
    if (user) {
      smsService.sendOtpSms(phone, code);
    }

    // MSG91 isn't set up yet, so sendOtpSms is a silent no-op — without this,
    // the code exists only as a hash in the DB and is genuinely unrecoverable
    // by anyone, including us. Server-side-only (Render's log dashboard, not
    // the HTTP response), and self-removing: this stops printing the moment
    // real MSG91 credentials are configured, so it can't linger as a bypass
    // once SMS delivery is actually live.
    if (!isSmsConfigured) {
      console.log(`[otp] SMS not configured — code for ${phone}: ${code}`);
    }

    return { message: "If this number is registered, a verification code has been sent." };
  },

  async verifyPhoneOtp(phone, code) {
    const otp = await phoneOtpRepository.findLatestByPhone(phone);

    if (!otp || otp.consumedAt || otp.expiresAt < new Date() || otp.attempts >= MAX_OTP_ATTEMPTS) {
      throw new ApiError(401, "Invalid or expired code");
    }

    if (hashOtp(code) !== otp.codeHash) {
      await phoneOtpRepository.incrementAttempts(otp.id);
      throw new ApiError(401, "Invalid or expired code");
    }

    await phoneOtpRepository.markConsumed(otp.id);

    // Verifying the code already proves phone ownership — the same bar
    // every mainstream phone-first signup (Swiggy/Zomato/Myntra, etc.)
    // uses to justify auto-provisioning. No separate signup form: an
    // unregistered number just gets an account the moment its code is
    // verified. fullName starts as a placeholder, email/passwordHash stay
    // null until the account optionally adds them later (setInitialCredentials).
    let user = await userRepository.findByPhone(phone);
    let isNewAccount = false;
    if (!user) {
      user = await userRepository.create({ fullName: "Customer", phone });
      isNewAccount = true;
    }

    const tokens = await issueTokens(user.id);
    return { user: sanitizeUser(user), isNewAccount, ...tokens };
  },

  // Enrollment is two steps, matching the industry-standard flow (Google/
  // GitHub/etc.): generate + display a secret (setupMfa), then require one
  // real code from the user's authenticator app before flipping mfaEnabled
  // (confirmMfaSetup) — this catches a mistyped QR scan or wrong app
  // *before* the account depends on it, rather than after.
  async setupMfa(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const secret = generateMfaSecret();
    await userRepository.setMfaSecret(userId, secret);
    const qrCodeDataUrl = await generateMfaQrCode(secret, user.email);

    return { secret, qrCodeDataUrl };
  },

  async confirmMfaSetup(userId, code) {
    const user = await userRepository.findById(userId);
    if (!user || !user.mfaSecret) {
      throw new ApiError(400, "Start MFA setup before confirming it");
    }

    const isValidCode = await verifyMfaCode(user.mfaSecret, code);
    if (!isValidCode) {
      throw new ApiError(400, "Invalid verification code");
    }

    await userRepository.confirmMfa(userId);
  },

  // Requires the password again (not just a TOTP code) — the same
  // "step back up to a real credential for a sensitive action" posture
  // changePassword already uses, so a stolen/unlocked device with an
  // active session alone can't turn MFA off.
  async disableMfaForUser(userId, password) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    // bcrypt.compare throws (not a graceful ApiError) against a null hash —
    // a phone-first account with no password yet can't use this endpoint.
    if (!user.passwordHash) {
      throw new ApiError(400, "Set up a password from your Account page first");
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new ApiError(401, "Incorrect password");
    }

    await userRepository.disableMfa(userId);
  },

  // Rotation: the presented refresh token is revoked and a brand new one
  // issued in the same breath as the new access token — a refresh token
  // only ever works once. If a revoked/expired/unknown token is presented
  // (e.g. a stolen one already used by its real owner), this just fails
  // closed with a 401 rather than silently granting anything.
  async refresh(rawRefreshToken) {
    if (!rawRefreshToken) {
      throw new ApiError(401, "Authentication required");
    }

    const existing = await refreshTokenRepository.findValid(hashRefreshToken(rawRefreshToken));
    if (!existing) {
      throw new ApiError(401, "Invalid or expired session");
    }

    await refreshTokenRepository.revoke(existing.id);
    return issueTokens(existing.userId);
  },

  async logout(rawRefreshToken) {
    if (rawRefreshToken) {
      await refreshTokenRepository.revokeByHash(hashRefreshToken(rawRefreshToken));
    }
  },

  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return sanitizeUser(user);
  },

  // Self-service edit of name/email/phone from the Profile page. Only
  // defined fields are passed to the repository, so a request that only
  // sends `phone` (say) leaves fullName/email untouched.
  async updateProfile(userId, { fullName, email, phone }) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // An empty string is normalized to null (clearing the phone), never
    // stored as "" — phone is a unique column, and a stray "" would
    // collide with any other account that also clears its phone this way.
    const fields = {
      ...(fullName !== undefined && { fullName }),
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone: phone || null }),
    };

    try {
      const updated = await userRepository.updateProfile(userId, fields);
      return sanitizeUser(updated);
    } catch (err) {
      if (err.code === "P2002") {
        const field = err.meta?.target?.includes("phone") ? "phone number" : "email";
        throw new ApiError(409, `An account with this ${field} already exists`);
      }
      throw err;
    }
  },

  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    // bcrypt.compare throws (not a graceful ApiError) against a null hash —
    // a phone-first account with no password yet must use
    // setInitialCredentials instead, which doesn't require a current one.
    if (!user.passwordHash) {
      throw new ApiError(400, "Set up a password from your Account page first");
    }

    const passwordMatches = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!passwordMatches) {
      throw new ApiError(401, "Current password is incorrect");
    }

    const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await userRepository.updatePassword(userId, newPasswordHash);
  },

  // For a phone-first account (no email/password yet) adding both for the
  // first time — deliberately not changePassword, which requires verifying
  // a current password that doesn't exist yet. Only valid while
  // passwordHash is still null; once set, changePassword is the right
  // endpoint for updating it.
  async setInitialCredentials(userId, { email, password }) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    if (user.passwordHash) {
      throw new ApiError(400, "This account already has a password — use Change Password instead");
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    try {
      const updated = await userRepository.updateProfile(userId, { email, passwordHash });
      return sanitizeUser(updated);
    } catch (err) {
      if (err.code === "P2002") {
        throw new ApiError(409, "An account with this email already exists");
      }
      throw err;
    }
  },
};
