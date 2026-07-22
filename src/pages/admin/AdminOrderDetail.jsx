import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Download, Printer } from "lucide-react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import { getAdminOrder, updateOrderStatus, updateOrderPayment } from "../../lib/adminOrders";
import { PATHS } from "../../routes/paths";

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
];
const PAYMENT_STATUSES = ["PENDING", "SUCCESS", "FAILED", "REFUNDED"];

const STATUS_TONE = {
  PENDING: "gold",
  CONFIRMED: "gold",
  PROCESSING: "gold",
  SHIPPED: "gold",
  OUT_FOR_DELIVERY: "gold",
  DELIVERED: "success",
  CANCELLED: "muted",
  RETURNED: "muted",
  SUCCESS: "success",
  FAILED: "muted",
  REFUNDED: "muted",
};

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [paymentUpdating, setPaymentUpdating] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // jsPDF's build bundles an internal html2canvas-based renderer (used by
  // its .html() API, which this invoice never calls) — dynamically
  // importing it here keeps that ~100KB+ gzipped out of every visitor's
  // initial bundle, loading it only the moment an admin actually clicks
  // Download PDF.
  async function handleDownloadPdf() {
    setIsGeneratingPdf(true);
    try {
      const { generateInvoicePdf } = await import("../../lib/invoicePdf");
      generateInvoicePdf(order).save(`invoice-${order.orderNumber}.pdf`);
    } finally {
      setIsGeneratingPdf(false);
    }
  }

  useEffect(() => {
    getAdminOrder(id)
      .then(setOrder)
      .catch((err) => setError(err.message || "Unable to load this order."))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleStatusChange(e) {
    const status = e.target.value;
    setStatusUpdating(true);
    try {
      const updated = await updateOrderStatus(id, status);
      setOrder(updated);
    } catch (err) {
      setError(err.message || "Unable to update order status.");
    } finally {
      setStatusUpdating(false);
    }
  }

  async function handlePaymentChange(e) {
    const status = e.target.value;
    setPaymentUpdating(true);
    try {
      const updated = await updateOrderPayment(id, { status });
      setOrder(updated);
    } catch (err) {
      setError(err.message || "Unable to update payment status.");
    } finally {
      setPaymentUpdating(false);
    }
  }

  if (loading) {
    return <div className="min-h-[50vh]" />;
  }

  if (!order) {
    return (
      <EmptyState
        title="Order not found"
        description={error || "This order doesn't exist."}
        actionLabel="Back to Orders"
        onAction={() => window.history.back()}
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to={PATHS.admin.orders}
        className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-muted hover:text-gold print:hidden"
      >
        <ArrowLeft size={14} />
        Back to Orders
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl text-ivory">{order.orderNumber}</h1>
          <Badge tone={STATUS_TONE[order.status] || "muted"}>{order.status}</Badge>
        </div>
        <div className="flex items-center gap-3 print:hidden">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer size={15} className="mr-2" />
            Print
          </Button>
          <Button variant="primary" size="sm" onClick={handleDownloadPdf} disabled={isGeneratingPdf}>
            <Download size={15} className="mr-2" />
            {isGeneratingPdf ? "Preparing…" : "Download PDF"}
          </Button>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-[var(--radius-card)] border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 print:hidden">
        <Card className="p-6" hoverable={false}>
          <h2 className="mb-4 font-display text-lg text-ivory">Order Status</h2>
          <select
            value={order.status}
            onChange={handleStatusChange}
            disabled={statusUpdating}
            className="w-full border border-border bg-background-soft px-4 py-3 text-sm text-ivory outline-none transition-colors focus:border-gold"
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Card>

        <Card className="p-6" hoverable={false}>
          <h2 className="mb-4 font-display text-lg text-ivory">Payment Status</h2>
          {order.payment ? (
            <>
              <select
                value={order.payment.status}
                onChange={handlePaymentChange}
                disabled={paymentUpdating}
                className="w-full border border-border bg-background-soft px-4 py-3 text-sm text-ivory outline-none transition-colors focus:border-gold"
              >
                {PAYMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <p className="mt-3 text-xs text-muted">
                {order.paymentMethod}
                {order.payment.paidAt && ` · Paid ${new Date(order.payment.paidAt).toLocaleDateString("en-IN")}`}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted">No payment record for this order.</p>
          )}
        </Card>
      </div>

      <Card className="mt-6 p-6" hoverable={false}>
        <h2 className="mb-4 font-display text-lg text-ivory">Customer</h2>
        <p className="text-sm text-ivory/80">{order.customer.fullName}</p>
        <p className="text-sm text-muted">{order.customer.email}</p>
        {order.customer.phone && <p className="text-sm text-muted">{order.customer.phone}</p>}
      </Card>

      <Card className="mt-6 p-6" hoverable={false}>
        <h2 className="mb-4 font-display text-lg text-ivory">Shipping Address</h2>
        <p className="text-sm text-ivory/80">{order.address.fullName} · {order.address.phone}</p>
        <p className="text-sm text-muted">
          {order.address.addressLine1}
          {order.address.addressLine2 && `, ${order.address.addressLine2}`}
        </p>
        <p className="text-sm text-muted">
          {order.address.city}, {order.address.state} {order.address.pincode}, {order.address.country}
        </p>
      </Card>

      <Card className="mt-6 p-6" hoverable={false}>
        <h2 className="mb-4 font-display text-lg text-ivory">Items</h2>
        <div className="divide-y divide-border">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between py-3 text-sm">
              <div>
                <p className="text-ivory">{item.productName}</p>
                <p className="text-xs text-muted">Qty {item.quantity} · ₹{item.unitPrice.toLocaleString("en-IN")} each</p>
              </div>
              <span className="text-gold">₹{item.lineTotal.toLocaleString("en-IN")}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
          <div className="flex justify-between text-ivory/75">
            <span>Subtotal</span>
            <span>₹{order.subtotal.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between text-ivory/75">
            <span>Shipping</span>
            <span>{order.shippingFee === 0 ? "Free" : `₹${order.shippingFee.toLocaleString("en-IN")}`}</span>
          </div>
          {order.coupon && (
            <div className="flex justify-between text-gold">
              <span>Discount ({order.coupon.code})</span>
              <span>-₹{order.coupon.discountAmount.toLocaleString("en-IN")}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 text-base">
            <span className="text-ivory">Total</span>
            <span className="font-display text-gold">₹{order.total.toLocaleString("en-IN")}</span>
          </div>
        </div>
        <div className="mt-4 border-t border-border pt-4 text-sm text-ivory/75">
          <p>Payment Method: {order.paymentMethod}</p>
          {order.payment && (
            <p className="mt-1">
              Payment Status: {order.payment.status}
              {order.payment.paidAt && ` · Paid ${new Date(order.payment.paidAt).toLocaleDateString("en-IN")}`}
            </p>
          )}
        </div>
      </Card>

      <Button as={Link} to={PATHS.admin.orders} variant="ghost" className="mt-6 px-0 print:hidden">
        ← Back to Orders
      </Button>
    </div>
  );
}
