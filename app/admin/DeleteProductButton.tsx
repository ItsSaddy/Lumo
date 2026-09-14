'use client'

import { useState, useTransition } from 'react'
import { deleteProduct } from './actions'

export default function DeleteProductButton({ id }: { id: string }) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm('Удалить товар?')) return
    setError(null)
    startTransition(async () => {
      const result = await deleteProduct(id)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="text-right">
      <button onClick={handleClick} disabled={isPending}
        className="text-sm text-red-600 underline disabled:opacity-50">
        {isPending ? 'Удаляю...' : 'Удалить'}
      </button>
      {error && <p className="mt-1 max-w-52 text-xs text-red-400">{error}</p>}
    </div>
  )
}
