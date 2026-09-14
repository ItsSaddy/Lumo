'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { moveProduct } from './actions'

export default function ReorderButtons({
  id,
  isFirst,
  isLast,
}: {
  id: string
  isFirst: boolean
  isLast: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleMove(direction: 'up' | 'down') {
    startTransition(async () => {
      await moveProduct(id, direction)
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col">
      <button onClick={() => handleMove('up')} disabled={isFirst || isPending}
        className="text-stone transition-colors hover:text-brass disabled:opacity-20"
        aria-label="Переместить выше">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
          <path d="M6 15l6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button onClick={() => handleMove('down')} disabled={isLast || isPending}
        className="text-stone transition-colors hover:text-brass disabled:opacity-20"
        aria-label="Переместить ниже">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  )
}
