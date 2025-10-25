import { prisma } from "@/lib/prisma"
import { auth } from "@/auth.config"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { 
  BookOpen, 
  Calendar, 
  Star, 
  Users, 
  TrendingUp,
  MapPin,
  Clock,
  Award
} from "lucide-react"

export default async function DashboardPage() {
  const session = await auth()
  
  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    include: {
      skills: {
        where: { isActive: true },
        take: 3,
      },
      bookings: {
        where: {
          status: { in: ["PENDING", "CONFIRMED"] },
        },
        take: 5,
        orderBy: { startTime: "asc" },
      },
      receivedReviews: {
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          reviewer: {
            select: { name: true, image: true },
          },
        },
      },
    },
  })

  const nearbySkills = await prisma.skill.findMany({
    where: {
      isActive: true,
      userId: { not: user?.id },
    },
    take: 6,
    include: {
      user: {
        select: {
          name: true,
          image: true,
          city: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const stats = {
    totalSkills: user?.skills.length || 0,
    upcomingBookings: user?.bookings.length || 0,
    reputation: user?.reputation.toFixed(1) || "0.0",
    totalReviews: user?.totalRatings || 0,
    credits: user?.credits || 0,
  }

  return (
    <div className="container-custom py-8 space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.name?.split(" ")[0] || "there"}! 👋
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening in your local community
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Skills</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSkills}</div>
            <p className="text-xs text-muted-foreground">
              Active listings
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingBookings}</div>
            <p className="text-xs text-muted-foreground">
              Upcoming sessions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reputation</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.reputation}</div>
            <p className="text-xs text-muted-foreground">
              From {stats.totalReviews} reviews
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.credits}</div>
            <p className="text-xs text-muted-foreground">
              Available balance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Upcoming Bookings */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Upcoming Sessions</CardTitle>
            <CardDescription>
              Your scheduled bookings and appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user?.bookings && user.bookings.length > 0 ? (
              <div className="space-y-4">
                {user.bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{booking.title}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(booking.startTime).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {booking.locationType}
                        </span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/dashboard/bookings/${booking.id}`}>
                        View
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No upcoming bookings</p>
                <Button className="mt-4" asChild>
                  <Link href="/dashboard/skills">Browse Skills</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Reviews</CardTitle>
            <CardDescription>
              What others are saying about you
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user?.receivedReviews && user.receivedReviews.length > 0 ? (
              <div className="space-y-4">
                {user.receivedReviews.map((review) => (
                  <div key={review.id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        by {review.reviewer.name}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-sm line-clamp-2">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No reviews yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Nearby Skills */}
      <Card>
        <CardHeader>
          <CardTitle>Skills Near You</CardTitle>
          <CardDescription>
            Discover what your neighbors are offering
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {nearbySkills.map((skill) => (
              <div
                key={skill.id}
                className="p-4 border rounded-lg space-y-2 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold line-clamp-1">{skill.title}</h3>
                  <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                    {skill.category}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {skill.description}
                </p>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">
                      {skill.user.name?.split(" ")[0]}
                    </span>
                    {skill.user.city && (
                      <span className="text-muted-foreground">• {skill.user.city}</span>
                    )}
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/dashboard/skills/${skill.id}`}>View</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Button variant="outline" asChild>
              <Link href="/dashboard/skills">Browse All Skills</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="card-hover cursor-pointer" asChild>
          <Link href="/dashboard/my-skills/new">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                List a Skill
              </CardTitle>
              <CardDescription>
                Share your expertise with the community
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>
        <Card className="card-hover cursor-pointer" asChild>
          <Link href="/dashboard/projects">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Join a Project
              </CardTitle>
              <CardDescription>
                Collaborate on community initiatives
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>
        <Card className="card-hover cursor-pointer" asChild>
          <Link href="/dashboard/skills">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Learn Something
              </CardTitle>
              <CardDescription>
                Find skills you want to develop
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>
      </div>
    </div>
  )
}
