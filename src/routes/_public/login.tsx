import { useState } from "react"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { z } from "zod"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { loginSchema } from "@/shared/schemas/auth.schema"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const searchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute("/_public/login")({
  validateSearch: searchSchema,
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const { redirect: redirectTo } = Route.useSearch()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const result = loginSchema.safeParse({ email, password })
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach((err) => {
        if (err.path[0]) fieldErrors[String(err.path[0])] = err.message
      })
      setErrors(fieldErrors)
      return
    }
    setErrors({})
    setIsLoading(true)

    await authClient.signIn.email(
      { email, password },
      {
        onSuccess: () => {
          navigate({ to: redirectTo || "/dashboard" })
        },
        onError: (ctx) => {
          toast.error(ctx.error.message || "Failed to sign in")
        },
      }
    )

    setIsLoading(false)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>Sign in to your account</CardDescription>
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
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!errors.password}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
          <div className="flex items-center justify-between text-sm">
            <Link
              to="/forgot-password"
              className="text-muted-foreground hover:text-foreground"
            >
              Forgot password?
            </Link>
            <Link
              to="/signup"
              className="text-muted-foreground hover:text-foreground"
            >
              Create an account
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
