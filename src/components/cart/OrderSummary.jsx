import { Link } from "react-router-dom";
import { Tag, X } from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import { Input } from "../ui/Input";
import { PATHS } from "../../routes/paths";
import { calculateOrderTotals, FREE_SHIPPING_THRESHOLD } from "../../lib/pricing";

/**
 * OrderSummary — used on both Cart (default footer: "Proceed to Checkout"
 * link) and Checkout (pass `footer` to render a submit button tied to the
 * shipping form instead). Totals always come from lib/pricing.js so the two
 * pages can never disagree on the number.
 *
 * The coupon section only renders when `onApplyCoupon` is passed — Cart.jsx
 * doesn't pass it (coupons only apply at checkout), so it renders nothing
 * extra there, no `coupon={null}` needed to opt out.
 */
export default function OrderSummary({
  subtotal,
  itemCount,
  footer,
  couponCode,
  onCouponCodeChange,
  onApplyCoupon,
  onRemoveCoupon,
  appliedCoupon,
  couponError,
  isApplyingCoupon,
}) {
  const { shipping, total: preDiscountTotal } = calculateOrderTotals(subtotal);
  const discountAmount = appliedCoupon?.discountAmount ?? 0;
  const total = preDiscountTotal - discountAmount;

  return (
    <Card className="p-6" hoverable={false}>
      <h2 className="font-display text-lg text-ivory">Order Summary</h2>

      <div className="mt-6 space-y-3 text-sm">
        <div className="flex justify-between text-ivory/75">
          <span>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
          <span>₹{subtotal.toLocaleString("en-IN")}</span>
        </div>
        <div className="flex justify-between text-ivory/75">
          <span>Shipping</span>
          <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
        </div>
        {shipping > 0 && (
          <p className="text-xs text-muted">
            Add ₹{(FREE_SHIPPING_THRESHOLD - subtotal).toLocaleString("en-IN")} more for free shipping.
          </p>
        )}

        {onApplyCoupon && (
          <div className="border-t border-border pt-3">
            {appliedCoupon ? (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-gold">
                  <Tag size={14} />
                  {appliedCoupon.code}
                </span>
                <button
                  type="button"
                  onClick={onRemoveCoupon}
                  aria-label="Remove coupon"
                  className="text-ivory/60 transition-colors hover:text-error"
                >
                  <X size={15} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={couponCode}
                  onChange={(e) => onCouponCodeChange(e.target.value)}
                  placeholder="Coupon code"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!couponCode || isApplyingCoupon}
                  onClick={onApplyCoupon}
                >
                  {isApplyingCoupon ? "Applying…" : "Apply"}
                </Button>
              </div>
            )}
            {couponError && <p className="mt-2 text-xs text-error">{couponError}</p>}
          </div>
        )}

        {discountAmount > 0 && (
          <div className="flex justify-between text-gold">
            <span>Discount ({appliedCoupon.code})</span>
            <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-between border-t border-border pt-4">
        <span className="font-display text-base text-ivory">Total</span>
        <span className="font-display text-lg text-gold">₹{total.toLocaleString("en-IN")}</span>
      </div>

      {footer ?? (
        <>
          <Button as={Link} to={PATHS.checkout} variant="primary" size="lg" className="mt-6 w-full">
            Proceed to Checkout
          </Button>
          <p className="mt-4 text-center text-xs text-muted">
            UPI and Cash on Delivery accepted at checkout.
          </p>
        </>
      )}
    </Card>
  );
}
