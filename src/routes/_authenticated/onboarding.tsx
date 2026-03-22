import { useState, useCallback } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { Sparkles, ArrowLeft } from "lucide-react"
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
  const [currentUiHints, setCurrentUiHints] = useState<UiHints | undefined>()
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
      setCurrentUiHints(result.turnResponse.uiHints)
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
      setCurrentUiHints(undefined)
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
        setCurrentUiHints(result.turnResponse.uiHints)

        if (result.isComplete) {
          setIsComplete(true)
          setSummary(result.turnResponse.updatedSummary || null)
        }
      } catch (error) {
        console.error("Failed to send message:", error)
      }
      setIsLoading(false)
    },
    [sessionId]
  )

  // Welcome screen before starting
  if (!hasStarted) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="size-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Meet Your AI Stylist</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              I&apos;ll ask you a few quick questions to understand your style,
              lifestyle, and preferences. This takes about 2 minutes.
            </p>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button onClick={handleStart} className="w-full" size="lg">
              Let&apos;s get started
            </Button>
          </CardFooter>
        </Card>
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
