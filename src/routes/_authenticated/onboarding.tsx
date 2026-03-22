import { useState, useCallback, useRef } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { Sparkles, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { StylistChat } from "@/components/stylist/stylist-chat"
import {
  startStylistSession,
  sendStylistMessage,
} from "@/server/functions/stylist"
import type { StylistTurnResponse, UiHints } from "@/server/ai/types"

interface SessionResult {
  sessionId: string
  turnResponse: StylistTurnResponse
  turnCount: number
  maxTurns: number
  isComplete?: boolean
}

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: OnboardingPage,
})

interface ChatMessage {
  role: "stylist" | "user"
  content: string
}

function OnboardingPage() {
  const navigate = useNavigate()

  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentUiHints, setCurrentUiHints] = useState<UiHints | undefined>(undefined)
  const lastUiHintsRef = useRef<UiHints | undefined>(undefined)
  function updateUiHints(hints: UiHints | undefined) {
    if (hints) lastUiHintsRef.current = hints
    setCurrentUiHints(hints)
  }
  const [turnCount, setTurnCount] = useState(0)
  const [maxTurns, setMaxTurns] = useState(7)
  const [isLoading, setIsLoading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)
  const [hasStarted, setHasStarted] = useState(false)

  const handleStart = useCallback(async () => {
    setIsLoading(true)
    setHasStarted(true)
    try {
      const result = (await startStylistSession({
        data: { type: "onboarding" },
      })) as SessionResult
      setSessionId(result.sessionId)
      setMaxTurns(result.maxTurns)
      setTurnCount(result.turnCount)
      setMessages([
        { role: "stylist", content: result.turnResponse.message },
      ])
      updateUiHints(result.turnResponse.uiHints)
    } catch (error: unknown) {
      const err = error as Error
      console.error("Failed to start session:", err.message || err)
      setHasStarted(false)
    }
    setIsLoading(false)
  }, [])

  const handleSendMessage = useCallback(
    async (message: string) => {
      if (!sessionId) return

      // Optimistically add user message
      setMessages((prev) => [...prev, { role: "user", content: message }])
      updateUiHints(undefined)
      setIsLoading(true)

      try {
        const result = (await sendStylistMessage({
          data: { sessionId, message },
        })) as SessionResult
        setTurnCount(result.turnCount)
        setMessages((prev) => [
          ...prev,
          { role: "stylist", content: result.turnResponse.message },
        ])
        updateUiHints(result.turnResponse.uiHints)

        if (result.isComplete) {
          setIsComplete(true)
          setSummary(result.turnResponse.updatedSummary || null)
        }
      } catch (error: unknown) {
        const err = error as Error
        console.error("Failed to send message:", err.message || err)
        toast.error("Couldn't reach the AI stylist. Please try again.")
        // Remove the optimistic user message so they can retry
        setMessages((prev) => prev.slice(0, -1))
        updateUiHints(lastUiHintsRef.current)
      }
      setIsLoading(false)
    },
    [sessionId]
  )

  // Welcome screen before starting
  if (!hasStarted) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Stylist avatar + intro */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex size-20 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="size-10 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold">
              Hi, I&apos;m your AI Stylist
            </h1>
            <p className="mt-2 text-muted-foreground">
              Think of me as your personal style consultant.
            </p>
          </div>

          {/* What to expect */}
          <Card>
            <CardContent className="space-y-4 pt-6">
              <p className="text-sm leading-relaxed">
                Before I can help you build amazing outfits, I need to
                understand <strong>you</strong>  - your style, your lifestyle,
                and what makes you feel confident.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                    1
                  </span>
                  <p className="text-sm text-muted-foreground">
                    I&apos;ll ask a few quick questions about your style
                    preferences, daily routine, and colors you love.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                    2
                  </span>
                  <p className="text-sm text-muted-foreground">
                    From your answers, I&apos;ll build a personalized style
                    profile unique to you.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                    3
                  </span>
                  <p className="text-sm text-muted-foreground">
                    Later, I&apos;ll use this profile to suggest outfits from
                    your wardrobe that truly match your style.
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                This takes about 2 minutes. You can always update your profile
                later.
              </p>
            </CardContent>
          </Card>

          <Button
            onClick={handleStart}
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? "Starting..." : "Let\u2019s get started"}
          </Button>
        </div>
      </div>
    )
  }

  // Completion screen
  if (isComplete && summary) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="size-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Your Style Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed text-muted-foreground">{summary}</p>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => navigate({ to: "/dashboard" })}
              className="w-full"
              size="lg"
            >
              Looks great! Take me to my dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Chat interface
  return (
    <div className="flex h-svh flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: "/dashboard" })}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <Sparkles className="size-5 text-primary" />
        <span className="font-medium">AI Stylist</span>
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-hidden">
        <StylistChat
          messages={messages}
          currentUiHints={currentUiHints}
          turnCount={turnCount}
          maxTurns={maxTurns}
          isLoading={isLoading}
          isComplete={isComplete}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  )
}
