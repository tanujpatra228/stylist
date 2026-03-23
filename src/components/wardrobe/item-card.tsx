import { Link } from "@tanstack/react-router"
import { Heart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ItemCardProps {
  id: string
  thumbnailUrl: string
  category: string
  colors: string[]
  favorite: boolean
}

export function ItemCard({
  id,
  thumbnailUrl,
  category,
  colors,
  favorite,
}: ItemCardProps) {
  return (
    <Link
      to="/wardrobe/$itemId"
      params={{ itemId: id }}
      className="group relative overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md"
    >
      <div className="aspect-square overflow-hidden">
        <img
          src={thumbnailUrl}
          alt={category}
          loading="lazy"
          className="size-full object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <div className="p-2">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs capitalize">
            {category}
          </Badge>
          {favorite && <Heart className="size-3.5 fill-red-500 text-red-500" />}
        </div>
        {colors.length > 0 && (
          <div className="mt-1.5 flex gap-1">
            {colors.slice(0, 4).map((color) => (
              <div
                key={color}
                title={color}
                className={cn(
                  "size-3 rounded-full border border-border",
                  color === "white" && "bg-white",
                  color === "black" && "bg-black",
                  color !== "white" &&
                    color !== "black" &&
                    "bg-muted-foreground"
                )}
                style={
                  !["white", "black"].includes(color)
                    ? { backgroundColor: color }
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
