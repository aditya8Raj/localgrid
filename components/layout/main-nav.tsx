"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Search, 
  BookOpen, 
  Calendar, 
  Users, 
  MessageSquare,
  Bell,
  Sparkles
} from "lucide-react"

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    label: "Browse Skills",
    icon: Search,
    href: "/dashboard/skills",
  },
  {
    label: "My Skills",
    icon: BookOpen,
    href: "/dashboard/my-skills",
  },
  {
    label: "Bookings",
    icon: Calendar,
    href: "/dashboard/bookings",
  },
  {
    label: "Projects",
    icon: Users,
    href: "/dashboard/projects",
  },
  {
    label: "Messages",
    icon: MessageSquare,
    href: "/dashboard/messages",
  },
]

export function MainNav() {
  const pathname = usePathname()

  return (
    <div className="flex items-center space-x-4 lg:space-x-6">
      <Link href="/dashboard" className="flex items-center space-x-2">
        <Sparkles className="h-6 w-6 text-primary" />
        <span className="font-bold">LocalGrid</span>
      </Link>
      <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary flex items-center gap-2",
              pathname === route.href
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            <route.icon className="h-4 w-4" />
            {route.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
