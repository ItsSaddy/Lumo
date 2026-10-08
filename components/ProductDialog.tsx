'use client'

import { useLayoutEffect, useRef, type ReactNode } from 'react'

// Окно «Подробнее» товара или набора: на телефоне — шторка снизу, на десктопе — по центру, фото слева.
// Управляется снаружи через open/onClose; Esc и клик по фону закрывают окно через onClose
export default function ProductDialog({ open, onClose, label, media, overlay, children }: {
  open: boolean
  onClose: () => void
  label: string
  // Фото/галерея слева и плашки поверх фото
  media: ReactNode
  overlay?: ReactNode
  children: ReactNode
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  // Layout-эффект: окно закрывается в том же кадре, что и клик, — ссылки внутри окна
  // («Что даёт каждый компонент») сразу прокручивают уже открытую страницу
  useLayoutEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      // showModal() фокусирует первую кнопку окна (выбор варианта или «В корзину») и прокручивает
      // шторку к ней — на телефоне окно открывалось уже внизу. Фокус на «Закрыть» держит его вверху
      closeRef.current?.focus()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  return (
    <dialog ref={dialogRef} aria-label={label} onClose={onClose}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      className="product-dialog m-0 mt-auto max-h-[92dvh] w-full max-w-none overflow-y-auto rounded-t-2xl bg-mist p-0 text-ink backdrop:bg-black/70 backdrop:backdrop-blur-sm sm:m-auto sm:max-w-3xl sm:rounded-2xl">
      <div className="relative sm:grid sm:grid-cols-2">
        <div className="group relative aspect-4/5 w-full overflow-hidden bg-paper sm:aspect-auto sm:min-h-112">
          <div className="h-full w-full sm:absolute sm:inset-0">{media}</div>
          {overlay}
        </div>
        <div className="flex flex-col p-6 sm:p-8">{children}</div>
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Закрыть"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-paper/80 text-ink backdrop-blur transition-colors hover:text-brass">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
            <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </dialog>
  )
}
