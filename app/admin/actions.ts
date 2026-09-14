'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type ProductInput = {
  name: string
  description: string
  price: number
  category: string
  spec: string
  image_url: string | null
  is_available?: boolean
  is_hero?: boolean
}

export async function addProduct(product: ProductInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Не авторизован' }

  const { data: lastProduct } = await supabase
    .from('products')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { error } = await supabase.from('products').insert({
    name: product.name,
    description: product.description || null,
    price: product.price,
    category: product.category || null,
    image_url: product.image_url,
    sort_order: (lastProduct?.sort_order ?? 0) + 1,
  })

  if (error) return { error: error.message }

  revalidatePath('/admin')
  revalidatePath('/')
  return { error: null }
}

export async function updateProduct(id: string, product: ProductInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Не авторизован' }

  if (product.is_hero) {
    // Ровно один товар может быть фоном главной — снимаем флаг с остальных
    const { error: clearError } = await supabase.from('products').update({ is_hero: false }).neq('id', id)
    if (clearError) return { error: clearError.message }
  }

  const { error } = await supabase
    .from('products')
    .update({
      name: product.name,
      description: product.description || null,
      price: product.price,
      category: product.category || null,
      image_url: product.image_url,
      is_available: product.is_available,
      is_hero: product.is_hero ?? false,
    })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin')
  revalidatePath('/')
  return { error: null }
}

export async function updateHeroMedia(mediaUrl: string | null, mediaType: 'image' | 'video' | null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Не авторизован' }

  const { error } = await supabase
    .from('site_settings')
    .upsert({ id: 1, hero_media_url: mediaUrl, hero_media_type: mediaType })

  if (error) return { error: error.message }

  revalidatePath('/')
  return { error: null }
}

export async function moveProduct(id: string, direction: 'up' | 'down') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Не авторизован' }

  const { data: products, error: fetchError } = await supabase
    .from('products')
    .select('id, sort_order')
    .order('sort_order', { ascending: true })

  if (fetchError) return { error: fetchError.message }

  const index = products.findIndex((p) => p.id === id)
  const swapIndex = direction === 'up' ? index - 1 : index + 1
  if (index === -1 || swapIndex < 0 || swapIndex >= products.length) return { error: null }

  const current = products[index]
  const neighbor = products[swapIndex]

  const { error: e1 } = await supabase.from('products').update({ sort_order: neighbor.sort_order }).eq('id', current.id)
  if (e1) return { error: e1.message }

  const { error: e2 } = await supabase.from('products').update({ sort_order: current.sort_order }).eq('id', neighbor.id)
  if (e2) return { error: e2.message }

  revalidatePath('/admin')
  revalidatePath('/')
  return { error: null }
}

export async function deleteProduct(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Не авторизован' }

  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) {
    if (error.code === '23503') {
      return { error: 'Нельзя удалить — по этому товару уже есть заказы. Сними галочку «В наличии» в редактировании, чтобы скрыть его из каталога, не потеряв историю заказов.' }
    }
    return { error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/')
  return { error: null }
}
