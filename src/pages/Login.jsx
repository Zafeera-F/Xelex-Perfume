import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Field, Input } from "../components/ui/Input";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { fadeInUp } from "../lib/animations";
import { useAuth } from "../context/AuthContext";
import { PATHS } from "../routes/paths";

// Matches the backend's own per-phone resend cooldown (auth.service.js's
// requestPhoneOtp, OTP_RESEND_COOLDOWN_MS) — purely a UI countdown, the
// server enforces the real limit regardless of what this shows.
const RESEND_COOLDOWN_SECONDS = 60;

export default function Login() {
  const { status, login, verifyMfaLogin, requestPhoneOtp, verifyPhoneOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState("email"); // "email" | "phone"

  // Email + password (+ optional TOTP step)
  const [values, setValues] = useState({ identifier: "", password: "" });
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);

  // Phone + SMS OTP — no password involved at all for this path.
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [isSubmittingPhone, setIsSubmittingPhone] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Already logged in (e.g. followed a stale bookmark to /login) — bounce
  // straight to the account page instead of showing the form again.
  if (status === "authenticated") {
    return <Navigate to={PATHS.profile} replace />;
  }

  function handleChange(field) {
    return (e) => setValues({ ...values, [field]: e.target.value });
  }

  function goToDestination() {
    const redirectTo = location.state?.from || PATHS.profile;
    navigate(redirectTo, { replace: true });
  }

  async function handleEmailSubmit(e) {
    e.preventDefault();
    setEmailError("");
    setIsSubmittingEmail(true);
    try {
      const result = await login(values);
      if (result.mfaRequired) {
        setMfaRequired(true);
        return;
      }
      goToDestination();
    } catch (err) {
      setEmailError(err.message || "Unable to log in. Please try again.");
    } finally {
      setIsSubmittingEmail(false);
    }
  }

  async function handleMfaSubmit(e) {
    e.preventDefault();
    setEmailError("");
    setIsSubmittingEmail(true);
    try {
      await verifyMfaLogin(mfaCode);
      goToDestination();
    } catch (err) {
      setEmailError(err.message || "Invalid code. Please try again.");
    } finally {
      setIsSubmittingEmail(false);
    }
  }

  async function handleSendCode(e) {
    e.preventDefault();
    setPhoneError("");
    setIsSubmittingPhone(true);
    try {
      await requestPhoneOtp(phone);
      setOtpSent(true);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setPhoneError(err.message || "Unable to send a code. Please try again.");
    } finally {
      setIsSubmittingPhone(false);
    }
  }

  async function handleVerifyCode(e) {
    e.preventDefault();
    setPhoneError("");
    setIsSubmittingPhone(true);
    try {
      await verifyPhoneOtp(phone, otpCode);
      goToDestination();
    } catch (err) {
      setPhoneError(err.message || "Invalid or expired code. Please try again.");
    } finally {
      setIsSubmittingPhone(false);
    }
  }

  function handleUseDifferentNumber() {
    setOtpSent(false);
    setOtpCode("");
    setPhoneError("");
    setResendCooldown(0);
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setEmailError("");
    setPhoneError("");
  }

  const showModeToggle = !mfaRequired && !otpSent;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16"
    >
      <p className="mb-3 text-center text-xs uppercase tracking-[0.3em] text-gold">XeleX Perfume</p>
      <h1 className="text-center font-display text-3xl text-ivory md:text-4xl">Welcome Back</h1>
      <p className="mt-3 text-center text-sm text-muted">
        {mode === "email"
          ? mfaRequired
            ? "Enter the 6-digit code from your authenticator app."
            : "Sign in to view your orders and saved details."
          : otpSent
            ? "Enter the 6-digit code we sent you."
            : "We'll text you a one-time code — no password needed."}
      </p>

      {showModeToggle && (
        <div className="mt-8 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => switchMode("email")}
            className={`border p-3 text-sm transition-colors ${
              mode === "email" ? "border-gold bg-background-soft text-gold" : "border-border text-ivory/70 hover:border-gold/50"
            }`}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => switchMode("phone")}
            className={`border p-3 text-sm transition-colors ${
              mode === "phone" ? "border-gold bg-background-soft text-gold" : "border-border text-ivory/70 hover:border-gold/50"
            }`}
          >
            Phone
          </button>
        </div>
      )}

      <Card className="mt-6 p-6" hoverable={false}>
        {mode === "email" ? (
          mfaRequired ? (
            <form onSubmit={handleMfaSubmit} className="space-y-5">
              {emailError && (
                <p className="rounded-[var(--radius-card)] border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
                  {emailError}
                </p>
              )}

              <Field label="6-Digit Code">
                <Input
                  required
                  autoFocus
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                />
              </Field>

              <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isSubmittingEmail || mfaCode.length !== 6}>
                {isSubmittingEmail ? "Verifying…" : "Verify & Sign In"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleEmailSubmit} className="space-y-5">
              {emailError && (
                <p className="rounded-[var(--radius-card)] border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
                  {emailError}
                </p>
              )}

              <Field label="Email Address">
                <Input
                  required
                  type="email"
                  autoComplete="email"
                  value={values.identifier}
                  onChange={handleChange("identifier")}
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

              <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isSubmittingEmail}>
                {isSubmittingEmail ? "Signing In…" : "Sign In"}
              </Button>
            </form>
          )
        ) : otpSent ? (
          <form onSubmit={handleVerifyCode} className="space-y-5">
            {phoneError && (
              <p className="rounded-[var(--radius-card)] border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
                {phoneError}
              </p>
            )}

            <Field label="6-Digit Code">
              <Input
                required
                autoFocus
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
              />
            </Field>

            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isSubmittingPhone || otpCode.length !== 6}>
              {isSubmittingPhone ? "Verifying…" : "Verify & Sign In"}
            </Button>

            <div className="flex items-center justify-between text-xs text-muted">
              <button
                type="button"
                onClick={handleSendCode}
                disabled={resendCooldown > 0 || isSubmittingPhone}
                className="text-gold hover:text-gold-soft disabled:pointer-events-none disabled:opacity-40"
              >
                {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend code"}
              </button>
              <button type="button" onClick={handleUseDifferentNumber} className="hover:text-ivory">
                Use a different number
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSendCode} className="space-y-5">
            {phoneError && (
              <p className="rounded-[var(--radius-card)] border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
                {phoneError}
              </p>
            )}

            <Field label="Mobile Number">
              <Input
                required
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="98765 43210"
              />
            </Field>

            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isSubmittingPhone || !phone}>
              {isSubmittingPhone ? "Sending Code…" : "Send Code"}
            </Button>
          </form>
        )}
      </Card>

      {mode === "email" && (
        <p className="mt-6 text-center text-sm text-muted">
          Don't have an account?{" "}
          <Link to={PATHS.register} className="text-gold hover:text-gold-soft">
            Create one
          </Link>
        </p>
      )}
    </motion.div>
  );
}
