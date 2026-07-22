/**
 * Logo — the gold X emblem (public/logo.png) paired with the text
 * wordmark. The emblem doesn't spell out the brand name on its own, so the
 * text stays alongside it for legibility rather than replacing it.
 *
 * `compact` stacks "PERFUME" under "XELEX" instead of running both on one
 * line — for narrow fixed-width contexts (the admin sidebar is only
 * ~208px of usable width) where a single-line lockup would overflow.
 * Stacking guarantees it stays within the width regardless of exact font
 * metrics, instead of relying on a tight pixel fit. The default
 * (non-compact) single-line form is for the storefront navbar/footer,
 * which have plenty of horizontal room.
 */
export default function Logo({ className = "", compact = false }) {
  if (compact) {
    return (
      <span className={`inline-flex select-none items-center gap-2 ${className}`}>
        <img src="/logo.png" alt="" className="h-8 w-auto flex-shrink-0" />
        <span className="flex flex-col leading-tight">
          <span className="font-display text-base font-bold tracking-[0.15em] text-gold">XELEX</span>
          <span className="text-[9px] font-body font-light tracking-[0.2em] text-muted">PERFUME</span>
        </span>
      </span>
    );
  }

  return (
    <span className={`inline-flex select-none items-center gap-2 ${className}`}>
      <img src="/logo.png" alt="" className="h-8 w-auto" />
      <span className="font-display text-xl font-bold tracking-[0.2em] text-gold">
        XELEX
        <span className="ml-2 hidden text-[0.55em] font-body font-light tracking-[0.4em] text-muted sm:inline">
          PERFUME
        </span>
      </span>
    </span>
  );
}