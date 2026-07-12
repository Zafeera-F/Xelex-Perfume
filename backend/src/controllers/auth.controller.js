// Auth controller — deliberately thin. Every function just extracts what it
// needs from `req`, calls into authService, and formats the response. All
// actual logic (hashing, validation of business rules, token issuance)
// lives in services/auth.service.js.

import { authService } from "../services/auth.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { setAuthCookie, clearAuthCookie } from "../utils/cookies.js";

export const register = asyncHandler(async (req, res) => {
  const { fullName, email, password, phone } = req.body;
  const { user, token } = await authService.register({ fullName, email, password, phone });

  setAuthCookie(res, token);
  res.status(201).json(new ApiResponse("Account created successfully", { user }));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await authService.login({ email, password });

  setAuthCookie(res, token);
  res.status(200).json(new ApiResponse("Logged in successfully", { user }));
});

export const logout = asyncHandler(async (req, res) => {
  clearAuthCookie(res);
  res.status(200).json(new ApiResponse("Logged out successfully"));
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user.id);
  res.status(200).json(new ApiResponse("Profile fetched successfully", { user }));
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user.id, { currentPassword, newPassword });
  res.status(200).json(new ApiResponse("Password updated successfully"));
});
