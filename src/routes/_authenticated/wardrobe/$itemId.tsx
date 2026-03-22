import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/wardrobe/$itemId")({
  component: WardrobeItemPage,
})

function WardrobeItemPage() {
  const { itemId } = Route.useParams()

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Wardrobe Item</h1>
      <p className="text-muted-foreground">Item ID: {itemId}</p>
    </div>
  )
}
