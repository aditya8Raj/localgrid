import { auth } from "@/auth.config"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  const isAuthRoute = nextUrl.pathname.startsWith("/auth")
  const isPublicRoute = nextUrl.pathname === "/"
  const isApiRoute = nextUrl.pathname.startsWith("/api")

  // Allow API routes
  if (isApiRoute) {
    return NextResponse.next()
  }

  // Redirect logged in users from auth pages
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl))
  }

  // Redirect non-logged in users to signin
  if (!isAuthRoute && !isPublicRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/signin", nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}
