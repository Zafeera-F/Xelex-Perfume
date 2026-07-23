// Validation chains for the auth routes. Kept separate from the routes
// themselves so the validation rules are easy to find, read, and reuse.

import { body } from "express-validator";

// Shared password-strength rule — used by both register and change-password
// so the definition of "strong enough" only exists in one place.
const strongPassword = (field) =>
  body(field)
    .isLength({ min: 8 })
    .withMessage(`${field === "newPassword" ? "New password" : "Password"} must be at least 8 characters`)
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number");

export const registerValidator = [
  body("fullName").trim().notEmpty().withMessage("Full name is required"),
  body("email").trim().isEmail().withMessage("A valid email is required").normalizeEmail(),
  strongPassword("password"),
  body("phone")
    .optional({ checkFalsy: true })
    .isMobilePhone("any")
    .withMessage("Phone number is invalid"),
];

// Deliberately not format-validated as email-or-phone here — replicating
// isEmail()/isMobilePhone("any") OR-logic in the validator layer would be
// redundant work auth.service.js's lookup-then-anti-enumeration-error
// already handles correctly (a malformed identifier just resolves to "no
// such user" -> the same generic 401).
export const loginValidator = [
  body("identifier").trim().notEmpty().withMessage("Email or mobile number is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

export const updateProfileValidator = [
  body("fullName").optional().trim().notEmpty().withMessage("Full name cannot be empty"),
  body("email").optional().trim().isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("phone").optional({ checkFalsy: true }).isMobilePhone("any").withMessage("Phone number is invalid"),
];

export const changePasswordValidator = [
  body("currentPassword").notEmpty().withMessage("Current password is required"),
  strongPassword("newPassword"),
];

// TOTP codes are always 6 digits — used for both the login-time
// verification step and confirming enrollment.
export const mfaCodeValidator = [
  body("code").trim().isLength({ min: 6, max: 6 }).isNumeric().withMessage("Enter the 6-digit code from your authenticator app"),
];

export const disableMfaValidator = [
  body("password").notEmpty().withMessage("Password is required"),
];

export const requestOtpValidator = [
  body("phone").trim().isMobilePhone("any").withMessage("A valid mobile number is required"),
];

export const verifyOtpValidator = [
  body("phone").trim().isMobilePhone("any").withMessage("A valid mobile number is required"),
  body("code").trim().isLength({ min: 6, max: 6 }).isNumeric().withMessage("Enter the 6-digit code sent by SMS"),
];

export const setInitialCredentialsValidator = [
  body("email").trim().isEmail().withMessage("A valid email is required").normalizeEmail(),
  strongPassword("password"),
];
