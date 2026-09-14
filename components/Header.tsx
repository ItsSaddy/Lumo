'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '@/lib/cart-context'

export default function Header() {
  const pathname = usePathname()
  const { totalCount } = useCart()
  if (pathname.startsWith('/admin')) return null

  return (
    <header className="border-b border-mist/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-7 sm:px-8 sm:py-8 md:px-10">
        <Link href="/" className="metal-text font-display text-2xl font-bold tracking-[0.15em]">LUMO</Link>
        <Link href="/cart" className="flex items-center gap-2 text-ink">
          <span className="text-xs uppercase tracking-[0.2em] text-stone">Корзина</span>
          {totalCount > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brass px-1 text-xs font-medium text-paper">
              {totalCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  )
}