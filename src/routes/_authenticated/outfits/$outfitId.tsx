import { useState } from "react"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import {
  ArrowLeft,
  Heart,
  Star,
  Trash2,
  Calendar,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  getOutfitDetail,
  rateOutfit,
  toggleOutfitSaved,
  markOutfitWorn,
  deleteOutfit,
} from "@/server/functions/outfit"

interface OutfitItem {
  itemId: string
  role: string
  thumbnailUrl: string
  imageUrl: string
  category: string
  subcategory: string
  colors: string[]
}

interface OutfitDetailData {
  id: string
  name: string
  items: OutfitItem[]
  occasion: string
  season: string
  aiReasoning: string
  rating: number | null
  saved: boolean
  wornDates: string[]
  createdAt: string
}

export const Route = createFileRoute("/_authenticated/outfits/$outfitId")({
  loader: async ({ params }) => {
    const outfit = (await getOutfitDetail({
      data: { outfitId: params.outfitId },
    })) as OutfitDetailData
    return { outfit }
  },
  component: OutfitDetailPage,
})

function OutfitDetailPage() {
  const { outfit } = Route.useLoaderData()
  const navigate = useNavigate()
  const [saved, setSaved] = useState(outfit.saved)
  const [rating, setRating] = useState(outfit.rating)

  async function handleToggleSaved() {
    try {
      const result = (await toggleOutfitSaved({
        data: { outfitId: outfit.id },
      })) as { saved: boolean }
      setSaved(result.saved)
    } catch {
      toast.error("Failed to update")
    }
  }

  async function handleRate(value: number) {
    try {
      await rateOutfit({ data: { outfitId: outfit.id, rating: value } })
      setRating(value)
    } catch {
      toast.error("Failed to rate")
    }
  }

  async function handleMarkWorn() {
    try {
      await markOutfitWorn({ data: { outfitId: outfit.id } })
      toast.success("Marked as worn today!")
    } catch {
      toast.error("Failed to mark as worn")
    }
  }

  async function handleDelete() {
    try {
      await deleteOutfit({ data: { outfitId: outfit.id } })
      toast.success("Outfit deleted")
      navigate({ to: "/outfits" })
    } catch {
      toast.error("Failed to delete")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Link to="/outfits">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <h1 className="flex-1 text-xl font-semibold">{outfit.name}</h1>
        <Button variant="ghost" size="icon" onClick={handleToggleSaved}>
          <Heart
            className={
              saved ? "size-5 fill-red-500 text-red-500" : "size-5"
            }
          />
        </Button>
      </div>

      {/* Badges */}
      <div className="flex gap-2">
        <Badge variant="secondary" className="capitalize">
          {outfit.occasion}
        </Badge>
        <Badge variant="outline" className="capitalize">
          {outfit.season}
        </Badge>
      </div>

      {/* Items grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {outfit.items.map((item, i) => (
          <Link
            key={i}
            to="/wardrobe/$itemId"
            params={{ itemId: item.itemId }}
            className="overflow-hidden rounded-lg border"
          >
            <div className="aspect-square overflow-hidden bg-muted">
              <img
                src={item.thumbnailUrl || item.imageUrl}
                alt={item.category}
                className="size-full object-cover"
              />
            </div>
            <div className="p-2">
              <p className="text-xs font-medium capitalize">{item.role}</p>
              <p className="text-[10px] text-muted-foreground capitalize">
                {item.subcategory || item.category}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* AI Reasoning */}
      <div>
        <h2 className="mb-2 text-sm font-medium">Why these work together</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {outfit.aiReasoning}
        </p>
      </div>

      <Separator />

      {/* Rating */}
      <div>
        <h2 className="mb-2 text-sm font-medium">Rate this outfit</h2>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              onClick={() => handleRate(value)}
              className="p-1"
            >
              <Star
                className={`size-6 ${
                  rating && value <= rating
                    ? "fill-yellow-500 text-yellow-500"
                    : "text-muted-foreground/30"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Worn dates */}
      {outfit.wornDates.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-medium">Worn on</h2>
          <div className="flex flex-wrap gap-2">
            {outfit.wornDates.map((date, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {new Date(date).toLocaleDateString()}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <Separator />

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={handleMarkWorn}
          className="gap-2"
        >
          <Calendar className="size-4" /> Mark as worn
        </Button>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive" className="gap-2">
              <Trash2 className="size-4" /> Delete
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete this outfit?</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              This will permanently remove this outfit. Your wardrobe items
              will not be affected.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline">Cancel</Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
