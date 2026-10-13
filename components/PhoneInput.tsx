'use client'

import { formatPhone, PHONE_LENGTH } from '@/lib/phone'

// Поле телефона с маской: «+7» — неизменяемый префикс, value — только 10 цифр после него.
// className — размеры и скругление рамки (задаёт форма, без цвета рамки — его ставит поле: красный при ошибке),
// error — текст ошибки под полем
export default function PhoneInput({ id, value, onChange, onBlur, error, className }: {
  id: string
  value: string
  onChange: (digits: string) => void
  onBlur?: () => void
  error?: string | null
  className: string
}) {
  function handleChange(raw: string) {
    const digits = raw.replace(/\D/g, '')
    // «8» в начале — привычный междугородний префикс, а не часть номера после +7
    if (value.length === 0 && digits === '8') return
    // Вставили или подставили автозаполнением номер целиком: +7 701 … или 8 701 … — отбрасываем код страны
    const next = digits.length > PHONE_LENGTH && value.length < PHONE_LENGTH && /^[78]/.test(digits) ? digits.slice(1) : digits
    onChange(next.slice(0, PHONE_LENGTH))
  }

  return (
    <div>
      <label htmlFor={id} className={`${className} flex cursor-text items-center gap-2 border transition-colors ${
        error ? 'border-red-400/70 focus-within:border-red-400' : 'border-stone/30 focus-within:border-brass'
      }`}>
        <span className="text-ink">+7</span>
        {/* bg-transparent! — перебивает глобальный фон input из globals.css */}
        <input id={id} type="tel" inputMode="numeric" placeholder="(700) 000-00-00" autoComplete="tel-national"
          aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined}
          value={formatPhone(value)} onChange={(e) => handleChange(e.target.value)} onBlur={onBlur}
          className="min-w-0 flex-1 bg-transparent! text-ink outline-none placeholder:text-stone/60" />
      </label>
      {error && <p id={`${id}-error`} className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  )
}
