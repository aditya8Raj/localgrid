import { redirect } from "next/navigation"
import { auth } from "@/auth.config"

export default async function Home() {
  const session = await auth()
  
  if (session?.user) {
    redirect("/dashboard")
  } else {
    redirect("/auth/signin")
  }
}
