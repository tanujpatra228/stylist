import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { UiHintOption } from "@/server/ai/types"

interface ImageGridInputProps {
  options: UiHintOption[]
  onSubmit: (value: string) => void
  disabled?: boolean
}

export function ImageGridInput({
  options,
  onSubmit,
  disabled,
}: ImageGridInputProps) {
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
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {options.map((option) => (
          <Button
            key={option.value}
            variant="outline"
            className={cn(
              "h-auto min-h-[80px] flex-col gap-1 whitespace-normal p-4",
              disabled && "pointer-events-none opacity-50",
              selectedValue === option.value &&
                "border-primary bg-accent ring-2 ring-primary"
            )}
            onClick={() => setSelectedValue(option.value)}
            disabled={disabled}
          >
            <span className="text-sm font-medium">{option.label}</span>
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
