import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useAuth } from '@/context/AuthContext'
import { Button, Field, Input } from '@/components/ui'
import logo from '@/assets/logo.svg'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
})

interface LocationState {
  from?: { pathname?: string }
}

export default function Login() {
  const { signIn, previewMode } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo =
    (location.state as LocationState | null)?.from?.pathname ?? '/'

  const [email, setEmail] = useState(previewMode ? 'admin@frontbits.com' : '')
  const [password, setPassword] = useState(previewMode ? 'preview' : '')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [formError, setFormError] = useState<string>()
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(undefined)
    const parsed = schema.safeParse({ email, password })
    if (!parsed.success) {
      const fieldErrors: { email?: string; password?: string } = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as 'email' | 'password'
        fieldErrors[key] = issue.message
      }
      setErrors(fieldErrors)
      return
    }
    setErrors({})
    setSubmitting(true)
    const { error } = await signIn(parsed.data.email, parsed.data.password)
    setSubmitting(false)
    if (error) {
      setFormError(error)
      return
    }
    navigate(redirectTo, { replace: true })
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <img src={logo} alt="Frontbits" className="h-7 w-auto" />
        </div>

        <div className="rounded-2xl border border-line bg-surface p-7 shadow-[var(--shadow-card)]">
          <h1 className="text-lg font-semibold text-ink">Sign in</h1>
          <p className="mt-1 text-sm text-ink-mute">
            Welcome back. Sign in to the Frontbits CRM.
          </p>

          {previewMode && (
            <div className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Preview mode is on. Any details will sign you in so you can explore the
              app shell. Add Supabase keys to .env for real accounts.
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
            <Field label="Email" htmlFor="email" error={errors.email}>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@frontbits.com"
              />
            </Field>

            <Field label="Password" htmlFor="password" error={errors.password}>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
              />
            </Field>

            {formError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {formError}
              </p>
            )}

            <Button type="submit" className="w-full" loading={submitting}>
              Sign in
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-ink-mute">
          Frontbits LLC internal tool. Access is limited to the team.
        </p>
      </div>
    </div>
  )
}
