import { after } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyKaspiWebhook } from '@/lib/kaspi'
import { formatPrice } from '@/lib/format'
import { sendTelegram } from '@/lib/telegram'

// Вебхук ApiPay. Адрес для кабинета ApiPay (Настройки → API-ключи → Webhook URL):
//   https://www.health-lumo.org/api/kaspi/webhook
// ApiPay ждёт ответ ≤5 секунд и повторяет доставку только при 5xx/429 — поэтому Telegram шлём
// после ответа (after), а 500 отдаём только когда стоит повторить (база недоступна)

type WebhookInvoice = {
  id: number
  external_order_id?: string
  amount: string
  status: string
  kaspi_source_type?: string
  paid_at?: string
  is_sandbox?: boolean
}

const SOURCE_LABEL: Record<string, string> = {
  GOLD: 'Kaspi Gold',
  RED: 'Kaspi Red',
  LOAN: 'Kaspi Кредит',
}

export async function POST(request: Request) {
  const rawBody = await request.text()
  if (!verifyKaspiWebhook(rawBody, request.headers.get('x-webhook-signature'))) {
    return new Response('Invalid signature', { status: 401 })
  }

  let payload: { event?: string; invoice?: WebhookInvoice }
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }
  const invoice = payload.invoice
  // Интересует только итог «оплачено»; qr_scanned, expired, cancelled и тестовый вебхук просто подтверждаем
  if (payload.event !== 'invoice.status_changed' || invoice?.status !== 'paid' || !invoice.external_order_id) {
    return new Response('OK')
  }

  const admin = createAdminClient()
  if (!admin) return new Response('Payments are not configured', { status: 500 })

  const { data: order, error } = await admin
    .from('orders')
    .select('id, customer_name, phone, total_price, payment_status, payment_invoice_id')
    .eq('id', invoice.external_order_id)
    .maybeSingle()
  if (error) return new Response('DB error', { status: 500 })
  if (!order) return new Response('OK')

  const testMark = invoice.is_sandbox ? '[ТЕСТ] ' : ''
  const paid = Number(invoice.amount)
  const method = SOURCE_LABEL[invoice.kaspi_source_type ?? ''] ?? 'Kaspi'

  if (order.payment_status === 'paid') {
    // Повторная доставка того же вебхука — ничего не делаем
    if (order.payment_invoice_id === invoice.id) return new Response('OK')
    // Клиент оплатил второй QR того же заказа — деньги пришли дважды
    after(() => sendTelegram(`⚠️ ${testMark}Повторная оплата заказа ${order.customer_name} (${order.phone}) — ${formatPrice(paid)}.
Заказ уже был оплачен, нужен возврат второго платежа в Kaspi Pay.`))
    return new Response('OK')
  }

  const { error: updateError } = await admin
    .from('orders')
    .update({
      payment_status: 'paid',
      payment_invoice_id: invoice.id,
      payment_method: invoice.kaspi_source_type ?? null,
      paid_at: invoice.paid_at ?? new Date().toISOString(),
    })
    .eq('id', order.id)
  if (updateError) return new Response('DB error', { status: 500 })

  const mismatch = paid !== Number(order.total_price)
    ? `\n⚠️ Сумма заказа ${formatPrice(order.total_price)} — проверьте!`
    : ''
  after(() => sendTelegram(`💰 ${testMark}Заказ оплачен через ${method}

Имя: ${order.customer_name}
Телефон: ${order.phone}
Оплачено: ${formatPrice(paid)}${mismatch}`))

  return new Response('OK')
}
