import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Pagination — simple prev/next + "Page X of Y" control, shared by
 * AdminProductList and AdminOrderList. No page-number buttons (jump to
 * page 5, etc.) — not needed at this data volume, and easy to add later if
 * it is.
 */
export default function Pagination({ page, pageSize, total, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (totalPages <= 1) return null;

  return (
    <div className="mt-6 flex items-center justify-between text-sm text-muted">
      <span>
        Page {page} of {totalPages} · {total} total
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex h-8 w-8 items-center justify-center border border-border text-ivory/70 transition-colors hover:border-gold hover:text-gold disabled:opacity-30 disabled:pointer-events-none"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="flex h-8 w-8 items-center justify-center border border-border text-ivory/70 transition-colors hover:border-gold hover:text-gold disabled:opacity-30 disabled:pointer-events-none"
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
