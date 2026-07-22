import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/admin/Pagination";
import { getAdminCoupons, updateCoupon, deleteCoupon } from "../../lib/adminCoupons";
import { PATHS } from "../../routes/paths";

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

function formatDiscount(coupon) {
  return coupon.discountType === "PERCENTAGE" ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`;
}

export default function AdminCouponList() {
  const [coupons, setCoupons] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => setPage(1), [status, search]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const t = setTimeout(() => {
      getAdminCoupons({ page, pageSize: 10, search, status })
        .then((res) => {
          if (cancelled) return;
          setCoupons(res.items);
          setTotal(res.total);
        })
        .catch(() => {
          if (!cancelled) {
            setCoupons([]);
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

  async function handleToggleActive(coupon) {
    const updated = await updateCoupon(coupon.id, { isActive: !coupon.isActive });
    setCoupons((prev) => prev.map((c) => (c.id === coupon.id ? { ...c, isActive: updated.isActive } : c)));
  }

  async function handleDelete(coupon) {
    if (!window.confirm(`Delete coupon "${coupon.code}"? This can't be undone from here.`)) return;
    await deleteCoupon(coupon.id);
    setCoupons((prev) => prev.filter((c) => c.id !== coupon.id));
    setTotal((prev) => prev - 1);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl text-ivory">Coupons</h1>
        <Button as={Link} to={PATHS.admin.newCoupon} variant="primary" size="sm">
          <Plus size={15} className="mr-1" />
          Add Coupon
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by code..."
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
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-[0.1em] text-muted">
              <th className="px-4 py-3 font-normal">Code</th>
              <th className="px-4 py-3 font-normal">Discount</th>
              <th className="px-4 py-3 font-normal">Usage</th>
              <th className="px-4 py-3 font-normal">Expires</th>
              <th className="px-4 py-3 font-normal">Status</th>
              <th className="px-4 py-3 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted">Loading…</td>
              </tr>
            ) : coupons.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <EmptyState title="No coupons found" description="Try a different search or filter." />
                </td>
              </tr>
            ) : (
              coupons.map((coupon) => (
                <tr key={coupon.id} className="border-b border-border last:border-none">
                  <td className="px-4 py-3">
                    <p className="text-ivory">{coupon.code}</p>
                    {coupon.description && <p className="text-xs text-muted">{coupon.description}</p>}
                  </td>
                  <td className="px-4 py-3 text-gold">{formatDiscount(coupon)}</td>
                  <td className="px-4 py-3 text-ivory/80">
                    {coupon.usedCount}{coupon.usageLimit != null ? ` / ${coupon.usageLimit}` : ""}
                  </td>
                  <td className="px-4 py-3 text-ivory/80">
                    {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {coupon.isActive ? (
                      <Badge tone="success">Active</Badge>
                    ) : (
                      <Badge tone="muted">Inactive</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        to={PATHS.admin.editCoupon(coupon.id)}
                        aria-label={`Edit ${coupon.code}`}
                        className="text-ivory/60 transition-colors hover:text-gold"
                      >
                        <Pencil size={15} />
                      </Link>
                      <button
                        onClick={() => handleToggleActive(coupon)}
                        aria-label={coupon.isActive ? `Deactivate ${coupon.code}` : `Activate ${coupon.code}`}
                        className="text-ivory/60 transition-colors hover:text-gold"
                      >
                        {coupon.isActive ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      <button
                        onClick={() => handleDelete(coupon)}
                        aria-label={`Delete ${coupon.code}`}
                        className="text-ivory/60 transition-colors hover:text-error"
                      >
                        <Trash2 size={15} />
                      </button>
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
