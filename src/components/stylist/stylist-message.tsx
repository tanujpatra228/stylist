import { Sparkles } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface StylistMessageProps {
  content: string
}

export function StylistMessage({ content }: StylistMessageProps) {
  return (
    <div className="flex gap-3">
      <Avatar className="size-8 shrink-0">
        <AvatarFallback className="bg-primary text-primary-foreground">
          <Sparkles className="size-4" />
        </AvatarFallback>
      </Avatar>
      <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-muted px-4 py-3">
        <p className="text-sm leading-relaxed">{content}</p>
      </div>
    </div>
  )
}
