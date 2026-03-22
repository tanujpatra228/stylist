import { createFileRoute } from "@tanstack/react-router"
import { Settings } from "lucide-react"

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
})

function SettingsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Settings className="size-6" />
        <h1 className="text-2xl font-semibold">Settings</h1>
      </div>
      <p className="text-muted-foreground">
        Account and app settings will be available here.
      </p>
    </div>
  )
}
