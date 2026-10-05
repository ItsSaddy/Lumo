import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Product } from '@/lib/types'
import { describeBundle, isBundle, resolveBundle } from '@/lib/bundles'
import { formatPrice } from '@/lib/format'

type OrderItemRow = {
  quantity: number
  price_at_order: number
  products: Product | null
}

type OrderRow = {
  id: string
  customer_name: string
  phone: string
  country: string | null
  address: string
  total_price: number
  created_at: string
  order_items: OrderItemRow[]
}

export default async function ClientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  // products(*), а не перечень колонок: так запрос не падает, пока колонки bundle ещё нет в базе
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id, customer_name, phone, country, address, total_price, created_at,
      order_items ( quantity, price_at_order, products ( * ) )
    `)
    .order('created_at', { ascending: false })

  // Справочник товаров — чтобы расписать состав заказанных наборов
  const { data: products } = await supabase.from('products').select('*')
  const productsById = new Map(((products ?? []) as Product[]).map((p) => [p.id, p]))

  const list = (orders ?? []) as unknown as OrderRow[]

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-ink">Клиенты</h1>
        <a href="/admin" className="text-sm text-stone underline">← В админку</a>
      </div>

      {list.length === 0 && <p className="mt-8 text-stone">Пока никто не оставлял заявок.</p>}

      <div className="mt-8 flex flex-col gap-6">
        {list.map((order) => (
          <div key={order.id} className="rounded border border-mist p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-ink">{order.customer_name}</p>
                <p className="text-sm text-stone">{order.phone}</p>
                {order.country && <p className="text-sm text-brass">{order.country}</p>}
                <p className="text-sm text-stone">{order.address}</p>
              </div>
              <div className="text-right">
                <p className="whitespace-nowrap font-price text-lg font-bold text-brass">{formatPrice(order.total_price)}</p>
                <p className="text-xs text-stone">{new Date(order.created_at).toLocaleString('ru-RU')}</p>
              </div>
            </div>
            <div className="mt-4 border-t border-mist pt-4">
              {order.order_items.map((item, i) => (
                <div key={i} className="py-0.5 text-sm text-stone">
                  <p>
                    {item.products?.name ?? 'Товар удалён'}{item.products?.spec ? ` · ${item.products.spec}` : ''} × {item.quantity} — {formatPrice(item.price_at_order * item.quantity)}
                  </p>
                  {item.products && isBundle(item.products) && (
                    <p className="mt-0.5 pl-3 text-xs text-stone/80">
                      {describeBundle(resolveBundle(item.products, productsById).lines)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}