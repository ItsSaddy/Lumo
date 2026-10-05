import Image from 'next/image'
import Link from 'next/link'
import { createPublicClient } from '@/lib/supabase/public'
import type { Product } from '@/lib/types'
import { isBundle, resolveBundle } from '@/lib/bundles'
import CatalogGrid from '@/components/CatalogGrid'
import BundleCard from '@/components/BundleCard'
import StateTimeline from '@/components/StateTimeline'
import RevealSection from '@/components/RevealSection'
import FaqAccordion from '@/components/FaqAccordion'
import SmoothScrollLink from '@/components/SmoothScrollLink'
import { CordycepsExtractInstruction, LionsManeCapsulesInstruction, LionsManeExtractInstruction } from '@/components/UsageInstructions'
import BenefitAccordion, { type Benefit } from '@/components/BenefitAccordion'

const TRUST_ITEMS = [
  {
    label: 'Американский стандарт',
    flag: true,
  },
  {
    label: '100% натурально',
    icon: 'M20 4c-6 0-14 2-14 10 0 3 1.6 5 4 6-2 2-3 3-3 3h2s2-1.5 3.4-3.1c1 .1 2.1.1 3.2-.1C20.4 18.8 20 8 20 4Zm-9 12c-1.8-.8-3-2.3-3-4.5C8 6 13 5 17 5c0 4-1 9-6 11Z',
  },
  {
    label: 'Сертифицировано',
    icon: 'M9 12.7 6.7 10.4 5.3 11.8l3.7 3.7 7-7L14.6 7 9 12.7ZM12 2 4 5v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V5l-8-3Z',
  },
  {
    label: 'Доставка по Казахстану',
    icon: 'M3 6h11v8H3V6Zm11 3h4l3 3v2h-2a2 2 0 1 1-4 0H9a2 2 0 1 1-4 0H3v-1h11V9Zm1 1v2h3.5L17 10h-2Z',
  },
]

const INGREDIENT_BENEFITS: { title: string; subtitle: string; items: Benefit[] }[] = [
  {
    title: 'Ежовик гребенчатый',
    subtitle: 'Экстракт и капсулы',
    items: [
      {
        title: 'Ясность ума и максимальный фокус',
        text: 'Ежовик устраняет «туман в голове» и помогает войти в состояние потока. Он улучшает работу мозга так, что вы дольше удерживаете внимание на сложных задачах, не отвлекаетесь по мелочам, быстрее принимаете решения и работаете с высокой продуктивностью весь день.',
      },
      {
        title: 'Крепкая память и лёгкая обучаемость',
        text: 'Активные вещества ежовика — эринацины и герициноны — стимулируют выработку фактора роста нервов (NGF). Это помогает мозгу создавать новые нейронные связи: вы быстрее усваиваете информацию, легко вспоминаете важные детали, имена и цифры и сохраняете остроту ума в любой ситуации.',
      },
      {
        title: 'Глубокий сон и защита от стресса',
        text: 'Гриб мягко балансирует нервную систему, снижает уровень кортизола и тревожности. Помогает расслабиться после напряжённого дня, быстрее заснуть и делает сон по-настоящему глубоким и восстанавливающим — утром вы просыпаетесь свежим, отдохнувшим и без чувства разбитости.',
      },
      {
        title: 'Крепкий иммунитет и поддержка организма',
        text: 'Благодаря высокому содержанию природных полисахаридов (бета-глюканов) и антиоксидантов экстракт работает как надёжный внутренний щит: активирует естественные защитные функции организма, снижает воспаление и помогает противостоять вирусам, инфекциям и сезонным простудам.',
      },
    ],
  },
  {
    title: 'Кордицепс военный',
    subtitle: 'Экстракт из 100% плодовых тел',
    items: [
      {
        title: 'Максимальная энергия и фокус',
        text: 'Кордицепс стимулирует выработку клеточной энергии (АТФ) и даёт мощный заряд бодрости на весь день — без кофеиновых спадов и учащённого сердцебиения.',
      },
      {
        title: 'Поддержка тестостерона и либидо',
        text: 'Действует как природный афродизиак: улучшает кровообращение, возвращает здоровую мужскую (и женскую) силу и повышает интерес к жизни.',
      },
      {
        title: 'Физическая выносливость',
        text: 'Улучшает кислородный обмен в организме — вы тренируетесь интенсивнее, работаете продуктивнее и меньше устаёте.',
      },
      {
        title: 'Быстрое восстановление',
        text: 'Ускоряет регенерацию организма после тяжёлых физических, умственных и стрессовых нагрузок и быстро возвращает вас в строй.',
      },
    ],
  },
  {
    title: 'Формула подушечек',
    subtitle: 'Ежовик + кордицепс + L-теанин',
    items: [
      {
        title: 'Фокус на 200%',
        text: 'Не путать с кофейными и энергетическими паучами. Это ноотропные паучи, которые улучшают и восстанавливают работу мозга и нервной системы. В составе — те же грибы, ежовик и кордицепс, а для усиления эффекта мы добавили L-теанин.',
      },
      { title: 'Снятие стресса и мгновенная концентрация' },
      {
        title: 'Растительный состав',
        text: 'Ничего не нужно сплёвывать — наоборот, глотать слюну теперь часть ритуала: состав полностью натуральный и полезный.',
      },
      {
        title: 'Помогает отказаться от курения',
        text: 'Успокаивает рецепторы, отвечающие за зависимость, — поэтому отказаться от сигарет, вейпов и снюса становится легко.',
      },
    ],
  },
]

