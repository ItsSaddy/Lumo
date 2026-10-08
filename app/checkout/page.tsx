'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart-context'
import { formatPrice } from '@/lib/format'
import { KASPI_PAY_LINK } from '@/lib/contacts'
import type { KaspiQr } from '@/lib/kaspi'
import KaspiPayment from '@/components/KaspiPayment'
import { createOrderQr, submitOrder } from './actions'

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [qr, setQr] = useState<{ orderId: string; qr: KaspiQr } | null>(null)
  const [orderTotal, setOrderTotal] = useState(0)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await submitOrder({
      customerName: name,
      phone,
      address,
      items: items.map((item) => ({
        id: item.productId ?? item.id,
        name: item.name,
        details: item.details,
        price: item.price,
        quantity: item.quantity,
      })),
    })

    if (result.error || !result.orderId) {
      setError(result.error ?? 'Не получилось оформить заказ')
      setLoading(false)
      return
    }

    // Заказ уже в базе. Если оплата по QR настроена — сразу показываем QR; если нет или Kaspi
    // не ответил — обычное «Заявка отправлена», менеджер свяжется сам
    const payment = await createOrderQr(result.orderId)
    if (payment && 'qr' in payment) setQr({ orderId: result.orderId, qr: payment.qr })

    // Сумму запоминаем до очистки корзины — её покажем на экране оплаты по ссылке Kaspi
    setOrderTotal(totalPrice)
    clearCart()
    setSubmitted(true)
    setLoading(false)
  }

  if (submitted && qr) return <KaspiPayment orderId={qr.orderId} initialQr={qr.qr} />

  if (submitted) {
    return (
      <main className="mx-auto max-w-md px-5 py-24 text-center sm:px-8">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-brass text-2xl text-paper">✓</span>
        <h1 className="mt-6 font-display text-3xl text-ink">Заявка отправлена</h1>
        <p className="mt-4 text-stone">
          Мы свяжемся с тобой по указанному номеру в течение часа, чтобы подтвердить заказ и договориться о доставке.
        </p>

        {/* Оплата по ссылке Kaspi Pay: сумму покупатель вводит сам, поступление менеджер сверяет в приложении Kaspi Pay */}
        {KASPI_PAY_LINK && orderTotal > 0 && (
          <div className="card-glow mt-8 rounded-lg bg-mist p-6">
            <p className="text-sm text-stone">Можно оплатить сразу — к оплате</p>
            <p className="mt-1 font-price text-2xl font-bold text-brass">{formatPrice(orderTotal)}</p>
            <a href={KASPI_PAY_LINK} target="_blank" rel="noopener noreferrer"
              className="mt-5 flex items-center justify-center rounded-full bg-[#f14635] py-3.5 text-sm font-semibold uppercase tracking-[0.15em] text-white transition-transform hover:scale-[1.02]">
              Оплатить в Kaspi
            </a>
            <p className="mt-3 text-xs leading-relaxed text-stone">
              Введите сумму {formatPrice(orderTotal)} на странице Kaspi. Менеджер проверит оплату и подтвердит заказ.
            </p>
          </div>
        )}

        <button onClick={() => router.push('/')}
          className="mt-8 rounded-full bg-brass px-8 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-paper">
          В каталог
        </button>
      </main>
    )
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-md px-5 py-24 text-center sm:px-8">
        <h1 className="font-display text-3xl text-ink">Корзина пуста</h1>
        <button onClick={() => router.push('/')} className="mt-6 text-brass underline">
          Вернуться в каталог
        </button>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-lg px-5 py-16 sm:px-8">
      <p className="text-sm uppercase tracking-widest text-stone">Последний шаг</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-ink">Оставить заявку</h1>
      <p className="mt-2 text-sm text-stone">
        Оплата и доставка обсуждаются отдельно — просто оставь контакты, мы свяжемся сами.
      </p>

      <div className="card-glow mt-8 rounded-lg bg-mist p-6">
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-start gap-3 text-sm">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-paper">
                {item.image_url && (
                  <Image src={item.image_url} alt={item.name} fill sizes="48px" className="object-cover" />
                )}
              </div>
              <span className="min-w-0 flex-1 text-stone">
                {item.name} × {item.quantity}
                {item.details && <span className="mt-0.5 block text-xs text-stone/70">{item.details}</span>}
              </span>
              <span className="shrink-0 whitespace-nowrap text-ink">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-paper/60 pt-4 text-lg">
          <span className="font-display text-ink">Итого</span>
          <span className="font-price font-bold text-brass">{formatPrice(totalPrice)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-stone">Имя</label>
          <input type="text" placeholder="Как обращаться к вам" value={name}
            onChange={(e) => setName(e.target.value)} required
            className="w-full rounded border border-stone/30 px-4 py-2.5 text-ink outline-none transition-colors focus:border-brass" />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-stone">Телефон</label>
          <input type="tel" placeholder="+7 ___ ___ __ __" value={phone}
            onChange={(e) => setPhone(e.target.value)} required
            className="w-full rounded border border-stone/30 px-4 py-2.5 text-ink outline-none transition-colors focus:border-brass" />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-stone">Адрес доставки</label>
          <input type="text" placeholder="Город в Казахстане, улица, дом, квартира" value={address}
            onChange={(e) => setAddress(e.target.value)} required
            className="w-full rounded border border-stone/30 px-4 py-2.5 text-ink outline-none transition-colors focus:border-brass" />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button type="submit" disabled={loading}
          className="mt-2 rounded-full bg-brass py-3.5 text-sm font-semibold uppercase tracking-[0.2em] text-paper transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100">
          {loading ? 'Отправляю...' : 'Оставить заявку'}
        </button>
        <p className="text-center text-xs text-stone">Без предоплаты · Ответим в течение часа · Рассрочка Kaspi</p>
        <p className="text-center text-xs leading-relaxed text-stone/70">
          Нажимая «Оставить заявку», вы даёте{' '}
          <Link href="/consent" className="underline underline-offset-2 hover:text-ink">согласие на обработку персональных данных</Link>{' '}
          в соответствии с <Link href="/privacy" className="underline underline-offset-2 hover:text-ink">Политикой конфиденциальности</Link>.
        </p>
      </form>
    </main>
  )
}
