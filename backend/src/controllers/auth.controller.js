// Auth controller — deliberately thin. Every function just extracts what it
// needs from `req`, calls into authService, and formats the response. All
// actual logic (hashing, validation of business rules, token issuance)
// lives in services/auth.service.js.

import { authService } from "../services/auth.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateCsrfToken } from "../utils/csrf.js";
import {
  setAuthCookie,
  clearAuthCookie,
  setRefreshCookie,
  clearRefreshCookie,
  setCsrfCookie,
  clearCsrfCookie,
  setMfaPendingCookie,
  clearMfaPendingCookie,
  REFRESH_COOKIE_NAME,
  MFA_PENDING_COOKIE_NAME,
} from "../utils/cookies.js";

export const register = asyncHandler(async (req, res) => {
  const { fullName, email, password, phone } = req.body;
  const { user, accessToken, refreshToken } = await authService.register({ fullName, email, password, phone });

  setAuthCookie(res, accessToken);
  setRefreshCookie(res, refreshToken);
  setCsrfCookie(res, generateCsrfToken());
  res.status(201).json(new ApiResponse("Account created successfully", { user }));
});

export const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;
  const result = await authService.login({ identifier, password });

  // MFA-enabled account: no real session yet, just the short-lived
  // pending cookie — the frontend must show the code-entry step and call
  // verifyMfaLogin next.
  if (result.mfaRequired) {
    setMfaPendingCookie(res, result.mfaPendingToken);
    return res.status(200).json(new ApiResponse("Verification code required", { mfaRequired: true }));
  }

  setAuthCookie(res, result.accessToken);
  setRefreshCookie(res, result.refreshToken);
  setCsrfCookie(res, generateCsrfToken());
  res.status(200).json(new ApiResponse("Logged in successfully", { user: result.user, mfaRequired: false }));
});

export const verifyMfaLogin = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const mfaPendingToken = req.cookies?.[MFA_PENDING_COOKIE_NAME];
  const { user, accessToken, refreshToken } = await authService.verifyMfaLogin(mfaPendingToken, code);

  clearMfaPendingCookie(res);
  setAuthCookie(res, accessToken);
  setRefreshCookie(res, refreshToken);
  setCsrfCookie(res, generateCsrfToken());
  res.status(200).json(new ApiResponse("Logged in successfully", { user }));
});

export const requestPhoneOtp = asyncHandler(async (req, res) => {
  const { phone } = req.body;
  const result = await authService.requestPhoneOtp(phone);
  res.status(200).json(new ApiResponse(result.message));
});

export const verifyPhoneOtp = asyncHandler(async (req, res) => {
  const { phone, code } = req.body;
  const { user, accessToken, refreshToken } = await authService.verifyPhoneOtp(phone, code);

  setAuthCookie(res, accessToken);
  setRefreshCookie(res, refreshToken);
  setCsrfCookie(res, generateCsrfToken());
  res.status(200).json(new ApiResponse("Logged in successfully", { user }));
});

// No requireAuth — by the time the access token has expired, requireAuth
// would already reject the request. Trust is entirely in the refresh
// token cookie's own validity (checked in authService.refresh), the same
// posture requireAdmin already uses (a DB-checked token, not a session).
export const refresh = asyncHandler(async (req, res) => {
  const rawRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
  const { accessToken, refreshToken } = await authService.refresh(rawRefreshToken);

  setAuthCookie(res, accessToken);
  setRefreshCookie(res, refreshToken);
  setCsrfCookie(res, generateCsrfToken());
  res.status(200).json(new ApiResponse("Session refreshed"));
});

export const logout = asyncHandler(async (req, res) => {
  const rawRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
  await authService.logout(rawRefreshToken);

  clearAuthCookie(res);
  clearRefreshCookie(res);
  clearCsrfCookie(res);
  clearMfaPendingCookie(res);
  res.status(200).json(new ApiResponse("Logged out successfully"));
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user.id);
  res.status(200).json(new ApiResponse("Profile fetched successfully", { user }));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, email, phone } = req.body;
  const user = await authService.updateProfile(req.user.id, { fullName, email, phone });
  res.status(200).json(new ApiResponse("Profile updated successfully", { user }));
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user.id, { currentPassword, newPassword });
  res.status(200).json(new ApiResponse("Password updated successfully"));
});

// MFA is optional for customers — toggled from the Profile page.
export const setupMfa = asyncHandler(async (req, res) => {
  const { secret, qrCodeDataUrl } = await authService.setupMfa(req.user.id);
  res.status(200).json(new ApiResponse("Scan this QR code with your authenticator app", { secret, qrCodeDataUrl }));
});

export const confirmMfaSetup = asyncHandler(async (req, res) => {
  const { code } = req.body;
  await authService.confirmMfaSetup(req.user.id, code);
  res.status(200).json(new ApiResponse("Two-factor authentication enabled"));
});

export const disableMfa = asyncHandler(async (req, res) => {
  const { password } = req.body;
  await authService.disableMfaForUser(req.user.id, password);
  res.status(200).json(new ApiResponse("Two-factor authentication disabled"));
});
