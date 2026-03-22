import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { UiHintOption } from "@/server/ai/types"

const DEFAULT_COLORS: UiHintOption[] = [
  { label: "Black", value: "black" },
  { label: "White", value: "white" },
  { label: "Navy", value: "navy" },
  { label: "Gray", value: "gray" },
  { label: "Beige", value: "beige" },
  { label: "Brown", value: "brown" },
  { label: "Red", value: "red" },
  { label: "Burgundy", value: "burgundy" },
  { label: "Pink", value: "pink" },
  { label: "Orange", value: "orange" },
  { label: "Yellow", value: "yellow" },
  { label: "Green", value: "green" },
  { label: "Olive", value: "olive" },
  { label: "Teal", value: "teal" },
  { label: "Blue", value: "blue" },
  { label: "Purple", value: "purple" },
]

const COLOR_MAP: Record<string, string> = {
  black: "#000000",
  white: "#FFFFFF",
  navy: "#1B2A4A",
  gray: "#9CA3AF",
  beige: "#D4C5A9",
  brown: "#7C5C3E",
  red: "#DC2626",
  burgundy: "#7F1D1D",
  pink: "#EC4899",
  orange: "#F97316",
  yellow: "#EAB308",
  green: "#16A34A",
  olive: "#6B7F3B",
  teal: "#0D9488",
  blue: "#3B82F6",
  purple: "#8B5CF6",
}

interface ColorPickerInputProps {
  options?: UiHintOption[]
  onSubmit: (value: string) => void
  disabled?: boolean
}

export function ColorPickerInput({
  options,
  onSubmit,
  disabled,
}: ColorPickerInputProps) {
  const colors = options?.length ? options : DEFAULT_COLORS
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [note, setNote] = useState("")

  function toggleColor(value: string) {
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
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
        {colors.map((color) => {
          const bg = COLOR_MAP[color.value] || color.value
          const isSelected = selected.has(color.value)
          return (
            <button
              key={color.value}
              type="button"
              onClick={() => toggleColor(color.value)}
              disabled={disabled}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg p-2 transition-all",
                isSelected
                  ? "bg-accent ring-2 ring-primary"
                  : "hover:bg-accent/50",
                disabled && "pointer-events-none opacity-50"
              )}
              title={color.label}
            >
              <div
                className="size-8 rounded-full border border-border"
                style={{ backgroundColor: bg }}
              />
              <span className="text-[10px] text-muted-foreground">
                {color.label}
              </span>
            </button>
          )
        })}
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
