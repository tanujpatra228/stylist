import { useRouter } from "@tanstack/react-router"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface RouteErrorProps {
  message?: string
}

export function RouteError({
  message = "Something went wrong. Please try again.",
}: RouteErrorProps) {
  const router = useRouter()

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center space-y-4 text-center">
      <AlertTriangle className="size-12 text-destructive" />
      <h2 className="text-lg font-semibold">Error</h2>
      <p className="max-w-md text-sm text-muted-foreground">{message}</p>
      <div className="flex gap-2">
        <Button onClick={() => router.invalidate()}>Try again</Button>
        <Button variant="outline" onClick={() => router.history.back()}>
          Go back
        </Button>
      </div>
    </div>
  )
}
