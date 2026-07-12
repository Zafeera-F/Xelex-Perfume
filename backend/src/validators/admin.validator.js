// Validation chains for the admin auth routes. Kept separate from the
// routes themselves so the validation rules are easy to find, read, and
// reuse. Self-contained (not imported from auth.validator.js) per the
// existing convention of validators being per-domain rather than shared.

import { body } from "express-validator";

// Shared password-strength rule — used by change-password so the definition
// of "strong enough" only exists in one place within this module.
const strongPassword = (field) =>
  body(field)
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number");

export const adminLoginValidator = [
  body("email").trim().isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

export const adminChangePasswordValidator = [
  body("currentPassword").notEmpty().withMessage("Current password is required"),
  strongPassword("newPassword"),
];

export const adminMfaCodeValidator = [
  body("code").trim().isLength({ min: 6, max: 6 }).isNumeric().withMessage("Enter the 6-digit code from your authenticator app"),
];
