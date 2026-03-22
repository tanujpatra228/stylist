import { createFileRoute, Link } from "@tanstack/react-router"
import {
  Shirt,
  Sparkles,
  User,
  Upload,
  Wand2,
  MessageCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
})

const STATS = [
  {
    label: "Wardrobe Items",
    value: "0",
    description: "Upload your first item",
    icon: Shirt,
  },
  {
    label: "Outfits",
    value: "0",
    description: "Get AI suggestions",
    icon: Sparkles,
  },
  {
    label: "Style Profile",
    value: "Not set up",
    description: "Chat with your stylist",
    icon: User,
  },
] as const

const QUICK_ACTIONS = [
  {
    label: "Upload Item",
    description: "Add clothing to your wardrobe",
    icon: Upload,
    to: "/wardrobe",
  },
  {
    label: "Get Outfit Suggestion",
    description: "Let AI create an outfit for you",
    icon: Wand2,
    to: "/outfits",
  },
  {
    label: "Chat with Stylist",
    description: "Get personalized style advice",
    icon: MessageCircle,
    to: "/onboarding",
  },
] as const

function Dashboard() {
  const { user } = Route.useRouteContext()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome, {user.name}</h1>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your style journey.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STATS.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.label}
              </CardTitle>
              <stat.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.to} to={action.to}>
              <Button
                variant="outline"
                className="h-auto w-full justify-start gap-3 p-4"
              >
                <action.icon className="size-5 shrink-0" />
                <div className="text-left">
                  <div className="font-medium">{action.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {action.description}
                  </div>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
