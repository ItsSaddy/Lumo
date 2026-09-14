export type Product = {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  category: string | null
  spec: string | null
  is_available: boolean
  is_hero: boolean
  sort_order: number
  created_at: string
}