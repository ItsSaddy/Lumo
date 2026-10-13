// Только для серверного кода (Server Actions): токен бота не должен попасть в браузер.
// Шлёт сообщение в чат менеджеров. Возвращает false, если бот не настроен или Telegram ответил ошибкой
export async function sendTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return false

  try {
    const first = await postMessage(token, chatId, text)
    if (first.ok) return true

    // Группу превратили в супергруппу — у неё новый id, а старый Telegram больше не принимает.
    // Повторяем по новому id сразу, чтобы заявка не потерялась, и просим обновить настройку
    const migratedTo = first.body?.parameters?.migrate_to_chat_id
    if (migratedTo) {
      console.error(`Telegram: группа стала супергруппой — обновите TELEGRAM_CHAT_ID на ${migratedTo} в настройках Vercel`)
      const retry = await postMessage(token, String(migratedTo), text)
      if (retry.ok) return true
      console.error('Telegram API отклонил уведомление:', retry.status, JSON.stringify(retry.body))
      return false
    }

    console.error('Telegram API отклонил уведомление:', first.status, JSON.stringify(first.body))
    return false
  } catch (err) {
    console.error('Не получилось отправить уведомление в Telegram:', err)
    return false
  }
}

async function postMessage(token: string, chatId: string, text: string) {
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  })
  const body = await res.json().catch(() => null) as { parameters?: { migrate_to_chat_id?: number } } | null
  return { ok: res.ok, status: res.status, body }
}
