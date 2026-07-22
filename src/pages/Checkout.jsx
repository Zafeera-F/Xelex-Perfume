import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Breadcrumb from "../components/ui/Breadcrumb";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import OrderSummary from "../components/cart/OrderSummary";
import ShippingForm from "../components/checkout/ShippingForm";
import PaymentMethodSelector from "../components/checkout/PaymentMethodSelector";
import OrderConfirmation from "../components/checkout/OrderConfirmation";
import { fadeInUp } from "../lib/animations";
import { createOrder } from "../lib/orders";
import { initiateRazorpayCheckout, verifyRazorpayPayment, loadRazorpayCheckoutScript } from "../lib/payments";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { PATHS } from "../routes/paths";

const EMPTY_SHIPPING = {
  fullName: "",
  phone: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  pincode: "",
};

export default function Checkout() {
  const { lines, itemCount, subtotal, clearCart, isLoading: cartLoading } = useCart();
  const { user, status } = useAuth();
  const location = useLocation();

  const [shipping, setShipping] = useState(EMPTY_SHIPPING);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [placedOrder, setPlacedOrder] = useState(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prefill from the account once it's known — the only fields the schema
  // has anywhere else to draw from.
  useEffect(() => {
    if (!user) return;
    setShipping((prev) => ({
      ...prev,
      fullName: prev.fullName || user.fullName || "",
      phone: prev.phone || user.phone || "",
    }));
  }, [user]);

  // Still resolving the session or still hydrating the cart against live
  // product data — don't redirect yet on either count, or a logged-in
  // visitor with a real cart would flash through /login or /cart on every
  // fresh page load before either async check resolves.
  if (status === "loading" || cartLoading) {
    return <div className="min-h-[50vh]" />;
  }

  if (status === "guest") {
    return <Navigate to={PATHS.login} state={{ from: location.pathname }} replace />;
  }

  // Redirect back to Cart if there's nothing to check out — but not if an
  // order was just placed and the cart has since been cleared.
  if (lines.length === 0 && !placedOrder) {
    return <Navigate to={PATHS.cart} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const items = lines.map((line) => ({ productId: line.id, quantity: line.quantity }));
    const shippingPayload = {
      fullName: shipping.fullName,
      phone: shipping.phone,
      addressLine1: shipping.address1,
      addressLine2: shipping.address2,
      city: shipping.city,
      state: shipping.state,
      pincode: shipping.pincode,
    };

    if (paymentMethod === "cod") {
      // Unchanged from before Razorpay was wired in — COD has no
      // "payment" to verify, so the order is created immediately.
      try {
        const order = await createOrder({ items, shipping: shippingPayload, paymentMethod: "COD" });
        setPlacedOrder(order);
        clearCart();
      } catch (err) {
        setError(err.message || "Unable to place your order. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // UPI via Razorpay — the order is deliberately NOT created here. It's
    // only ever built server-side after a verified payment (see
    // handleRazorpaySuccess below), so a failed or cancelled payment never
    // leaves a phantom order behind and never touches the cart.
    try {
      const { razorpayOrderId, amount, currency, keyId } = await initiateRazorpayCheckout({
        items,
        shipping: shippingPayload,
      });
      await loadRazorpayCheckoutScript();

      const rzp = new window.Razorpay({
        key: keyId,
        amount,
        currency,
        order_id: razorpayOrderId,
        name: "XeleX Perfume",
        description: "Order payment",
        prefill: {
          name: shippingPayload.fullName,
          contact: shippingPayload.phone,
        },
        theme: { color: "#d4af37" },
        handler: (response) => handleRazorpaySuccess(response),
        modal: {
          ondismiss: () => {
            setError("Payment was cancelled. Your cart is still saved — you can try again anytime.");
            setIsSubmitting(false);
          },
        },
      });

      rzp.on("payment.failed", () => {
        setError("Payment failed. Your cart is still saved — please try again.");
        setIsSubmitting(false);
      });

      rzp.open();
      // Intentionally no setIsSubmitting(false) here — the widget is now
      // open and the button should stay disabled until the customer
      // succeeds, fails, or cancels (all handled above/below).
    } catch (err) {
      setError(err.message || "Unable to start payment. Please try again.");
      setIsSubmitting(false);
    }
  }

  async function handleRazorpaySuccess(response) {
    try {
      const order = await verifyRazorpayPayment({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      });
      setPlacedOrder(order);
      clearCart();
    } catch (err) {
      setError(err.message || "Payment verification failed. Please contact support if you were charged.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (placedOrder) {
    return (
      <OrderConfirmation
        orderId={placedOrder.orderNumber}
        total={Number(placedOrder.total)}
        paymentMethod={placedOrder.paymentMethod.toLowerCase()}
      />
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 md:px-10">
      <Breadcrumb
        items={[
          { label: "Home", to: PATHS.home },
          { label: "Cart", to: PATHS.cart },
          { label: "Checkout" },
        ]}
      />

      <motion.h1
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="mt-6 font-display text-3xl text-ivory md:text-4xl"
      >
        Checkout
      </motion.h1>

      <form onSubmit={handleSubmit} className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-[1fr_340px]">
        <div className="space-y-10">
          {error && (
            <p className="rounded-[var(--radius-card)] border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
              {error}
            </p>
          )}

          <Card className="p-6" hoverable={false}>
            <h2 className="mb-6 font-display text-lg text-ivory">Shipping Details</h2>
            <ShippingForm values={shipping} onChange={setShipping} />
          </Card>

          <Card className="p-6" hoverable={false}>
            <h2 className="mb-6 font-display text-lg text-ivory">Payment Method</h2>
            <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} />
          </Card>
        </div>

        <div>
          <OrderSummary
            subtotal={subtotal}
            itemCount={itemCount}
            footer={
              <Button type="submit" variant="primary" size="lg" className="mt-6 w-full" disabled={isSubmitting}>
                {isSubmitting ? "Placing Order…" : "Place Order"}
              </Button>
            }
          />
        </div>
      </form>
    </div>
  );
}
