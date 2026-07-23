import { Search, LayoutGrid, List, SlidersHorizontal } from "lucide-react";
import { Input } from "../ui/Input";

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
];

export default function ProductToolbar({
  search,
  onSearchChange,
  sort,
  onSortChange,
  view,
  onViewChange,
  resultCount,
  onOpenMobileFilters,
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileFilters}
          className="flex items-center gap-2 border border-border px-4 py-2.5 text-xs uppercase tracking-[0.15em] text-ivory/80 transition-colors hover:border-gold hover:text-gold md:hidden"
        >
          <SlidersHorizontal size={14} />
          Filters
        </button>
        <p className="text-sm text-muted">
          <span className="text-ivory">{resultCount}</span> fragrance{resultCount !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <div className="relative w-full sm:w-64">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <Input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search fragrances..."
            aria-label="Search fragrances"
            className="w-full py-3.5 pl-10 pr-4 text-base sm:py-3 sm:text-sm"
          />
        </div>

        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full border border-border bg-background-soft px-4 py-3 text-sm text-ivory outline-none transition-colors focus:border-gold sm:w-auto"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <div className="flex items-center gap-1 self-start border border-border p-1">
          <button
            aria-label="Grid view"
            onClick={() => onViewChange("grid")}
            className={`p-2 transition-colors ${view === "grid" ? "bg-gold text-background" : "text-ivory/60 hover:text-gold"}`}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            aria-label="List view"
            onClick={() => onViewChange("list")}
            className={`p-2 transition-colors ${view === "list" ? "bg-gold text-background" : "text-ivory/60 hover:text-gold"}`}
          >
            <List size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
