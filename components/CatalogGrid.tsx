'use client'

import { useState, useTransition, ViewTransition } from 'react'
import type { Product } from '@/lib/types'
import AddToCartButton from '@/components/AddToCartButton'
import { getProductBenefits, getProductVariants } from '@/lib/product-info'

const CATEGORIES = ['Все', 'Экстракты', 'Капсулы', 'Подушечки']
const POUCH_CATEGORY = 'Подушечки'

const CATEGORY_INFO: Record<string, { benefits: string[]; badges: string[] }> = {
  'Экстракты': {
    benefits: ['Улучшает сон', 'Укрепляет память и фокус', 'Снимает стресс и тревожность'],
    badges: ['100% натурально', 'Стандарт США'],
  },
  'Капсулы': {
    benefits: ['Укрепляет нервную систему', 'Ускоряет усвоение информации', 'Для ежедневного приёма'],
    badges: ['100% органика', 'Стандарт США'],
  },
  [POUCH_CATEGORY]: {
    benefits: ['Фокус без сонливости', 'Заряд энергии за 5 минут', 'Помогает бросить курить'],
    badges: ['0% никотина', 'Халяль'],
  },
}

function pluralizeProducts(count: number) {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod100 >= 11 && mod100 <= 14) return 'товаров'
  if (mod10 === 1) return 'товар'
  if (mod10 >= 2 && mod10 <= 4) return 'товара'
  return 'товаров'
}

export default function CatalogGrid({ products }: { products: Product[] }) {
  const [active, setActive] = useState('Все')
  const [, startTransition] = useTransition()
  const filtered = active === 'Все' ? products : products.filter((p) => p.category === active)

  function selectCategory(cat: string) {
    startTransition(() => setActive(cat))
  }

  return (
    <div id="catalog">
      <div className="flex flex-wrap gap-1.5 rounded-full bg-mist p-1.5 sm:flex-nowrap">
        {CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => selectCategory(cat)}
            className={`flex-1 rounded-full px-4 py-3.5 text-sm font-semibold uppercase tracking-widest transition-colors ${
              active === cat ? 'bg-brass text-paper' : 'text-stone hover:text-ink'
            }`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Раздел акций временно скрыт
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg bg-mist p-6 sm:p-8">
          <span className="inline-block rounded-full bg-brass px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-paper">
            Экстракты и капсулы
          </span>
          <h3 className="mt-4 font-display text-xl font-bold text-ink sm:text-2xl">Скидка 50% на второй товар</h3>
          <p className="mt-2 max-w-sm text-sm text-stone">
            Действует автоматически на 2 любых экстракта или капсулы в корзине — скидка применяется к тому, что дешевле.
          </p>
        </div>
        <div className="rounded-lg bg-mist p-6 sm:p-8">
          <span className="inline-block rounded-full bg-plum px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-ink">
            Подушечки
          </span>
          <h3 className="mt-4 font-display text-xl font-bold text-ink sm:text-2xl">От 3 шт — по 10 000 ₸</h3>
          <p className="mt-2 max-w-sm text-sm text-stone">
            Возьми от трёх шайб (можно разные вкусы) — цена автоматически пересчитается при оформлении.
          </p>
        </div>
      </div>
      */}

      <div className="mt-12 flex items-baseline justify-between">
        <p className="text-sm uppercase tracking-widest text-stone">Каталог</p>
        <p className="text-sm text-stone">{filtered.length} {pluralizeProducts(filtered.length)}</p>
      </div>

      <ViewTransition key={active} name="catalog-grid" share="auto" enter="auto" default="none">
        <div>
          {filtered.length === 0 && (
            <p className="mt-8 text-stone">В этой категории пока нет товаров.</p>
          )}

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </ViewTransition>
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  const info = product.category ? CATEGORY_INFO[product.category] : undefined
  const benefits = getProductBenefits(product) ?? info?.benefits
  const variants = getProductVariants(product)
  const [variantKey, setVariantKey] = useState(variants?.[0].key)
  const variant = variants?.find((v) => v.key === variantKey)
  const price = variant?.price ?? product.price

  return (
    <article className="card-glow group overflow-hidden rounded-lg bg-mist transition-transform duration-300 hover:-translate-y-1">
      <div className="relative aspect-4/5 w-full overflow-hidden bg-paper">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image_url} alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-stone">нет фото</div>
        )}
      </div>
      <div className="p-6">
        <div className="flex flex-wrap gap-1.5">
          {product.spec && (
            <span className="rounded-full border border-paper bg-paper/60 px-2.5 py-1 text-[11px] uppercase tracking-wide text-stone">
              {product.spec}
            </span>
          )}
          {info?.badges.map((badge) => (
            <span key={badge} className="rounded-full border border-paper bg-paper/60 px-2.5 py-1 text-[11px] uppercase tracking-wide text-stone">
              {badge}
            </span>
          ))}
        </div>
        <h2 className="mt-3 font-display text-2xl text-ink">{product.name}</h2>
        {product.description && (
          <p className="mt-2 text-sm leading-relaxed text-stone line-clamp-2">{product.description}</p>
        )}
        {benefits && (
          <ul className="mt-4 flex flex-col gap-1.5">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-2 text-xs text-stone">
                <span className="h-1 w-1 shrink-0 rounded-full bg-brass" />
                {benefit}
              </li>
            ))}
          </ul>
        )}
        {variants && (
          <div className="mt-5 grid grid-cols-2 gap-1.5 rounded-full bg-paper/60 p-1">
            {variants.map((v) => (
              <button key={v.key} type="button" onClick={() => setVariantKey(v.key)}
                aria-pressed={v.key === variantKey}
                className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
                  v.key === variantKey ? 'bg-brass text-paper' : 'text-stone hover:text-ink'
                }`}>
                {v.label}
              </button>
            ))}
          </div>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <p className="font-price text-xl font-bold text-brass">{price} ₸</p>
          <span className="rounded bg-[#e31e24] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
            Kaspi Рассрочка
          </span>
        </div>
        <AddToCartButton product={{
          id: variant ? `${product.id}:${variant.key}` : product.id,
          productId: product.id,
          name: variant ? `${product.name} · ${variant.label}` : product.name,
          price,
          image_url: product.image_url,
        }} />
      </div>
    </article>
  )
}
