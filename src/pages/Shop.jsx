import { useEffect, useMemo, useRef, useState } from "react";
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
const SEARCH_DEBOUNCE_MS = 300;

const EMPTY_FACETS = { categories: [], collections: [], lines: [], priceBounds: { min: 0, max: 0 } };

function parseListParam(value) {
  return value ? value.split(",").filter(Boolean) : [];
}

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Derived fresh from the URL on every render (not useState) — Best
  // Sellers, New Arrivals, and All Fragrances are all the same /shop route,
  // so clicking between those footer links only changes the query string
  // without remounting this component. A frozen useState snapshot would
  // never notice that change; this does. It still isn't part of the
  // ongoing two-way sync scheme below (it drives *what gets fetched*, not a
  // toggle-able filter dimension) — the write-effect just echoes whatever
  // this currently is back into the URL so it's never silently dropped.
  const filterParam = searchParams.get("filter");

  const [products, setProducts] = useState([]);
  const [facets, setFacets] = useState(EMPTY_FACETS);

  const [filters, setFilters] = useState(() => ({
    categories: parseListParam(searchParams.get("category")),
    collections: parseListParam(searchParams.get("collection")),
    lines: parseListParam(searchParams.get("line")),
    // Infinity until either a URL value or the real bounds from
    // GET /api/products/facets arrive — Infinity is a safe "no cap yet"
    // sentinel since it can never be less than a real product price.
    priceMax: Number(searchParams.get("priceMax")) || Infinity,
    minRating: Number(searchParams.get("minRating")) || 0,
    inStockOnly: searchParams.get("inStock") === "1",
  }));
  const [search, setSearch] = useState(() => searchParams.get("search") || "");
  const [sort, setSort] = useState(() => searchParams.get("sort") || "featured");
  const [view, setView] = useState(() => searchParams.get("view") || "grid");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // Debounced separately from `search` itself — typing updates the input
  // instantly, but the actual filtering (and the URL sync below) only
  // reacts ~300ms after the user stops typing, so a fast typist doesn't
  // recompute the list or rewrite the address bar on every keystroke.
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(false);

    Promise.all([getProducts({ bestSeller: filterParam === "best-sellers" }), getFacets()])
      .then(([productsData, facetsData]) => {
        if (cancelled) return;
        setProducts(productsData);
        setFacets(facetsData);
        setFilters((prev) => ({
          ...prev,
          priceMax: prev.priceMax === Infinity ? facetsData.priceBounds.max : prev.priceMax,
          // The footer's category links use lowercase, URL-friendly names
          // (?category=men) — resolve them to the real, exactly-cased
          // category name once the facet list is known, so both the
          // filter predicate and the sidebar's checked-checkbox state
          // (an exact-match .includes() check) work correctly.
          categories: prev.categories.map(
            (c) => facetsData.categories.find((fc) => fc.toLowerCase() === c.toLowerCase()) || c
          ),
        }));
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
  }, [filterParam]);

  // Reset pagination whenever the applied filters/search/sort change so
  // users don't land on an empty "page 3" of a much smaller result set.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filters, debouncedSearch, sort]);

  // Keep the URL in sync with the current filter state (two-way sync, per
  // request) — `replace`, not `push`, so a filter tweak doesn't create a
  // new Back-button stop for every checkbox click; only genuine page
  // navigations (e.g. clicking into a product) do that. Guarded by the ref
  // below so this never fights with the "read from URL" effect underneath it.
  const skipNextUrlWriteRef = useRef(false);
  // Marks a searchParams change as "we did this to ourselves" (echoing local
  // filter state into the URL) versus a genuine external navigation (footer
  // link, Back/Forward). The read-effect below uses this to decide whether
  // to scroll to top — a sidebar checkbox tweak shouldn't yank scroll
  // position, but landing on a fresh preset like ?filter=best-sellers from
  // the footer should, even though both are "just a query-string change" as
  // far as the router is concerned.
  const isInternalUrlUpdateRef = useRef(false);
  useEffect(() => {
    if (skipNextUrlWriteRef.current) {
      skipNextUrlWriteRef.current = false;
      return;
    }
    const next = new URLSearchParams();
    if (filterParam) next.set("filter", filterParam);
    if (filters.categories.length) next.set("category", filters.categories.join(","));
    if (filters.collections.length) next.set("collection", filters.collections.join(","));
    if (filters.lines.length) next.set("line", filters.lines.join(","));
    // Only shown once it's a genuine active filter (moved away from the
    // catalog's real max) — otherwise every fresh page load would show a
    // priceMax in the URL the instant facets resolve, even though the user
    // never touched the slider.
    if (filters.priceMax !== Infinity && filters.priceMax !== facets.priceBounds.max) {
      next.set("priceMax", String(filters.priceMax));
    }
    if (filters.minRating) next.set("minRating", String(filters.minRating));
    if (filters.inStockOnly) next.set("inStock", "1");
    if (debouncedSearch) next.set("search", debouncedSearch);
    if (sort !== "featured") next.set("sort", sort);
    if (view !== "grid") next.set("view", view);
    isInternalUrlUpdateRef.current = true;
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.categories,
    filters.collections,
    filters.lines,
    filters.priceMax,
    filters.minRating,
    filters.inStockOnly,
    debouncedSearch,
    sort,
    view,
  ]);

  // React to external URL changes (browser Back/Forward, or a fresh link
  // like the footer's ?category=men) by re-deriving filter state from the
  // URL. The ref set here tells the write-effect above to skip its very
  // next run, so this never bounces straight back into a second rewrite.
  useEffect(() => {
    const isExternalNavigation = !isInternalUrlUpdateRef.current;
    isInternalUrlUpdateRef.current = false;
    skipNextUrlWriteRef.current = true;
    setFilters((prev) => ({
      ...prev,
      categories: parseListParam(searchParams.get("category")),
      collections: parseListParam(searchParams.get("collection")),
      lines: parseListParam(searchParams.get("line")),
      // Absent from the URL just means "not actively filtered by price" —
      // keep whatever's already resolved (the facet-derived max, once
      // known) rather than resetting to the Infinity sentinel, which would
      // render as a literal "∞" in the sidebar's price display.
      priceMax: searchParams.has("priceMax") ? Number(searchParams.get("priceMax")) : prev.priceMax,
      minRating: Number(searchParams.get("minRating")) || 0,
      inStockOnly: searchParams.get("inStock") === "1",
    }));
    setSearch(searchParams.get("search") || "");
    setSort(searchParams.get("sort") || "featured");
    setView(searchParams.get("view") || "grid");
    if (isExternalNavigation) {
      window.scrollTo(0, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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
    setFilters({
      categories: [],
      collections: [],
      lines: [],
      priceMax: facets.priceBounds.max,
      minRating: 0,
      inStockOnly: false,
    });
    setSearch("");
  }

  const filteredProducts = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();

    let result = products.filter((p) => {
      if (filterParam === "new-arrivals" && p.badge !== "New") return false;
      if (filters.categories.length && !filters.categories.includes(p.category)) return false;
      if (filters.collections.length && !filters.collections.includes(p.collection)) return false;
      if (filters.lines.length && !filters.lines.includes(p.line)) return false;
      if (p.price > filters.priceMax) return false;
      if (filters.minRating && p.rating < filters.minRating) return false;
      if (filters.inStockOnly && !p.inStock) return false;
      if (query) {
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesCategory = (p.category || "").toLowerCase().includes(query);
        const matchesLine = (p.line || "").toLowerCase().includes(query);
        if (!matchesName && !matchesCategory && !matchesLine) return false;
      }
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
  }, [products, filters, debouncedSearch, sort, filterParam]);

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
