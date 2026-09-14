import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

type OrderItemRow = {
  quantity: number
  price_at_order: number
  products: { name: string } | null
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

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id, customer_name, phone, country, address, total_price, created_at,
      order_items ( quantity, price_at_order, products ( name ) )
    `)
    .order('created_at', { ascending: false })

  const list = (orders ?? []) as unknown as OrderRow[]

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-ink">Клиенты</h1>
        <a href="/admin" className="text-sm text-stone underline">← В админку</a>
      </div>

      {list.length === 0 && <p className="mt-8 text-stone">Пока никто не оставлял заявок.</p>}

      <div className="mt-8 flex flex-col gap-6">
        {list.map((order) => (
          <div key={order.id} className="rounded border border-mist p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-ink">{order.customer_name}</p>
                <p className="text-sm text-stone">{order.phone}</p>
                {order.country && <p className="text-sm text-brass">{order.country}</p>}
                <p className="text-sm text-stone">{order.address}</p>
              </div>
              <div className="text-right">
                <p className="font-price text-lg font-bold text-brass">{order.total_price} ₸</p>
                <p className="text-xs text-stone">{new Date(order.created_at).toLocaleString('ru-RU')}</p>
              </div>
            </div>
            <div className="mt-4 border-t border-mist pt-4">
              {order.order_items.map((item, i) => (
                <p key={i} className="text-sm text-stone">
                  {item.products?.name ?? 'Товар удалён'} × {item.quantity} — {item.price_at_order * item.quantity} ₸
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}