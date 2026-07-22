import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import Breadcrumb from "../components/ui/Breadcrumb";
import SectionDivider from "../components/ui/SectionDivider";
import FilterSidebar from "../components/shop/FilterSidebar";
import MobileFilterDrawer from "../components/shop/MobileFilterDrawer";
import ProductToolbar from "../components/shop/ProductToolbar";
import ProductGrid from "../components/shop/ProductGrid";
import EmptyState from "../components/ui/EmptyState";
import { fadeInUp } from "../lib/animations";
import { getProducts, getFacets } from "../lib/products";

const PAGE_SIZE = 6;

const EMPTY_FACETS = { categories: [], collections: [], lines: [], priceBounds: { min: 0, max: 0 } };

const DEFAULT_FILTERS = {
  categories: [],
  collections: [],
  lines: [],
  priceMax: Infinity, // widened until the real price bounds arrive from GET /api/products/facets
  minRating: 0,
  inStockOnly: false,
};

export default function Shop() {
  const [searchParams] = useSearchParams();
  // Read once on mount — the footer/nav links that set this (?filter=
  // best-sellers|new-arrivals) are entry points into the page, not a live
  // filter control the sidebar exposes, so there's no need to re-fetch if
  // it changes after the initial load.
  const [filterParam] = useState(() => searchParams.get("filter"));
  const [products, setProducts] = useState([]);
  const [facets, setFacets] = useState(EMPTY_FACETS);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");
  const [view, setView] = useState("grid");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(false);

    Promise.all([getProducts({ bestSeller: filterParam === "best-sellers" }), getFacets()])
      .then(([productsData, facetsData]) => {
        if (cancelled) return;
        setProducts(productsData);
        setFacets(facetsData);
        setFilters((prev) => ({ ...prev, priceMax: facetsData.priceBounds.max }));
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // filterParam is seeded once via useState's lazy initializer and never
    // changes after mount, so listing it here never causes a re-fetch.
  }, [filterParam]);

  // Reset pagination whenever filters/search/sort change so users don't
  // land on an empty "page 3" of a much smaller filtered result set.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filters, search, sort]);

  function toggleFilter(key, value) {
    setFilters((prev) => {
      const current = prev[key];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [key]: next };
    });
  }

  function clearFilters() {
    setFilters({ ...DEFAULT_FILTERS, priceMax: facets.priceBounds.max });
    setSearch("");
  }

  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      if (filterParam === "new-arrivals" && p.badge !== "New") return false;
      if (filters.categories.length && !filters.categories.includes(p.category)) return false;
      if (filters.collections.length && !filters.collections.includes(p.collection)) return false;
      if (filters.lines.length && !filters.lines.includes(p.line)) return false;
      if (p.price > filters.priceMax) return false;
      if (filters.minRating && p.rating < filters.minRating) return false;
      if (filters.inStockOnly && !p.inStock) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

    switch (sort) {
      case "price-asc":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;
      default:
        break; // "featured" — catalog order
    }

    return result;
  }, [products, filters, search, sort, filterParam]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  const filterProps = {
    filters,
    categories: facets.categories,
    collections: facets.collections,
    lines: facets.lines,
    priceBounds: facets.priceBounds,
    onToggle: toggleFilter,
    onPriceChange: (val) => setFilters((prev) => ({ ...prev, priceMax: val })),
    onRatingChange: (val) => setFilters((prev) => ({ ...prev, minRating: val })),
    onAvailabilityChange: (val) => setFilters((prev) => ({ ...prev, inStockOnly: val })),
    onClear: clearFilters,
  };

  return (
    <div>
      {/* Hero / Banner */}
      <section className="border-b border-border bg-background-soft">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="mx-auto max-w-7xl px-6 py-14 md:px-10"
        >
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Shop" }]} />
          <h1 className="mt-4 font-display text-3xl text-ivory md:text-4xl">
            The Full Collection
          </h1>
          <p className="mt-2 max-w-md text-sm text-muted">
            Every XeleX fragrance, in one place — from signature everyday scents
            to rare, limited releases.
          </p>
        </motion.div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-12 md:px-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[240px_1fr]">
          {/* Desktop sidebar */}
          <aside className="hidden md:block">
            <FilterSidebar {...filterProps} />
          </aside>

          {/* Mobile drawer */}
          <MobileFilterDrawer
            open={mobileFiltersOpen}
            onClose={() => setMobileFiltersOpen(false)}
            {...filterProps}
          />

          <div>
            <ProductToolbar
              search={search}
              onSearchChange={setSearch}
              sort={sort}
              onSortChange={setSort}
              view={view}
              onViewChange={setView}
              resultCount={filteredProducts.length}
              onOpenMobileFilters={() => setMobileFiltersOpen(true)}
            />

            <SectionDivider className="my-8 opacity-40" />

            {loadError ? (
              <EmptyState
                title="Couldn't load the collection"
                description="Something went wrong reaching the catalog. Please refresh to try again."
              />
            ) : (
              <ProductGrid
                products={visibleProducts}
                view={view}
                loading={loading}
                hasMore={hasMore}
                onLoadMore={() => setVisibleCount((c) => c + PAGE_SIZE)}
                onClearFilters={clearFilters}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
