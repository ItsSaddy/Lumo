'use client'

import { useState } from 'react'
import { submitConsultation } from '@/app/consultation/actions'
import { whatsappLink } from '@/lib/contacts'

// Поля — прозрачные рамки поверх карточки со свечением. «!» перебивает глобальный фон input из globals.css
const FIELD = 'w-full rounded-lg border bg-transparent! border-stone/30 px-5 py-3.5 text-ink outline-none transition-colors placeholder:text-stone/60 focus:border-brass'

// Храним только 10 цифр после +7 и показываем их как (701) 234-56-78
function formatPhone(digits: string) {
  const [code, a, b, c] = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 8), digits.slice(8, 10)]
  let out = code ? `(${code}` : ''
  if (a) out += `) ${a}`
  if (b) out += `-${b}`
  if (c) out += `-${c}`
  return out
}

function WhatsAppIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.94.57 3.75 1.55 5.27L2 22l4.97-1.64a9.87 9.87 0 0 0 5.07 1.38c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm5.8 14.07c-.24.68-1.4 1.3-1.94 1.38-.5.08-1.12.11-1.8-.11a15.8 15.8 0 0 1-2.63-1.14 12.3 12.3 0 0 1-3.6-3.9c-.38-.6-.63-1.28-.6-2.03.03-.6.35-1.14.72-1.5.14-.14.32-.2.5-.2h.36c.15 0 .35.02.5.36.2.44.68 1.66.74 1.78.06.12.1.26.02.42-.08.16-.13.26-.26.4-.13.14-.27.32-.39.43-.13.12-.26.26-.12.5.36.62.86 1.24 1.36 1.72.5.48 1.06.9 1.66 1.2.24.12.4.1.55-.04.16-.14.68-.72.86-.97.18-.24.36-.2.6-.12.24.08 1.5.7 1.76.83.26.12.43.18.5.28.06.1.06.6-.18 1.28Z" />
    </svg>
  )
}

export default function ConsultationForm() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  function handlePhoneChange(raw: string) {
    const digits = raw.replace(/\D/g, '')
    // «8» в начале — привычный междугородний префикс, а не часть номера после +7
    if (phone.length === 0 && digits === '8') return
    // Вставили номер целиком: +7 701 … или 8 701 … — отбрасываем код страны
    const next = digits.length > 10 && phone.length < 10 && /^[78]/.test(digits) ? digits.slice(1) : digits
    setPhone(next.slice(0, 10))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (phone.length < 10) {
      setError('Укажите номер телефона полностью')
      return
    }
    setLoading(true)
    setError(null)

    const result = await submitConsultation({ name, phone: `+7 ${formatPhone(phone)}`, email, website })

    setLoading(false)
    if (result.error) {
      setError(result.error)
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-lg border border-brass/40 px-6 py-12 text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-brass text-2xl text-paper">✓</span>
        <p className="mt-5 font-display text-2xl text-ink">Заявка отправлена</p>
        <p className="mt-3 max-w-xs text-stone">Мы позвоним или напишем вам в течение часа в рабочее время.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input type="text" placeholder="Ваше имя" aria-label="Ваше имя" autoComplete="name" required
        value={name} onChange={(e) => setName(e.target.value)} className={FIELD} />
      <label className={`${FIELD} flex cursor-text items-center gap-2 focus-within:border-brass`}>
        <span className="text-ink">+7</span>
        <input type="tel" inputMode="numeric" placeholder="(000) 000-00-00" aria-label="Телефон" autoComplete="tel-national" required
          value={formatPhone(phone)} onChange={(e) => handlePhoneChange(e.target.value)}
          className="min-w-0 flex-1 bg-transparent! text-ink outline-none placeholder:text-stone/60" />
      </label>
      <input type="email" placeholder="Ваш email (необязательно)" aria-label="Email" autoComplete="email"
        value={email} onChange={(e) => setEmail(e.target.value)} className={FIELD} />
      {/* Ловушка для ботов: поле скрыто от людей и от скринридеров */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden"
        value={website} onChange={(e) => setWebsite(e.target.value)} />

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button type="submit" disabled={loading}
        className="mt-1 rounded-full bg-brass py-3.5 text-sm font-semibold uppercase tracking-[0.2em] text-paper shadow-lg shadow-brass/20 transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100">
        {loading ? 'Отправляю...' : 'Оставить заявку'}
      </button>
      <a href={whatsappLink('Здравствуйте! Хочу проконсультироваться по продуктам LUMO.')} target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 rounded-full border border-[#25d366]/50 py-3.5 text-sm font-semibold text-ink transition-colors hover:border-[#25d366] hover:bg-[#25d366]/10">
        <WhatsAppIcon className="h-5 w-5 shrink-0 text-[#25d366]" />
        Проконсультироваться в WhatsApp
      </a>
    </form>
  )
}
