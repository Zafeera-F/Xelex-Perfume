// Admin dashboard controller — deliberately thin, mirrors the rest of the
// app's controllers.

import { adminDashboardService } from "../services/adminDashboard.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getStats = asyncHandler(async (req, res) => {
  const stats = await adminDashboardService.getStats();
  res.status(200).json(new ApiResponse("Dashboard stats fetched successfully", stats));
});
