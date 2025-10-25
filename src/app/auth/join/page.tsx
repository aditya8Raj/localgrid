"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Users, Briefcase, ArrowRight } from "lucide-react";

export default function JoinPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Join LocalGrid</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose how you want to participate in India&apos;s local skill-sharing community
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Skill Provider Card */}
          <Card className="hover:shadow-xl transition-shadow duration-300 border-2 hover:border-primary cursor-pointer group">
            <CardHeader>
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Join as Skill Provider</CardTitle>
              <CardDescription className="text-base">
                Share your skills and earn income from your expertise
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Perfect for:</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">✓</span>
                      <span>Freelancers and independent professionals</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">✓</span>
                      <span>Teachers, coaches, and trainers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">✓</span>
                      <span>Creative professionals and artists</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">✓</span>
                      <span>Anyone with skills to share locally</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">You can:</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Create skill listings and set your rates</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Manage bookings and availability</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Earn credits and accept payments</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Build reputation through reviews</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Join community projects</span>
                    </li>
                  </ul>
                </div>

                <Button 
                  className="w-full mt-6 group/btn" 
                  size="lg"
                  onClick={() => router.push("/auth/join/provider")}
                >
                  Get Started as Provider
                  <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Project Creator Card */}
          <Card className="hover:shadow-xl transition-shadow duration-300 border-2 hover:border-secondary cursor-pointer group">
            <CardHeader>
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                <Briefcase className="w-8 h-8 text-secondary-foreground" />
              </div>
              <CardTitle className="text-2xl">Join as Project Creator</CardTitle>
              <CardDescription className="text-base">
                Post projects and find talented local professionals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Perfect for:</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-secondary-foreground mt-1">✓</span>
                      <span>Entrepreneurs and startup founders</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-secondary-foreground mt-1">✓</span>
                      <span>Event organizers and coordinators</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-secondary-foreground mt-1">✓</span>
                      <span>Small business owners</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-secondary-foreground mt-1">✓</span>
                      <span>Anyone needing local talent</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">You can:</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-secondary-foreground mt-1">•</span>
                      <span>Post community projects and opportunities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-secondary-foreground mt-1">•</span>
                      <span>Browse and book skill providers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-secondary-foreground mt-1">•</span>
                      <span>Manage hiring and team collaboration</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-secondary-foreground mt-1">•</span>
                      <span>Review and rate service providers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-secondary-foreground mt-1">•</span>
                      <span>Build your network locally</span>
                    </li>
                  </ul>
                </div>

                <Button 
                  className="w-full mt-6 group/btn" 
                  size="lg"
                  variant="secondary"
                  onClick={() => router.push("/auth/join/creator")}
                >
                  Get Started as Creator
                  <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            Already have an account?{" "}
            <Button
              variant="link"
              className="p-0 h-auto font-semibold"
              onClick={() => router.push("/auth/signin")}
            >
              Sign in here
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
}
