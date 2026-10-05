'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '@/lib/cart-context'

const NAV = [
  { href: '/#sets', label: 'Наборы' },
  { href: '/shop', label: 'Магазин' },
]

const LINK_CLASS = 'text-xs uppercase tracking-[0.2em] transition-colors hover:text-ink'

export default function Header() {
  const pathname = usePathname()
  const { totalCount } = useCart()
  if (pathname.startsWith('/admin')) return null

  return (
    <header className="sticky top-0 z-40 border-b border-mist/60 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8 sm:py-6 md:px-10">
        <Link href="/" className="metal-text font-display text-xl font-bold tracking-[0.15em] sm:text-2xl">LUMO</Link>
        <nav className="flex items-center gap-5 sm:gap-8">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href}
              className={`${LINK_CLASS} ${pathname === item.href ? 'text-brass' : 'text-stone'}`}>
              {item.label}
            </Link>
          ))}
          <Link href="/cart" aria-label="Корзина"
            className={`relative flex items-center gap-2 ${LINK_CLASS} ${pathname === '/cart' ? 'text-brass' : 'text-stone'}`}>
            {/* На телефоне вместо слова — иконка, чтобы навигация влезла в одну строку */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 sm:hidden" aria-hidden>
              <circle cx="9" cy="20" r="1.4" />
              <circle cx="17" cy="20" r="1.4" />
              <path d="M2 3h2l2.4 12.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L20 7H6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="hidden sm:inline">Корзина</span>
            {totalCount > 0 && (
              <span className="absolute -right-2.5 -top-2 inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-brass px-1 text-[10px] font-medium tracking-normal text-paper sm:static sm:h-5 sm:min-w-5 sm:text-xs">
                {totalCount}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  )
}
