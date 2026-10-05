'use client'

import { useState } from 'react'
import type { BundleItem, Product } from '@/lib/types'
import { getProductVariants } from '@/lib/product-info'
import { getUnitPrice } from '@/lib/bundles'
import { formatPrice } from '@/lib/format'

export type BundleDraft = { items: BundleItem[]; badge: string }

export function bundleDraftFrom(product?: Product): BundleDraft {
  return { items: product?.bundle?.items ?? [], badge: product?.bundle?.badge ?? '' }
}

const FIELD = 'rounded border border-stone/30 bg-paper px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-brass'

// Конструктор набора: какие товары входят, сколько штук, что идёт в подарок.
// Внизу — сумма по отдельности и выгода, чтобы цену набора было легко подобрать
export default function BundleFields({
  products,
  value,
  onChange,
  price,
  onPriceChange,
}: {
  products: Product[]
  value: BundleDraft
  onChange: (value: BundleDraft) => void
  price: string
  onPriceChange: (price: string) => void
}) {
  const [discount, setDiscount] = useState('30')
  const byId = new Map(products.map((p) => [p.id, p]))

  function firstVariant(product: Product | undefined) {
    return product ? getProductVariants(product)?.options[0].key ?? null : null
  }

  function updateItem(index: number, patch: Partial<BundleItem>) {
    onChange({ ...value, items: value.items.map((item, i) => (i === index ? { ...item, ...patch } : item)) })
  }

  // Скрытые товары (старые дубли) не предлагаем, но оставляем уже выбранный, чтобы набор не «терял» позицию
  const options = (selectedId: string) => products.filter((p) => p.is_available || p.id === selectedId)

  function addItem() {
    const product = products.find((p) => p.is_available) ?? products[0]
    if (!product) return
    onChange({ ...value, items: [...value.items, { product_id: product.id, variant: firstVariant(product), quantity: 1, gift: false }] })
  }

  function removeItem(index: number) {
    onChange({ ...value, items: value.items.filter((_, i) => i !== index) })
  }

  const totals = value.items.reduce((acc, item) => {
    const product = byId.get(item.product_id)
    if (!product) return acc
    const sum = getUnitPrice(product, item.variant) * item.quantity
    return item.gift ? { ...acc, gifts: acc.gifts + sum } : { ...acc, regular: acc.regular + sum }
  }, { regular: 0, gifts: 0 })
  const priceValue = parseFloat(price) || 0
  const savings = totals.regular + totals.gifts - priceValue

  return (
    <div className="rounded-lg border border-brass/30 p-4">
      <p className="text-xs uppercase tracking-wide text-brass">Состав набора</p>

      <div className="mt-3 flex flex-col gap-2">
        {value.items.map((item, i) => {
          const product = byId.get(item.product_id)
          const variants = product ? getProductVariants(product) : null
          return (
            <div key={i} className="flex flex-wrap items-center gap-2 rounded bg-paper/60 p-2">
              <select value={item.product_id} aria-label="Товар"
                onChange={(e) => updateItem(i, { product_id: e.target.value, variant: firstVariant(byId.get(e.target.value)) })}
                className={`${FIELD} min-w-0 basis-full sm:flex-1 sm:basis-0`}>
                {!product && <option value={item.product_id}>Товар удалён — выберите другой</option>}
                {options(item.product_id).map((p) => (
                  <option key={p.id} value={p.id}>{p.name}{p.is_available ? '' : ' (скрыт)'}</option>
                ))}
              </select>
              {variants && (
                <select value={item.variant ?? ''} aria-label={variants.title}
                  onChange={(e) => updateItem(i, { variant: e.target.value })}
                  className={`${FIELD} min-w-0 basis-full sm:basis-auto`}>
                  {variants.options.map((v) => <option key={v.key} value={v.key}>{v.label}</option>)}
                </select>
              )}
              <input type="number" min={1} max={99} value={item.quantity} aria-label="Количество"
                onChange={(e) => updateItem(i, { quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                className={`${FIELD} w-16`} />
              <label className="flex items-center gap-1.5 text-xs text-stone">
                <input type="checkbox" checked={Boolean(item.gift)} onChange={(e) => updateItem(i, { gift: e.target.checked })} />
                Подарок
              </label>
              <button type="button" onClick={() => removeItem(i)} aria-label="Убрать из набора"
                className="ml-auto px-2 py-1 text-sm text-red-400">✕</button>
            </div>
          )
        })}
      </div>

      <button type="button" onClick={addItem} disabled={products.length === 0}
        className="mt-3 text-sm text-brass underline underline-offset-4 disabled:opacity-50">
        + Добавить продукт
      </button>

      {value.items.length > 0 && (
        <div className="mt-4 border-t border-stone/20 pt-4 text-sm text-stone">
          <p>
            По отдельности: <span className="text-ink">{formatPrice(totals.regular)}</span>
            {totals.gifts > 0 && <> · подарки: <span className="text-ink">{formatPrice(totals.gifts)}</span></>}
          </p>
          {priceValue > 0 && (
            <p className="mt-1">
              Выгода покупателя: <span className={savings > 0 ? 'text-brass' : 'text-red-400'}>{formatPrice(savings)}</span>
              {totals.regular > priceValue && ` (скидка ${Math.round((1 - priceValue / totals.regular) * 100)}%)`}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span>Скидка от суммы</span>
            <input type="number" min={0} max={99} value={discount} aria-label="Скидка, %"
              onChange={(e) => setDiscount(e.target.value)} className={`${FIELD} w-16`} />
            <span>%</span>
            <button type="button"
              onClick={() => onPriceChange(String(Math.round(totals.regular * (1 - (parseFloat(discount) || 0) / 100))))}
              className="rounded-full border border-brass/40 px-3 py-1.5 text-xs text-brass transition-colors hover:border-brass">
              Подставить в цену
            </button>
          </div>
        </div>
      )}

      <div className="mt-4">
        <label className="mb-1 block text-xs uppercase tracking-wide text-stone">Плашка на карточке</label>
        <input type="text" placeholder="Напр. «Хит продаж» — пусто, если не нужна" value={value.badge}
          onChange={(e) => onChange({ ...value, badge: e.target.value })}
          className={`${FIELD} w-full`} />
      </div>
    </div>
  )
}
