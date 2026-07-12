// Shared order-total logic. Both the Cart page and Checkout page must show
// the exact same numbers, so this lives in one place rather than being
// recalculated separately in each component.
//
// This is a pre-submit preview only — the authoritative calculation lives
// server-side in backend/src/services/order.service.js (kept in sync with
// the two constants below) and is what actually determines the order total
// once "Place Order" is submitted.

export const FREE_SHIPPING_THRESHOLD = 1999;
export const FLAT_SHIPPING_FEE = 99;

export function calculateOrderTotals(subtotal) {
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : FLAT_SHIPPING_FEE;
  const total = subtotal + shipping;
  return { shipping, total };
}