const REVIEWS = [
  {
    text: '«Слушайте, что творят ваши экстракты! Я сразу попробовала кордицепс — и через 20 минут готова марафон бежать. Сколько энергии, машаАллах! Однозначно я ваш клиент теперь и буду всем рекомендовать»',
    author: 'Мария',
  },
  {
    text: '«Очень понравился ваш продукт. Я искал что-то подобное — лёгкое пробуждение мозга, ясность и бодрость сознания. Капли с утра, кофе, и контрольный под язык — все нейроны начинают двигаться. Спасибо большое за оперативность!»',
    author: 'Покупатель LUMO',
  },
]

const NTIN_CODES = [
  { name: 'Ежовик гребенчатый, капсулы 120 шт', code: '0200407433955' },
  { name: 'Ежовик гребенчатый, жидкий экстракт 20 мл', code: '0200401232196' },
  { name: 'Кордицепс военный, жидкий экстракт 20 мл', code: '0200401232264' },
  { name: 'Грибные подушечки, ментол, 20 шт', code: '0200407428951' },
]

const FAQ = [
  { q: 'Как принимать капсулы ежовика?', a: <LionsManeCapsulesInstruction /> },
  { q: 'Как принимать жидкий экстракт ежовика?', a: <LionsManeExtractInstruction /> },
  { q: 'Как принимать жидкий экстракт кордицепса?', a: <CordycepsExtractInstruction /> },
  {
    q: 'Есть ли противопоказания?',
    a: 'Продукция изготовлена из натурального сырья, но при беременности, кормлении грудью или хронических заболеваниях рекомендуем проконсультироваться с врачом перед началом приёма.',
  },
  {
    q: 'Как оформить рассрочку через Kaspi?',
    a: 'Рассрочка Kaspi доступна на все товары — менеджер отправит ссылку на оплату после подтверждения заявки.',
  },
  {
    q: 'Сколько стоит доставка?',
    a: 'По Алматы — фиксированно 1 500 ₸. В другие регионы Казахстана — по тарифам СДЭК/почты/InDriver, точную стоимость менеджер посчитает и озвучит при подтверждении заказа.',
  },
  {
    q: 'Как быстро вы свяжетесь после заявки?',
    a: 'Обычно в течение часа в рабочее время — позвоним или напишем на номер, указанный в заявке, чтобы подтвердить заказ и договориться о доставке.',
  },
]

// Страница статическая; обновляется сразу после правок в админке и страховочно раз в час
export const revalidate = 3600

