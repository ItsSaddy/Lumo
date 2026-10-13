// Телефон покупателя: +7 и 10 цифр. Код оператора начинается с 7 (Казахстан) или 9 (мобильные России).
// Один и тот же модуль проверяет номер в форме (подсказка под полем) и на сервере (Server Actions)
export const PHONE_LENGTH = 10

// 10 цифр после +7 → (701) 234-56-78; неполный номер форматируется по мере ввода
export function formatPhone(digits: string) {
  const [code, a, b, c] = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 8), digits.slice(8, 10)]
  let out = code ? `(${code}` : ''
  if (a) out += `) ${a}`
  if (b) out += `-${b}`
  if (c) out += `-${c}`
  return out
}

export function fullPhone(digits: string) {
  return `+7 ${formatPhone(digits)}`
}

export function phoneError(digits: string): string | null {
  if (digits.length === 0) return 'Введите номер телефона'
  if (digits.length < PHONE_LENGTH) return `Номер неполный: нужно ${PHONE_LENGTH} цифр после +7`
  if (digits.length > PHONE_LENGTH) return `Слишком длинный номер: нужно ${PHONE_LENGTH} цифр после +7`
  if (!/^[79]/.test(digits)) return 'Проверьте код оператора: номер должен начинаться с +7 7… или +7 9…'
  return null
}

// Для сервера: номер в любом виде (+7 701…, 8 701…, 7701…) → 10 цифр после +7 или null, если номер неверный
export function parsePhone(raw: string): string | null {
  let digits = raw.replace(/\D/g, '')
  if (digits.length === PHONE_LENGTH + 1 && /^[78]/.test(digits)) digits = digits.slice(1)
  return phoneError(digits) ? null : digits
}
