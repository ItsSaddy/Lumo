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
}