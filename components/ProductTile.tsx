import type { ReactNode } from 'react'

// Компактная карточка витрины: фото, название, цена. Вся карточка — кнопка, открывающая окно «Подробнее»
// (окно передаётся в dialog и рендерится вне кнопки — внутри button интерактивное содержимое недопустимо)
export default function ProductTile({ onOpen, media, overlay, title, caption, price, oldPrice, highlight, dialog }: {
  onOpen: () => void
  media: ReactNode
  overlay?: ReactNode
  title: string
  caption?: string | null
  price: string
  oldPrice?: string | null
  highlight?: boolean
  dialog: ReactNode
}) {
  return (
    <article className={`card-glow group flex flex-col overflow-hidden rounded-lg bg-mist transition-transform duration-300 hover:-translate-y-1 ${
      highlight ? 'ring-1 ring-brass/60' : ''
    }`}>
      <button type="button" onClick={onOpen} aria-haspopup="dialog"
        className="flex flex-1 flex-col text-left outline-offset-2 focus-visible:outline-2 focus-visible:outline-brass">
        <div className="relative aspect-4/5 w-full overflow-hidden bg-paper">
          {media}
          {overlay}
        </div>
        {/* Плитка на телефоне ~140px: Unbounded широкий, поэтому 12px; hyphens — страховка для слишком длинного слова */}
        <div className="flex flex-1 flex-col p-2.5 sm:p-4">
          <h3 className="text-balance break-words font-display text-xs leading-snug text-ink hyphens-auto sm:text-sm lg:text-base">{title}</h3>
          {caption && <p className="mt-1 text-[11px] leading-tight text-stone sm:text-xs">{caption}</p>}
          {/* Спейсер: цена прижата к низу, чтобы в ряду цены стояли на одной линии */}
          <div className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-3">
            <span className="whitespace-nowrap font-price text-base font-bold text-brass sm:text-lg">{price}</span>
            {oldPrice && <s className="whitespace-nowrap font-price text-xs font-bold text-stone/70 sm:text-sm">{oldPrice}</s>}
          </div>
        </div>
      </button>
      {dialog}
    </article>
  )
}
