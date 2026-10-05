'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '@/lib/cart-context'

const NAV = [
  { href: '/#sets', label: 'Наборы' },
  { href: '/shop', label: 'Магазин' },
]

// На телефоне чуть мельче — рядом с логотипом и подписью навигация должна влезть в 360px
const LINK_CLASS = 'text-[11px] uppercase tracking-[0.14em] transition-colors hover:text-ink sm:text-xs sm:tracking-[0.2em]'

export default function Header() {
  const pathname = usePathname()
  const { totalCount } = useCart()
  if (pathname.startsWith('/admin')) return null

  return (
    <header className="sticky top-0 z-40 border-b border-mist/60 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-4 sm:gap-4 sm:px-8 sm:py-5 md:px-10">
        {/* Подпись по ширине почти равна слову LUMO; отрицательный отступ справа убирает хвост letter-spacing, чтобы строки центрировались ровно */}
        <Link href="/" aria-label="LUMO — Premium Mushroom Extracts" className="flex min-w-0 flex-col items-center leading-none">
          <span className="logo-text mr-[-0.22em] font-display text-[1.75rem] font-bold tracking-[0.22em] sm:mr-[-0.3em] sm:text-4xl sm:tracking-[0.3em]">LUMO</span>
          <span aria-hidden className="mt-1.5 h-px w-full bg-linear-to-r from-transparent via-brass/60 to-transparent sm:mt-2" />
          <span className="mr-[-0.14em] mt-1 text-center text-[7px] font-semibold uppercase tracking-[0.14em] text-brass sm:mr-[-0.16em] sm:mt-1.5 sm:text-[9px] sm:tracking-[0.16em]">
            Premium Mushroom Extracts
          </span>
        </Link>
        <nav className="flex shrink-0 items-center gap-4 sm:gap-8">
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
