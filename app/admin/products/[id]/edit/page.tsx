import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import EditProductForm from '@/app/admin/EditProductForm'

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

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (!product) {
    notFound()
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="font-display text-3xl text-ink">Изменить товар</h1>
      <EditProductForm product={product} />
    </main>
  )
}