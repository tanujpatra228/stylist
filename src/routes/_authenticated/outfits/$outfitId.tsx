import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/outfits/$outfitId")({
  component: OutfitDetailPage,
})

function OutfitDetailPage() {
  const { outfitId } = Route.useParams()

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Outfit Details</h1>
      <p className="text-muted-foreground">Outfit ID: {outfitId}</p>
    </div>
  )
}
