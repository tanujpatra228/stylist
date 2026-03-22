import { useState } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { forgotPasswordSchema } from "@/shared/schemas/auth.schema"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const Route = createFileRoute("/_public/forgot-password")({
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const result = forgotPasswordSchema.safeParse({ email })
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach((err) => {
        if (err.path[0]) fieldErrors[String(err.path[0])] = err.message
      })
      setErrors(fieldErrors)
      return
    }
    setErrors({})
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Check your email</CardTitle>
          <CardDescription>
            If an account exists with that email, we&apos;ll send you a password
            reset link.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link to="/login" className="w-full">
            <Button variant="outline" className="w-full">
              Back to sign in
            </Button>
          </Link>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Forgot password</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send you a reset link.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full">
            Send reset link
          </Button>
          <Link
            to="/login"
            className="text-center text-sm text-muted-foreground hover:text-foreground"
          >
            Back to sign in
          </Link>
        </CardFooter>
      </form>
    </Card>
  )
}
