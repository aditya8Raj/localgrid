"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Users, Briefcase, Loader2 } from "lucide-react"
import { toast } from "sonner"
import axios from "axios"

export default function OnboardingPage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [userType, setUserType] = useState<"SKILL_PROVIDER" | "PROJECT_CREATOR">("SKILL_PROVIDER")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Update user type in database
      await axios.patch("/api/users/onboarding", {
        userType: userType,
      })

      // Update session
      await update()

      toast.success("Profile updated successfully!")
      
      // Redirect to appropriate dashboard
      if (userType === "SKILL_PROVIDER") {
        router.push("/dashboard/provider")
      } else {
        router.push("/dashboard/creator")
      }
      router.refresh()
    } catch (error) {
      console.error("Onboarding error:", error)
      toast.error("Failed to update profile. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // If user already has a userType, redirect to dashboard
  if (session?.user?.userType) {
    if (session.user.userType === "SKILL_PROVIDER") {
      router.push("/dashboard/provider")
    } else {
      router.push("/dashboard/creator")
    }
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-2xl">LG</span>
            </div>
            <span className="text-3xl font-bold">LocalGrid</span>
          </div>
          <h1 className="text-3xl font-bold mt-4">Welcome to LocalGrid!</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Let&apos;s set up your account. This choice is permanent.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Choose Your Role</CardTitle>
            <CardDescription>
              Select how you want to use LocalGrid. You won&apos;t be able to change this later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <Label className="text-lg font-semibold">I want to join as:</Label>
                <RadioGroup 
                  value={userType} 
                  onValueChange={(value: string) => setUserType(value as "SKILL_PROVIDER" | "PROJECT_CREATOR")}
                  className="space-y-4"
                >
                  {/* Skill Provider Option */}
                  <div 
                    className={`relative flex items-start space-x-4 border-2 rounded-lg p-6 cursor-pointer transition-all
                      ${userType === "SKILL_PROVIDER" 
                        ? "border-primary bg-primary/5 shadow-md" 
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                      }`}
                    onClick={() => setUserType("SKILL_PROVIDER")}
                  >
                    <RadioGroupItem value="SKILL_PROVIDER" id="provider" className="mt-1" />
                    <Label htmlFor="provider" className="flex items-start gap-4 cursor-pointer flex-1">
                      <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Users className="h-7 w-7 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xl font-bold mb-2">Skill Provider</div>
                        <div className="text-sm text-muted-foreground mb-3">
                          Perfect for freelancers, teachers, and service providers
                        </div>
                        <ul className="text-sm space-y-1.5 text-muted-foreground">
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">✓</span>
                            <span>Create and manage skill listings</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">✓</span>
                            <span>Accept bookings from clients</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">✓</span>
                            <span>Earn credits and build reputation</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">✓</span>
                            <span>Join community projects as a member</span>
                          </li>
                        </ul>
                      </div>
                    </Label>
                  </div>

                  {/* Project Creator Option */}
                  <div 
                    className={`relative flex items-start space-x-4 border-2 rounded-lg p-6 cursor-pointer transition-all
                      ${userType === "PROJECT_CREATOR" 
                        ? "border-primary bg-primary/5 shadow-md" 
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                      }`}
                    onClick={() => setUserType("PROJECT_CREATOR")}
                  >
                    <RadioGroupItem value="PROJECT_CREATOR" id="creator" className="mt-1" />
                    <Label htmlFor="creator" className="flex items-start gap-4 cursor-pointer flex-1">
                      <div className="h-14 w-14 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                        <Briefcase className="h-7 w-7 text-secondary-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xl font-bold mb-2">Project Creator</div>
                        <div className="text-sm text-muted-foreground mb-3">
                          Perfect for entrepreneurs, managers, and project leads
                        </div>
                        <ul className="text-sm space-y-1.5 text-muted-foreground">
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">✓</span>
                            <span>Browse and book skill providers</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">✓</span>
                            <span>Create and manage community projects</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">✓</span>
                            <span>Build and lead teams</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">✓</span>
                            <span>Review and rate service providers</span>
                          </li>
                        </ul>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                  ⚠️ Important: This choice is permanent and cannot be changed later.
                </p>
              </div>

              <Button type="submit" className="w-full h-12 text-base" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Setting up your account...
                  </>
                ) : (
                  `Continue as ${userType === "SKILL_PROVIDER" ? "Skill Provider" : "Project Creator"}`
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-sm text-center text-muted-foreground mt-6">
          Need help deciding?{" "}
          <a href="/help/choosing-role" className="text-primary hover:underline">
            Learn more about each role
          </a>
        </p>
      </div>
    </div>
  )
}
