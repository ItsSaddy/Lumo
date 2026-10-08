'use server'

import { sendTelegram } from '@/lib/telegram'

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
  const phone = input.phone.trim().slice(0, 40)
  const email = input.email.trim().slice(0, 120)

  if (!name) return { error: 'Укажите имя' }
  if (phone.replace(/\D/g, '').length < 11) return { error: 'Укажите номер телефона полностью' }

  const sent = await sendTelegram(`💬 Заявка на консультацию

Имя: ${name}
Телефон: ${phone}${email ? `\nEmail: ${email}` : ''}`)

  // Заявка больше нигде не сохраняется — если Telegram недоступен, честно просим написать напрямую
  if (!sent) return { error: 'Не получилось отправить заявку. Напишите нам в WhatsApp — ответим там.' }
  return { error: null }
}
