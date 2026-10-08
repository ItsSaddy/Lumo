import Link from 'next/link'
import ConsultationForm from '@/components/ConsultationForm'

const LEGAL_LINK = 'underline decoration-stone/40 underline-offset-2 transition-colors hover:text-ink hover:decoration-ink'

export default function ConsultationSection() {
  return (
    <div className="card-glow relative isolate overflow-hidden rounded-lg bg-mist p-5 sm:p-10 lg:p-12">
      {/* Фиолетовое свечение — за текстом слева, не под полями формы */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_90%_at_0%_0%,rgba(92,54,86,0.4),transparent_70%)]" />
      {/* На телефоне: текст → форма → согласие. На десктопе форма справа на всю высоту, согласие внизу слева */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-x-16">
        <div>
          <p className="text-sm uppercase tracking-widest text-stone">Консультация</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">Не уверены, какой курс выбрать?</h2>
          <p className="mt-4 max-w-md leading-relaxed text-stone">
            Оставьте заявку — мы проконсультируем и поможем подобрать курс под вашу цель: фокус, энергию или спокойный сон.
          </p>
        </div>
        <div className="lg:row-span-2">
          <ConsultationForm />
        </div>
        <p className="max-w-md text-xs leading-relaxed text-stone/80 lg:self-end">
          Нажимая «Оставить заявку» или «Проконсультироваться в WhatsApp», вы даёте{' '}
          <Link href="/consent" className={LEGAL_LINK}>согласие на обработку персональных данных</Link> в соответствии
          с <Link href="/privacy" className={LEGAL_LINK}>Политикой конфиденциальности</Link>.
        </p>
      </div>
    </div>
  )
}
