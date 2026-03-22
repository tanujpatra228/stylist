import { createFileRoute } from "@tanstack/react-router"
import { User } from "lucide-react"

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
})

function ProfilePage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <User className="size-6" />
        <h1 className="text-2xl font-semibold">Style Profile</h1>
      </div>
      <p className="text-muted-foreground">
        Your AI-generated style profile will appear here after your first
        stylist conversation.
      </p>
    </div>
  )
}
