import SmoothScrollLink from '@/components/SmoothScrollLink'

const STAGES = [
  {
    days: '2–3',
    title: 'Глубокое восстановление',
    text: 'Циркадные ритмы приходят в норму. Увеличивается продолжительность глубокой фазы сна, а пробуждение становится лёгким и бодрым.',
  },
  {
    days: '5–7',
    title: 'Баланс нервной системы',
    text: 'Заметно снижается уровень фонового стресса. Уходит фоновая тревожность, нервозность и признаки апатии. На смену приходит ровное внутреннее спокойствие.',
  },
  {
    days: '8–12',
    title: 'Ясность ума',
    text: 'Рассеивается «туман в голове». Улучшаются краткосрочная память и способность долго удерживать концентрацию внимания на одной задаче.',
  },
  {
    days: '14–20+',
    title: 'Когнитивный апгрейд',
    text: 'Вы ощущаете новый уровень уверенности в себе. Мозг работает эффективно, не перегружаясь: информация усваивается быстрее, новые знания структурируются легче, и нужные мысли больше не «вылетают» из головы.',
  },
]

// Точки и отрезки шкалы разгораются от этапа к этапу
const DOT_OPACITY = ['opacity-40', 'opacity-60', 'opacity-80', 'opacity-100']
const SEGMENT_COLOR = ['from-brass/20 to-brass/40', 'from-brass/40 to-brass/60', 'from-brass/60 to-brass/90']

export default function StateTimeline({ ctaHref }: { ctaHref?: string }) {
  return (
    <>
      <p className="text-sm uppercase tracking-widest text-stone">Накопительный эффект</p>
      <h2 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">Эволюция вашего состояния</h2>
      <p className="mt-4 max-w-2xl leading-relaxed text-stone">
        Помните, что LUMO имеет накопительный эффект. У всех процесс адаптации проходит по-разному, но в среднем путь
        к вашему лучшему состоянию выглядит так:
      </p>

      <ol className="mt-10 grid grid-cols-1 gap-9 lg:grid-cols-4 lg:gap-8">
        {STAGES.map((stage, i) => (
          <li key={stage.days} className="relative pl-10 lg:pl-0 lg:pt-12">
            {/* Отрезок шкалы до следующей точки: вертикальный на телефоне, горизонтальный на десктопе (зазоры = gap списка) */}
            {i < STAGES.length - 1 && (
              <span aria-hidden className={`absolute -bottom-8 left-[11px] top-7 w-px bg-linear-to-b lg:-right-7 lg:bottom-auto lg:left-7 lg:top-[11px] lg:h-px lg:w-auto lg:bg-linear-to-r ${SEGMENT_COLOR[i]}`} />
            )}
            <span className={`absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-full border border-brass/40 bg-paper ${
              i === STAGES.length - 1 ? 'shadow-[0_0_18px_rgba(224,168,56,0.55)]' : ''
            }`}>
              <span className={`h-2 w-2 rounded-full bg-brass ${DOT_OPACITY[i]}`} />
            </span>
            <p className="font-price text-sm font-bold uppercase tracking-widest text-brass">Дни {stage.days}</p>
            <h3 className="mt-2 font-display text-lg leading-snug text-ink">{stage.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-stone">{stage.text}</p>
          </li>
        ))}
      </ol>

      <div className="card-glow mt-12 rounded-lg bg-mist px-6 py-9 text-center sm:py-12">
        {/* box-decoration-clone: градиент «металла» на каждой строке свой, а не один на весь абзац */}
        <p className="font-display text-xl font-bold leading-snug sm:text-3xl">
          <span className="metal-text box-decoration-clone">LUMO: ваш потенциал без границ</span>
        </p>
        <p className="mt-3 text-stone">Будьте здоровы и продуктивны!</p>
        {ctaHref && (
          <SmoothScrollLink href={ctaHref}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-brass px-7 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-paper shadow-lg shadow-brass/20 transition-all duration-300 hover:scale-105 hover:shadow-brass/40">
            Выбрать курс
          </SmoothScrollLink>
        )}
      </div>
    </>
  )
}
