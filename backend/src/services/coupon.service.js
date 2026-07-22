// Coupon service — the discount formula and eligibility rules live here
// exactly once, imported by order.service.js and payment.service.js the
// same way both already import buildOrderInTransaction, so the "3-way
// duplicated" shipping/total math never becomes a 4-way duplication for
// coupons too.

import { couponRepository } from "../repositories/coupon.repository.js";
import { ApiError } from "../utils/ApiError.js";

// Returns the rupee discount for a given coupon + subtotal, or null if the
// order doesn't meet the coupon's minimum. Never touches usedCount — purely
// a calculation, safe to call as many times as needed (real-time validate,
// checkout initiation, order build) without side effects.
export function computeCouponDiscount(coupon, subtotal) {
  if (coupon.minOrderAmount != null && subtotal < Number(coupon.minOrderAmount)) {
    return null;
  }

  let discount =
    coupon.discountType === "PERCENTAGE"
      ? subtotal * (Number(coupon.discountValue) / 100)
      : Number(coupon.discountValue);

  if (coupon.maxDiscountAmount != null) {
    discount = Math.min(discount, Number(coupon.maxDiscountAmount));
  }

  // Never let a discount exceed the subtotal itself (e.g. a flat-amount
  // coupon larger than a near-empty cart).
  discount = Math.min(discount, subtotal);

  return Math.round(discount * 100) / 100;
}

// Shared eligibility checks — same rules whether called from the real-time
// validate endpoint, checkout initiation, or (re-run, never trusted from
// the client) order build time.
function assertEligible(coupon) {
  if (!coupon || !coupon.isActive) {
    throw new ApiError(404, "Invalid coupon code");
  }
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    throw new ApiError(400, "This coupon has expired");
  }
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    throw new ApiError(400, "This coupon has been fully redeemed");
  }
}

export const couponService = {
  // Real-time validate — called as the customer types a code at checkout.
  // Deliberately read-only: never claims/increments usage, since the coupon
  // isn't actually consumed until an order completes.
  async validate(code, subtotal) {
    const coupon = await couponRepository.findByCode(code.toUpperCase());
    assertEligible(coupon);

    const discountAmount = computeCouponDiscount(coupon, subtotal);
    if (discountAmount == null) {
      throw new ApiError(400, `Minimum order amount is ₹${coupon.minOrderAmount}`);
    }

    return { code: coupon.code, discountAmount, description: coupon.description };
  },
};

export { assertEligible };
