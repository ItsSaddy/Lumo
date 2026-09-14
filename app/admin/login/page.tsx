'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Неверный email или пароль')
      setLoading(false)
      return
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <span className="metal-text font-display text-lg font-bold tracking-[0.3em]">LUMO</span>
      <h1 className="mt-2 font-display text-3xl text-ink">Вход в админку</h1>
      <form onSubmit={handleSubmit} className="card-glow mt-8 flex flex-col gap-4 rounded-lg bg-mist p-6">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="rounded border border-stone/30 bg-paper px-4 py-2.5 text-ink outline-none transition-colors focus:border-brass"
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="rounded border border-stone/30 bg-paper px-4 py-2.5 text-ink outline-none transition-colors focus:border-brass"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-full bg-brass py-3 text-sm font-semibold uppercase tracking-[0.15em] text-paper transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
        >
          {loading ? 'Вхожу...' : 'Войти'}
        </button>
      </form>
    </main>
  )
}