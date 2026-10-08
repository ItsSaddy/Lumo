'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createOrderQr, getOrderPaymentStatus } from '@/app/checkout/actions'
import type { KaspiQr } from '@/lib/kaspi'
import { formatPrice } from '@/lib/format'

const POLL_MS = 3000
// Дольше не опрашиваем: если оплата так и не пришла, заказ всё равно у менеджера
const POLL_LIMIT_MS = 20 * 60 * 1000

function formatCountdown(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000))
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

export default function KaspiPayment({ orderId, initialQr }: { orderId: string; initialQr: KaspiQr }) {
  const [qr, setQr] = useState(initialQr)
  const [paid, setPaid] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Статус оплаты ставит вебхук на сервере — здесь только спрашиваем его.
  // Опрос не останавливаем по истечении QR: оплата, начатая до конца окна, завершается позже
  useEffect(() => {
    if (paid) return
    const startedAt = Date.now()
    const timer = setInterval(async () => {
      if (Date.now() - startedAt > POLL_LIMIT_MS) {
        clearInterval(timer)
        return
      }
      if ((await getOrderPaymentStatus(orderId)) === 'paid') setPaid(true)
    }, POLL_MS)
    return () => clearInterval(timer)
  }, [orderId, paid])

  useEffect(() => {
    if (paid) return
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [paid])

  async function refreshQr() {
    setRefreshing(true)
    setError(null)
    const result = await createOrderQr(orderId)
    setRefreshing(false)
    if (!result) setError('Оплата по QR сейчас недоступна. Менеджер свяжется с вами.')
    else if ('paid' in result) setPaid(true)
    else if ('error' in result) setError(result.error)
    else {
      setQr(result.qr)
      setNow(Date.now())
    }
  }

  if (paid) {
    return (
      <main className="mx-auto max-w-md px-5 py-24 text-center sm:px-8">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-brass text-2xl text-paper">✓</span>
        <h1 className="mt-6 font-display text-3xl text-ink">Оплата получена</h1>
        <p className="mt-4 text-stone">
          Спасибо! Заказ оплачен — мы свяжемся с вами в течение часа, чтобы договориться о доставке.
        </p>
        <Link href="/" className="mt-8 inline-block rounded-full bg-brass px-8 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-paper">
          На главную
        </Link>
      </main>
    )
  }

  const remaining = new Date(qr.expiresAt).getTime() - now
  const expired = remaining <= 0

  return (
    <main className="mx-auto max-w-md px-5 py-16 text-center sm:px-8">
      <p className="text-sm uppercase tracking-widest text-stone">Заявка принята</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-ink">Оплатите через Kaspi</h1>
      <p className="mt-3 font-price text-2xl font-bold text-brass">{formatPrice(qr.amount)}</p>

      <div className="card-glow mt-8 rounded-lg bg-mist p-6">
        {expired ? (
          <div className="flex aspect-square w-full flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-stone/40 p-6">
            <p className="text-stone">Время QR-кода истекло</p>
            <button onClick={refreshQr} disabled={refreshing}
              className="rounded-full bg-brass px-6 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-paper disabled:opacity-50">
              {refreshing ? 'Создаю...' : 'Получить новый QR'}
            </button>
          </div>
        ) : (
          <>
            {qr.qrImageUrl && (
              // QR живёт минуты на сервере ApiPay — оптимизатор картинок Next тут не нужен
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qr.qrImageUrl} alt="QR-код для оплаты в Kaspi"
                className="mx-auto aspect-square w-full max-w-64 rounded-lg bg-white p-3" />
            )}
            <p className="mt-4 text-sm text-stone">
              Отсканируйте камерой в приложении Kaspi.kz · действует ещё <span className="font-price text-ink">{formatCountdown(remaining)}</span>
            </p>
            {/* С телефона сканировать нечем — ссылка открывает этот же счёт сразу в приложении Kaspi */}
            <a href={qr.qrTokenUrl} target="_blank" rel="noopener noreferrer"
              className="mt-5 flex items-center justify-center rounded-full bg-[#f14635] py-3.5 text-sm font-semibold uppercase tracking-[0.15em] text-white transition-transform hover:scale-[1.02]">
              Открыть Kaspi и оплатить
            </a>
          </>
        )}
        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      </div>

      <p className="mt-6 flex items-center justify-center gap-2 text-sm text-stone">
        <span className="h-2 w-2 animate-pulse rounded-full bg-brass" aria-hidden />
        Ждём подтверждения оплаты — страница обновится сама
      </p>
      <p className="mt-4 text-xs leading-relaxed text-stone/70">
        Не получается оплатить? Ничего страшного — заявка уже у нас, менеджер свяжется с вами в течение часа.
      </p>
    </main>
  )
}
