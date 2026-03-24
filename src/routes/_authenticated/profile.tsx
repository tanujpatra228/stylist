import { createFileRoute, Link } from "@tanstack/react-router"
import { User, MessageCircle, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { getStyleProfile } from "@/server/functions/stylist"

export const Route = createFileRoute("/_authenticated/profile")({
  loader: async () => {
    const profile = await getStyleProfile()
    return { profile }
  },
  component: ProfilePage,
  pendingComponent: ProfilePending,
})

function ProfilePending() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Skeleton className="size-6 rounded" />
        <Skeleton className="h-8 w-36" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-28" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-16 rounded-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ProfilePage() {
  const { profile } = Route.useLoaderData()

  if (!profile || !profile.summary) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4 text-center">
        <Sparkles className="size-12 text-primary" />
        <h1 className="text-2xl font-semibold">No Style Profile Yet</h1>
        <p className="max-w-md text-muted-foreground">
          Complete the onboarding conversation with your AI stylist to build
          your style profile.
        </p>
        <Link to="/onboarding">
          <Button>
            <MessageCircle className="mr-2 size-4" />
            Start Onboarding
          </Button>
        </Link>
      </div>
    )
  }

  const traits = profile.traits || {}
  const traitBadges = extractTraitBadges(traits)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <User className="size-6" />
        <h1 className="text-2xl font-semibold">Style Profile</h1>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Style Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="leading-relaxed text-muted-foreground">
            {profile.summary}
          </p>
        </CardContent>
      </Card>

      {/* Traits */}
      {traitBadges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Style Traits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {traitBadges.map((group) => (
                <div key={group.category}>
                  <p className="mb-2 text-sm font-medium capitalize">
                    {group.category}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {group.values.map((v) => (
                      <Badge key={v} variant="secondary">
                        {v}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Actions */}
      <Link to="/onboarding">
        <Button variant="outline" className="w-full sm:w-auto">
          <MessageCircle className="mr-2 size-4" />
          Chat with your stylist
        </Button>
      </Link>
    </div>
  )
}

function extractTraitBadges(
  traits: Record<string, unknown>
): { category: string; values: string[] }[] {
  const groups: { category: string; values: string[] }[] = []

  for (const [key, value] of Object.entries(traits)) {
    if (Array.isArray(value)) {
      groups.push({
        category: key.replace(/([A-Z])/g, " $1").trim(),
        values: value.map(String),
      })
    } else if (typeof value === "string" && value) {
      groups.push({
        category: key.replace(/([A-Z])/g, " $1").trim(),
        values: [value],
      })
    }
  }

  return groups
}
