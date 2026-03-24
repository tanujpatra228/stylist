import { Skeleton } from "@/components/ui/skeleton"

export function ItemCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="p-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="size-3.5 rounded-full" />
        </div>
        <div className="mt-1.5 flex gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="size-3 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  )
}
