const VARIANTS = {
  primary:
    "bg-gold text-background hover:bg-gold-soft shadow-[var(--shadow-gold-glow)]",
  outline:
    "border border-gold/60 text-gold hover:bg-gold hover:text-background",
  ghost:
    "text-ivory/80 hover:text-gold",
};

const SIZES = {
  sm: "px-4 py-2 text-xs",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
};

/**
 * Button — the single source of truth for every clickable action in the app.
 * Usage: <Button variant="outline" size="lg">Explore Collection</Button>
 */
export default function Button({
  as: Component = "button",
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}) {
  return (
    <Component
      className={`inline-flex items-center justify-center gap-2 font-body font-medium tracking-wide
        uppercase transition-all duration-300 ease-out rounded-[var(--radius-card)]
        disabled:opacity-40 disabled:pointer-events-none
        ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
