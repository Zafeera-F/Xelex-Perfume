import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { Field, Input } from "../ui/Input";
import { useAuth } from "../../context/AuthContext";
import { getProductReviews, getMyReview, createReview, updateReview, deleteReview } from "../../lib/reviews";
import { PATHS } from "../../routes/paths";

function RatingBar({ label, percent }) {
  return (
    <div className="flex items-center gap-3 text-xs text-muted">
      <span className="w-12">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-background-soft">
        <div className="h-full bg-gold" style={{ width: `${percent}%` }} />
      </div>
      <span className="w-8 text-right">{percent}%</span>
    </div>
  );
}

function StarPicker({ value, onChange }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const starValue = i + 1;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(starValue)}
            aria-label={`${starValue} star${starValue !== 1 ? "s" : ""}`}
            className="p-0.5"
          >
            <Star size={22} className={starValue <= value ? "fill-gold text-gold" : "text-border"} />
          </button>
        );
      })}
    </div>
  );
}

const EMPTY_FORM = { rating: 0, title: "", comment: "" };

export default function ReviewsSection({ productSlug, rating, reviews }) {
  const { status: authStatus } = useAuth();

  const [reviewList, setReviewList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myReview, setMyReview] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isEditing, setIsEditing] = useState(false);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getProductReviews(productSlug)
      .then((data) => {
        if (!cancelled) setReviewList(data);
      })
      .catch(() => {
        if (!cancelled) setReviewList([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [productSlug]);

  useEffect(() => {
    if (authStatus !== "authenticated") {
      setMyReview(null);
      return;
    }
    let cancelled = false;
    getMyReview(productSlug)
      .then((data) => {
        if (cancelled) return;
        setMyReview(data);
        if (data) setForm({ rating: data.rating, title: data.title || "", comment: data.comment || "" });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [productSlug, authStatus]);

  const breakdown = [5, 4, 3, 2, 1].map((star) => {
    const count = reviewList.filter((r) => r.rating === star).length;
    const percent = reviewList.length ? Math.round((count / reviewList.length) * 100) : 0;
    return { star, percent };
  });

  // Once the real review list has loaded, the headline average/count are
  // derived from it directly — same source of truth as the breakdown bars
  // above — rather than the `rating`/`reviews` props, which are only a
  // snapshot from whenever the parent last fetched the product and would
  // otherwise go stale the instant a review is posted/edited/deleted here.
  const displayRating = loading
    ? rating
    : reviewList.length
      ? Math.round((reviewList.reduce((sum, r) => sum + r.rating, 0) / reviewList.length) * 10) / 10
      : 0;
  const displayCount = loading ? reviews : reviewList.length;

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    if (form.rating < 1) {
      setFormError("Please select a rating.");
      return;
    }
    setIsSubmitting(true);
    try {
      const saved = myReview
        ? await updateReview(productSlug, myReview.id, form)
        : await createReview(productSlug, form);
      setMyReview(saved);
      setIsEditing(false);
      const refreshed = await getProductReviews(productSlug);
      setReviewList(refreshed);
    } catch (err) {
      setFormError(err.message || "Unable to save your review.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!myReview) return;
    setIsSubmitting(true);
    try {
      await deleteReview(productSlug, myReview.id);
      setMyReview(null);
      setForm(EMPTY_FORM);
      const refreshed = await getProductReviews(productSlug);
      setReviewList(refreshed);
    } catch (err) {
      setFormError(err.message || "Unable to delete your review.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const showForm = authStatus === "authenticated" && (isEditing || !myReview);

  return (
    <div className="mt-16 border-t border-border pt-16">
      <h2 className="font-display text-2xl text-ivory">Customer Reviews</h2>

      <div className="mt-8 grid grid-cols-1 gap-10 md:grid-cols-[240px_1fr]">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-4xl text-gold">{displayRating}</span>
            <span className="text-sm text-muted">/ 5</span>
          </div>
          <div className="mt-1 flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={14}
                className={i < Math.round(displayRating) ? "fill-gold text-gold" : "text-border"}
              />
            ))}
          </div>
          <p className="mt-1 text-xs text-muted">Based on {displayCount} review{displayCount !== 1 ? "s" : ""}</p>

          <div className="mt-6 space-y-2">
            {breakdown.map(({ star, percent }) => (
              <RatingBar key={star} label={`${star} star`} percent={percent} />
            ))}
          </div>
        </div>

        <div className="space-y-8">
          {/* Write / edit / delete */}
          {authStatus === "guest" && (
            <Card className="p-6" hoverable={false}>
              <p className="text-sm text-ivory/80">
                <Link to={PATHS.login} state={{ from: PATHS.productLink(productSlug) }} className="text-gold hover:text-gold-soft">
                  Log in
                </Link>{" "}
                to write a review.
              </p>
            </Card>
          )}

          {authStatus === "authenticated" && !showForm && myReview && (
            <Card className="p-6" hoverable={false}>
              <div className="flex items-center justify-between">
                <p className="text-sm text-ivory">Your Review</p>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setIsEditing(true)} className="text-xs uppercase tracking-[0.15em] text-muted hover:text-gold">
                    Edit
                  </button>
                  <button type="button" onClick={handleDelete} disabled={isSubmitting} className="text-xs uppercase tracking-[0.15em] text-muted hover:text-error">
                    Delete
                  </button>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={13} className={i < myReview.rating ? "fill-gold text-gold" : "text-border"} />
                ))}
              </div>
              {myReview.title && <p className="mt-2 text-sm text-ivory">{myReview.title}</p>}
              {myReview.comment && <p className="mt-1 text-sm text-ivory/75">{myReview.comment}</p>}
            </Card>
          )}

          {showForm && (
            <Card className="p-6" hoverable={false}>
              <h3 className="mb-4 text-sm text-ivory">{myReview ? "Edit Your Review" : "Write a Review"}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                {formError && (
                  <p className="rounded-[var(--radius-card)] border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
                    {formError}
                  </p>
                )}
                <Field label="Your Rating">
                  <StarPicker value={form.rating} onChange={(rating) => setForm({ ...form, rating })} />
                </Field>
                <Field label="Title (Optional)">
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={100} />
                </Field>
                <Field label="Comment (Optional)">
                  <textarea
                    value={form.comment}
                    onChange={(e) => setForm({ ...form, comment: e.target.value })}
                    maxLength={1000}
                    rows={3}
                    className="w-full border border-border bg-background-soft px-4 py-3 text-sm text-ivory outline-none transition-colors focus:border-gold"
                  />
                </Field>
                <div className="flex gap-3">
                  <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                    {isSubmitting ? "Saving…" : myReview ? "Save Changes" : "Post Review"}
                  </Button>
                  {isEditing && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </Card>
          )}

          {/* Existing reviews */}
          {!loading && reviewList.length === 0 && (
            <p className="text-sm text-muted">No reviews yet — be the first to share your thoughts.</p>
          )}
          {reviewList.map((r) => (
            <Card key={r.id} className="p-6" hoverable={false}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ivory">{r.authorName}</span>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} className={i < r.rating ? "fill-gold text-gold" : "text-border"} />
                  ))}
                </div>
              </div>
              {r.title && <p className="mt-2 text-sm text-ivory">{r.title}</p>}
              {r.comment && <p className="mt-1 text-sm leading-relaxed text-ivory/75">{r.comment}</p>}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
