import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { UiHintOption } from "@/server/ai/types"

interface SingleSelectInputProps {
  options: UiHintOption[]
  onSubmit: (value: string) => void
  disabled?: boolean
}

export function SingleSelectInput({
  options,
  onSubmit,
  disabled,
}: SingleSelectInputProps) {
  const [selectedValue, setSelectedValue] = useState<string | null>(null)
  const [note, setNote] = useState("")
  const [showNote, setShowNote] = useState(false)

  function handleSubmit() {
    if (!selectedValue) return
    const submission = note.trim()
      ? `${selectedValue} (Note: ${note.trim()})`
      : selectedValue
    onSubmit(submission)
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <Button
            key={option.value}
            variant="outline"
            className={cn(
              "h-auto min-h-[44px] whitespace-normal px-4 py-3 text-left",
              selectedValue === option.value &&
                "border-primary bg-accent ring-2 ring-primary"
            )}
            onClick={() => setSelectedValue(option.value)}
            disabled={disabled}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {selectedValue && (
        <div className="space-y-2">
          {showNote ? (
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note (optional)"
              className="text-sm"
              disabled={disabled}
            />
          ) : (
            <button
              type="button"
              onClick={() => setShowNote(true)}
              className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
            >
              Add a note (optional)
            </button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={disabled}
            className="w-full sm:w-auto"
          >
            Continue
          </Button>
        </div>
      )}
    </div>
  )
}
