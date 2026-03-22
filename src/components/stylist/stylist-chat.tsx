import { useEffect, useRef } from "react"
import { Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { StylistMessage } from "./stylist-message"
import { UserMessage } from "./user-message"
import { SingleSelectInput } from "./inputs/single-select-input"
import { MultiSelectInput } from "./inputs/multi-select-input"
import { FreeTextInput } from "./inputs/free-text-input"
import { SliderInput } from "./inputs/slider-input"
import { ColorPickerInput } from "./inputs/color-picker-input"
import { ImageGridInput } from "./inputs/image-grid-input"
import type { UiHints } from "@/server/ai/types"

interface ChatMessage {
  role: "stylist" | "user"
  content: string
}

interface StylistChatProps {
  messages: ChatMessage[]
  currentUiHints?: UiHints
  turnCount: number
  maxTurns: number
  isLoading: boolean
  isComplete: boolean
  onSendMessage: (message: string) => void
}

export function StylistChat({
  messages,
  currentUiHints,
  turnCount,
  maxTurns,
  isLoading,
  isComplete,
  onSendMessage,
}: StylistChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  const progress = Math.round((turnCount / maxTurns) * 100)

  return (
    <div className="flex h-full flex-col">
      {/* Progress bar */}
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <Progress value={progress} className="flex-1" />
        <span className="shrink-0 text-xs text-muted-foreground">
          {turnCount} / {maxTurns}
        </span>
      </div>

      {/* Messages  - min-h-0 is critical for flex children to enable scrolling */}
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto p-4"
      >
        <div className="mx-auto max-w-2xl space-y-4 pb-4">
          {messages.map((msg, i) =>
            msg.role === "stylist" ? (
              <StylistMessage key={i} content={msg.content} />
            ) : (
              <UserMessage key={i} content={msg.content} />
            )
          )}

          {isLoading && (
            <div className="flex gap-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Loader2 className="size-4 animate-spin" />
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-3">
                <p className="text-sm text-muted-foreground">Thinking...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input area  - pinned to bottom */}
      {!isComplete && !isLoading && currentUiHints && (
        <div className="shrink-0 border-t bg-background p-4">
          <div className="mx-auto max-w-2xl">
            <DynamicInput
              uiHints={currentUiHints}
              onSubmit={onSendMessage}
              disabled={isLoading}
            />
            <div className="mt-2 flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={() =>
                  onSendMessage(
                    "Sorry, I didn't fully understand that question. Can you rephrase it or ask one thing at a time?"
                  )
                }
                disabled={isLoading}
              >
                <RefreshCw className="mr-1 size-3" />
                Can you rephrase that?
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DynamicInput({
  uiHints,
  onSubmit,
  disabled,
}: {
  uiHints: UiHints
  onSubmit: (value: string) => void
  disabled: boolean
}) {
  switch (uiHints.inputType) {
    case "single-select":
      return (
        <SingleSelectInput
          options={uiHints.options || []}
          onSubmit={onSubmit}
          disabled={disabled}
        />
      )
    case "multi-select":
      return (
        <MultiSelectInput
          options={uiHints.options || []}
          onSubmit={onSubmit}
          disabled={disabled}
        />
      )
    case "color-picker":
      return (
        <ColorPickerInput
          options={uiHints.options}
          onSubmit={onSubmit}
          disabled={disabled}
        />
      )
    case "slider":
      return (
        <SliderInput
          min={uiHints.min ?? 1}
          max={uiHints.max ?? 10}
          onSubmit={onSubmit}
          disabled={disabled}
        />
      )
    case "image-grid":
      return (
        <ImageGridInput
          options={uiHints.options || []}
          onSubmit={onSubmit}
          disabled={disabled}
        />
      )
    case "free-text":
      return (
        <FreeTextInput
          placeholder={uiHints.placeholder}
          onSubmit={onSubmit}
          disabled={disabled}
        />
      )
    case "text":
      // No input needed  - just a statement from the stylist
      return null
    default:
      return (
        <FreeTextInput
          placeholder="Type your response..."
          onSubmit={onSubmit}
          disabled={disabled}
        />
      )
  }
}
