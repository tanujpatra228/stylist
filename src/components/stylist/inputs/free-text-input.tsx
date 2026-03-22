import { useState } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface FreeTextInputProps {
  placeholder?: string
  onSubmit: (value: string) => void
  disabled?: boolean
}

export function FreeTextInput({
  placeholder,
  onSubmit,
  disabled,
}: FreeTextInputProps) {
  const [value, setValue] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!value.trim()) return
    onSubmit(value.trim())
    setValue("")
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder || "Type your response..."}
        disabled={disabled}
        className="flex-1"
      />
      <Button
        type="submit"
        size="icon"
        disabled={!value.trim() || disabled}
      >
        <Send className="size-4" />
      </Button>
    </form>
  )
}
