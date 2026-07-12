// Order service — business logic only, mirrors the layering already
// established by auth/admin/product services. This is the one service so
// far that needs a real database transaction: placing an order touches
// Address, Order, OrderItem, Payment, and Product.stockQuantity together,
// and a failure partway through (a stock shortfall, an order-number
// collision) must roll back everything rather than leave a half-written
// order behind.

import prisma from "../config/prisma.js";
import { orderRepository } from "../repositories/order.repository.js";
import { addressRepository } from "../repositories/address.repository.js";
import { productRepository } from "../repositories/product.repository.js";
import { ApiError } from "../utils/ApiError.js";

// Kept in sync with src/lib/pricing.js on the frontend — that copy is only
// a pre-submit preview; this is the authoritative calculation.
const FREE_SHIPPING_THRESHOLD = 1999;
const FLAT_SHIPPING_FEE = 99;

const MAX_ORDER_NUMBER_ATTEMPTS = 3;

function generateOrderNumber(sequence) {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const d = String(today.getDate()).padStart(2, "0");
  return `XV-${y}${m}${d}-${String(sequence).padStart(4, "0")}`;
}

export const orderService = {
  async createOrder(userId, { items, shipping, paymentMethod }) {
    for (let attempt = 1; attempt <= MAX_ORDER_NUMBER_ATTEMPTS; attempt++) {
      try {
        return await prisma.$transaction(async (tx) => {
          // Re-fetch every line server-side — price and availability are
          // never trusted from the client cart.
          //
          // Note: this is a plain read-then-update, not a `SELECT ... FOR
          // UPDATE` row lock, so there's a narrow race window under high
          // concurrent load on the same SKU where two simultaneous orders
          // could both pass this check. Acceptable for this catalog's
          // scale today; revisit with row locking if order volume grows.
          const lines = [];
          for (const { productId, quantity } of items) {
            const product = await productRepository.findBySlug(productId, tx);
            if (!product) {
              throw new ApiError(404, `Product no longer available: ${productId}`);
            }
            if (product.stockQuantity < quantity) {
              throw new ApiError(
                409,
                `${product.name} doesn't have enough stock (only ${product.stockQuantity} left)`
              );
            }
            lines.push({ product, quantity });
          }

          const subtotal = lines.reduce(
            (sum, { product, quantity }) => sum + Number(product.price) * quantity,
            0
          );
          const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
          const total = subtotal + shippingFee;

          const address = await addressRepository.create({ userId, ...shipping }, tx);

          const sequence = (await orderRepository.countCreatedToday(tx)) + 1;
          const orderNumber = generateOrderNumber(sequence);

          const order = await orderRepository.create(
            {
              orderNumber,
              userId,
              addressId: address.id,
              subtotal,
              shippingFee,
              total,
              paymentMethod,
              items: {
                create: lines.map(({ product, quantity }) => ({
                  productId: product.id,
                  productName: product.name,
                  unitPrice: product.price,
                  quantity,
                  lineTotal: Number(product.price) * quantity,
                })),
              },
              payment: {
                create: { method: paymentMethod, amount: total },
              },
            },
            tx
          );

          for (const { product, quantity } of lines) {
            await productRepository.decrementStock(product.id, quantity, tx);
          }

          return order;
        });
      } catch (err) {
        // Same-day orderNumber collision — recompute the sequence and
        // retry, same race-handling posture as auth.service.js's P2002
        // handling for duplicate emails.
        if (err.code === "P2002" && attempt < MAX_ORDER_NUMBER_ATTEMPTS) {
          continue;
        }
        throw err;
      }
    }
  },

  listOrders(userId) {
    return orderRepository.findAllByUser(userId);
  },
};
