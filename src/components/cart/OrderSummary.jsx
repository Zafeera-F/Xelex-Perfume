import { Link } from "react-router-dom";
import Button from "../ui/Button";
import Card from "../ui/Card";
import { PATHS } from "../../routes/paths";
import { calculateOrderTotals, FREE_SHIPPING_THRESHOLD } from "../../lib/pricing";

/**
 * OrderSummary — used on both Cart (default footer: "Proceed to Checkout"
 * link) and Checkout (pass `footer` to render a submit button tied to the
 * shipping form instead). Totals always come from lib/pricing.js so the two
 * pages can never disagree on the number.
 */
export default function OrderSummary({ subtotal, itemCount, footer }) {
  const { shipping, total } = calculateOrderTotals(subtotal);

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
