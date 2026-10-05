'use client'

import { useEffect, useRef, type ReactNode } from 'react'

export default function RevealSection({ children, className = '', id }: { children: ReactNode; className?: string; id?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible')
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} id={id} className={`reveal ${className}`}>
      {children}
    </div>
  )
}
