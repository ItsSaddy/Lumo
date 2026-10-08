'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { Product } from '@/lib/types'
import AddToCartButton from '@/components/AddToCartButton'
import ProductGallery from '@/components/ProductGallery'
import ProductDialog from '@/components/ProductDialog'
import ProductTile from '@/components/ProductTile'
import SmoothScrollLink from '@/components/SmoothScrollLink'
import { describeBundle, type BundleLine, type ResolvedBundle } from '@/lib/bundles'
import { getProductImages } from '@/lib/product-info'
import { formatPrice } from '@/lib/format'

const CHIP = 'whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest'
// На карточке фото маленькое — плашки компактнее
const TILE_CHIP = 'whitespace-nowrap rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-wider sm:text-[10px]'
const COLLAGE_COLS = ['', 'grid-cols-1', 'grid-cols-2', 'grid-cols-3']
const LINK = 'inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-brass transition-colors hover:text-ink'

// Пока у набора нет своего фото — собираем обложку из фото входящих продуктов
function BundleCollage({ lines, sizes }: { lines: BundleLine[]; sizes: string }) {
  const cells = lines.filter((line) => !line.gift && line.image).slice(0, 3)

  if (cells.length === 0) {
    return (
      <div className="hero-glow flex h-full w-full items-center justify-center">
        <span className="metal-text font-display text-2xl font-bold tracking-[0.3em]">LUMO</span>
      </div>
    )
  }

  return (
    <div className={`grid h-full w-full gap-px bg-paper ${COLLAGE_COLS[cells.length]}`}>
      {cells.map((line) => (
        <div key={line.key} className="relative overflow-hidden">
          <Image src={line.image!} alt="" fill sizes={sizes}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
          {line.quantity > 1 && (
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-paper/80 px-2 py-0.5 font-price text-sm font-bold text-ink backdrop-blur">
              ×{line.quantity}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

function GiftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5" aria-hidden>
      <path d="M20 12v9H4v-9M2 7h20v5H2zM12 21V7M12 7H7.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7Zm0 0h4.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7Z"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function BundleCard({ bundle, resolved }: { bundle: Product; resolved: ResolvedBundle }) {
  const images = getProductImages(bundle)
  const badge = bundle.bundle?.badge
  const { lines, regularTotal, savings, discountPercent } = resolved
  const [detailsOpen, setDetailsOpen] = useState(false)
  const oldPrice = regularTotal > bundle.price ? formatPrice(regularTotal) : null

  // Снимки наборов вертикальные, продукты чуть ниже центра — сдвигаем кадр, чтобы они влезли целиком
  const cover = images.length > 0
    ? <Image src={images[0]} alt={bundle.name} fill sizes="(min-width: 1024px) 360px, (min-width: 768px) 33vw, 50vw"
        className="object-cover object-[center_56%] transition-transform duration-700 ease-out group-hover:scale-105" />
    : <BundleCollage lines={lines} sizes="(min-width: 1024px) 240px, 50vw" />

  return (
    <ProductTile
      onOpen={() => setDetailsOpen(true)}
      highlight={Boolean(badge)}
      media={cover}
      overlay={
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-1 p-2 sm:p-3">
          {discountPercent > 0 ? <span className={`${TILE_CHIP} bg-brass text-paper`}>−{discountPercent}%</span> : <span />}
          {badge && <span className={`${TILE_CHIP} bg-plum text-ink shadow-lg shadow-black/30`}>{badge}</span>}
        </div>
      }
      title={bundle.name}
      caption={bundle.spec}
      price={formatPrice(bundle.price)}
      oldPrice={oldPrice}
      dialog={
        <ProductDialog open={detailsOpen} onClose={() => setDetailsOpen(false)} label={bundle.name}
          media={images.length > 0
            ? <ProductGallery images={images} alt={bundle.name} sizes="(min-width: 640px) 384px, 100vw" imageClassName="object-[center_56%]" />
            : <BundleCollage lines={lines} sizes="(min-width: 640px) 200px, 50vw" />}>
          <div className="flex flex-wrap gap-1.5 pr-10">
            {bundle.spec && <span className={`${CHIP} bg-paper/60 text-ink`}>{bundle.spec}</span>}
            {discountPercent > 0 && <span className={`${CHIP} bg-brass font-bold text-paper`}>−{discountPercent}%</span>}
            {badge && <span className={`${CHIP} bg-plum text-ink`}>{badge}</span>}
          </div>
          <h2 className="mt-3 text-balance font-display text-3xl leading-tight text-ink">{bundle.name}</h2>
          {bundle.description && <p className="mt-3 text-sm leading-relaxed text-stone">{bundle.description}</p>}

          <p className="mt-5 text-[11px] uppercase tracking-widest text-stone">Состав набора</p>
          <ul className="mt-2 flex flex-col gap-2">
            {lines.map((line) => (
              <li key={line.key}
                className={`flex items-center gap-3 rounded-lg p-2 pr-3 ${line.gift ? 'bg-brass/10 ring-1 ring-brass/30' : 'bg-paper/50'}`}>
                <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md bg-paper">
                  {line.image && <Image src={line.image} alt="" fill sizes="44px" className="object-cover" />}
                </span>
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block text-sm font-medium text-ink">{line.name}</span>
                  {line.form && <span className="mt-0.5 block text-xs text-stone">{line.form}</span>}
                </span>
                {line.gift ? (
                  <span className="flex shrink-0 items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-brass">
                    <GiftIcon />
                    {line.quantity > 1 ? `×${line.quantity} в подарок` : 'Подарок'}
                  </span>
                ) : (
                  <span className="shrink-0 font-price text-sm font-bold text-ink">×{line.quantity}</span>
                )}
              </li>
            ))}
          </ul>

          {/* Окно закрываем до прокрутки — иначе оно останется поверх нужного блока */}
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            <SmoothScrollLink href="#benefits" onClick={() => setDetailsOpen(false)} className={LINK}>Что даёт каждый компонент</SmoothScrollLink>
            <SmoothScrollLink href="#faq" onClick={() => setDetailsOpen(false)} className={LINK}>Как принимать</SmoothScrollLink>
          </div>

          <div className="mt-auto pt-6">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <p className="font-price text-2xl font-bold text-brass">{formatPrice(bundle.price)}</p>
              {oldPrice && <s className="font-price text-base font-bold text-stone/70">{oldPrice}</s>}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {savings > 0 && (
                <span className="rounded bg-brass/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-brass">
                  Выгода {formatPrice(savings)}
                </span>
              )}
              <span className="rounded bg-[#e31e24] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                Kaspi Рассрочка
              </span>
            </div>
            <AddToCartButton product={{
              id: bundle.id,
              productId: bundle.id,
              name: bundle.spec ? `${bundle.name} · ${bundle.spec}` : bundle.name,
              price: bundle.price,
              image_url: images[0] ?? lines[0]?.image ?? null,
              details: describeBundle(lines),
            }} />
          </div>
        </ProductDialog>
      }
    />
  )
}
