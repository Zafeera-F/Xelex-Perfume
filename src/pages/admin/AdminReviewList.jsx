import { useEffect, useState } from "react";
import { Star, EyeOff, Eye, Trash2 } from "lucide-react";
import Badge from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/admin/Pagination";
import { getAdminReviews, setReviewApproval, deleteReview } from "../../lib/adminReviews";

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "approved", label: "Approved" },
  { value: "hidden", label: "Hidden" },
];

export default function AdminReviewList() {
  const [reviews, setReviews] = useState([]);
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
      getAdminReviews({ page, pageSize: 10, search, status })
        .then((res) => {
          if (cancelled) return;
          setReviews(res.items);
          setTotal(res.total);
        })
        .catch(() => {
          if (!cancelled) {
            setReviews([]);
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

  async function handleToggleApproval(review) {
    await setReviewApproval(review.id, !review.isApproved);
    setReviews((prev) =>
      prev.map((r) => (r.id === review.id ? { ...r, isApproved: !r.isApproved } : r))
    );
  }

  async function handleDelete(review) {
    if (!window.confirm(`Delete this review by ${review.authorName}? This can't be undone from here.`)) return;
    await deleteReview(review.id);
    setReviews((prev) => prev.filter((r) => r.id !== review.id));
    setTotal((prev) => prev - 1);
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-ivory">Reviews</h1>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by author or product..."
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
              <th className="px-4 py-3 font-normal">Product</th>
              <th className="px-4 py-3 font-normal">Author</th>
              <th className="px-4 py-3 font-normal">Rating</th>
              <th className="px-4 py-3 font-normal">Review</th>
              <th className="px-4 py-3 font-normal">Status</th>
              <th className="px-4 py-3 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted">Loading…</td>
              </tr>
            ) : reviews.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <EmptyState title="No reviews found" description="Try a different search or filter." />
                </td>
              </tr>
            ) : (
              reviews.map((review) => (
                <tr key={review.id} className="border-b border-border last:border-none align-top">
                  <td className="px-4 py-3 text-ivory/80">{review.productName}</td>
                  <td className="px-4 py-3">
                    <p className="text-ivory">{review.authorName}</p>
                    <p className="text-xs text-muted">{review.authorEmail}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={12} className={i < review.rating ? "fill-gold text-gold" : "text-border"} />
                      ))}
                    </div>
                  </td>
                  <td className="max-w-xs px-4 py-3">
                    {review.title && <p className="text-ivory">{review.title}</p>}
                    {review.comment && <p className="text-xs text-muted line-clamp-2">{review.comment}</p>}
                  </td>
                  <td className="px-4 py-3">
                    {review.isApproved ? (
                      <Badge tone="success">Approved</Badge>
                    ) : (
                      <Badge tone="muted">Hidden</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => handleToggleApproval(review)}
                        aria-label={review.isApproved ? "Hide review" : "Approve review"}
                        className="text-ivory/60 transition-colors hover:text-gold"
                      >
                        {review.isApproved ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      <button
                        onClick={() => handleDelete(review)}
                        aria-label="Delete review"
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
