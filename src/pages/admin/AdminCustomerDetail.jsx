import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import { getAdminCustomer } from "../../lib/adminCustomers";
import { PATHS } from "../../routes/paths";

const STATUS_TONE = {
  PENDING: "gold",
  CONFIRMED: "gold",
  PROCESSING: "gold",
  SHIPPED: "gold",
  DELIVERED: "success",
  CANCELLED: "muted",
  RETURNED: "muted",
};

export default function AdminCustomerDetail() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminCustomer(id)
      .then((data) => {
        setCustomer(data.customer);
        setOrders(data.orders);
      })
      .catch((err) => setError(err.message || "Unable to load this customer."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="min-h-[50vh]" />;
  }

  if (!customer) {
    return (
      <EmptyState
        title="Customer not found"
        description={error || "This customer doesn't exist."}
        actionLabel="Back to Customers"
        onAction={() => window.history.back()}
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link to={PATHS.admin.customers} className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-muted hover:text-gold">
        <ArrowLeft size={14} />
        Back to Customers
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-ivory">{customer.fullName}</h1>
        {customer.deletedAt ? <Badge tone="muted">Deactivated</Badge> : <Badge tone="success">Active</Badge>}
      </div>

      {error && (
        <p className="mt-4 rounded-[var(--radius-card)] border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </p>
      )}

      <Card className="mt-6 p-6" hoverable={false}>
        <h2 className="mb-4 font-display text-lg text-ivory">Contact</h2>
        <p className="text-sm text-ivory/80">{customer.email}</p>
        {customer.phone && <p className="text-sm text-muted">{customer.phone}</p>}
        <p className="mt-3 text-xs text-muted">
          Joined {new Date(customer.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </p>
      </Card>

      <Card className="mt-6 p-6" hoverable={false}>
        <h2 className="mb-4 font-display text-lg text-ivory">Purchase History</h2>
        {orders.length === 0 ? (
          <p className="text-sm text-muted">No orders yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {orders.map((order) => (
              <div key={order.orderNumber} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="text-ivory">{order.orderNumber}</p>
                  <p className="text-xs text-muted">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    {" · "}
                    {order.itemCount} item{order.itemCount !== 1 ? "s" : ""}
                    {" · "}
                    {order.paymentMethod}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge tone={STATUS_TONE[order.status] || "muted"}>{order.status}</Badge>
                  <span className="text-gold">₹{Number(order.total).toLocaleString("en-IN")}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Button as={Link} to={PATHS.admin.customers} variant="ghost" className="mt-6 px-0">
        ← Back to Customers
      </Button>
    </div>
  );
}
