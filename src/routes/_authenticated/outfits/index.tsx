import { createFileRoute } from "@tanstack/react-router"
import { Sparkles } from "lucide-react"

export const Route = createFileRoute("/_authenticated/outfits/")({
  component: OutfitsPage,
})

function OutfitsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="size-6" />
        <h1 className="text-2xl font-semibold">My Outfits</h1>
      </div>
      <p className="text-muted-foreground">
        AI-suggested outfit combinations will appear here.
      </p>
    </div>
  )
}
