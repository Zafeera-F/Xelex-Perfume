const TONES = {
  gold: "border-gold/50 text-gold",
  muted: "border-border text-muted",
  success: "border-success/50 text-success",
};

/**
 * Badge — small uppercase label. Use sparingly: one badge per product card max.
 * Usage: <Badge tone="gold">Best Seller</Badge>
 */
export default function Badge({ tone = "gold", children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded-[var(--radius-pill)] border px-3 py-1
        text-[10px] font-body font-medium uppercase tracking-[0.15em]
        ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
