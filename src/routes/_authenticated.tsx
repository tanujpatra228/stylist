import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { getSession } from "@/server/auth.functions"
import { AppShell } from "@/components/layout/app-shell"

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    const session = await getSession()
    if (!session) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      })
    }
    // Redirect to onboarding if not completed (unless already on onboarding page)
    const isOnboardingRoute = location.pathname === "/onboarding"
    if (!session.user.onboardingComplete && !isOnboardingRoute) {
      throw redirect({ to: "/onboarding" })
    }

    return { user: session.user, session: session.session }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const { user } = Route.useRouteContext()

  // Onboarding page renders full-screen without the app shell
  if (!user.onboardingComplete) {
    return <Outlet />
  }

  return <AppShell user={user} />
}
