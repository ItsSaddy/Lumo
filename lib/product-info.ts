import type { Product } from '@/lib/types'

// Старые товары без колонки images показывают единственное image_url
export function getProductImages(product: Pick<Product, 'image_url' | 'images'>): string[] {
  if (product.images?.length) return product.images
  return product.image_url ? [product.image_url] : []
}

export type ProductVariant = {
  key: string
  label: string
  price: number
}

// Фасовки капсул: 120 шт — основная (цена из БД), 60 шт — половинная банка
const CAPSULE_VARIANTS: ProductVariant[] = [
  { key: '120', label: '120 капсул', price: 16000 },
  { key: '60', label: '60 капсул', price: 8000 },
]

export function getProductVariants(product: Pick<Product, 'category'>): ProductVariant[] | null {
  return product.category === 'Капсулы' ? CAPSULE_VARIANTS : null
}

export const CORDYCEPS_BENEFITS = [
  'Заряд энергии и выносливости',
  'Восстановление тестостерона и мужского здоровья',
  'Естественное повышение либидо и тонуса',
  'Быстрое восстановление после нагрузок',
]

export const LIONS_MANE_BENEFITS = [
  'Укрепляет нервную систему',
  'Улучшает память, сон и концентрацию',
  'Снимает стресс и тревожность',
  'Ускоряет усвоение информации',
]

// Пункты преимуществ зависят от гриба, а не от формы выпуска
export function getProductBenefits(product: Pick<Product, 'name'>): string[] | null {
  const name = product.name.toLowerCase()
  if (name.includes('кордицепс')) return CORDYCEPS_BENEFITS
  if (name.includes('ежовик')) return LIONS_MANE_BENEFITS
  return null
}
