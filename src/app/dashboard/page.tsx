"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/auth/signin")
      return
    }

    // Check if user needs onboarding
    if (!session.user.userType) {
      router.push("/auth/onboarding")
      return
    }

    // Redirect based on user type
    if (session.user.userType === 'SKILL_PROVIDER') {
      router.push("/dashboard/provider")
    } else if (session.user.userType === 'PROJECT_CREATOR') {
      router.push("/dashboard/creator")
    }
  }, [session, status, router])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground">Redirecting to your dashboard...</p>
    </div>
  )
}