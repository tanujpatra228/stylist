import { createFileRoute } from "@tanstack/react-router"
import { Shirt } from "lucide-react"

export const Route = createFileRoute("/_authenticated/wardrobe/")({
  component: WardrobePage,
})

function WardrobePage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Shirt className="size-6" />
        <h1 className="text-2xl font-semibold">My Wardrobe</h1>
      </div>
      <p className="text-muted-foreground">
        Your wardrobe items will appear here. Upload feature coming soon.
      </p>
    </div>
  )
}
