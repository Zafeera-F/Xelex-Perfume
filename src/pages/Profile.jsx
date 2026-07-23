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
import MfaSetup from "../components/ui/MfaSetup";
import { fadeInUp } from "../lib/animations";
import { useAuth } from "../context/AuthContext";
import { getOrders } from "../lib/orders";
import { PATHS } from "../routes/paths";

const EMPTY_PASSWORD_FORM = { currentPassword: "", newPassword: "" };
const EMPTY_DISABLE_MFA_FORM = { password: "" };

const STATUS_TONE = {
  PENDING: "gold",
  CONFIRMED: "gold",
  PROCESSING: "gold",
  SHIPPED: "gold",
  OUT_FOR_DELIVERY: "gold",
  DELIVERED: "success",
  CANCELLED: "muted",
  RETURNED: "muted",
};

export default function Profile() {
  const { user, status, logout, updateProfile, setInitialCredentials, changePassword, setupMfa, confirmMfaSetup, disableMfa } =
    useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState(null);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Nudge for a phone-first account (no email/password yet) — keyed off
  // !user.email rather than a persisted dismissal, so it naturally stops
  // showing once they add one, and "not now" only needs to last this
  // session (matches the app's existing lightweight posture elsewhere).
  const [nudgeDismissed, setNudgeDismissed] = useState(false);
  const [showCredentialsForm, setShowCredentialsForm] = useState(false);
  const [credentialsForm, setCredentialsForm] = useState({ email: "", password: "" });
  const [credentialsError, setCredentialsError] = useState("");
  const [isSavingCredentials, setIsSavingCredentials] = useState(false);

  const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORD_FORM);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [disableMfaForm, setDisableMfaForm] = useState(EMPTY_DISABLE_MFA_FORM);
  const [disableMfaError, setDisableMfaError] = useState("");
  const [isDisablingMfa, setIsDisablingMfa] = useState(false);

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

  function handleStartEditProfile() {
    setProfileForm({ fullName: user.fullName, email: user.email || "", phone: user.phone || "" });
    setProfileError("");
    setProfileSuccess(false);
    setIsEditingProfile(true);
  }

  function handleCancelEditProfile() {
    setIsEditingProfile(false);
    setProfileError("");
  }

  function handleCredentialsFieldChange(field) {
    return (e) => setCredentialsForm({ ...credentialsForm, [field]: e.target.value });
  }

  async function handleCredentialsSubmit(e) {
    e.preventDefault();
    setCredentialsError("");
    setIsSavingCredentials(true);
    try {
      await setInitialCredentials(credentialsForm);
      setShowCredentialsForm(false);
      setCredentialsForm({ email: "", password: "" });
    } catch (err) {
      setCredentialsError(err.message || "Unable to save. Please try again.");
    } finally {
      setIsSavingCredentials(false);
    }
  }

  function handleProfileFieldChange(field) {
    return (e) => setProfileForm({ ...profileForm, [field]: e.target.value });
  }

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setProfileError("");
    setIsSavingProfile(true);
    try {
      // Blank email is left untouched rather than sent — a phone-first
      // account with no email yet might only be editing name/phone here;
      // clearing an already-set email isn't something this form supports.
      await updateProfile({ ...profileForm, email: profileForm.email || undefined, phone: profileForm.phone || null });
      setIsEditingProfile(false);
      setProfileSuccess(true);
    } catch (err) {
      setProfileError(err.message || "Unable to update your details. Please try again.");
    } finally {
      setIsSavingProfile(false);
    }
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

  async function handleDisableMfaSubmit(e) {
    e.preventDefault();
    setDisableMfaError("");
    setIsDisablingMfa(true);
    try {
      await disableMfa(disableMfaForm.password);
      setDisableMfaForm(EMPTY_DISABLE_MFA_FORM);
    } catch (err) {
      setDisableMfaError(err.message || "Unable to disable two-factor authentication. Please try again.");
    } finally {
      setIsDisablingMfa(false);
    }
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

      {!user.email && !nudgeDismissed && (
        <Card className="mt-10 p-6" hoverable={false}>
          {showCredentialsForm ? (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <h2 className="font-display text-lg text-ivory">Add Email &amp; Password</h2>
              <p className="text-sm text-muted">
                So you can always get back into your account, even without access to this phone number.
              </p>
              {credentialsError && (
                <p className="rounded-[var(--radius-card)] border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
                  {credentialsError}
                </p>
              )}
              <Field label="Email">
                <Input
                  required
                  type="email"
                  autoComplete="email"
                  value={credentialsForm.email}
                  onChange={handleCredentialsFieldChange("email")}
                  placeholder="you@example.com"
                />
              </Field>
              <Field label="Password">
                <Input
                  required
                  type="password"
                  autoComplete="new-password"
                  value={credentialsForm.password}
                  onChange={handleCredentialsFieldChange("password")}
                  placeholder="At least 8 characters"
                />
              </Field>
              <div className="flex gap-3">
                <Button type="submit" variant="primary" disabled={isSavingCredentials}>
                  {isSavingCredentials ? "Saving…" : "Save"}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowCredentialsForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-lg text-ivory">Add Email &amp; Password</h2>
                <p className="mt-1 text-sm text-muted">
                  So you can always get back into your account, even without access to this phone number.
                </p>
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="primary" size="sm" onClick={() => setShowCredentialsForm(true)}>
                  Add Now
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setNudgeDismissed(true)}>
                  Not Now
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
        <Card className="p-6" hoverable={false}>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-lg text-ivory">Account Details</h2>
            {!isEditingProfile && (
              <Button type="button" variant="ghost" size="sm" onClick={handleStartEditProfile}>
                Edit
              </Button>
            )}
          </div>

          {profileError && (
            <p className="mb-4 rounded-[var(--radius-card)] border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
              {profileError}
            </p>
          )}
          {profileSuccess && !isEditingProfile && (
            <p className="mb-4 rounded-[var(--radius-card)] border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-gold">
              Account details updated successfully.
            </p>
          )}

          {isEditingProfile ? (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <Field label="Full Name">
                <Input required value={profileForm.fullName} onChange={handleProfileFieldChange("fullName")} />
              </Field>
              <Field label="Email">
                <Input
                  type="email"
                  value={profileForm.email}
                  onChange={handleProfileFieldChange("email")}
                  placeholder="Add an email address"
                />
              </Field>
              <Field label="Phone">
                <Input
                  type="tel"
                  value={profileForm.phone}
                  onChange={handleProfileFieldChange("phone")}
                  placeholder="Add a mobile number"
                />
              </Field>
              <div className="flex gap-3">
                <Button type="submit" variant="outline" disabled={isSavingProfile}>
                  {isSavingProfile ? "Saving…" : "Save"}
                </Button>
                <Button type="button" variant="ghost" onClick={handleCancelEditProfile}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-[0.15em] text-muted">Full Name</dt>
                <dd className="mt-1 text-ivory">{user.fullName}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.15em] text-muted">Email</dt>
                <dd className="mt-1 text-ivory">{user.email || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.15em] text-muted">Phone</dt>
                <dd className="mt-1 text-ivory">{user.phone || "—"}</dd>
              </div>
            </dl>
          )}
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

        <Card className="p-6 md:col-span-2" hoverable={false}>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-lg text-ivory">Two-Factor Authentication</h2>
            <Badge tone={user.mfaEnabled ? "success" : "muted"}>{user.mfaEnabled ? "Enabled" : "Disabled"}</Badge>
          </div>

          {user.mfaEnabled ? (
            <form onSubmit={handleDisableMfaSubmit} className="max-w-sm space-y-4">
              <p className="text-sm text-muted">
                Enter your password to turn off two-factor authentication for this account.
              </p>
              {disableMfaError && (
                <p className="rounded-[var(--radius-card)] border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
                  {disableMfaError}
                </p>
              )}
              <Field label="Password">
                <Input
                  required
                  type="password"
                  autoComplete="current-password"
                  value={disableMfaForm.password}
                  onChange={(e) => setDisableMfaForm({ password: e.target.value })}
                />
              </Field>
              <Button type="submit" variant="outline" disabled={isDisablingMfa}>
                {isDisablingMfa ? "Disabling…" : "Disable Two-Factor Authentication"}
              </Button>
            </form>
          ) : showMfaSetup ? (
            <div className="max-w-sm">
              <MfaSetup onSetup={setupMfa} onConfirm={confirmMfaSetup} onSuccess={() => setShowMfaSetup(false)} />
            </div>
          ) : (
            <div className="max-w-sm space-y-4">
              <p className="text-sm text-muted">
                Add an extra layer of security to your account with a code from an authenticator app.
              </p>
              <Button type="button" variant="outline" onClick={() => setShowMfaSetup(true)}>
                Enable Two-Factor Authentication
              </Button>
            </div>
          )}
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
