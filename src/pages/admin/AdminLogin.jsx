import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Field, Input } from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Logo from "../../components/ui/Logo";
import { fadeInUp } from "../../lib/animations";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { PATHS } from "../../routes/paths";

export default function AdminLogin() {
  const { status, login } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [values, setValues] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (status === "authenticated") {
    return <Navigate to={PATHS.admin.products} replace />;
  }

  function handleChange(field) {
    return (e) => setValues({ ...values, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await login(values);
      navigate(location.state?.from || PATHS.admin.products, { replace: true });
    } catch (err) {
      setError(err.message || "Unable to log in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <h1 className="text-center font-display text-2xl text-ivory">Admin Sign In</h1>
        <p className="mt-2 text-center text-sm text-muted">Staff access only.</p>

        <Card className="mt-8 p-6" hoverable={false}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <p className="rounded-[var(--radius-card)] border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
                {error}
              </p>
            )}

            <Field label="Email Address">
              <Input
                required
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={handleChange("email")}
                placeholder="admin@xelexperfumes.com"
              />
            </Field>

            <Field label="Password">
              <Input
                required
                type="password"
                autoComplete="current-password"
                value={values.password}
                onChange={handleChange("password")}
                placeholder="••••••••"
              />
            </Field>

            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing In…" : "Sign In"}
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
