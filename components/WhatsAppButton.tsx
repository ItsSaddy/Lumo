'use client'

import { usePathname } from 'next/navigation'

const PHONE_NUMBER = '992993333366' // код страны без «+» и без пробелов

export default function WhatsAppButton() {
  const pathname = usePathname()
  if (pathname.startsWith('/admin')) return null

  return (
    <a
      href={`https://wa.me/${PHONE_NUMBER}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-lg shadow-black/40 transition-all hover:scale-105 hover:bg-[#1ebe5b]"
      aria-label="Написать в WhatsApp"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.94.57 3.75 1.55 5.27L2 22l4.97-1.64a9.87 9.87 0 0 0 5.07 1.38c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm5.8 14.07c-.24.68-1.4 1.3-1.94 1.38-.5.08-1.12.11-1.8-.11a15.8 15.8 0 0 1-2.63-1.14 12.3 12.3 0 0 1-3.6-3.9c-.38-.6-.63-1.28-.6-2.03.03-.6.35-1.14.72-1.5.14-.14.32-.2.5-.2h.36c.15 0 .35.02.5.36.2.44.68 1.66.74 1.78.06.12.1.26.02.42-.08.16-.13.26-.26.4-.13.14-.27.32-.39.43-.13.12-.26.26-.12.5.36.62.86 1.24 1.36 1.72.5.48 1.06.9 1.66 1.2.24.12.4.1.55-.04.16-.14.68-.72.86-.97.18-.24.36-.2.6-.12.24.08 1.5.7 1.76.83.26.12.43.18.5.28.06.1.06.6-.18 1.28Z" />
      </svg>
    </a>
  )
}