export default async function Home() {
  const supabase = createPublicClient()
  // Берём и скрытые товары: они могут входить в состав видимого набора
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true })

  const { data: siteSettings } = await supabase
    .from('site_settings')
    .select('hero_media_url, hero_media_type')
    .eq('id', 1)
    .maybeSingle()

  const products = (data ?? []) as Product[]
  const productsById = new Map(products.map((p) => [p.id, p]))
  const available = products.filter((p) => p.is_available)
  const singles = available.filter((p) => !isBundle(p))
  // Главный экран — готовые наборы; отдельные товары живут в /shop.
  // Пока наборов нет (не выполнен supabase/bundles.sql) — показываем каталог, как раньше
  const bundles = available
    .filter(isBundle)
    .map((bundle) => ({ bundle, resolved: resolveBundle(bundle, productsById) }))
    .filter(({ resolved }) => resolved.lines.length > 0)
  const hasBundles = bundles.length > 0

  const heroMediaUrl = siteSettings?.hero_media_url
    ?? singles.find((p) => p.is_hero && p.image_url)?.image_url
    ?? singles.find((p) => p.image_url)?.image_url
  const heroMediaType = siteSettings?.hero_media_url ? siteSettings.hero_media_type : 'image'

  return (
    <>
      <section className="relative isolate flex min-h-84 items-end overflow-hidden sm:min-h-112 lg:min-h-128">
        {heroMediaUrl ? (
          <>
            {heroMediaType === 'video' ? (
              <video src={heroMediaUrl} className="absolute inset-0 h-full w-full object-cover object-[center_68%] brightness-110"
                autoPlay muted loop playsInline />
            ) : (
              <Image src={heroMediaUrl} alt="" fill preload sizes="100vw"
                className="object-cover object-[center_68%] brightness-110" />
            )}
            {/* Низ под текстом затемнён плотно, верх — слегка, чтобы продукция оставалась видна */}
            <div className="absolute inset-0 bg-linear-to-t from-paper from-10% via-paper/75 via-55% to-paper/25" />
          </>
        ) : (
          <div className="hero-glow absolute inset-0" />
        )}
        <div className="animate-fade-up relative z-10 mx-auto w-full max-w-2xl px-5 pb-8 pt-12 text-center sm:pb-14 sm:pt-16">
          <h1 className="font-display text-4xl font-bold leading-tight text-ink drop-shadow-lg sm:text-5xl md:text-6xl">
            Ясность мысли.<br />Сила тела.
          </h1>
          <p className="mx-auto mt-4 max-w-sm text-ink/90 drop-shadow-md">
            Премиальные экстракты редких грибов и трав — ежовик гребенчатый, кордицепс и формулы для фокуса, по стандарту США
          </p>
          <SmoothScrollLink href={hasBundles ? '#sets' : '#catalog'}
            className="group mt-6 inline-flex items-center gap-2 rounded-full bg-brass px-8 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-paper shadow-lg shadow-brass/20 transition-all duration-300 hover:scale-105 hover:shadow-brass/40 sm:mt-8">
            {hasBundles ? 'Выбрать курс' : 'Смотреть каталог'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4 animate-bounce">
              <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </SmoothScrollLink>
        </div>
      </section>

      <section className="border-b border-mist/60 bg-mist/30">
        <div className="mx-auto grid max-w-6xl grid-cols-4 gap-2 px-3 py-4 sm:gap-6 sm:px-8 sm:py-6 md:px-10">
          {TRUST_ITEMS.map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-1.5 text-center sm:gap-2">
              {'flag' in item ? (
                <svg viewBox="0 0 38 20" className="my-0.5 h-4 w-7 shrink-0 rounded-[2px] sm:my-1" aria-hidden>
                  <rect width="38" height="20" fill="#b22234" />
                  {[1, 3, 5, 7, 9, 11].map((row) => (
                    <rect key={row} y={(row * 20) / 13} width="38" height={20 / 13} fill="#fff" />
                  ))}
                  <rect width="15.2" height={(20 / 13) * 7} fill="#3c3b6e" />
                  {[0, 1, 2, 3].map((r) => [0, 1, 2, 3, 4].map((c) => (
                    <circle key={`${r}-${c}`} cx={1.6 + c * 3} cy={1.4 + r * 2.4} r="0.55" fill="#fff" />
                  )))}
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0 text-brass sm:h-6 sm:w-6">
                  <path d={item.icon} />
                </svg>
              )}
              <span className="text-[10px] leading-tight text-stone sm:text-sm">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-5 pb-20 pt-10 sm:px-8 sm:pt-14 md:px-10">
        {error && <p className="text-red-400">Не получилось загрузить товары: {error.message}</p>}
        {!error && !hasBundles && <CatalogGrid products={singles} />}

        {hasBundles && (
          <section id="sets">
            <p className="text-sm uppercase tracking-widest text-stone">Готовые решения</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">Выберите курс</h2>
            <p className="mt-3 max-w-xl leading-relaxed text-stone">
              LUMO работает накопительно — лучший результат даёт курс. Наборы выгоднее, чем покупать по отдельности.
            </p>
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
              {bundles.map(({ bundle, resolved }) => (
                <BundleCard key={bundle.id} bundle={bundle} resolved={resolved} />
              ))}
            </div>

            {/* Рядом с яркими фото наборов плашка в цвет фона терялась — даём ей золотую рамку, подсветку и явную кнопку */}
            <Link href="/shop"
              className="card-glow group mt-6 flex items-center gap-4 rounded-lg border border-brass/40 bg-linear-to-r from-brass/15 via-mist to-mist px-5 py-5 transition-colors hover:border-brass sm:px-6 sm:py-6">
              <div className="hidden shrink-0 -space-x-3 sm:flex">
                {singles.filter((p) => p.image_url).slice(0, 4).map((p) => (
                  <span key={p.id} className="relative h-12 w-12 overflow-hidden rounded-full bg-paper ring-2 ring-brass/40">
                    <Image src={p.image_url!} alt="" fill sizes="48px" className="object-cover" />
                  </span>
                ))}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg text-ink sm:text-xl">Нужен один продукт?</p>
                <p className="mt-1 text-sm text-ink/70">Экстракты, капсулы и паучи по отдельности — в магазине</p>
              </div>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center gap-2 rounded-full bg-brass text-paper shadow-lg shadow-brass/20 transition-transform duration-300 group-hover:translate-x-1 sm:h-auto sm:w-auto sm:px-5 sm:py-3">
                <span className="hidden text-xs font-semibold uppercase tracking-[0.2em] sm:inline">В магазин</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4" aria-hidden>
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>
          </section>
        )}

        <RevealSection className="mt-24">
          <StateTimeline ctaHref={hasBundles ? '#sets' : undefined} />
        </RevealSection>

        {/* Сюда ведёт кнопка «Подробнее» в карточках наборов */}
        <RevealSection id="benefits" className="mt-24">
          <p className="text-sm uppercase tracking-widest text-stone">Преимущества</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">Что даёт каждый компонент</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {INGREDIENT_BENEFITS.map((group) => (
              <div key={group.title} className="card-glow rounded-lg bg-mist p-6 sm:p-7">
                <h3 className="font-display text-xl text-ink">{group.title}</h3>
                <p className="mt-1 text-xs uppercase tracking-wide text-brass">{group.subtitle}</p>
                <BenefitAccordion items={group.items} />
              </div>
            ))}
          </div>
        </RevealSection>

        <RevealSection className="mt-24">
          <p className="text-sm uppercase tracking-widest text-stone">Отзывы</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">Что говорят клиенты</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {REVIEWS.map((review) => (
              <div key={review.author} className="card-glow rounded-lg bg-mist p-6 sm:p-7">
                <p className="text-brass">★★★★★</p>
                <p className="mt-3 leading-relaxed text-stone">{review.text}</p>
                <p className="mt-4 text-sm text-ink">— {review.author}</p>
              </div>
            ))}
          </div>
        </RevealSection>

        <RevealSection className="mt-24 rounded-lg bg-mist p-8 sm:p-12">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:items-center">
            <div>
              <p className="text-sm uppercase tracking-widest text-stone">О бренде</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-ink">LUMO</h2>
              <p className="mt-4 leading-relaxed text-stone">
                LUMO производит функциональные концентраты из редких грибов по американскому стандарту качества.
                Каждая партия — полностью натуральное, сертифицированное сырьё, без лишних добавок. Наша цель — ясность
                мышления и сила тела без стимуляторов и компромиссов.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded bg-paper px-4 py-6 text-center">
                <p className="font-display text-2xl font-bold text-brass">🇺🇸</p>
                <p className="mt-2 text-xs uppercase tracking-wide text-stone">Американский стандарт</p>
              </div>
              <div className="rounded bg-paper px-4 py-6 text-center">
                <p className="font-display text-2xl font-bold text-brass">100%</p>
                <p className="mt-2 text-xs uppercase tracking-wide text-stone">Натуральное сырьё</p>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-paper/60 pt-8">
            <p className="text-xs uppercase tracking-wide text-stone">Проверка подлинности — NTIN-код товара</p>
            <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
              {NTIN_CODES.map((item) => (
                <div key={item.code} className="flex items-center justify-between gap-4 border-b border-paper/40 py-2 text-sm">
                  <span className="text-stone">{item.name}</span>
                  <span className="whitespace-nowrap font-mono text-ink">{item.code}</span>
                </div>
              ))}
            </div>
          </div>
        </RevealSection>

        <RevealSection className="mt-24 max-w-3xl">
          <p className="text-sm uppercase tracking-widest text-stone">Вопросы</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">Частые вопросы</h2>
          <FaqAccordion items={FAQ} />
        </RevealSection>
      </main>
    </>
  )
}
