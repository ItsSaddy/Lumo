import type { ReactNode } from 'react'

// Инструкции по применению для FAQ на главной

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-6 first:mt-0">
      <p className="text-xs font-semibold uppercase tracking-widest text-brass">{title}</p>
      <div className="mt-2.5">{children}</div>
    </div>
  )
}

function Points({ items }: { items: { lead?: string; text: ReactNode }[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brass" />
          <span>
            {item.lead && <span className="font-semibold text-ink">{item.lead}. </span>}
            {item.text}
          </span>
        </li>
      ))}
    </ul>
  )
}

function Schedule({ rows }: { rows: { when: string; text: ReactNode; muted?: boolean }[] }) {
  return (
    <div className="flex flex-col gap-2">
      {rows.map((row) => (
        <div key={row.when} className="flex items-start gap-3">
          <span className={`mt-0.5 w-20 shrink-0 rounded-full px-2 py-1 text-center text-[11px] font-semibold uppercase tracking-wide ${
            row.muted ? 'bg-paper/60 text-stone' : 'bg-brass/15 text-brass'
          }`}>
            {row.when}
          </span>
          <span>{row.text}</span>
        </div>
      ))}
    </div>
  )
}

function Option({ title, badge, children }: { title: string; badge?: string; children: ReactNode }) {
  return (
    <div className="rounded-lg bg-mist p-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-semibold text-ink">{title}</p>
        {badge && (
          <span className="rounded-full bg-brass px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-paper">{badge}</span>
        )}
      </div>
      <div className="mt-1.5">{children}</div>
    </div>
  )
}

const DOSE = '0,5 пипетки (7–8 капель)'

const CONTRAINDICATIONS = { lead: 'Противопоказания', text: 'индивидуальная непереносимость компонентов, беременность, период лактации.' }

const STORAGE_AND_CONTRAINDICATIONS = [
  CONTRAINDICATIONS,
  { lead: 'Хранение', text: 'в сухом, защищённом от света месте, лучше в холодильнике — продукт натуральный, так активные вещества сохраняются дольше.' },
]

export function LionsManeCapsulesInstruction() {
  return (
    <>
      <p>
        Суточная норма для активной работы мозга — <span className="font-semibold text-ink">4 капсулы</span>.
        Выберите одну из двух схем в зависимости от ваших целей.
      </p>

      <Block title="Схемы приёма">
        <div className="grid gap-3 sm:grid-cols-2">
          <Option title="А. Быстрый запуск" badge="Рекомендуем">
            Все 4 капсулы сразу утром натощак, за 20–30 минут до еды. Максимальная концентрация активных веществ
            в крови с самого утра — идеально, если нужно сразу «включиться» в сложные задачи.
          </Option>
          <Option title="Б. Продлённый фокус">
            2 капсулы утром натощак + 2 капсулы в обед. Ровная продуктивность в течение всего дня без
            послеобеденного спада энергии.
          </Option>
        </div>
      </Block>

      <Block title="Важные правила">
        <Points items={[
          { lead: 'Вода', text: 'запивайте капсулы стаканом чистой воды комнатной температуры — так оболочка растворится быстрее.' },
          { lead: 'Время', text: 'последнюю капсулу примите не позднее 16:00–17:00 (за 4–5 часов до сна), чтобы эффект не мешал заснуть.' },
        ]} />
      </Block>

      <Block title="Важно">
        <Points items={[
          CONTRAINDICATIONS,
          // Холодильник советуем только для жидких экстрактов: капсулам вредит конденсат
          { lead: 'Хранение', text: 'в сухом, защищённом от света месте, плотно закрыв крышку.' },
        ]} />
      </Block>
    </>
  )
}

