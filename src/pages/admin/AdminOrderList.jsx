import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Eye } from "lucide-react";
import Badge from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/admin/Pagination";
import { getAdminOrders } from "../../lib/adminOrders";
import { PATHS } from "../../routes/paths";

const STATUS_OPTIONS = [
  "",
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
];

const STATUS_TONE = {
  PENDING: "gold",
  CONFIRMED: "gold",
  PROCESSING: "gold",
  SHIPPED: "gold",
  OUT_FOR_DELIVERY: "gold",
  DELIVERED: "success",
  CANCELLED: "muted",
  RETURNED: "muted",
};

export default function AdminOrderList() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(() => Number(searchParams.get("page")) || 1);
  const [status, setStatus] = useState(() => searchParams.get("status") || "");
  const [search, setSearch] = useState(() => searchParams.get("search") || "");
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
    if (page !== 1) next.set("page", String(page));
    isInternalUrlUpdateRef.current = true;
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, debouncedSearch, page]);

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
    setPage(Number(searchParams.get("page")) || 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getAdminOrders({ page, pageSize: 10, status, search: debouncedSearch })
      .then((res) => {
        if (cancelled) return;
        setOrders(res.items);
        setTotal(res.total);
      })
      .catch(() => {
        if (!cancelled) {
          setOrders([]);
          setTotal(0);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, status, debouncedSearch]);

  return (
    <div>
      <h1 className="font-display text-2xl text-ivory">Orders</h1>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by order ID, name, or phone..."
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
            <option key={opt} value={opt}>{opt || "All Statuses"}</option>
          ))}
        </select>
      </div>

      <div className="mt-6 overflow-x-auto border border-border">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-[0.1em] text-muted">
              <th className="px-4 py-3 font-normal">Order</th>
              <th className="px-4 py-3 font-normal">Customer</th>
              <th className="px-4 py-3 font-normal">Status</th>
              <th className="px-4 py-3 font-normal">Payment</th>
              <th className="px-4 py-3 font-normal">Total</th>
              <th className="px-4 py-3 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted">Loading…</td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <EmptyState title="No orders found" description="Try a different search or status filter." />
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-b border-border last:border-none">
                  <td className="px-4 py-3">
                    <p className="text-ivory">{order.orderNumber}</p>
                    <p className="text-xs text-muted">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      {" · "}
                      {order.itemCount} item{order.itemCount !== 1 ? "s" : ""}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-ivory/80">{order.customerName}</p>
                    <p className="text-xs text-muted">{order.customerEmail}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_TONE[order.status] || "muted"}>{order.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-ivory/80">
                    {order.paymentMethod} · {order.paymentStatus}
                  </td>
                  <td className="px-4 py-3 text-gold">₹{order.total.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <Link
                        to={PATHS.admin.orderDetail(order.id)}
                        aria-label={`View order ${order.orderNumber}`}
                        className="text-ivory/60 transition-colors hover:text-gold"
                      >
                        <Eye size={16} />
                      </Link>
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
