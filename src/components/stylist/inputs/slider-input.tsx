import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SliderInputProps {
  min: number
  max: number
  onSubmit: (value: string) => void
  disabled?: boolean
}

export function SliderInput({
  min,
  max,
  onSubmit,
  disabled,
}: SliderInputProps) {
  const mid = Math.round((min + max) / 2)
  const [value, setValue] = useState(mid)
  const [note, setNote] = useState("")
  const [touched, setTouched] = useState(false)

  function handleValueChange([v]: number[]) {
    setValue(v)
    setTouched(true)
  }

  function handleSubmit() {
    const base = String(value)
    const submission = note.trim()
      ? `${base} (Note: ${note.trim()})`
      : base
    onSubmit(submission)
  }

  return (
    <div className="space-y-4">
      <div className="px-1">
        <Slider
          min={min}
          max={max}
          step={1}
          value={[value]}
          onValueChange={handleValueChange}
          disabled={disabled}
        />
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>{min}</span>
          <span className="text-sm font-medium text-foreground">{value}</span>
          <span>{max}</span>
        </div>
      </div>
      {touched && (
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
        disabled={disabled}
        className="w-full sm:w-auto"
      >
        Continue
      </Button>
    </div>
  )
}
