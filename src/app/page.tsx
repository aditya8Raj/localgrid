import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, MapPin, Calendar, Shield, Award, Sparkles } from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: Users,
      title: "Connect Locally",
      description: "Discover and connect with skilled individuals in your immediate community."
    },
    {
      icon: MapPin,
      title: "Geo-Location Matching",
      description: "Find skills and services within your customizable search radius."
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Built-in calendar with automated reminders and conflict detection."
    },
    {
      icon: Shield,
      title: "Trusted Community",
      description: "Verified profiles with ratings, reviews, and skill endorsements."
    },
    {
      icon: Award,
      title: "Recognition System",
      description: "Earn credits and badges as you contribute to the community."
    },
    {
      icon: Sparkles,
      title: "Collaborative Projects",
      description: "Join or create community projects and initiatives together."
    }
  ];

  const categories = [
    "Digital Skills",
    "Traditional Crafts",
    "Tutoring",
    "Fitness & Wellness",
    "Languages",
    "Music & Arts",
    "Home Services",
    "Consulting"
  ];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">LG</span>
            </div>
            <span className="text-xl font-bold">LocalGrid</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/explore">
              <Button variant="ghost">Explore</Button>
            </Link>
            <Link href="/how-it-works">
              <Button variant="ghost">How It Works</Button>
            </Link>
            <Link href="/auth/signin">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-20 md:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <Badge className="mb-4" variant="secondary">
            Building Stronger Communities Together
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
            Share Skills, Build Community, Grow Together
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            LocalGrid connects you with talented neighbors for skill exchange, learning, and collaborative projects. 
            Transform your community into a thriving ecosystem of knowledge and support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="text-lg px-8">
                Join Your Community
              </Button>
            </Link>
            <Link href="/explore">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Explore Skills
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container py-16 bg-muted/50">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            Everything You Need for Local Skill Exchange
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            A comprehensive platform designed to empower communities through knowledge sharing and collaboration.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <feature.icon className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            Explore Diverse Skill Categories
          </h2>
          <p className="text-center text-muted-foreground mb-8">
            From tech to traditional crafts, find or offer skills across multiple domains.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <Badge key={category} variant="secondary" className="px-4 py-2 text-sm">
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Community?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of community members already sharing skills and building stronger neighborhoods.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Create Your Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/explore">Explore Skills</Link></li>
                <li><Link href="/how-it-works">How It Works</Link></li>
                <li><Link href="/community">Community</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/help">Help Center</Link></li>
                <li><Link href="/safety">Safety</Link></li>
                <li><Link href="/contact">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy">Privacy Policy</Link></li>
                <li><Link href="/terms">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">LocalGrid</h3>
              <p className="text-sm text-muted-foreground">
                Building stronger communities through skill exchange and collaboration.
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © 2025 LocalGrid. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
