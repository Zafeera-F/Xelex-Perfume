import { Star } from "lucide-react";
import Button from "../ui/Button";

const RATINGS = [4, 3, 2];

function FilterGroup({ title, children }) {
  return (
    <div className="border-b border-border py-6 first:pt-0 last:border-none">
      <h4 className="mb-4 text-xs uppercase tracking-[0.2em] text-gold">{title}</h4>
      {children}
    </div>
  );
}

function CheckboxRow({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 py-1.5 text-sm text-ivory/80 transition-colors hover:text-ivory">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-[var(--color-gold)]"
      />
      {label}
    </label>
  );
}

/**
 * FilterSidebar — pure UI + callbacks. All filter state lives in Shop.jsx
 * (the parent), so this component can be rendered both inline (desktop
 * sidebar) and inside MobileFilterDrawer without duplicating state logic.
 */
export default function FilterSidebar({
  filters,
  categories,
  collections,
  lines,
  priceBounds,
  onToggle,
  onPriceChange,
  onRatingChange,
  onAvailabilityChange,
  onClear,
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-display text-lg text-ivory">Filters</h3>
        <button onClick={onClear} className="text-xs uppercase tracking-[0.15em] text-muted hover:text-gold">
          Clear all
        </button>
      </div>

      <FilterGroup title="Category">
        {categories.map((c) => (
          <CheckboxRow
            key={c}
            label={c}
            checked={filters.categories.includes(c)}
            onChange={() => onToggle("categories", c)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Collection">
        {collections.map((c) => (
          <CheckboxRow
            key={c}
            label={c}
            checked={filters.collections.includes(c)}
            onChange={() => onToggle("collections", c)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Price Range">
        <div className="flex items-center justify-between text-sm text-ivory/80">
          <span>₹{filters.priceMax.toLocaleString("en-IN")}</span>
          <span className="text-muted">up to ₹{priceBounds.max.toLocaleString("en-IN")}</span>
        </div>
        <input
          type="range"
          min={priceBounds.min}
          max={priceBounds.max}
          step={100}
          value={filters.priceMax}
          onChange={(e) => onPriceChange(Number(e.target.value))}
          className="mt-3 w-full accent-[var(--color-gold)]"
        />
      </FilterGroup>

      <FilterGroup title="Brand">
        {lines.map((line) => (
          <CheckboxRow
            key={line}
            label={line}
            checked={filters.lines.includes(line)}
            onChange={() => onToggle("lines", line)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Rating">
        {RATINGS.map((r) => (
          <label
            key={r}
            className="flex cursor-pointer items-center gap-2 py-1.5 text-sm text-ivory/80 transition-colors hover:text-ivory"
          >
            <input
              type="radio"
              name="rating"
              checked={filters.minRating === r}
              onChange={() => onRatingChange(r)}
              className="h-4 w-4 accent-[var(--color-gold)]"
            />
            <span className="flex items-center gap-1">
              {Array.from({ length: r }).map((_, i) => (
                <Star key={i} size={13} className="fill-gold text-gold" />
              ))}
              <span className="ml-1 text-muted">&amp; up</span>
            </span>
          </label>
        ))}
      </FilterGroup>

      <FilterGroup title="Availability">
        <CheckboxRow
          label="In Stock Only"
          checked={filters.inStockOnly}
          onChange={() => onAvailabilityChange(!filters.inStockOnly)}
        />
      </FilterGroup>

      <Button variant="outline" size="sm" className="mt-6 w-full md:hidden" onClick={onClear}>
        Reset Filters
      </Button>
    </div>
  );
}
