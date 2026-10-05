import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import EditProductForm from '@/app/admin/EditProductForm'
import type { Product } from '@/lib/types'
import { isBundle } from '@/lib/bundles'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  // Все товары сразу: из обычных собирается состав, если это набор
  const { data } = await supabase
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true })

  const products = (data ?? []) as Product[]
  const product = products.find((p) => p.id === id)

  if (!product) {
    notFound()
  }

  return (
    <main className="mx-auto max-w-md px-4 py-10 sm:px-6 sm:py-16">
      <h1 className="font-display text-3xl text-ink">{isBundle(product) ? 'Изменить набор' : 'Изменить товар'}</h1>
      <EditProductForm product={product} products={products.filter((p) => !isBundle(p))} />
    </main>
  )
}