// Admin controller — deliberately thin, mirrors auth.controller.js. Every
// function just extracts what it needs from `req`, calls into
// adminService, and formats the response.

import { adminService } from "../services/admin.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { setAdminAuthCookie, clearAdminAuthCookie } from "../utils/adminCookies.js";

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { admin, token } = await adminService.login({ email, password });

  setAdminAuthCookie(res, token);
  res.status(200).json(new ApiResponse("Logged in successfully", { admin }));
});

export const logout = asyncHandler(async (req, res) => {
  clearAdminAuthCookie(res);
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
