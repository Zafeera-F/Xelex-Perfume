import Card from "./Card";

/**
 * ProductCardSkeleton — mirrors ProductCard's layout exactly so the grid
 * doesn't jump/reflow when real cards replace skeletons.
 */
export default function ProductCardSkeleton() {
  return (
    <Card hoverable={false} className="overflow-hidden">
      <div className="h-72 animate-pulse bg-background-soft" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-2/3 animate-pulse rounded bg-background-soft" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-background-soft" />
        <div className="flex items-center justify-between pt-2">
          <div className="h-4 w-16 animate-pulse rounded bg-background-soft" />
          <div className="h-8 w-16 animate-pulse rounded bg-background-soft" />
        </div>
      </div>
    </Card>
  );
}
