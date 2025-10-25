"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Star, 
  Plus,
  TrendingUp,
  Settings
} from "lucide-react";
import Link from "next/link";

export default function ProviderDashboard() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!session || session.user.userType !== 'SKILL_PROVIDER') {
    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Skill Provider Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session.user.name}! Manage your skills, bookings, and earnings.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Skills you&apos;re offering</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Sessions scheduled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹0</div>
            <p className="text-xs text-muted-foreground">Credits earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">From reviews</p>
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
              Get verified to unlock premium features like paid listings and credit withdrawals
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
          <TabsTrigger value="listings">My Listings</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started with these common tasks</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <Link href="/listings/new">
                <Button className="w-full h-auto py-6 flex flex-col gap-2">
                  <Plus className="h-6 w-6" />
                  <span>Create New Listing</span>
                  <span className="text-xs font-normal opacity-80">
                    Share your skills with the community
                  </span>
                </Button>
              </Link>

              <Link href="/bookings">
                <Button variant="outline" className="w-full h-auto py-6 flex flex-col gap-2">
                  <Calendar className="h-6 w-6" />
                  <span>View Calendar</span>
                  <span className="text-xs font-normal opacity-80">
                    Manage your availability
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
                No recent activity. Start by creating your first listing!
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="listings" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>My Skill Listings</CardTitle>
                <CardDescription>Manage your service offerings</CardDescription>
              </div>
              <Link href="/listings/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Listing
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                You haven&apos;t created any listings yet. Create your first one to start offering your skills!
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Booking Management</CardTitle>
              <CardDescription>View and manage your upcoming sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                No bookings yet. Your bookings will appear here once clients book your services.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Credit Balance</CardTitle>
                <CardDescription>Your available credits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-2">0 Credits</div>
                <p className="text-sm text-muted-foreground mb-4">≈ ₹0</p>
                <Button variant="outline" disabled={!session.user.isVerified}>
                  Withdraw Earnings
                </Button>
                {!session.user.isVerified && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Verification required for withdrawals
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Earnings This Month</CardTitle>
                <CardDescription>Your income for current period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-2">₹0</div>
                <p className="text-sm text-muted-foreground">0 completed sessions</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Your recent earnings and transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                No transactions yet. Your earning history will appear here.
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
