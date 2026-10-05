'use client'

import { useRef, useState, useTransition, ViewTransition } from 'react'
import type { Product } from '@/lib/types'
import AddToCartButton from '@/components/AddToCartButton'
import ProductGallery from '@/components/ProductGallery'
import { getProductBenefits, getProductImages, getProductVariants } from '@/lib/product-info'
import { formatPrice } from '@/lib/format'
import { whatsappLink } from '@/lib/contacts'

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
      {/* На телефоне — одна строка с прокруткой: перенос внутри «пилюли» ломает форму */}
      <div className="-mx-5 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max min-w-full gap-1 rounded-full bg-mist p-1.5">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => selectCategory(cat)}
              className={`shrink-0 grow rounded-full px-2.5 py-2.5 text-[11px] font-semibold uppercase tracking-wide transition-colors sm:basis-0 sm:px-4 sm:py-3.5 sm:text-sm sm:tracking-widest ${
                active === cat ? 'bg-brass text-paper' : 'text-stone hover:text-ink'
              }`}>
              {cat}
            </button>
          ))}
        </div>
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

      <div className="mt-10 flex items-baseline justify-between sm:mt-12">
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

const BADGE_CLASS = 'rounded-full border border-paper bg-paper/60 px-2.5 py-1 text-[11px] uppercase tracking-wide text-stone'

