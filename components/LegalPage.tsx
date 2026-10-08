import type { ReactNode } from 'react'

export type LegalSection = { title: string; body: ReactNode[] }

// Общий вид для «Документов» из футера: заголовок, дата редакции, пронумерованные разделы
export default function LegalPage({ title, updated, intro, sections }: {
  title: string
  updated: string
  intro?: ReactNode
  sections: LegalSection[]
}) {
  return (
    <main className="mx-auto max-w-3xl px-5 pb-20 pt-10 sm:px-8 sm:pt-14">
      <p className="text-sm uppercase tracking-widest text-stone">Документы</p>
      <h1 className="mt-2 text-balance font-display text-3xl font-bold text-ink sm:text-4xl">{title}</h1>
      <p className="mt-3 text-sm text-stone">Редакция от {updated}</p>
      {intro && <p className="mt-8 leading-relaxed text-stone">{intro}</p>}

      <ol className="mt-10 flex flex-col gap-8">
        {sections.map((section, i) => (
          <li key={section.title}>
            <h2 className="font-display text-lg text-ink">{i + 1}. {section.title}</h2>
            <div className="mt-3 flex flex-col gap-3 leading-relaxed text-stone">
              {section.body.map((paragraph, j) => <p key={j}>{paragraph}</p>)}
            </div>
          </li>
        ))}
      </ol>
    </main>
  )
}
