'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { COMPANY, EMAIL, INSTAGRAM, INSTAGRAM_URL, PHONE_DISPLAY, WHATSAPP_PHONE, whatsappLink } from '@/lib/contacts'

const NAV = [
  { href: '/#sets', label: 'Наборы' },
  { href: '/shop', label: 'Магазин' },
  { href: '/#benefits', label: 'Преимущества' },
  { href: '/#reviews', label: 'Отзывы' },
  { href: '/#about', label: 'О бренде' },
  { href: '/#faq', label: 'Вопросы' },
  { href: '/#consultation', label: 'Консультация' },
]

const DOCS = [
  { href: '/consent', label: 'Согласие на обработку персональных данных' },
  { href: '/privacy', label: 'Политика конфиденциальности' },
  { href: '/terms', label: 'Пользовательское соглашение' },
]

const HEADING = 'text-xs uppercase tracking-widest text-stone'
const LINK = 'text-ink/90 transition-colors hover:text-brass'

export default function Footer() {
  const pathname = usePathname()
  if (pathname.startsWith('/admin')) return null

  return (
    <footer className="border-t border-mist/60 bg-mist/20">
      <div className="mx-auto max-w-6xl px-5 pb-10 pt-14 sm:px-8 sm:pt-20 md:px-10">
        <p className="metal-text font-display text-6xl font-bold leading-none tracking-[0.12em] sm:text-8xl lg:text-9xl">LUMO</p>
        <p className="mt-4 font-display text-xl text-ink sm:text-2xl">Ясность мысли. Сила тела.</p>

        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 text-sm sm:mt-14 lg:grid-cols-[1fr_1fr_2fr]">
          <div>
            <p className={HEADING}>Свяжитесь с нами</p>
            <ul className="mt-4 flex flex-col gap-2.5">
              <li>
                <a href={`tel:+${WHATSAPP_PHONE}`} className={`${LINK} whitespace-nowrap`}>{PHONE_DISPLAY}</a>
              </li>
              <li>
                <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className={LINK}>WhatsApp</a>
              </li>
              {EMAIL && <li><a href={`mailto:${EMAIL}`} className={LINK}>{EMAIL}</a></li>}
              {INSTAGRAM_URL && (
                <li><a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className={LINK}>Instagram @{INSTAGRAM}</a></li>
              )}
            </ul>
            <p className="mt-5 leading-relaxed text-stone">
              Доставка по Алматы — 1 500 ₸, по Казахстану — по тарифам перевозчика
            </p>
          </div>

          <div>
            <p className={HEADING}>Навигация</p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {NAV.map((item) => (
                <li key={item.href}><Link href={item.href} className={LINK}>{item.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* На телефоне документы на всю ширину — длинные названия не ломаются в узкой колонке */}
          <div className="col-span-2 lg:col-span-1">
            <p className={HEADING}>Документы</p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {DOCS.map((item) => (
                <li key={item.href}><Link href={item.href} className={LINK}>{item.label}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-mist pt-6 text-xs text-stone/80 sm:flex-row sm:justify-between">
          {/* Год считается при сборке страницы — в новогоднюю ночь сервер и браузер могут разойтись */}
          <p suppressHydrationWarning>© Все права защищены. LUMO — {new Date().getFullYear()}</p>
          <p>{COMPANY.name} · БИН {COMPANY.bin} · {COMPANY.city}</p>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-stone/60">
          БАД. Не является лекарственным средством. Перед применением рекомендуется проконсультироваться со специалистом.
          Информация на сайте не является публичной офертой.
        </p>
      </div>
    </footer>
  )
}
