import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import Button from "../ui/Button";
import { PATHS } from "../../routes/paths";

export default function OrderConfirmation({ orderId, total, paymentMethod }) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-24 text-center">
      <CheckCircle2 size={48} strokeWidth={1.2} className="text-gold" />
      <h1 className="mt-6 font-display text-3xl text-ivory">Order Placed</h1>
      <p className="mt-3 text-sm text-muted">
        Thank you — your order <span className="text-ivory">#{orderId}</span> has been confirmed.
      </p>

      <div className="mt-8 w-full border border-border p-6 text-left text-sm">
        <div className="flex justify-between text-ivory/75">
          <span>Payment Method</span>
          <span className="text-ivory">{paymentMethod === "upi" ? "UPI" : "Cash on Delivery"}</span>
        </div>
        <div className="mt-3 flex justify-between border-t border-border pt-3">
          <span className="text-ivory">Order Total</span>
          <span className="font-display text-gold">₹{total.toLocaleString("en-IN")}</span>
        </div>
      </div>

      <p className="mt-6 text-xs text-muted">
        A confirmation will be sent to your email once order tracking is connected.
      </p>

      <Button as={Link} to={PATHS.shop} variant="primary" size="lg" className="mt-8">
        Continue Shopping
      </Button>
    </div>
  );
}
