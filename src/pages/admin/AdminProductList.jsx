import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, ImageOff } from "lucide-react";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/admin/Pagination";
import { getAdminProducts, deleteProduct } from "../../lib/adminProducts";
import { PATHS } from "../../routes/paths";

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "deleted", label: "Deleted" },
];

export default function AdminProductList() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => setPage(1), [status, search]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    // Small debounce on search so every keystroke doesn't fire a request.
    const t = setTimeout(() => {
      getAdminProducts({ page, pageSize: 10, search, status })
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
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [page, search, status]);

  async function handleDelete(product) {
    if (!window.confirm(`Delete "${product.name}"? This can't be undone from here.`)) return;
    await deleteProduct(product.id);
    setProducts((prev) => prev.filter((p) => p.id !== product.id));
    setTotal((prev) => prev - 1);
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
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name..."
          className="max-w-xs"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-border bg-background-soft px-4 py-3 text-sm text-ivory outline-none transition-colors focus:border-gold"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
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
                  <td className="px-4 py-3 text-ivory/80">{product.stockQuantity}</td>
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
