import { createFileRoute } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { useNavigate } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
})

function Dashboard() {
  const { user } = Route.useRouteContext()
  const navigate = useNavigate()

  async function handleSignOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate({ to: "/login" })
        },
      },
    })
  }

  return (
    <div className="flex min-h-svh flex-col p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium">
            Welcome, {user.name}
          </h1>
          <p className="text-muted-foreground">
            Your dashboard will be built in Phase 2.
          </p>
        </div>
        <Button variant="outline" onClick={handleSignOut}>
          Sign out
        </Button>
      </div>
    </div>
  )
}
