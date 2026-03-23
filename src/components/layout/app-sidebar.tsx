import { Link, useMatchRoute, useRouter } from "@tanstack/react-router"
import { useEffect } from "react"
import {
  LayoutDashboard,
  Shirt,
  Sparkles,
  User,
  Settings,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

const NAV_ITEMS = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "My Wardrobe", to: "/wardrobe", icon: Shirt },
  { label: "Outfits", to: "/outfits", icon: Sparkles },
  { label: "Style Profile", to: "/profile", icon: User },
  { label: "Settings", to: "/settings", icon: Settings },
] as const

interface AppSidebarProps {
  user: { name: string; email: string; image?: string | null }
}

export function AppSidebar({ user }: AppSidebarProps) {
  const matchRoute = useMatchRoute()
  const router = useRouter()
  const { isMobile, setOpenMobile } = useSidebar()

  // Close mobile sidebar on navigation
  useEffect(() => {
    return router.subscribe("onBeforeNavigate", () => {
      if (isMobile) setOpenMobile(false)
    })
  }, [router, isMobile, setOpenMobile])

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          <span className="text-lg font-semibold">AI Stylist</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const isActive = matchRoute({ to: item.to, fuzzy: true })
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild isActive={!!isActive}>
                      <Link to={item.to}>
                        <item.icon className="size-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-8">
            <AvatarFallback className="text-xs">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
