// Admin controller — deliberately thin, mirrors auth.controller.js. Every
// function just extracts what it needs from `req`, calls into
// adminService, and formats the response.

import { adminService } from "../services/admin.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateCsrfToken } from "../utils/csrf.js";
import {
  setAdminAuthCookie,
  clearAdminAuthCookie,
  setAdminRefreshCookie,
  clearAdminRefreshCookie,
  setAdminCsrfCookie,
  clearAdminCsrfCookie,
  setAdminMfaPendingCookie,
  clearAdminMfaPendingCookie,
  ADMIN_REFRESH_COOKIE_NAME,
  ADMIN_MFA_PENDING_COOKIE_NAME,
} from "../utils/adminCookies.js";

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await adminService.login({ email, password });

  if (result.mfaRequired) {
    setAdminMfaPendingCookie(res, result.mfaPendingToken);
    return res.status(200).json(new ApiResponse("Verification code required", { mfaRequired: true }));
  }

  setAdminAuthCookie(res, result.accessToken);
  setAdminRefreshCookie(res, result.refreshToken);
  setAdminCsrfCookie(res, generateCsrfToken());
  res.status(200).json(new ApiResponse("Logged in successfully", { admin: result.admin, mfaRequired: false }));
});

export const verifyMfaLogin = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const mfaPendingToken = req.cookies?.[ADMIN_MFA_PENDING_COOKIE_NAME];
  const { admin, accessToken, refreshToken } = await adminService.verifyMfaLogin(mfaPendingToken, code);

  clearAdminMfaPendingCookie(res);
  setAdminAuthCookie(res, accessToken);
  setAdminRefreshCookie(res, refreshToken);
  setAdminCsrfCookie(res, generateCsrfToken());
  res.status(200).json(new ApiResponse("Logged in successfully", { admin }));
});

export const refresh = asyncHandler(async (req, res) => {
  const rawRefreshToken = req.cookies?.[ADMIN_REFRESH_COOKIE_NAME];
  const { accessToken, refreshToken } = await adminService.refresh(rawRefreshToken);

  setAdminAuthCookie(res, accessToken);
  setAdminRefreshCookie(res, refreshToken);
  setAdminCsrfCookie(res, generateCsrfToken());
  res.status(200).json(new ApiResponse("Session refreshed"));
});

export const logout = asyncHandler(async (req, res) => {
  const rawRefreshToken = req.cookies?.[ADMIN_REFRESH_COOKIE_NAME];
  await adminService.logout(rawRefreshToken);

  clearAdminAuthCookie(res);
  clearAdminRefreshCookie(res);
  clearAdminCsrfCookie(res);
  clearAdminMfaPendingCookie(res);
  res.status(200).json(new ApiResponse("Logged out successfully"));
});

export const getProfile = asyncHandler(async (req, res) => {
  const admin = await adminService.getProfile(req.admin.id);
  res.status(200).json(new ApiResponse("Profile fetched successfully", { admin }));
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await adminService.changePassword(req.admin.id, { currentPassword, newPassword });
  res.status(200).json(new ApiResponse("Password updated successfully"));
});

// Mandatory for every admin — no disable endpoint exists (see
// adminService.setupMfa's comment on why).
export const setupMfa = asyncHandler(async (req, res) => {
  const { secret, qrCodeDataUrl } = await adminService.setupMfa(req.admin.id);
  res.status(200).json(new ApiResponse("Scan this QR code with your authenticator app", { secret, qrCodeDataUrl }));
});

export const confirmMfaSetup = asyncHandler(async (req, res) => {
  const { code } = req.body;
  await adminService.confirmMfaSetup(req.admin.id, code);
  res.status(200).json(new ApiResponse("Two-factor authentication enabled"));
});
