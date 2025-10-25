"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  Calendar, 
  Award, 
  TrendingUp,
  MapPin,
  Plus,
} from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { data: session } = useSession()

  const stats = [
    {
      title: "Active Skills",
      value: "0",
      description: "Skills you're offering",
      icon: Award,
      href: "/dashboard/skills"
    },
    {
      title: "Upcoming Bookings",
      value: "0",
      description: "Scheduled sessions",
      icon: Calendar,
      href: "/dashboard/bookings"
    },
    {
      title: "Community Projects",
      value: "0",
      description: "Projects you're involved in",
      icon: Users,
      href: "/dashboard/projects"
    },
    {
      title: "Credits Earned",
      value: "0",
      description: "Total community credits",
      icon: TrendingUp,
      href: "/dashboard/credits"
    }
  ]

  const quickActions = [
    {
      title: "Add a Skill",
      description: "Share your expertise with the community",
      icon: Plus,
      href: "/dashboard/skills/new",
      color: "bg-blue-500"
    },
    {
      title: "Explore Skills",
      description: "Find skills in your area",
      icon: MapPin,
      href: "/dashboard/explore",
      color: "bg-green-500"
    },
    {
      title: "Create Project",
      description: "Start a community initiative",
      icon: Users,
      href: "/dashboard/projects/new",
      color: "bg-purple-500"
    }
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {session?.user?.name?.split(' ')[0] || 'User'}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Here&apos;s what&apos;s happening in your community today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                <CardHeader>
                  <div className={`h-12 w-12 rounded-lg ${action.color} flex items-center justify-center mb-4`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle>{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Getting Started */}
      <Card className="border-2 border-dashed">
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>
            Help your community get to know you better
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Add Your Location</p>
                <p className="text-sm text-muted-foreground">
                  Connect with nearby community members
                </p>
              </div>
            </div>
            <Link href="/dashboard/profile">
              <Button variant="outline">Add</Button>
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">List Your First Skill</p>
                <p className="text-sm text-muted-foreground">
                  Start sharing your expertise
                </p>
              </div>
            </div>
            <Link href="/dashboard/skills/new">
              <Button variant="outline">Add</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity - Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Stay updated with your community</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No recent activity yet.</p>
            <p className="text-sm mt-2">Start exploring skills and connecting with your community!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
