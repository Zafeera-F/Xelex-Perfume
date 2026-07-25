/**
 * Card — the base surface for product tiles, dashboard panels, and content blocks.
 * Keep it a plain shell; compose specific card types (ProductCard, StatCard) around it
 * so the visual language (color, border, radius) never has to be redefined per feature.
 */
export default function Card({ as: Component = "div", className = "", children, hoverable = true, ...props }) {
  return (
    <Component
      className={`bg-card border border-border rounded-[var(--radius-card)]
        ${hoverable ? "transition-colors duration-300 hover:bg-card-hover hover:border-gold/30" : ""}
        ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
