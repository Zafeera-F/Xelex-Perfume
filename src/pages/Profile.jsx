import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PackageSearch } from "lucide-react";
import Breadcrumb from "../components/ui/Breadcrumb";
import { Field, Input } from "../components/ui/Input";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import { fadeInUp } from "../lib/animations";
import { useAuth } from "../context/AuthContext";
import { getOrders } from "../lib/orders";
import { PATHS } from "../routes/paths";

const EMPTY_PASSWORD_FORM = { currentPassword: "", newPassword: "" };

const STATUS_TONE = {
  PENDING: "gold",
  CONFIRMED: "gold",
  PROCESSING: "gold",
  SHIPPED: "gold",
  DELIVERED: "success",
  CANCELLED: "muted",
  RETURNED: "muted",
};

export default function Profile() {
  const { user, status, logout, changePassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORD_FORM);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (status !== "authenticated") return;
    getOrders()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
  }, [status]);

  // Still resolving the session (GET /api/auth/profile in flight) — don't
  // redirect yet, or a real logged-in visitor would flash through /login on
  // every refresh before the cookie check resolves.
  if (status === "loading") {
    return <div className="min-h-[50vh]" />;
  }

  if (status === "guest") {
    return <Navigate to={PATHS.login} state={{ from: location.pathname }} replace />;
  }

  function handlePasswordChange(field) {
    return (e) => setPasswordForm({ ...passwordForm, [field]: e.target.value });
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);
    setIsSubmitting(true);
    try {
      await changePassword(passwordForm);
      setPasswordForm(EMPTY_PASSWORD_FORM);
      setPasswordSuccess(true);
    } catch (err) {
      setPasswordError(err.message || "Unable to update password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate(PATHS.home);
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      className="mx-auto max-w-4xl px-6 py-12 md:px-10"
    >
      <Breadcrumb items={[{ label: "Home", to: PATHS.home }, { label: "My Account" }]} />

      <div className="mt-6 flex items-center justify-between">
        <h1 className="font-display text-3xl text-ivory md:text-4xl">My Account</h1>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Log Out
        </Button>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
        <Card className="p-6" hoverable={false}>
          <h2 className="mb-6 font-display text-lg text-ivory">Account Details</h2>
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-[0.15em] text-muted">Full Name</dt>
              <dd className="mt-1 text-ivory">{user.fullName}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.15em] text-muted">Email</dt>
              <dd className="mt-1 text-ivory">{user.email}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.15em] text-muted">Phone</dt>
              <dd className="mt-1 text-ivory">{user.phone || "—"}</dd>
            </div>
          </dl>
        </Card>

        <Card className="p-6" hoverable={false}>
          <h2 className="mb-6 font-display text-lg text-ivory">Change Password</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {passwordError && (
              <p className="rounded-[var(--radius-card)] border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
                {passwordError}
              </p>
            )}
            {passwordSuccess && (
              <p className="rounded-[var(--radius-card)] border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-gold">
                Password updated successfully.
              </p>
            )}

            <Field label="Current Password">
              <Input
                required
                type="password"
                autoComplete="current-password"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange("currentPassword")}
              />
            </Field>

            <Field label="New Password">
              <Input
                required
                type="password"
                autoComplete="new-password"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange("newPassword")}
                placeholder="At least 8 characters"
              />
            </Field>

            <Button type="submit" variant="outline" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Updating…" : "Update Password"}
            </Button>
          </form>
        </Card>
      </div>

      <div className="mt-8">
        <Card hoverable={false}>
          <h2 className="p-6 pb-0 font-display text-lg text-ivory">Order History</h2>
          {ordersLoading ? (
            <div className="min-h-[120px]" />
          ) : orders.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="No orders yet"
              description="Your past orders will appear here once you place one."
            />
          ) : (
            <div className="divide-y divide-border">
              {orders.map((order) => (
                <div
                  key={order.orderNumber}
                  className="flex flex-wrap items-center justify-between gap-3 p-6"
                >
                  <div>
                    <p className="text-sm text-ivory">{order.orderNumber}</p>
                    <p className="mt-1 text-xs text-muted">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      · {order.itemCount} item{order.itemCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge tone={STATUS_TONE[order.status] || "muted"}>{order.status}</Badge>
                    <span className="font-body text-sm text-gold">
                      ₹{Number(order.total).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </motion.div>
  );
}
