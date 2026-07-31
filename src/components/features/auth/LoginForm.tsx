'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldKeyIcon, Mail01Icon, LockPasswordIcon, ViewIcon, ViewOffIcon } from 'hugeicons-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { loginAction } from '@/actions'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await loginAction({ email, password })
      if (result.success) {
        router.push('/')
        router.refresh()
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-[120px]"
        style={{ background: 'radial-gradient(circle, var(--violet-nyx), transparent 70%)' }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />

      <Card className="relative w-full max-w-sm border-border/60 p-8 shadow-2xl shadow-black/40">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="rounded-xl bg-violet-nyx/15 p-3">
            <ShieldKeyIcon size={28} className="text-violet-nyx" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-text-primary">Nyx</h1>
            <p className="mt-0.5 font-mono text-xs text-teal">
              <span className="text-text-secondary">$</span> master the night, own the light_
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-7 space-y-3">
          <div className="relative">
            <Mail01Icon size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              autoComplete="email"
              className="pl-10"
              required
            />
          </div>
          <div className="relative">
            <LockPasswordIcon size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              autoComplete="current-password"
              className="pl-10 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary transition-colors hover:text-text-primary"
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              tabIndex={-1}
            >
              {showPassword ? <ViewOffIcon size={17} /> : <ViewIcon size={17} />}
            </button>
          </div>

          {error && (
            <p className="rounded-md border border-red/30 bg-red/10 px-3 py-2 text-sm text-red">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
