'use server'

import { createClient } from '@/lib/supabase/server'
import { randomUUID } from 'crypto'
import { calculateOrderTotals } from '@/lib/discount'
import { formatPrice } from '@/lib/format'

type OrderInput = {
  customerName: string
  phone: string
  address: string
  // details — состав набора, чтобы менеджер видел, что собирать
  items: { id: string; name: string; details?: string; price: number; quantity: number }[]
}

async function notifyTelegram(order: OrderInput, totalPrice: number) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return

  const itemsList = order.items
    .map((item) => `— ${item.name} × ${item.quantity} — ${formatPrice(item.price * item.quantity)}${item.details ? `\n   ${item.details}` : ''}`)
    .join('\n')

  const text = `🔔 Новая заявка на Lumo

Имя: ${order.customerName}
Телефон: ${order.phone}
Адрес: ${order.address}

${itemsList}

Итого (со скидкой): ${formatPrice(totalPrice)}`

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    })
    if (!res.ok) {
      console.error('Telegram API отклонил уведомление:', res.status, await res.text())
    }
  } catch (err) {
    console.error('Не получилось отправить уведомление в Telegram:', err)
  }
}

export async function submitOrder(order: OrderInput) {
  const supabase = await createClient()
  const orderId = randomUUID()
  const { total: totalPrice } = calculateOrderTotals(order.items)

  const { error: orderError } = await supabase.from('orders').insert({
    id: orderId,
    customer_name: order.customerName,
    phone: order.phone,
    // Доставка только по Казахстану — колонку заполняем, чтобы заявки в админке выглядели единообразно
    country: 'Казахстан',
    address: order.address,
    total_price: totalPrice,
    status: 'new',
  })

  if (orderError) return { error: orderError.message }

  const orderItems = order.items.map((item) => ({
    order_id: orderId,
    product_id: item.id,
    quantity: item.quantity,
    price_at_order: item.price,
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
  if (itemsError) return { error: itemsError.message }

  await notifyTelegram(order, totalPrice)

  return { error: null }
}