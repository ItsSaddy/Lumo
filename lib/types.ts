// Позиция набора: товар каталога (с фасовкой/вкусом, если они есть) и количество; gift — идёт в подарок
export type BundleItem = {
  product_id: string
  variant?: string | null
  quantity: number
  gift?: boolean
}

export type BundleInfo = {
  items: BundleItem[]
  // Плашка на карточке, напр. «Хит продаж»
  badge?: string | null
}

export type Product = {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  // Все фото товара по порядку; image_url всегда совпадает с первым (его берут корзина и фон главной)
  images: string[] | null
  category: string | null
  spec: string | null
  is_available: boolean
  is_hero: boolean
  sort_order: number
  created_at: string
  // Состав — только у категории «Наборы»; колонку добавляет supabase/bundles.sql, до этого её нет
  bundle?: BundleInfo | null
}
