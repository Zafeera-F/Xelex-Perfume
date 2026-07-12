// Validation chains for the admin order routes. Values are checked against
// the real Prisma enums; no transition/state-machine rules on top (see
// adminOrder.service.js for why).

import { body } from "express-validator";

const ORDER_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"];
const PAYMENT_STATUSES = ["PENDING", "SUCCESS", "FAILED", "REFUNDED"];

export const updateStatusValidator = [
  body("status").isIn(ORDER_STATUSES).withMessage("Invalid order status"),
];

export const updatePaymentValidator = [
  body("status").isIn(PAYMENT_STATUSES).withMessage("Invalid payment status"),
  body("transactionId").optional({ checkFalsy: true }).trim(),
];
