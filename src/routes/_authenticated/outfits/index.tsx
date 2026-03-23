import { createFileRoute, useRouter } from "@tanstack/react-router"
import { Sparkles } from "lucide-react"
import { getUserOutfits } from "@/server/functions/outfit"
import { GenerationDialog } from "@/components/outfits/generation-dialog"
import { OutfitCard } from "@/components/outfits/outfit-card"

interface OutfitItem {
  itemId: string
  role: string
  thumbnailUrl: string
  category: string
}

interface OutfitData {
  id: string
  name: string
  items: OutfitItem[]
  occasion: string
  season: string
  aiReasoning: string
  rating: number | null
  saved: boolean
}

export const Route = createFileRoute("/_authenticated/outfits/")({
  loader: async () => {
    const outfits = (await getUserOutfits()) as OutfitData[]
    return { outfits }
  },
  component: OutfitsPage,
})

function OutfitsPage() {
  const { outfits } = Route.useLoaderData()
  const router = useRouter()

  function handleGenerated() {
    router.invalidate()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="size-6" />
          <h1 className="text-2xl font-semibold">My Outfits</h1>
        </div>
        <GenerationDialog onGenerated={handleGenerated} />
      </div>

      {outfits.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
          <Sparkles className="mb-4 size-12 text-muted-foreground/50" />
          <h2 className="text-lg font-medium">No outfits yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Generate your first AI-powered outfit from your wardrobe.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {outfits.map((outfit) => (
            <OutfitCard key={outfit.id} {...outfit} />
          ))}
        </div>
      )}
    </div>
  )
}
