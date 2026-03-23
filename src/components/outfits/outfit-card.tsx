import { Link } from "@tanstack/react-router"
import { Heart, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface OutfitItem {
  itemId: string
  role: string
  thumbnailUrl: string
  category: string
}

interface OutfitCardProps {
  id: string
  name: string
  items: OutfitItem[]
  occasion: string
  season: string
  aiReasoning: string
  rating: number | null
  saved: boolean
}

export function OutfitCard({
  id,
  name,
  items,
  occasion,
  season,
  aiReasoning,
  rating,
  saved,
}: OutfitCardProps) {
  return (
    <Link
      to="/outfits/$outfitId"
      params={{ outfitId: id }}
      className="group block overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md"
    >
      {/* Item thumbnails grid */}
      <div className="grid grid-cols-2 gap-0.5">
        {items.slice(0, 4).map((item, i) => (
          <div key={i} className="aspect-square overflow-hidden bg-muted">
            {item.thumbnailUrl ? (
              <img
                src={item.thumbnailUrl}
                alt={item.category}
                loading="lazy"
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                {item.category}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between">
          <h3 className="text-sm font-medium leading-tight">{name}</h3>
          <div className="flex items-center gap-1 shrink-0">
            {saved && (
              <Heart className="size-3.5 fill-red-500 text-red-500" />
            )}
            {rating && (
              <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                <Star className="size-3 fill-yellow-500 text-yellow-500" />
                {rating}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-1.5">
          <Badge variant="secondary" className="text-[10px] capitalize">
            {occasion}
          </Badge>
          <Badge variant="outline" className="text-[10px] capitalize">
            {season}
          </Badge>
        </div>

        <p className="line-clamp-2 text-xs text-muted-foreground">
          {aiReasoning}
        </p>
      </div>
    </Link>
  )
}
