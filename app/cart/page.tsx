'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/lib/cart-context'
import { formatPrice } from '@/lib/format'

export default function CartPage() {
  const { items, removeItem, setQuantity, totalPrice } = useCart()

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-24 text-center sm:px-8">
        <h1 className="font-display text-3xl text-ink">Корзина пуста</h1>
        <p className="mt-3 text-stone">Загляни в каталог — там ждут наборы, экстракты, капсулы и паучи LUMO.</p>
        <Link href="/"
          className="mt-8 inline-block rounded-full bg-brass px-8 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-paper">
          В каталог
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-2xl px-5 py-16 sm:px-8">
      <p className="text-sm uppercase tracking-widest text-stone">Оформление</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-ink">Корзина</h1>

      <div className="mt-8 flex flex-col gap-4">
        {items.map((item) => (
          <div key={item.id} className="card-glow flex items-start gap-3 rounded-lg bg-mist p-4 sm:items-center sm:gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-paper sm:h-20 sm:w-20">
              {item.image_url && (
                <Image src={item.image_url} alt={item.name} fill sizes="80px" className="object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-ink">{item.name}</p>
              {item.details && <p className="mt-1 text-xs leading-relaxed text-stone">{item.details}</p>}
              <p className="font-price mt-1 text-sm font-bold text-brass">{formatPrice(item.price)}</p>
              <div className="mt-3 flex items-center gap-3">
                <button onClick={() => setQuantity(item.id, item.quantity - 1)} aria-label="Меньше"
                  className="h-8 w-8 rounded border border-stone/30 text-ink transition-colors hover:border-brass hover:text-brass">−</button>
                <span className="w-5 text-center text-ink">{item.quantity}</span>
                <button onClick={() => setQuantity(item.id, item.quantity + 1)} aria-label="Больше"
                  className="h-8 w-8 rounded border border-stone/30 text-ink transition-colors hover:border-brass hover:text-brass">+</button>
              </div>
            </div>
            <button onClick={() => removeItem(item.id)} className="shrink-0 self-start text-xs text-stone underline hover:text-red-400 sm:text-sm">
              Удалить
            </button>
          </div>
        ))}
      </div>

      <div className="card-glow mt-8 rounded-lg bg-mist p-6">
        <div className="flex items-center justify-between">
          <p className="font-display text-xl text-ink">Итого</p>
          <p className="font-price text-xl font-bold text-brass">{formatPrice(totalPrice)}</p>
        </div>
      </div>

      <Link href="/checkout"
        className="mt-6 block w-full rounded-full bg-brass py-3.5 text-center text-sm font-semibold uppercase tracking-[0.2em] text-paper transition-transform hover:scale-[1.02]">
        Оставить заявку
      </Link>
      <p className="mt-4 text-center text-xs text-stone">
        Без предоплаты — оплата и доставка обсуждаются с менеджером после подтверждения заявки
      </p>
    </main>
  )
}
