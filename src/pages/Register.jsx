import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Field, Input } from "../components/ui/Input";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { fadeInUp } from "../lib/animations";
import { useAuth } from "../context/AuthContext";
import { PATHS } from "../routes/paths";

const EMPTY_VALUES = { fullName: "", email: "", phone: "", password: "" };

export default function Register() {
  const { status, register } = useAuth();
  const navigate = useNavigate();

  const [values, setValues] = useState(EMPTY_VALUES);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (status === "authenticated") {
    return <Navigate to={PATHS.profile} replace />;
  }

  function handleChange(field) {
    return (e) => setValues({ ...values, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setIsSubmitting(true);
    try {
      // Backend treats an empty phone the same as omitted (optional field);
      // send undefined rather than "" so its own optional validator doesn't
      // try to phone-format an empty string.
      await register({ ...values, phone: values.phone || undefined });
      navigate(PATHS.profile, { replace: true });
    } catch (err) {
      if (err.errors?.length) {
        setFieldErrors(Object.fromEntries(err.errors.map((e) => [e.field, e.message])));
      }
      setError(err.message || "Unable to create your account. Please try again.");
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
      <p className="mb-3 text-center text-xs uppercase tracking-[0.3em] text-gold">XeleX Perfume</p>
      <h1 className="text-center font-display text-3xl text-ivory md:text-4xl">Create Account</h1>
      <p className="mt-3 text-center text-sm text-muted">Join us for early access and order tracking.</p>

      <Card className="mt-10 p-6" hoverable={false}>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <p className="rounded-[var(--radius-card)] border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
              {error}
            </p>
          )}

          <Field label="Full Name" error={fieldErrors.fullName}>
            <Input
              required
              autoComplete="name"
              value={values.fullName}
              onChange={handleChange("fullName")}
              placeholder="Your name"
            />
          </Field>

          <Field label="Email Address" error={fieldErrors.email}>
            <Input
              required
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={handleChange("email")}
              placeholder="you@example.com"
            />
          </Field>

          <Field label="Phone Number (Optional)" error={fieldErrors.phone}>
            <Input
              type="tel"
              autoComplete="tel"
              value={values.phone}
              onChange={handleChange("phone")}
              placeholder="+91 98765 43210"
            />
          </Field>

          <Field label="Password" error={fieldErrors.password}>
            <Input
              required
              type="password"
              autoComplete="new-password"
              value={values.password}
              onChange={handleChange("password")}
              placeholder="At least 8 characters"
            />
          </Field>

          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating Account…" : "Create Account"}
          </Button>
        </form>
      </Card>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link to={PATHS.login} className="text-gold hover:text-gold-soft">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}
