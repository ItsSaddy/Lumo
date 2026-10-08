'use client'

import type { ReactNode, MouseEvent } from 'react'

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

// onClick — вызывается до прокрутки (например, закрыть окно «Подробнее», чтобы оно не осталось поверх блока)
export default function SmoothScrollLink({
  href,
  children,
  className,
  onClick,
}: {
  href: string
  children: ReactNode
  className?: string
  onClick?: () => void
}) {
  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    onClick?.()
    const target = document.getElementById(href.replace('#', ''))
    if (!target) return
    e.preventDefault()

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // отступ под шапку задаёт scroll-padding-top в globals.css
      target.scrollIntoView()
      return
    }

    // Шапка липкая — останавливаемся под ней, а не под краем окна
    const headerHeight = document.querySelector('header')?.offsetHeight ?? 0
    const start = window.scrollY
    const end = target.getBoundingClientRect().top + start - headerHeight - 16
    const distance = end - start
    const duration = 900
    let startTime: number | null = null

    function step(timestamp: number) {
      if (startTime === null) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      window.scrollTo(0, start + distance * easeInOutCubic(progress))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  )
}
