'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { randomUUID } from 'crypto'
import { calculateOrderTotals } from '@/lib/discount'
import { formatPrice } from '@/lib/format'
import { getProductVariants } from '@/lib/product-info'
import { sendTelegram } from '@/lib/telegram'
import { createKaspiQr, isKaspiConfigured, type KaspiQr } from '@/lib/kaspi'
import type { Product } from '@/lib/types'

type OrderInput = {
  customerName: string
  phone: string
  address: string
  // details — состав набора, чтобы менеджер видел, что собирать
  items: { id: string; name: string; details?: string; price: number; quantity: number }[]
}

// Сколько раз можно перевыпустить QR для одного заказа: каждый QR — отдельный счёт в тарифе ApiPay
const MAX_QR_PER_ORDER = 5
// QR выдаём только для свежих заказов — старые менеджер закрывает вручную
const QR_ORDER_MAX_AGE_MS = 24 * 60 * 60 * 1000

async function notifyTelegram(order: OrderInput, totalPrice: number) {
  const itemsList = order.items
    .map((item) => `— ${item.name} × ${item.quantity} — ${formatPrice(item.price * item.quantity)}${item.details ? `\n   ${item.details}` : ''}`)
    .join('\n')

  const text = `🔔 Новая заявка на Lumo

Имя: ${order.customerName}
Телефон: ${order.phone}
Адрес: ${order.address}

${itemsList}

Итого (со скидкой): ${formatPrice(totalPrice)}`

  // Заказ уже в базе — если уведомление не дошло, менеджер увидит его в админке
  await sendTelegram(text)
}

// Цены приходят из корзины в браузере — сверяем их с базой (и с ценами фасовок), иначе
// подделанная корзина дала бы оплаченный по QR заказ на копеечную сумму
async function pricesMatchCatalog(items: OrderInput['items']) {
  if (items.length === 0) return false
  if (items.some((item) => !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99)) return false

  const supabase = await createClient()
  const { data } = await supabase.from('products').select('*').in('id', [...new Set(items.map((item) => item.id))])
  const productsById = new Map(((data ?? []) as Product[]).map((p) => [p.id, p]))

  return items.every((item) => {
    const product = productsById.get(item.id)
    if (!product) return false
    const variantPrices = getProductVariants(product)?.options.map((v) => v.price ?? product.price) ?? []
    return [product.price, ...variantPrices].some((price) => Number(price) === item.price)
  })
}

export async function submitOrder(order: OrderInput) {
  if (!(await pricesMatchCatalog(order.items))) {
    return { error: 'Цена некоторых товаров изменилась. Удалите их из корзины и добавьте заново.', orderId: null }
  }

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

  if (orderError) return { error: orderError.message, orderId: null }

  const orderItems = order.items.map((item) => ({
    order_id: orderId,
    product_id: item.id,
    quantity: item.quantity,
    price_at_order: item.price,
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
  if (itemsError) return { error: itemsError.message, orderId: null }

  await notifyTelegram(order, totalPrice)

  return { error: null, orderId }
}

// QR Kaspi на сумму заказа из базы (не из браузера). null — оплата по QR не настроена
// или не удалась: тогда покупатель просто ждёт звонка менеджера, как раньше
export async function createOrderQr(orderId: string): Promise<{ qr: KaspiQr } | { paid: true } | { error: string } | null> {
  const admin = createAdminClient()
  if (!admin || !isKaspiConfigured()) return null

  const { data: order } = await admin
    .from('orders')
    .select('id, total_price, created_at, payment_status, payment_attempts')
    .eq('id', orderId)
    .maybeSingle()
  if (!order) return null
  if (order.payment_status === 'paid') return { paid: true }
  if (Date.now() - new Date(order.created_at).getTime() > QR_ORDER_MAX_AGE_MS) return null
  if (order.payment_attempts >= MAX_QR_PER_ORDER) {
    return { error: 'Слишком много попыток. Менеджер свяжется с вами и поможет с оплатой.' }
  }

  await admin.from('orders').update({ payment_attempts: order.payment_attempts + 1 }).eq('id', orderId)

  const qr = await createKaspiQr({ orderId, amount: Number(order.total_price) })
  return qr ? { qr } : { error: 'Не получилось создать QR. Попробуйте ещё раз через минуту.' }
}

// Опрашивается со страницы оплаты; статус в базе ставит вебхук ApiPay (app/api/kaspi/webhook)
export async function getOrderPaymentStatus(orderId: string) {
  const admin = createAdminClient()
  if (!admin) return 'unpaid'
  const { data } = await admin.from('orders').select('payment_status').eq('id', orderId).maybeSingle()
  return data?.payment_status === 'paid' ? 'paid' : 'unpaid'
}
