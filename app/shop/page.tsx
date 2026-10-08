import type { Metadata } from 'next'
import Link from 'next/link'
import { createPublicClient } from '@/lib/supabase/public'
import type { Product } from '@/lib/types'
import { isBundle, resolveBundle } from '@/lib/bundles'
import CatalogGrid from '@/components/CatalogGrid'
import ConsultationSection from '@/components/ConsultationSection'

export const metadata: Metadata = {
  title: 'Магазин — Lumo',
  description: 'Экстракты, капсулы и паучи LUMO по отдельности',
}

// Как и главная: статическая, обновляется после правок в админке и страховочно раз в час
export const revalidate = 3600

export default async function ShopPage() {
  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true })

  const products = (data ?? []) as Product[]
  const productsById = new Map(products.map((p) => [p.id, p]))
  const available = products.filter((p) => p.is_available)
  const singles = available.filter((p) => !isBundle(p))
  const maxDiscount = Math.max(0, ...available.filter(isBundle).map((b) => resolveBundle(b, productsById).discountPercent))

  return (
    <main className="mx-auto max-w-6xl px-5 pb-20 pt-10 sm:px-8 sm:pt-14 md:px-10">
      <p className="text-sm uppercase tracking-widest text-stone">Магазин</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">Продукты по отдельности</h1>

      {maxDiscount > 0 && (
        <Link href="/#sets"
          className="card-glow group mt-6 flex items-center gap-4 rounded-lg bg-mist p-5 transition-colors hover:bg-mist/80 sm:p-6">
          <div className="min-w-0 flex-1">
            <span className="inline-block rounded-full bg-brass px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-paper">
              Выгоднее до {maxDiscount}%
            </span>
            <p className="mt-3 font-display text-base text-ink sm:text-lg">Наборы на курс — дешевле, чем по отдельности</p>
          </div>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-paper text-brass transition-transform duration-300 group-hover:translate-x-1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4" aria-hidden>
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </Link>
      )}

      <div className="mt-10">
        {error
          ? <p className="text-red-400">Не получилось загрузить товары: {error.message}</p>
          : <CatalogGrid products={singles} />}
      </div>

      <section className="mt-24">
        <ConsultationSection />
      </section>
    </main>
  )
}
