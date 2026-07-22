// MFA (TOTP) helpers — the only place that touches otplib/qrcode directly.
// Google Authenticator / Authy / 1Password-compatible: standard 6-digit,
// 30-second, SHA-1 TOTP (otplib's defaults, and what every mainstream
// authenticator app expects — see otplib's own README on this).

import { generateSecret, verify, generateURI } from "otplib";
import QRCode from "qrcode";

const ISSUER = "XeleX Perfume";

export function generateMfaSecret() {
  return generateSecret();
}

// otplib's verify() throws on malformed input (wrong length, non-numeric)
// rather than returning false — a user mistyping a code, or submitting
// garbage, must never surface as a 500. Anything that isn't a clean
// { valid: true } is just "wrong code" from this function's point of view.
export async function verifyMfaCode(secret, code) {
  try {
    const result = await verify({ secret, token: String(code ?? "") });
    return result.valid;
  } catch {
    return false;
  }
}

export async function generateMfaQrCode(secret, accountLabel) {
  const uri = generateURI({ issuer: ISSUER, label: accountLabel, secret });
  return QRCode.toDataURL(uri);
}
