'use client'

import { useState } from 'react'

export type Benefit = { title: string; text?: string }

export default function BenefitAccordion({ items }: { items: Benefit[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <ul className="mt-5 flex flex-col divide-y divide-paper/60">
      {items.map((item, i) => {
        const isOpen = openIndex === i

        if (!item.text) {
          return (
            <li key={item.title} className="flex items-start gap-2.5 py-3.5 text-sm font-medium text-ink">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brass" />
              {item.title}
            </li>
          )
        }

        return (
          <li key={item.title} className="py-3.5">
            <button type="button" onClick={() => setOpenIndex(isOpen ? null : i)} aria-expanded={isOpen}
              className="flex w-full items-start gap-2.5 text-left text-sm font-medium text-ink transition-colors hover:text-brass">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brass" />
              <span className="flex-1">{item.title}</span>
              <span className={`shrink-0 text-lg leading-none text-brass transition-transform duration-300 ease-out ${isOpen ? 'rotate-45' : ''}`}>+</span>
            </button>
            <div className={`grid transition-[grid-template-rows] duration-400 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
              <div className="overflow-hidden">
                <p className={`pl-4 pt-2.5 text-sm leading-relaxed text-stone transition-opacity duration-300 ${isOpen ? 'opacity-100 delay-150' : 'opacity-0'}`}>
                  {item.text}
                </p>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
