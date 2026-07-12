/**
 * Input — shared text input styling for every form in the app
 * (login, checkout, contact, admin). Pair with <Field> for label + error text.
 */
export function Input({ className = "", error = false, ...props }) {
  return (
    <input
      className={`w-full bg-background-soft border rounded-[var(--radius-card)]
        px-4 py-3 text-sm font-body text-ivory placeholder:text-muted
        transition-colors duration-200 outline-none
        ${error ? "border-error" : "border-border focus:border-gold"}
        ${className}`}
      {...props}
    />
  );
}

/**
 * Field — wraps a label, an input (or any control), and optional error text
 * so every form field in the app is spaced and labeled identically.
 * Usage: <Field label="Email address"><Input type="email" /></Field>
 */
export function Field({ label, htmlFor, error, children }) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label
          htmlFor={htmlFor}
          className="text-xs font-body uppercase tracking-[0.15em] text-muted"
        >
          {label}
        </label>
      )}
      {children}
      {error && <span className="text-xs text-error">{error}</span>}
    </div>
  );
}
