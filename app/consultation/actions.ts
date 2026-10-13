'use server'

import { sendTelegram } from '@/lib/telegram'
import { fullPhone, parsePhone } from '@/lib/phone'

type ConsultationInput = {
  name: string
  phone: string
  email: string
  // Скрытое поле-ловушка: люди его не видят, боты заполняют
  website: string
}

// Заявка на консультацию в базу не пишется — только уведомление менеджерам в Telegram
export async function submitConsultation(input: ConsultationInput) {
  if (input.website) return { error: null }

  const name = input.name.trim().slice(0, 100)
  const phoneDigits = parsePhone(input.phone)
  const email = input.email.trim().slice(0, 120)

  if (!name) return { error: 'Укажите имя' }
  if (!phoneDigits) return { error: 'Проверьте номер телефона: нужно +7 и 10 цифр' }
  const phone = fullPhone(phoneDigits)

  const sent = await sendTelegram(`💬 Заявка на консультацию

Имя: ${name}
Телефон: ${phone}${email ? `\nEmail: ${email}` : ''}`)

  // Заявка больше нигде не сохраняется — если Telegram недоступен, честно просим написать напрямую
  if (!sent) return { error: 'Не получилось отправить заявку. Напишите нам в WhatsApp — ответим там.' }
  return { error: null }
}
