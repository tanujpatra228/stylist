import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { UiHintOption } from "@/server/ai/types"

interface MultiSelectInputProps {
  options: UiHintOption[]
  onSubmit: (value: string) => void
  disabled?: boolean
}

export function MultiSelectInput({
  options,
  onSubmit,
  disabled,
}: MultiSelectInputProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [note, setNote] = useState("")

  function toggleOption(value: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(value)) {
        next.delete(value)
      } else {
        next.add(value)
      }
      return next
    })
  }

  function handleSubmit() {
    if (selected.size === 0) return
    const base = Array.from(selected).join(", ")
    const submission = note.trim()
      ? `${base} (Note: ${note.trim()})`
      : base
    onSubmit(submission)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Badge
            key={option.value}
            variant={selected.has(option.value) ? "default" : "outline"}
            className={cn(
              "min-h-[36px] cursor-pointer px-3 py-1.5 text-sm",
              disabled && "pointer-events-none opacity-50"
            )}
            onClick={() => toggleOption(option.value)}
          >
            {option.label}
          </Badge>
        ))}
      </div>
      {selected.size > 0 && (
        <Input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note (optional)"
          className="text-sm"
          disabled={disabled}
        />
      )}
      <Button
        onClick={handleSubmit}
        disabled={selected.size === 0 || disabled}
        className="w-full sm:w-auto"
      >
        Continue ({selected.size} selected)
      </Button>
    </div>
  )
}
