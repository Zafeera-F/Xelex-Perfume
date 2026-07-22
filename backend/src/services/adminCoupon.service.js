// Admin coupon service — business logic only, mirrors the layering
// established by adminProduct.service.js.

import { couponRepository } from "../repositories/coupon.repository.js";
import { ApiError } from "../utils/ApiError.js";

function toAdminItem(coupon) {
  return {
    id: coupon.id,
    code: coupon.code,
    description: coupon.description,
    discountType: coupon.discountType,
    discountValue: Number(coupon.discountValue),
    minOrderAmount: coupon.minOrderAmount != null ? Number(coupon.minOrderAmount) : null,
    maxDiscountAmount: coupon.maxDiscountAmount != null ? Number(coupon.maxDiscountAmount) : null,
    expiresAt: coupon.expiresAt,
    usageLimit: coupon.usageLimit,
    usedCount: coupon.usedCount,
    isActive: coupon.isActive,
    createdAt: coupon.createdAt,
    updatedAt: coupon.updatedAt,
  };
}

// Coupon codes are case-insensitive by convention — normalized to uppercase
// at write time so "SAVE10" and "save10" are always the same coupon.
function normalizeCode(fields) {
  return fields.code ? { ...fields, code: fields.code.toUpperCase() } : fields;
}

export const adminCouponService = {
  async list({ page = 1, pageSize = 10, search, status } = {}) {
    const { items, total } = await couponRepository.findAllForAdmin({ page, pageSize, search, status });
    return { items: items.map(toAdminItem), total, page, pageSize };
  },

  async getById(id) {
    const coupon = await couponRepository.findById(id);
    if (!coupon) {
      throw new ApiError(404, "Coupon not found");
    }
    return toAdminItem(coupon);
  },

  async create(fields) {
    try {
      const coupon = await couponRepository.create(normalizeCode(fields));
      return toAdminItem(coupon);
    } catch (err) {
      if (err.code === "P2002") {
        throw new ApiError(409, "A coupon with this code already exists");
      }
      throw err;
    }
  },

  async update(id, fields) {
    const existing = await couponRepository.findById(id);
    if (!existing) {
      throw new ApiError(404, "Coupon not found");
    }

    try {
      const coupon = await couponRepository.update(id, normalizeCode(fields));
      return toAdminItem(coupon);
    } catch (err) {
      if (err.code === "P2002") {
        throw new ApiError(409, "A coupon with this code already exists");
      }
      throw err;
    }
  },

  async delete(id) {
    const existing = await couponRepository.findById(id);
    if (!existing) {
      throw new ApiError(404, "Coupon not found");
    }
    await couponRepository.delete(id);
  },
};
