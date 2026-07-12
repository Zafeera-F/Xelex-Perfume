import { Minus, Plus } from "lucide-react";

/**
 * QuantitySelector — plain controlled stepper. Reusable on Product Details
 * now, and the Cart page later (cart line items need the same +/- control).
 */
export default function QuantitySelector({ value, onChange, min = 1, max = 10 }) {
  return (
    <div className="flex items-center border border-border">
      <button
        aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="p-3 text-ivory/70 transition-colors hover:text-gold disabled:opacity-30 disabled:pointer-events-none"
      >
        <Minus size={14} />
      </button>
      <span className="w-10 text-center text-sm text-ivory">{value}</span>
      <button
        aria-label="Increase quantity"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="p-3 text-ivory/70 transition-colors hover:text-gold disabled:opacity-30 disabled:pointer-events-none"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
