import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { getSession } from "@/server/auth.functions"

export const Route = createFileRoute("/_public")({
  beforeLoad: async () => {
    const session = await getSession()
    if (session) {
      throw redirect({ to: "/dashboard" })
    }
  },
  component: PublicLayout,
})

function PublicLayout() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-4">
      <Outlet />
    </div>
  )
}
