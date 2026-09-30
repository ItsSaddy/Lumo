'use client'

import { useState } from 'react'
import { useCart } from '@/lib/cart-context'

export default function AddToCartButton({
  product,
}: {
  product: { id: string; productId?: string; name: string; price: number; image_url: string | null }
}) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  function handleClick() {
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <button
      onClick={handleClick}
      className={`mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-brass py-3 text-xs font-semibold uppercase tracking-[0.15em] text-paper transition-all duration-300 ${
        added ? 'scale-[1.02]' : 'hover:scale-[1.02] hover:shadow-lg hover:shadow-brass/25 active:scale-[0.98]'
      }`}
    >
      {added ? (
        <>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-4 w-4">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Добавлено
        </>
      ) : (
        <>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <circle cx="9" cy="20" r="1.4" />
            <circle cx="17" cy="20" r="1.4" />
            <path d="M2 3h2l2.4 12.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L20 7H6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          В корзину
        </>
      )}
    </button>
  )
}