export function LionsManeExtractInstruction() {
  return (
    <>
      <p>Чтобы ощутить действие быстрее, начните с интенсивного курса — приём 2 раза в день.</p>

      <Block title="Дозировка">
        <Points items={[
          { lead: 'Разовая порция', text: DOSE + '.' },
          { lead: 'Способ', text: 'накапать под язык и подержать во рту 30–60 секунд, затем проглотить. Через слизистую активные вещества попадают сразу в кровь, минуя желудок, — усвоение выше в разы.' },
        ]} />
      </Block>

      <Block title="Схема приёма">
        <Schedule rows={[
          { when: 'Утро', text: 'Натощак — для запуска мозга и настройки ритмов.' },
          { when: 'Обед', text: 'Для продуктивности во второй половине дня.' },
          { when: 'Вечер', text: 'Не принимать за 4–5 часов до сна — может вызвать излишнюю бодрость.', muted: true },
        ]} />
      </Block>

      <Block title="Как усилить эффект">
        <Points items={[
          { lead: 'С кофе', text: 'идеальная пара: ежовик сглаживает «кофейную тревожность» и превращает возбуждение в чистый фокус. Выпейте кофе через 5–10 минут после экстракта.' },
          { lead: 'С жирами', text: 'грибные экстракты лучше усваиваются с жирами — запейте ложкой кокосового или оливкового масла, съешьте кусочек авокадо или добавьте в bulletproof-кофе.' },
          { lead: 'Вкус', text: 'приятный и натуральный. При желании можно запить водой, соком или добавить в смузи.' },
        ]} />
      </Block>

      <Block title="Важно">
        <Points items={[
          { lead: 'Встряхните перед применением', text: 'естественный осадок допускается и говорит о качестве продукта.' },
          ...STORAGE_AND_CONTRAINDICATIONS,
        ]} />
      </Block>
    </>
  )
}

export function CordycepsExtractInstruction() {
  return (
    <>
      <p>
        Кордицепс — природный аккумулятор и топливо для тела. В отличие от стимуляторов, он не истощает нервную систему.
        Ежовик работает с нейронами, а кордицепс — с клетками тела: увеличивает выработку АТФ (чистой энергии)
        и улучшает усвоение кислорода.
      </p>

      <Block title="Способ применения">
        <ol className="flex flex-col gap-2">
          {[
            'Встряхните флакон — осадок это полезные частицы гриба.',
            `Наберите ${DOSE}.`,
            'Накапайте под язык.',
            'Подержите 30–40 секунд — это важно для быстрого всасывания в кровь — и проглотите. Можно запить водой.',
          ].map((step, i) => (
            <li key={step} className="flex items-start gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brass/15 text-[11px] font-semibold text-brass">{i + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </Block>

      <Block title="Базовая схема — для тонуса весь день">
        <Schedule rows={[
          { when: 'Утро', text: 'Натощак — лучшее время: запускает обмен веществ и даёт заряд бодрости сразу после пробуждения.' },
          { when: 'Обед', text: 'Вторая порция перед обедом — без сонливости после еды, продуктивность до вечера.' },
          { when: 'Вечер', text: 'Не позже 18:00 — гриб даёт сильный прилив сил и может помешать уснуть.', muted: true },
        ]} />
      </Block>

      <Block title="Спорт и тренировки">
        <div className="grid gap-3 sm:grid-cols-2">
          <Option title="За 20–30 минут до">
            {DOSE}. Повышает выносливость, улучшает дыхание — лёгкие усваивают больше кислорода — и даёт взрывную силу.
          </Option>
          <Option title="Сразу после">
            {DOSE}. Ускоряет выведение молочной кислоты и кортизола: мышцы восстанавливаются быстрее, а крепатура
            на следующий день заметно меньше или не появляется совсем.
          </Option>
        </div>
      </Block>

      <Block title="Мужская сила и либидо">
        <p>
          Кордицепс известен как природный афродизиак: улучшает кровообращение и гормональный фон.
          Примите {DOSE} за 30–60 минут до близости — улучшает кровоснабжение, повышает выносливость и остроту ощущений.
        </p>
      </Block>

      <Block title="Вместе с ежовиком">
        <p>
          Грибы идеально дополняют друг друга: ежовик отвечает за мозг (фокус, спокойствие), кордицепс — за тело (энергия, сила).
        </p>
        <div className="mt-3 flex flex-col gap-3">
          <Option title="Смешать">
            Наберите под язык 0,5 пипетки ежовика и сразу 0,5 пипетки кордицепса, подержите вместе и проглотите.
          </Option>
          <Option title="Раздельно">
            <Schedule rows={[
              { when: 'Утро', text: 'Ежовик + кордицепс — для мощного старта дня.' },
              { when: 'Обед', text: 'Кордицепс — для физической бодрости.' },
              { when: 'Вечер', text: 'Только ежовик — для спокойствия нервной системы.', muted: true },
            ]} />
          </Option>
          <Option title="Дважды в день">
            Утром и в обед — ежовик + кордицепс. Кофе в этом случае пейте через 1,5 часа после приёма.
          </Option>
        </div>
      </Block>

      <Block title="Важно">
        <Points items={[
          { lead: 'Вода', text: 'в течение дня пейте чуть больше чистой воды — кордицепс ускоряет метаболизм.' },
          ...STORAGE_AND_CONTRAINDICATIONS,
        ]} />
      </Block>
    </>
  )
}
