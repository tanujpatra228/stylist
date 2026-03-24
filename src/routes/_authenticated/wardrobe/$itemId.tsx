import { useState } from "react"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import {
  ArrowLeft,
  Heart,
  Trash2,
  Pencil,
  Check,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  getWardrobeItem,
  deleteWardrobeItem,
  toggleWardrobeFavorite,
  updateWardrobeItem,
} from "@/server/functions/wardrobe"

interface ItemData {
  id: string
  imageUrl: string
  category: string
  subcategory: string
  colors: string[]
  pattern: string
  material: string
  season: string[]
  occasion: string[]
  brand: string | null
  tags: string[]
  favorite: boolean
  createdAt: string
}

export const Route = createFileRoute("/_authenticated/wardrobe/$itemId")({
  loader: async ({ params }) => {
    const item = await getWardrobeItem({ data: { itemId: params.itemId } })
    return { item: item as ItemData }
  },
  component: WardrobeItemPage,
  pendingComponent: WardrobeItemPending,
})

function WardrobeItemPending() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Skeleton className="size-9 rounded-md" />
        <Skeleton className="h-7 w-40" />
      </div>

      {/* Image */}
      <Skeleton className="aspect-[4/3] w-full rounded-lg" />

      {/* Metadata rows */}
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-28" />
          </div>
        ))}
      </div>

      {/* Badges area */}
      <div className="space-y-3">
        <Skeleton className="h-3 w-16" />
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-14 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  )
}

function WardrobeItemPage() {
  const { item } = Route.useLoaderData()
  const navigate = useNavigate()
  const [favorite, setFavorite] = useState(item.favorite)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState({
    category: item.category,
    subcategory: item.subcategory,
    pattern: item.pattern,
    material: item.material,
  })

  async function handleToggleFavorite() {
    try {
      const result = (await toggleWardrobeFavorite({
        data: { itemId: item.id },
      })) as { favorite: boolean }
      setFavorite(result.favorite)
    } catch {
      toast.error("Failed to update favorite")
    }
  }

  async function handleDelete() {
    try {
      await deleteWardrobeItem({ data: { itemId: item.id } })
      toast.success("Item deleted")
      navigate({ to: "/wardrobe" })
    } catch {
      toast.error("Failed to delete item")
    }
  }

  async function handleSaveEdit() {
    try {
      await updateWardrobeItem({
        data: { itemId: item.id, updates: editData },
      })
      toast.success("Item updated")
      setEditing(false)
    } catch {
      toast.error("Failed to update item")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Link to="/wardrobe">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <h1 className="flex-1 text-xl font-semibold capitalize">
          {item.subcategory || item.category}
        </h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleFavorite}
        >
          <Heart
            className={
              favorite
                ? "size-5 fill-red-500 text-red-500"
                : "size-5"
            }
          />
        </Button>
      </div>

      {/* Image */}
      <div className="overflow-hidden rounded-lg">
        <img
          src={item.imageUrl}
          alt={item.subcategory || item.category}
          className="w-full object-cover"
        />
      </div>

      {/* Metadata */}
      {editing ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Input
              value={editData.category}
              onChange={(e) =>
                setEditData((d) => ({ ...d, category: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Subcategory</Label>
            <Input
              value={editData.subcategory}
              onChange={(e) =>
                setEditData((d) => ({ ...d, subcategory: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Pattern</Label>
            <Input
              value={editData.pattern}
              onChange={(e) =>
                setEditData((d) => ({ ...d, pattern: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Material</Label>
            <Input
              value={editData.material}
              onChange={(e) =>
                setEditData((d) => ({ ...d, material: e.target.value }))
              }
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSaveEdit} className="gap-2">
              <Check className="size-4" /> Save
            </Button>
            <Button
              variant="outline"
              onClick={() => setEditing(false)}
              className="gap-2"
            >
              <X className="size-4" /> Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Category</p>
              <p className="font-medium capitalize">{item.category}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Subcategory</p>
              <p className="font-medium capitalize">{item.subcategory}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Pattern</p>
              <p className="font-medium capitalize">{item.pattern}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Material</p>
              <p className="font-medium capitalize">{item.material}</p>
            </div>
            {item.brand && (
              <div>
                <p className="text-muted-foreground">Brand</p>
                <p className="font-medium">{item.brand}</p>
              </div>
            )}
          </div>

          {/* Colors */}
          {item.colors.length > 0 && (
            <div>
              <p className="mb-2 text-sm text-muted-foreground">Colors</p>
              <div className="flex flex-wrap gap-2">
                {item.colors.map((color) => (
                  <Badge key={color} variant="secondary" className="capitalize">
                    {color}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Season & Occasion */}
          {item.season.length > 0 && (
            <div>
              <p className="mb-2 text-sm text-muted-foreground">Season</p>
              <div className="flex flex-wrap gap-2">
                {item.season.map((s) => (
                  <Badge key={s} variant="outline" className="capitalize">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {item.occasion.length > 0 && (
            <div>
              <p className="mb-2 text-sm text-muted-foreground">Occasion</p>
              <div className="flex flex-wrap gap-2">
                {item.occasion.map((o) => (
                  <Badge key={o} variant="outline" className="capitalize">
                    {o}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {item.tags.length > 0 && (
            <div>
              <p className="mb-2 text-sm text-muted-foreground">Tags</p>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Separator />

      {/* Actions */}
      <div className="flex gap-2">
        {!editing && (
          <Button
            variant="outline"
            onClick={() => setEditing(true)}
            className="gap-2"
          >
            <Pencil className="size-4" /> Edit
          </Button>
        )}

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive" className="gap-2">
              <Trash2 className="size-4" /> Delete
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete this item?</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              This will permanently remove this item from your wardrobe and
              delete the image. This action cannot be undone.
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
