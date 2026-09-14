'use client'

import { usePathname } from 'next/navigation'

export default function Footer() {
  const pathname = usePathname()
  if (pathname.startsWith('/admin')) return null

  return (
    <footer className="border-t border-mist/60">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 md:px-10">
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
          <span className="metal-text font-display text-lg font-bold tracking-[0.15em]">LUMO</span>
          <p className="text-sm text-stone">Доставка по Алматы — 1 500 ₸, по Казахстану — по тарифам перевозчика</p>
        </div>
        <p className="mt-6 text-center text-xs leading-relaxed text-stone/70 sm:text-left">
          БАД. Не является лекарственным средством. Перед применением рекомендуется проконсультироваться со специалистом.
        </p>
        <p className="mt-2 text-center text-xs leading-relaxed text-stone/70 sm:text-left">
          ИП Алимоллаев · БИН 940516050612 · Алматы. Информация на сайте не является публичной офертой.
        </p>
      </div>
    </footer>
  )
}