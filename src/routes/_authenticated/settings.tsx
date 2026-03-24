import { createFileRoute } from "@tanstack/react-router"
import { useTheme } from "next-themes"
import { Settings, Sun, Moon, Monitor } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
})

function SettingsPage() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <Settings className="size-6" />
        <h1 className="text-2xl font-semibold">Settings</h1>
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-medium">Theme</h2>
          <p className="text-sm text-muted-foreground">
            Choose how the app looks for you.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
            <Card
              key={value}
              role="button"
              tabIndex={0}
              onClick={() => setTheme(value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  setTheme(value)
                }
              }}
              className={cn(
                "flex cursor-pointer flex-col items-center gap-2 p-6 transition-colors hover:bg-accent",
                theme === value &&
                  "border-primary bg-accent ring-2 ring-primary"
              )}
            >
              <Icon className="size-6" />
              <span className="text-sm font-medium">{label}</span>
            </Card>
          ))}
        </div>
      </section>

      <p className="text-muted-foreground">
        More account and app settings coming soon.
      </p>
    </div>
  )
}
