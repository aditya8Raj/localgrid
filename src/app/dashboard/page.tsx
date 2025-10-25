"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  Calendar, 
  Award, 
  TrendingUp,
  MapPin,
  Plus,
} from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function DashboardContent() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get('tab') || 'overview'

  const stats = [
    {
      title: "Active Listings",
      value: "0",
      description: "Skills you're offering",
      icon: Award,
      href: "/dashboard?tab=listings"
    },
    {
      title: "Upcoming Bookings",
      value: "0",
      description: "Scheduled sessions",
      icon: Calendar,
      href: "/dashboard?tab=bookings"
    },
    {
      title: "Community Projects",
      value: "0",
      description: "Projects you're involved in",
      icon: Users,
      href: "/projects"
    },
    {
      title: "Credits Earned",
      value: "0",
      description: "Total community credits",
      icon: TrendingUp,
      href: "/credits"
    }
  ]

  const quickActions = [
    {
      title: "Add a Listing",
      description: "Share your expertise with the community",
      icon: Plus,
      href: "/listings/new",
      color: "bg-blue-500"
    },
    {
      title: "Explore Skills",
      description: "Find skills in your area",
      icon: MapPin,
      href: "/listings",
      color: "bg-green-500"
    },
    {
      title: "Create Project",
      description: "Start a community initiative",
      icon: Users,
      href: "/projects",
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

      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bookings">My Bookings</TabsTrigger>
          <TabsTrigger value="listings">My Listings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
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
              <Link href={`/profile/${session?.user?.id || ''}`}>
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
              <Link href="/listings/new">
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
      </TabsContent>

      <TabsContent value="bookings">
        <Card>
          <CardHeader>
            <CardTitle>My Bookings</CardTitle>
            <CardDescription>View and manage your session bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No bookings yet.</p>
              <p className="text-sm mt-2 mb-4">Start booking sessions with local skill providers!</p>
              <Link href="/listings">
                <Button>Explore Skills</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="listings">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>My Listings</CardTitle>
                <CardDescription>Manage your skill listings</CardDescription>
              </div>
              <Link href="/listings/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Listing
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No listings yet.</p>
              <p className="text-sm mt-2 mb-4">Share your skills with the community!</p>
              <Link href="/listings/new">
                <Button>Create Your First Listing</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  )
}