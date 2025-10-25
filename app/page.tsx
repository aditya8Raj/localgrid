import Link from "next/link"
import { ArrowRight, Users, MapPin, Star, Calendar, Shield, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Users className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold">LocalGrid</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/auth/signin">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-primary hover:bg-primary/90">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container flex flex-col items-center gap-8 py-20 text-center">
        <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm">
          <Zap className="mr-2 h-4 w-4 text-yellow-500" />
          Connect with skilled neighbors in your community
        </div>
        
        <h1 className="max-w-4xl text-5xl font-bold leading-tight tracking-tighter sm:text-6xl md:text-7xl">
          Share Skills, Build Community,
          <span className="bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 bg-clip-text text-transparent"> Grow Together</span>
        </h1>
        
        <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
          LocalGrid connects you with talented people in your neighborhood. Learn new skills, 
          share your expertise, and strengthen your local community.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link href="/auth/signup">
            <Button size="lg" className="gap-2">
              Start Connecting <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/auth/signin">
            <Button size="lg" variant="outline">
              Sign In
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-8 flex flex-wrap justify-center gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold">10K+</div>
            <div className="text-sm text-muted-foreground">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">50+</div>
            <div className="text-sm text-muted-foreground">Skill Categories</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">25K+</div>
            <div className="text-sm text-muted-foreground">Skills Shared</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-muted/50 py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to connect
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Powerful features designed to make skill sharing seamless and secure
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-2 border-border bg-card hover:border-primary/50 transition-colors">
              <CardHeader>
                <MapPin className="mb-2 h-10 w-10 text-blue-500" />
                <CardTitle>Hyperlocal Matching</CardTitle>
                <CardDescription>
                  Find skilled neighbors within your preferred radius. Connect with people nearby for easy collaboration.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-border bg-card hover:border-primary/50 transition-colors">
              <CardHeader>
                <Star className="mb-2 h-10 w-10 text-yellow-500" />
                <CardTitle>Reputation System</CardTitle>
                <CardDescription>
                  Build trust through ratings, reviews, and skill endorsements. Transparent feedback keeps the community strong.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-border bg-card hover:border-primary/50 transition-colors">
              <CardHeader>
                <Calendar className="mb-2 h-10 w-10 text-green-500" />
                <CardTitle>Smart Scheduling</CardTitle>
                <CardDescription>
                  Built-in calendar with automated reminders. Schedule sessions that work for everyone.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-border bg-card hover:border-primary/50 transition-colors">
              <CardHeader>
                <Shield className="mb-2 h-10 w-10 text-purple-500" />
                <CardTitle>Verified Profiles</CardTitle>
                <CardDescription>
                  Skill validation through peer reviews and digital badges. Know who you're working with.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-border bg-card hover:border-primary/50 transition-colors">
              <CardHeader>
                <Users className="mb-2 h-10 w-10 text-pink-500" />
                <CardTitle>Community Projects</CardTitle>
                <CardDescription>
                  Join collaborative initiatives or start your own. Build something amazing together.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-border bg-card hover:border-primary/50 transition-colors">
              <CardHeader>
                <Zap className="mb-2 h-10 w-10 text-orange-500" />
                <CardTitle>Credit System</CardTitle>
                <CardDescription>
                  Earn credits for sharing skills. Redeem them for services or donate to community causes.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20 text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to join your local community?
          </h2>
          <p className="text-lg text-muted-foreground">
            Sign up today and discover the amazing talents in your neighborhood. 
            It's free to get started!
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © 2025 LocalGrid. Built with ❤️ for local communities.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Terms
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
