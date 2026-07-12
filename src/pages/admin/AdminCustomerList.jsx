import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import Badge from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/admin/Pagination";
import { getAdminCustomers } from "../../lib/adminCustomers";
import { PATHS } from "../../routes/paths";

export default function AdminCustomerList() {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => setPage(1), [search]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    // Small debounce on search so every keystroke doesn't fire a request.
    const t = setTimeout(() => {
      getAdminCustomers({ page, pageSize: 10, search })
        .then((res) => {
          if (cancelled) return;
          setCustomers(res.items);
          setTotal(res.total);
          setError("");
        })
        .catch((err) => {
          if (!cancelled) {
            setCustomers([]);
            setTotal(0);
            setError(err.message || "Unable to load customers.");
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
  }, [page, search]);

  return (
    <div>
      <h1 className="font-display text-2xl text-ivory">Customers</h1>

      {error && (
        <p className="mt-6 rounded-[var(--radius-card)] border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or phone..."
          className="max-w-xs"
        />
      </div>

      <div className="mt-6 overflow-x-auto border border-border">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-[0.1em] text-muted">
              <th className="px-4 py-3 font-normal">Customer</th>
              <th className="px-4 py-3 font-normal">Phone</th>
              <th className="px-4 py-3 font-normal">Orders</th>
              <th className="px-4 py-3 font-normal">Joined</th>
              <th className="px-4 py-3 font-normal">Status</th>
              <th className="px-4 py-3 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted">Loading…</td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <EmptyState title="No customers found" description="Try a different search." />
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.id} className="border-b border-border last:border-none">
                  <td className="px-4 py-3">
                    <p className="text-ivory">{customer.fullName}</p>
                    <p className="text-xs text-muted">{customer.email}</p>
                  </td>
                  <td className="px-4 py-3 text-ivory/80">{customer.phone || "—"}</td>
                  <td className="px-4 py-3 text-ivory/80">{customer.orderCount}</td>
                  <td className="px-4 py-3 text-ivory/80">
                    {new Date(customer.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    {customer.deletedAt ? <Badge tone="muted">Deactivated</Badge> : <Badge tone="success">Active</Badge>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <Link
                        to={PATHS.admin.customerDetail(customer.id)}
                        aria-label={`View ${customer.fullName}`}
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
