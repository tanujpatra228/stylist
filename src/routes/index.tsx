import { createFileRoute, Link, redirect } from "@tanstack/react-router"
import {
  Sparkles,
  Shirt,
  Wand2,
  MessageCircle,
  ArrowRight,
  Upload,
  UserCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getSession } from "@/server/auth.functions"

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const session = await getSession()
    if (session) {
      throw redirect({ to: "/dashboard" })
    }
  },
  component: LandingPage,
})

const FEATURES = [
  {
    icon: MessageCircle,
    title: "AI Style Profile",
    description:
      "Have a conversation with your personal AI stylist who learns your preferences, lifestyle, and taste.",
  },
  {
    icon: Shirt,
    title: "Smart Wardrobe",
    description:
      "Upload photos of your clothes and AI automatically categorizes them by type, color, season, and occasion.",
  },
  {
    icon: Wand2,
    title: "Outfit Suggestions",
    description:
      "Get AI-generated outfit combinations from your own wardrobe, tailored to any occasion or mood.",
  },
]

const STEPS = [
  {
    icon: UserCheck,
    step: "1",
    title: "Chat with your stylist",
    description: "Answer a few quick questions so the AI understands your style.",
  },
  {
    icon: Upload,
    step: "2",
    title: "Upload your wardrobe",
    description: "Snap photos of your clothes. AI handles the rest.",
  },
  {
    icon: Sparkles,
    step: "3",
    title: "Get outfit ideas",
    description: "Receive personalized outfit suggestions for any occasion.",
  },
]

function LandingPage() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      {/* Nav */}
      <header className="flex items-center justify-between border-b px-4 py-3 sm:px-8">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          <span className="text-lg font-semibold">AI Stylist</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Log in
            </Button>
          </Link>
          <Link to="/signup">
            <Button size="sm">Sign up</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:py-24">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
            <Sparkles className="size-3.5" />
            Powered by AI
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Your personal
            <br />
            <span className="text-primary">AI stylist</span>
          </h1>
          <p className="mx-auto max-w-lg text-lg text-muted-foreground">
            Upload your wardrobe, build your style profile, and get
            AI-powered outfit suggestions tailored to your life.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link to="/signup">
              <Button size="lg" className="w-full gap-2 sm:w-auto">
                Get started free
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
              >
                Log in
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/30 px-4 py-16 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-10 text-center text-2xl font-bold sm:text-3xl">
            Everything you need to dress your best
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {FEATURES.map((feature) => (
              <Card key={feature.title} className="border-0 bg-transparent shadow-none">
                <CardContent className="space-y-3 pt-6">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="size-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-16 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-10 text-center text-2xl font-bold sm:text-3xl">
            How it works
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.step} className="text-center">
                <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10">
                  <step.icon className="size-6 text-primary" />
                </div>
                <div className="mb-2 text-sm font-medium text-primary">
                  Step {step.step}
                </div>
                <h3 className="mb-1 font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-muted/30 px-4 py-16 text-center sm:px-8">
        <div className="mx-auto max-w-md space-y-4">
          <h2 className="text-2xl font-bold">Ready to elevate your style?</h2>
          <p className="text-muted-foreground">
            Join AI Stylist and let AI help you look your best every day.
          </p>
          <Link to="/signup">
            <Button size="lg" className="gap-2">
              Create your free account
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-6 text-center text-sm text-muted-foreground">
        AI Stylist - Built with AI
      </footer>
    </div>
  )
}
