import { PackageSearch } from "lucide-react";
import Button from "./Button";

/**
 * EmptyState — generic "nothing here" panel. Reusable across Shop (no results),
 * Cart (empty cart), Wishlist (empty wishlist), Orders (no orders), etc.
 */
export default function EmptyState({
  icon: Icon = PackageSearch,
  title = "No results found",
  description = "Try adjusting your filters or search terms.",
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-border">
        <Icon size={26} strokeWidth={1.5} className="text-muted" />
      </div>
      <h3 className="font-display text-xl text-ivory">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted">{description}</p>
      {actionLabel && (
        <Button variant="outline" className="mt-6" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
