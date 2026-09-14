'use client'

import { useState } from 'react'

export default function FaqAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="mt-8 flex flex-col divide-y divide-mist">
      {items.map((item, i) => {
        const isOpen = openIndex === i
        return (
          <div key={item.q} className="py-5">
            <button onClick={() => setOpenIndex(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 text-left text-ink">
              <span className="font-medium">{item.q}</span>
              <span className={`shrink-0 text-brass transition-transform duration-300 ease-out ${isOpen ? 'rotate-45' : ''}`}>+</span>
            </button>
            <div className={`grid transition-[grid-template-rows] duration-400 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
              <div className="overflow-hidden">
                <p className={`pt-3 text-sm leading-relaxed text-stone transition-opacity duration-300 ${isOpen ? 'opacity-100 delay-150' : 'opacity-0'}`}>
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
