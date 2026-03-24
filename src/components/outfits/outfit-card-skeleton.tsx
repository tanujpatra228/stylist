import { Skeleton } from "@/components/ui/skeleton"

export function OutfitCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      {/* 2x2 grid of skeleton squares */}
      <div className="grid grid-cols-2 gap-0.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-none" />
        ))}
      </div>

      {/* Info area */}
      <div className="space-y-2 p-3">
        <div className="flex items-start justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="size-3.5 rounded-full" />
        </div>
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  )
}
