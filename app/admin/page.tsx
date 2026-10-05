import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Product } from '@/lib/types'
import { describeBundle, isBundle, resolveBundle } from '@/lib/bundles'
import { formatPrice } from '@/lib/format'
import AddProductForm from './AddProductForm'
import DeleteProductButton from './DeleteProductButton'
import HeroMediaForm from './HeroMediaForm'
import ReorderButtons from './ReorderButtons'

function ProductRow({ product, index, total, details }: { product: Product; index: number; total: number; details?: string }) {
  return (
    // flex-wrap: на телефоне ссылки «Изменить/Удалить» уходят на вторую строку, а не сжимают название
    <div className="card-glow flex flex-wrap items-center gap-x-4 gap-y-3 rounded-lg bg-mist p-4">
      <ReorderButtons id={product.id} isFirst={index === 0} isLast={index === total - 1} />
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-paper">
        {product.image_url && (
          <Image src={product.image_url} alt="" fill sizes="56px" className="object-cover" />
        )}
      </div>
      <div className="min-w-0 flex-1 basis-40">
        <p className="truncate text-ink">{product.name}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <span className="font-price text-sm font-bold text-brass">{formatPrice(product.price)}</span>
          {product.spec && (
            <span className="rounded-full bg-paper px-2.5 py-0.5 text-[11px] uppercase tracking-wide text-stone">{product.spec}</span>
          )}
          {product.category && !isBundle(product) && (
            <span className="rounded-full bg-paper px-2.5 py-0.5 text-[11px] uppercase tracking-wide text-stone">
              {product.category}
            </span>
          )}
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide ${
            product.is_available ? 'bg-emerald-500/15 text-emerald-400' : 'bg-stone/15 text-stone'
          }`}>
            {product.is_available ? 'В наличии' : 'Скрыт'}
          </span>
        </div>
        {details && <p className="mt-1.5 text-xs leading-relaxed text-stone">{details}</p>}
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-4">
        <a href={`/admin/products/${product.id}/edit`} className="text-sm text-brass underline underline-offset-4">
          Изменить
        </a>
        <DeleteProductButton id={product.id} />
      </div>
    </div>
  )
}

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true })

  const { data: siteSettings } = await supabase
    .from('site_settings')
    .select('hero_media_url, hero_media_type')
    .eq('id', 1)
    .maybeSingle()

  const all = (products ?? []) as Product[]
  const productsById = new Map(all.map((p) => [p.id, p]))
  const bundles = all.filter(isBundle)
  const singles = all.filter((p) => !isBundle(p))

  async function handleLogout() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/admin/login')
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-mist/60 pb-8">
        <div>
          <span className="metal-text font-display text-sm font-bold tracking-[0.2em]">LUMO</span>
          <h1 className="mt-1 font-display text-3xl text-ink">Админка</h1>
          <p className="mt-2 text-sm text-stone">Вошёл как {user.email}</p>
        </div>
        <div className="flex items-center gap-4">
          <a href="/admin/clients" className="text-sm text-brass underline underline-offset-4">Клиенты</a>
          <form action={handleLogout}>
            <button type="submit" className="text-sm text-stone underline underline-offset-4 hover:text-ink">Выйти</button>
          </form>
        </div>
      </div>

      <section className="card-glow mt-10 rounded-lg bg-mist p-6 sm:p-8">
        <h2 className="font-display text-xl text-ink">Фон главной страницы</h2>
        <HeroMediaForm
          currentUrl={siteSettings?.hero_media_url ?? null}
          currentType={(siteSettings?.hero_media_type as 'image' | 'video' | null) ?? null}
        />
      </section>

      <section className="card-glow mt-6 rounded-lg bg-mist p-6 sm:p-8">
        <h2 className="font-display text-xl text-ink">Добавить товар или набор</h2>
        <p className="mt-2 text-sm text-stone">Чтобы собрать набор (комбо), выберите категорию «Наборы» — появится выбор состава.</p>
        <AddProductForm products={singles} />
      </section>

      <section className="mt-12">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-xl text-ink">Наборы</h2>
          <span className="text-sm text-stone">{bundles.length} всего · на главной</span>
        </div>
        <div className="mt-6 flex flex-col gap-3">
          {bundles.map((product, index) => (
            <ProductRow key={product.id} product={product} index={index} total={bundles.length}
              details={describeBundle(resolveBundle(product, productsById).lines)} />
          ))}
          {bundles.length === 0 && (
            <p className="rounded-lg border border-dashed border-mist p-6 text-center text-sm text-stone">
              Наборов пока нет — соберите первый через форму выше. Если при сохранении ошибка про колонку —
              выполните supabase/bundles.sql в Supabase (SQL Editor).
            </p>
          )}
        </div>
      </section>

      <section className="mt-12">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-xl text-ink">Товары</h2>
          <span className="text-sm text-stone">{singles.length} всего · в магазине</span>
        </div>
        <div className="mt-6 flex flex-col gap-3">
          {singles.map((product, index) => (
            <ProductRow key={product.id} product={product} index={index} total={singles.length} />
          ))}
          {singles.length === 0 && (
            <p className="rounded-lg border border-dashed border-mist p-6 text-center text-sm text-stone">
              Пока нет ни одного товара — добавь первый выше.
            </p>
          )}
        </div>
      </section>
    </main>
  )
}
