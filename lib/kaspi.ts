import { createHmac, timingSafeEqual } from 'crypto'

// Kaspi QR через посредника ApiPay.kz (https://apipay.kz/docs): он выставляет счёт от имени
// кассира в нашем Kaspi Pay и присылает вебхук, когда Kaspi сообщит итог оплаты.
// Только для серверного кода — API-ключ не должен попасть в браузер.
const API_URL = 'https://api.apipay.kz/api/v1'

export type KaspiQr = {
  invoiceId: number
  amount: number
  // PNG с QR на стороне ApiPay; может отсутствовать — тогда остаётся только ссылка
  qrImageUrl: string | null
  // Ссылка на тот же счёт: на телефоне открывает приложение Kaspi без сканирования
  qrTokenUrl: string
  // До этого момента QR можно отсканировать (окно — минуты, длину задаёт Kaspi)
  expiresAt: string
}

export function isKaspiConfigured() {
  return Boolean(process.env.APIPAY_API_KEY && process.env.APIPAY_WEBHOOK_SECRET)
}

export async function createKaspiQr({ orderId, amount }: { orderId: string; amount: number }): Promise<KaspiQr | null> {
  const apiKey = process.env.APIPAY_API_KEY
  if (!apiKey) return null

  try {
    const res = await fetch(`${API_URL}/invoices/qr`, {
      method: 'POST',
      headers: { 'X-API-Key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: Math.round(amount),
        // Название позиции в чеке Kaspi (до 100 символов)
        description: `Заказ LUMO №${orderId.slice(0, 8).toUpperCase()}`,
        // По нему вебхук находит заказ. Повторные QR для одного заказа — отдельные счета с тем же id
        external_order_id: orderId,
      }),
    })
    if (!res.ok) {
      console.error('ApiPay не создал QR:', res.status, await res.text())
      return null
    }
    const data = await res.json()
    return {
      invoiceId: data.id,
      amount: Number(data.amount),
      qrImageUrl: data.qr_image_url ?? null,
      qrTokenUrl: data.qr_token_url,
      expiresAt: data.qr_expires_at,
    }
  } catch (err) {
    console.error('ApiPay недоступен:', err)
    return null
  }
}

// Подпись вебхука: X-Webhook-Signature = 'sha256=' + HMAC-SHA256(сырое тело, секрет вебхука)
export function verifyKaspiWebhook(rawBody: string, signature: string | null) {
  const secret = process.env.APIPAY_WEBHOOK_SECRET
  if (!secret || !signature) return false
  const expected = Buffer.from(`sha256=${createHmac('sha256', secret).update(rawBody).digest('hex')}`)
  const got = Buffer.from(signature)
  return got.length === expected.length && timingSafeEqual(got, expected)
}
