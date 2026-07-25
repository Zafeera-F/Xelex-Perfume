import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Plus, Pencil, Trash2, ImageOff, Eye, EyeOff } from "lucide-react";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/admin/Pagination";
import { getAdminProducts, deleteProduct, updateProduct } from "../../lib/adminProducts";
import { PATHS } from "../../routes/paths";

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "deleted", label: "Deleted" },
];

export default function AdminProductList() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(() => Number(searchParams.get("page")) || 1);
  const [status, setStatus] = useState(() => searchParams.get("status") || "");
  const [search, setSearch] = useState(() => searchParams.get("search") || "");
  const [lowStock, setLowStock] = useState(() => searchParams.get("lowStock") === "1");
  const [loading, setLoading] = useState(true);

  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Two-way URL sync, same pattern as Shop.jsx: `isInternalUrlUpdateRef`
  // marks a searchParams change as self-inflicted (this effect echoing
  // local state) so the read-effect below doesn't treat it as a fresh
  // external navigation (dashboard card click, Back/Forward).
  const skipNextUrlWriteRef = useRef(false);
  const isInternalUrlUpdateRef = useRef(false);
  useEffect(() => {
    if (skipNextUrlWriteRef.current) {
      skipNextUrlWriteRef.current = false;
      return;
    }
    const next = new URLSearchParams();
    if (status) next.set("status", status);
    if (debouncedSearch) next.set("search", debouncedSearch);
    if (lowStock) next.set("lowStock", "1");
    if (page !== 1) next.set("page", String(page));
    isInternalUrlUpdateRef.current = true;
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, debouncedSearch, lowStock, page]);

  // React to external URL changes (a dashboard card link, or Back/Forward) —
  // replaces whatever filter was active with the one now in the URL.
  useEffect(() => {
    if (isInternalUrlUpdateRef.current) {
      isInternalUrlUpdateRef.current = false;
      return;
    }
    skipNextUrlWriteRef.current = true;
    setStatus(searchParams.get("status") || "");
    setSearch(searchParams.get("search") || "");
    setLowStock(searchParams.get("lowStock") === "1");
    setPage(Number(searchParams.get("page")) || 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getAdminProducts({ page, pageSize: 10, search: debouncedSearch, status, lowStock })
      .then((res) => {
        if (cancelled) return;
        setProducts(res.items);
        setTotal(res.total);
      })
      .catch(() => {
        if (!cancelled) {
          setProducts([]);
          setTotal(0);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch, status, lowStock]);

  async function handleDelete(product) {
    if (!window.confirm(`Delete "${product.name}"? This can't be undone from here.`)) return;
    await deleteProduct(product.id);
    setProducts((prev) => prev.filter((p) => p.id !== product.id));
    setTotal((prev) => prev - 1);
  }

  async function handleToggleActive(product) {
    const updated = await updateProduct(product.id, { isActive: !product.isActive });
    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, isActive: updated.isActive } : p)));
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl text-ivory">Products</h1>
        <Button as={Link} to={PATHS.admin.newProduct} variant="primary" size="sm">
          <Plus size={15} className="mr-1" />
          Add Product
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by name..."
          className="max-w-xs"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="border border-border bg-background-soft px-4 py-3 text-sm text-ivory outline-none transition-colors focus:border-gold"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-ivory/80">
          <input
            type="checkbox"
            checked={lowStock}
            onChange={(e) => {
              setLowStock(e.target.checked);
              setPage(1);
            }}
            className="h-4 w-4 accent-gold"
          />
          Low Stock only
        </label>
      </div>

      <div className="mt-6 overflow-x-auto border border-border">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-[0.1em] text-muted">
              <th className="px-4 py-3 font-normal">Product</th>
              <th className="px-4 py-3 font-normal">Category</th>
              <th className="px-4 py-3 font-normal">Price</th>
              <th className="px-4 py-3 font-normal">Stock</th>
              <th className="px-4 py-3 font-normal">Status</th>
              <th className="px-4 py-3 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted">Loading…</td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <EmptyState title="No products found" description="Try a different search or filter." />
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="border-b border-border last:border-none">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden bg-background-soft">
                        {product.image ? (
                          <img src={product.image} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <ImageOff size={16} className="text-muted" />
                        )}
                      </div>
                      <div>
                        <p className="text-ivory">{product.name}</p>
                        <p className="text-xs text-muted">{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ivory/80">{product.category || "—"}</td>
                  <td className="px-4 py-3 text-gold">₹{product.price.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-ivory/80">
                    <div className="flex items-center gap-2">
                      <span>{product.stockQuantity}</span>
                      {product.stockQuantity > 0 && product.stockQuantity < 10 && (
                        <Badge tone="gold">Low Stock</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {product.deletedAt ? (
                      <Badge tone="muted">Deleted</Badge>
                    ) : product.isActive ? (
                      <Badge tone="success">Active</Badge>
                    ) : (
                      <Badge tone="muted">Inactive</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        to={PATHS.admin.editProduct(product.id)}
                        aria-label={`Edit ${product.name}`}
                        className="text-ivory/60 transition-colors hover:text-gold"
                      >
                        <Pencil size={15} />
                      </Link>
                      {!product.deletedAt && (
                        <button
                          onClick={() => handleToggleActive(product)}
                          aria-label={product.isActive ? `Disable ${product.name}` : `Enable ${product.name}`}
                          className="text-ivory/60 transition-colors hover:text-gold"
                        >
                          {product.isActive ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      )}
                      {!product.deletedAt && (
                        <button
                          onClick={() => handleDelete(product)}
                          aria-label={`Delete ${product.name}`}
                          className="text-ivory/60 transition-colors hover:text-error"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} pageSize={10} total={total} onPageChange={setPage} />
    </div>
  );
}
