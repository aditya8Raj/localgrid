"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Briefcase, 
  Users, 
  Search, 
  DollarSign, 
  Plus,
  TrendingUp,
  Settings
} from "lucide-react";
import Link from "next/link";

export default function CreatorDashboard() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!session || session.user.userType !== 'PROJECT_CREATOR') {
    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Project Creator Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session.user.name}! Manage your projects and find talented professionals.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Projects in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Collaborators hired</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹0</div>
            <p className="text-xs text-muted-foreground">Credits used</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Saved Providers</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">In your network</p>
          </CardContent>
        </Card>
      </div>

      {/* Verification Banner */}
      {!session.user.isVerified && (
        <Card className="mb-8 border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Verify Your Account
            </CardTitle>
            <CardDescription>
              Get verified to post larger projects and access premium features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button>Start Verification</Button>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">My Projects</TabsTrigger>
          <TabsTrigger value="providers">Find Talent</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started with these common tasks</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <Link href="/projects/new">
                <Button className="w-full h-auto py-6 flex flex-col gap-2">
                  <Plus className="h-6 w-6" />
                  <span>Create New Project</span>
                  <span className="text-xs font-normal opacity-80">
                    Post opportunities for providers
                  </span>
                </Button>
              </Link>

              <Link href="/listings">
                <Button variant="outline" className="w-full h-auto py-6 flex flex-col gap-2">
                  <Search className="h-6 w-6" />
                  <span>Browse Providers</span>
                  <span className="text-xs font-normal opacity-80">
                    Find local talent
                  </span>
                </Button>
              </Link>

              <Link href="/bookings">
                <Button variant="outline" className="w-full h-auto py-6 flex flex-col gap-2">
                  <Users className="h-6 w-6" />
                  <span>Manage Team</span>
                  <span className="text-xs font-normal opacity-80">
                    View your collaborators
                  </span>
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest updates and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                No recent activity. Start by creating your first project!
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>My Projects</CardTitle>
                <CardDescription>Manage your community projects</CardDescription>
              </div>
              <Link href="/projects/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                You haven&apos;t created any projects yet. Create your first one to start collaborating!
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="providers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Find Skill Providers</CardTitle>
              <CardDescription>Browse and connect with local talent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/listings">
                <Button className="w-full">
                  <Search className="h-4 w-4 mr-2" />
                  Browse All Providers
                </Button>
              </Link>

              <div className="space-y-2">
                <h3 className="font-semibold">Popular Categories</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm">Web Development</Button>
                  <Button variant="outline" size="sm">Graphic Design</Button>
                  <Button variant="outline" size="sm">Content Writing</Button>
                  <Button variant="outline" size="sm">Photography</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Saved Providers</CardTitle>
              <CardDescription>Your network of trusted professionals</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                You haven&apos;t saved any providers yet. Browse listings to build your network!
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Booking Management</CardTitle>
              <CardDescription>View your scheduled sessions with providers</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                No bookings yet. Book a session with a skill provider to get started!
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Manage your public profile and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Credit Balance</h3>
                <div className="text-2xl font-bold">0 Credits</div>
                <p className="text-sm text-muted-foreground">≈ ₹0</p>
                <Button variant="outline">Add Credits</Button>
              </div>

              <div className="pt-4 border-t space-y-2">
                <Link href={`/profile/${session.user.id}`}>
                  <Button variant="outline" className="w-full">
                    View Public Profile
                  </Button>
                </Link>
                <Link href="/profile/edit">
                  <Button variant="outline" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