function ProductCard({ product }: { product: Product }) {
  const info = product.category ? CATEGORY_INFO[product.category] : undefined
  const benefits = getProductBenefits(product) ?? info?.benefits
  const variants = getProductVariants(product)
  const [variantKey, setVariantKey] = useState(variants?.options[0].key)
  const variant = variants?.options.find((v) => v.key === variantKey)
  const price = variant?.price ?? product.price
  // У вкусов паучей свои фото — при выборе вкуса меняется и картинка
  const images = variant?.image ? [variant.image] : getProductImages(product)
  const comingSoon = variant?.comingSoon ?? false
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  // showModal() фокусирует первую кнопку окна (выбор варианта или «В корзину») и прокручивает
  // шторку к ней — на телефоне окно открывалось уже внизу. Фокус на «Закрыть» держит его вверху
  function openDialog() {
    dialogRef.current?.showModal()
    closeRef.current?.focus()
  }

  const badges = (
    <div className="flex flex-wrap gap-1.5">
      {product.spec && <span className={BADGE_CLASS}>{product.spec}</span>}
      {info?.badges.map((badge) => <span key={badge} className={BADGE_CLASS}>{badge}</span>)}
    </div>
  )

  const benefitList = benefits && (
    <ul className="flex flex-col gap-1.5">
      {benefits.map((benefit) => (
        <li key={benefit} className="flex items-center gap-2 text-xs text-stone">
          <span className="h-1 w-1 shrink-0 rounded-full bg-brass" />
          {benefit}
        </li>
      ))}
    </ul>
  )

  // Пока есть только две фасовки — переключатель-«пилюля», вкусов больше — сетка 2×2
  const isGrid = (variants?.options.length ?? 0) > 2

  // Выбор варианта, цена и кнопка — общие для карточки и окна «Подробнее», вариант синхронен
  const purchase = (
    <>
      {variants && (
        <div className="mb-4">
          {isGrid && (
            <p className="mb-2 text-[11px] uppercase tracking-widest text-stone">
              {variants.title}: <span className="text-ink">{variant?.label}</span>
              {comingSoon && <span className="text-brass"> · скоро в наличии</span>}
            </p>
          )}
          <div className={`grid grid-cols-2 gap-1 bg-paper/60 p-1 ${isGrid ? 'rounded-2xl' : 'rounded-full'}`}>
            {variants.options.map((v) => (
              <button key={v.key} type="button" onClick={() => setVariantKey(v.key)}
                aria-pressed={v.key === variantKey}
                className={`flex items-center justify-center gap-1.5 rounded-full px-2.5 py-2 text-xs font-semibold transition-colors ${
                  isGrid ? '' : 'uppercase tracking-wide'
                } ${v.key === variantKey ? 'bg-brass text-paper' : 'text-stone hover:text-ink'}`}>
                {v.color && <span className="h-2 w-2 shrink-0 rounded-full ring-1 ring-paper/40" style={{ backgroundColor: v.color }} />}
                {v.label}
                {/* Значок вместо слова «скоро» — иначе «Лесные ягоды» не влезают в чип на телефоне */}
                {v.comingSoon && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-label="скоро в наличии"
                    className={`h-3 w-3 shrink-0 ${v.key === variantKey ? 'text-paper/70' : 'text-stone/60'}`}>
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-price text-xl font-bold text-brass">{formatPrice(price)}</p>
        <span className="rounded bg-[#e31e24] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
          Kaspi Рассрочка
        </span>
      </div>
      {comingSoon && variant ? (
        <>
          <p className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-stone/30 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-stone">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden>
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Скоро в наличии
          </p>
          <a href={whatsappLink(`Здравствуйте! Сообщите, пожалуйста, когда появятся паучи LUMO со вкусом «${variant.label}».`)}
            target="_blank" rel="noopener noreferrer"
            className="mt-2.5 block text-center text-xs text-brass underline-offset-4 hover:underline">
            Сообщить о поступлении в WhatsApp
          </a>
        </>
      ) : (
        <AddToCartButton product={{
          id: variant ? `${product.id}:${variant.key}` : product.id,
          productId: product.id,
          name: variant ? `${product.name} · ${variant.label}` : product.name,
          price,
          image_url: variant?.image ?? product.image_url,
        }} />
      )}
    </>
  )

  const comingSoonBadge = comingSoon && (
    <span className="pointer-events-none absolute left-3 top-3 z-10 rounded-full bg-paper/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-ink backdrop-blur">
      Скоро в наличии
    </span>
  )

  return (
    <article className="card-glow group flex flex-col overflow-hidden rounded-lg bg-mist transition-transform duration-300 hover:-translate-y-1">
      <div className="relative aspect-4/5 w-full overflow-hidden bg-paper">
        <ProductGallery key={images.join()} images={images} alt={product.name} sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw" />
        {comingSoonBadge}
      </div>
      <div className="flex flex-1 flex-col p-6">
        {badges}
        <h2 className="mt-3 font-display text-2xl text-ink">{product.name}</h2>
        {product.description && (
          <>
            <p className="mt-2 text-sm leading-relaxed text-stone line-clamp-2">{product.description}</p>
            <button type="button" onClick={openDialog}
              className="mt-1.5 inline-flex items-center gap-1 self-start text-xs font-semibold uppercase tracking-widest text-brass transition-colors hover:text-ink">
              Подробнее
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5">
                <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </>
        )}
        {benefitList && <div className="mt-4">{benefitList}</div>}
        {/* Спейсер: прижимает цену и кнопку к низу, чтобы карточки в ряду были одной высоты */}
        <div className="mt-auto pt-6">{purchase}</div>
      </div>

      {product.description && (
        <dialog ref={dialogRef} aria-label={product.name}
          onClick={(e) => { if (e.target === e.currentTarget) e.currentTarget.close() }}
          className="product-dialog m-0 mt-auto max-h-[92dvh] w-full max-w-none overflow-y-auto rounded-t-2xl bg-mist p-0 text-ink backdrop:bg-black/70 backdrop:backdrop-blur-sm sm:m-auto sm:max-w-3xl sm:rounded-2xl">
          <div className="relative sm:grid sm:grid-cols-2">
            <div className="group relative aspect-4/5 w-full overflow-hidden bg-paper sm:aspect-auto sm:min-h-112">
              <div className="h-full w-full sm:absolute sm:inset-0">
                <ProductGallery key={images.join()} images={images} alt={product.name} sizes="(min-width: 640px) 384px, 100vw" />
              </div>
              {comingSoonBadge}
            </div>
            <div className="flex flex-col p-6 sm:p-8">
              {badges}
              <h2 className="mt-3 pr-8 font-display text-3xl text-ink">{product.name}</h2>
              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-stone">{product.description}</p>
              {benefitList && <div className="mt-5 border-t border-paper/60 pt-5">{benefitList}</div>}
              <div className="mt-auto pt-6">{purchase}</div>
            </div>
            <button ref={closeRef} type="button" onClick={() => dialogRef.current?.close()} aria-label="Закрыть"
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-paper/80 text-ink backdrop-blur transition-colors hover:text-brass">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
                <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </dialog>
      )}
    </article>
  )
}
