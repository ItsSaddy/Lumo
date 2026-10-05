'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { BundleInfo } from '@/lib/types'
import { isBundle } from '@/lib/bundles'

// Колонки products.images и products.bundle добавляют вручную в Supabase — без них сохранение падает с непонятной ошибкой
function productError(error: { code?: string; message: string }) {
  if (error.code === 'PGRST204' && error.message.includes('images')) {
    return 'В базе нет колонки для нескольких фото — выполните SQL из инструкции в Supabase (SQL Editor)'
  }
  if (error.code === 'PGRST204' && error.message.includes('bundle')) {
    return 'В базе нет колонки для наборов — выполните SQL из файла supabase/bundles.sql в Supabase (SQL Editor)'
  }
  return error.message
}

// Витрина: главная (наборы) и магазин (отдельные товары)
function revalidateStorefront() {
  revalidatePath('/admin')
  revalidatePath('/')
  revalidatePath('/shop')
}

type ProductInput = {
  name: string
  description: string
  price: number
  category: string
  spec: string
  images: string[]
  is_available?: boolean
  is_hero?: boolean
  bundle?: BundleInfo | null
}

// Состав приходит из браузера — приводим к ожидаемой форме перед записью в jsonb
function cleanBundle(bundle: BundleInfo | null | undefined): BundleInfo {
  return {
    items: (bundle?.items ?? [])
      .filter((item) => typeof item.product_id === 'string' && item.product_id)
      .map((item) => ({
        product_id: item.product_id,
        variant: item.variant || null,
        quantity: Math.min(99, Math.max(1, Math.round(Number(item.quantity) || 1))),
        gift: Boolean(item.gift),
      })),
    badge: bundle?.badge?.trim() || null,
  }
}

// Поля для insert/update. bundle передаём только наборам: обычные товары
// сохраняются и в базе, где колонку bundle ещё не добавили
function productFields(product: ProductInput): { fields: Record<string, unknown>; error?: string } {
  const fields: Record<string, unknown> = {
    name: product.name,
    description: product.description || null,
    price: product.price,
    category: product.category || null,
    spec: product.spec || null,
    image_url: product.images[0] ?? null,
    images: product.images,
  }
  if (isBundle(product)) {
    const bundle = cleanBundle(product.bundle)
    if (!bundle.items.some((item) => !item.gift)) {
      return { fields, error: 'Добавьте в набор хотя бы один продукт, который не идёт в подарок' }
    }
    fields.bundle = bundle
  }
  return { fields }
}

export async function addProduct(product: ProductInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Не авторизован' }

  const { fields, error: inputError } = productFields(product)
  if (inputError) return { error: inputError }

  const { data: lastProduct } = await supabase
    .from('products')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { error } = await supabase.from('products').insert({
    ...fields,
    sort_order: (lastProduct?.sort_order ?? 0) + 1,
  })

  if (error) return { error: productError(error) }

  revalidateStorefront()
  return { error: null }
}

export async function updateProduct(id: string, product: ProductInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Не авторизован' }

  const { fields, error: inputError } = productFields(product)
  if (inputError) return { error: inputError }

  if (product.is_hero) {
    // Ровно один товар может быть фоном главной — снимаем флаг с остальных
    const { error: clearError } = await supabase.from('products').update({ is_hero: false }).neq('id', id)
    if (clearError) return { error: clearError.message }
  }

  const { error } = await supabase
    .from('products')
    .update({
      ...fields,
      is_available: product.is_available,
      is_hero: product.is_hero ?? false,
    })
    .eq('id', id)

  if (error) return { error: productError(error) }

  revalidateStorefront()
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
    .select('id, sort_order, category')
    .order('sort_order', { ascending: true })

  if (fetchError) return { error: fetchError.message }

  // Наборы и обычные товары в админке — отдельные списки, порядок меняем внутри своего
  const target = products.find((p) => p.id === id)
  if (!target) return { error: null }
  const group = products.filter((p) => isBundle(p) === isBundle(target))

  const index = group.findIndex((p) => p.id === id)
  const swapIndex = direction === 'up' ? index - 1 : index + 1
  if (swapIndex < 0 || swapIndex >= group.length) return { error: null }

  const current = group[index]
  const neighbor = group[swapIndex]

  const { error: e1 } = await supabase.from('products').update({ sort_order: neighbor.sort_order }).eq('id', current.id)
  if (e1) return { error: e1.message }

  const { error: e2 } = await supabase.from('products').update({ sort_order: current.sort_order }).eq('id', neighbor.id)
  if (e2) return { error: e2.message }

  revalidateStorefront()
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

  revalidateStorefront()
  return { error: null }
}
