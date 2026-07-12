import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Field, Input } from "../components/ui/Input";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { fadeInUp } from "../lib/animations";
import { useAuth } from "../context/AuthContext";
import { PATHS } from "../routes/paths";

export default function Login() {
  const { status, login, verifyMfaLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [values, setValues] = useState({ email: "", password: "" });
  const [mfaRequired, setMfaRequired] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Already logged in (e.g. followed a stale bookmark to /login) — bounce
  // straight to the account page instead of showing the form again.
  if (status === "authenticated") {
    return <Navigate to={PATHS.profile} replace />;
  }

  function handleChange(field) {
    return (e) => setValues({ ...values, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const result = await login(values);
      if (result.mfaRequired) {
        setMfaRequired(true);
        return;
      }
      const redirectTo = location.state?.from || PATHS.profile;
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || "Unable to log in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifySubmit(e) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await verifyMfaLogin(code);
      const redirectTo = location.state?.from || PATHS.profile;
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || "Invalid code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16"
    >
      <p className="mb-3 text-center text-xs uppercase tracking-[0.3em] text-gold">XeleX Perfumes</p>
      <h1 className="text-center font-display text-3xl text-ivory md:text-4xl">Welcome Back</h1>
      <p className="mt-3 text-center text-sm text-muted">
        {mfaRequired ? "Enter the 6-digit code from your authenticator app." : "Sign in to view your orders and saved details."}
      </p>

      <Card className="mt-10 p-6" hoverable={false}>
        {mfaRequired ? (
          <form onSubmit={handleVerifySubmit} className="space-y-5">
            {error && (
              <p className="rounded-[var(--radius-card)] border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
                {error}
              </p>
            )}

            <Field label="6-Digit Code">
              <Input
                required
                autoFocus
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
              />
            </Field>

            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isSubmitting || code.length !== 6}>
              {isSubmitting ? "Verifying…" : "Verify & Sign In"}
            </Button>
          </form>
        ) : (
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
                placeholder="you@example.com"
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
        )}
      </Card>

      <p className="mt-6 text-center text-sm text-muted">
        Don't have an account?{" "}
        <Link to={PATHS.register} className="text-gold hover:text-gold-soft">
          Create one
        </Link>
      </p>
    </motion.div>
  );
}
