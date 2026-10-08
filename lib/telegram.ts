// Только для серверного кода (Server Actions): токен бота не должен попасть в браузер.
// Шлёт сообщение в чат менеджеров. Возвращает false, если бот не настроен или Telegram ответил ошибкой
export async function sendTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return false

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    })
    if (!res.ok) {
      console.error('Telegram API отклонил уведомление:', res.status, await res.text())
      return false
    }
    return true
  } catch (err) {
    console.error('Не получилось отправить уведомление в Telegram:', err)
    return false
  }
}
