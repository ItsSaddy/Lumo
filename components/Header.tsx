'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '@/lib/cart-context'
import SmoothScrollLink from '@/components/SmoothScrollLink'

const NAV = [
  { href: '/#sets', label: 'Наборы' },
  { href: '/shop', label: 'Магазин' },
]

// На телефоне чуть мельче — рядом с логотипом навигация должна влезть в одну строку
const LINK_CLASS = 'text-[11px] uppercase tracking-[0.14em] transition-colors hover:text-ink sm:text-xs sm:tracking-[0.2em]'

export default function Header() {
  const pathname = usePathname()
  const { totalCount } = useCart()
  if (pathname.startsWith('/admin')) return null

  return (
    <header className="sticky top-0 z-40 border-b border-mist/60 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-4 sm:gap-4 sm:px-8 sm:py-6 md:px-10">
        {/* Подпись в две строки справа от LUMO — не выше самого слова, шапка не растёт. Уже 390px рядом
            с четырьмя пунктами навигации ей не хватает места — прячем (Android 360, iPhone SE/mini) */}
        <Link href="/" aria-label="LUMO — Premium Mushrooms" className="flex min-w-0 items-center gap-1.5 sm:gap-3">
          <span className="metal-text font-display text-lg font-bold tracking-[0.15em] sm:text-2xl">LUMO</span>
          <span aria-hidden className="h-5 w-px bg-stone/30 max-[389px]:hidden sm:h-6" />
          <span className="text-[7px] font-semibold uppercase leading-[1.35] tracking-[0.2em] text-stone max-[389px]:hidden sm:text-[9px] sm:tracking-[0.25em]">
            Premium<br />Mushrooms
          </span>
        </Link>
        <nav className="flex shrink-0 items-center gap-2.5 sm:gap-8">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href}
              className={`${LINK_CLASS} ${pathname === item.href ? 'text-brass' : 'text-stone'}`}>
              {item.label}
            </Link>
          ))}
          {/* Контакты — в футере, он есть на каждой странице. На телефоне — иконка, как у корзины */}
          <SmoothScrollLink href="#contacts" className={`flex items-center ${LINK_CLASS} text-stone`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 sm:hidden" aria-label="Контакты">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="hidden sm:inline">Контакты</span>
          </SmoothScrollLink>
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
