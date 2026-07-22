import { useEffect, useState } from "react";
import Badge from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/admin/Pagination";
import { getAdminSubscribers } from "../../lib/adminNewsletter";

export default function AdminSubscribers() {
  const [subscribers, setSubscribers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => setPage(1), [search]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    // Small debounce on search so every keystroke doesn't fire a request.
    const t = setTimeout(() => {
      getAdminSubscribers({ page, pageSize: 10, search })
        .then((res) => {
          if (cancelled) return;
          setSubscribers(res.items);
          setTotal(res.total);
        })
        .catch(() => {
          if (!cancelled) {
            setSubscribers([]);
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
  }, [page, search]);

  return (
    <div>
      <h1 className="font-display text-2xl text-ivory">Newsletter Subscribers</h1>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by email..."
          className="max-w-xs"
        />
      </div>

      <div className="mt-6 overflow-x-auto border border-border">
        <table className="w-full min-w-[500px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-[0.1em] text-muted">
              <th className="px-4 py-3 font-normal">Email</th>
              <th className="px-4 py-3 font-normal">Subscribed</th>
              <th className="px-4 py-3 font-normal">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="px-4 py-10 text-center text-muted">Loading…</td>
              </tr>
            ) : subscribers.length === 0 ? (
              <tr>
                <td colSpan={3}>
                  <EmptyState title="No subscribers found" description="Try a different search." />
                </td>
              </tr>
            ) : (
              subscribers.map((sub) => (
                <tr key={sub.id} className="border-b border-border last:border-none">
                  <td className="px-4 py-3 text-ivory/80">{sub.email}</td>
                  <td className="px-4 py-3 text-ivory/80">
                    {new Date(sub.subscribedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {sub.unsubscribedAt ? (
                      <Badge tone="muted">Unsubscribed</Badge>
                    ) : (
                      <Badge tone="success">Subscribed</Badge>
                    )}
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
