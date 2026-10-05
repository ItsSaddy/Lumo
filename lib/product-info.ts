import type { Product } from '@/lib/types'

// Старые товары без колонки images показывают единственное image_url
export function getProductImages(product: Pick<Product, 'image_url' | 'images'>): string[] {
  if (product.images?.length) return product.images
  return product.image_url ? [product.image_url] : []
}

export type ProductVariant = {
  key: string
  label: string
  // Не задана — берётся цена товара из БД
  price?: number
  // Своё фото варианта вместо фото товара (вкусы паучей)
  image?: string
  // Цвет метки вкуса
  color?: string
  comingSoon?: boolean
}

export type VariantGroup = { title: string; options: ProductVariant[] }

// Фасовки капсул: 120 шт — основная, 60 шт — половинная банка
const CAPSULE_VARIANTS: VariantGroup = {
  title: 'Фасовка',
  options: [
    { key: '120', label: '120 капсул', price: 16000 },
    { key: '60', label: '60 капсул', price: 8000 },
  ],
}

// Вкусы паучей: ментол в наличии (его фото — у самого товара), остальные пока «скоро в наличии»
const POUCH_FLAVORS: VariantGroup = {
  title: 'Вкус',
  options: [
    { key: 'menthol', label: 'Ментол', color: '#3fbfd0' },
    { key: 'bubble-gum', label: 'Бабл гам', color: '#e0a838', image: '/flavors/bubble-gum.jpg', comingSoon: true },
    { key: 'wild-berries', label: 'Лесные ягоды', color: '#9b7bd8', image: '/flavors/wild-berries.jpg', comingSoon: true },
    { key: 'strawberry', label: 'Клубника', color: '#e0483e', image: '/flavors/strawberry.jpg', comingSoon: true },
  ],
}

export function getProductVariants(product: Pick<Product, 'category'>): VariantGroup | null {
  if (product.category === 'Капсулы') return CAPSULE_VARIANTS
  if (product.category === 'Подушечки') return POUCH_FLAVORS
  return null
}

// Названия в БД набраны капсом — в составе наборов показываем «Ежовик гребенчатый»
export function displayName(name: string) {
  if (name !== name.toUpperCase()) return name
  const lower = name.toLowerCase()
  return lower.charAt(0).toUpperCase() + lower.slice(1)
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
