import { useState } from "react";
import { Field, Input } from "./Input";
import Button from "./Button";

/**
 * MfaSetup — QR enrollment + code confirmation, shared by the customer
 * Profile page (optional) and the admin mandatory setup page. Realm-
 * agnostic: the caller supplies `onSetup` (returns { secret, qrCodeDataUrl })
 * and `onConfirm(code)` from whichever auth context applies, so this
 * component never needs to know which cookie/endpoint realm it's in.
 */
export default function MfaSetup({ onSetup, onConfirm, onSuccess, submitLabel = "Enable Two-Factor Authentication" }) {
  const [step, setStep] = useState("start"); // "start" | "scan" | "loading"
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState(null);
  const [secret, setSecret] = useState(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleStart() {
    setError("");
    setStep("loading");
    try {
      const result = await onSetup();
      setSecret(result.secret);
      setQrCodeDataUrl(result.qrCodeDataUrl);
      setStep("scan");
    } catch (err) {
      setError(err.message || "Unable to start setup. Please try again.");
      setStep("start");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await onConfirm(code);
      onSuccess?.();
    } catch (err) {
      setError(err.message || "Invalid code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (step === "start") {
    return (
      <div className="space-y-4">
        {error && (
          <p className="rounded-[var(--radius-card)] border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
            {error}
          </p>
        )}
        <p className="text-sm text-muted">
          Protect this account with a 6-digit code from an authenticator app (Google Authenticator, Authy, or
          similar) in addition to your password.
        </p>
        <Button type="button" variant="outline" className="w-full" onClick={handleStart}>
          Get Started
        </Button>
      </div>
    );
  }

  if (step === "loading") {
    return <div className="min-h-[120px]" />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="rounded-[var(--radius-card)] border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </p>
      )}

      <p className="text-sm text-muted">
        Scan this QR code with your authenticator app, then enter the 6-digit code it shows.
      </p>

      {qrCodeDataUrl && (
        <div className="flex justify-center rounded-[var(--radius-card)] border border-border bg-ivory p-4">
          <img src={qrCodeDataUrl} alt="Two-factor authentication QR code" className="h-40 w-40" />
        </div>
      )}

      {secret && (
        <p className="break-all text-center text-xs text-muted">
          Can't scan? Enter this key manually: <span className="text-ivory">{secret}</span>
        </p>
      )}

      <Field label="6-Digit Code">
        <Input
          required
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          placeholder="000000"
        />
      </Field>

      <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting || code.length !== 6}>
        {isSubmitting ? "Verifying…" : submitLabel}
      </Button>
    </form>
  );
}
