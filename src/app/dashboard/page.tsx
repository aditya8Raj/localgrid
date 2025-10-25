"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/auth/signin")
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
    <div className="flex items-center justify-center min-h-screen">
      <p>Redirecting to your dashboard...</p>
    </div>
  )
}