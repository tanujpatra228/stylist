import { cn } from "@/lib/utils"

const CATEGORIES = [
  { label: "All", value: "all" },
  { label: "Tops", value: "tops" },
  { label: "Bottoms", value: "bottoms" },
  { label: "Footwear", value: "footwear" },
  { label: "Outerwear", value: "outerwear" },
  { label: "Accessories", value: "accessories" },
  { label: "Dresses", value: "dresses" },
]

interface ItemFiltersProps {
  activeCategory: string
  onCategoryChange: (category: string) => void
}

export function ItemFilters({
  activeCategory,
  onCategoryChange,
}: ItemFiltersProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onCategoryChange(cat.value)}
          className={cn(
            "shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors",
            activeCategory === cat.value
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background hover:bg-accent"
          )}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}
