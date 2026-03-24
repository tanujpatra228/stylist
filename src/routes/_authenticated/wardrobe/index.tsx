import { useState } from "react"
import { createFileRoute, useRouter } from "@tanstack/react-router"
import { Shirt } from "lucide-react"
import { getUserWardrobeItems } from "@/server/functions/wardrobe"
import { UploadDialog } from "@/components/wardrobe/upload-dialog"
import { ItemCard } from "@/components/wardrobe/item-card"
import { ItemCardSkeleton } from "@/components/wardrobe/item-card-skeleton"
import { ItemFilters } from "@/components/wardrobe/item-filters"

interface WardrobeItemData {
  id: string
  thumbnailUrl: string
  category: string
  colors: string[]
  favorite: boolean
}

export const Route = createFileRoute("/_authenticated/wardrobe/")({
  loader: async () => {
    const items = await getUserWardrobeItems({ data: { category: "all" } })
    return { items: items as WardrobeItemData[] }
  },
  component: WardrobePage,
  pendingComponent: WardrobePending,
})

function WardrobePending() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shirt className="size-6" />
          <h1 className="text-2xl font-semibold">My Wardrobe</h1>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <ItemCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

function WardrobePage() {
  const { items: initialItems } = Route.useLoaderData()
  const router = useRouter()
  const [category, setCategory] = useState("all")

  const filteredItems =
    category === "all"
      ? initialItems
      : initialItems.filter((item) => item.category === category)

  function handleItemUploaded() {
    router.invalidate()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shirt className="size-6" />
          <h1 className="text-2xl font-semibold">My Wardrobe</h1>
        </div>
        <UploadDialog onItemUploaded={handleItemUploaded} />
      </div>

      <ItemFilters
        activeCategory={category}
        onCategoryChange={setCategory}
      />

      {filteredItems.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
          <Shirt className="mb-4 size-12 text-muted-foreground/50" />
          <h2 className="text-lg font-medium">No items yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload your first wardrobe piece to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filteredItems.map((item) => (
            <ItemCard
              key={item.id}
              id={item.id}
              thumbnailUrl={item.thumbnailUrl}
              category={item.category}
              colors={item.colors}
              favorite={item.favorite}
            />
          ))}
        </div>
      )}
    </div>
  )
}
