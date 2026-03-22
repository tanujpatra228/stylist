import { createFileRoute } from "@tanstack/react-router"
import { Sparkles } from "lucide-react"

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: OnboardingPage,
})

function OnboardingPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4 text-center">
      <Sparkles className="size-12 text-primary" />
      <h1 className="text-2xl font-semibold">AI Stylist Onboarding</h1>
      <p className="max-w-md text-muted-foreground">
        Your personal AI stylist conversation will happen here. This
        full-screen experience is coming in Phase 3.
      </p>
    </div>
  )
}
