/**
 * Logo — text wordmark treatment. No image asset needed; the letterforms
 * themselves (Cinzel, bold, full gold) carry the brand mark until a
 * physical logo asset is supplied.
 */
export default function Logo({ className = "" }) {
  return (
    <span
      className={`font-display text-xl font-bold tracking-[0.2em] text-gold select-none ${className}`}
    >
      XELEX
      <span className="ml-2 hidden text-[0.55em] font-body font-light tracking-[0.4em] text-muted sm:inline">
        PERFUMES
      </span>
    </span>
  );
}