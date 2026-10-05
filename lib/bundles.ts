import type { Product } from '@/lib/types'
import { displayName, getProductVariants } from '@/lib/product-info'

// Наборы (комбо) — обычные строки products с этой категорией и составом в колонке bundle.
// Так их фото, цена, порядок и наличие правятся в той же админке, а order_items ссылаются на них как на товар
export const BUNDLE_CATEGORY = 'Наборы'

export function isBundle(product: Pick<Product, 'category'>) {
  return product.category === BUNDLE_CATEGORY
}

// Форма выпуска для строки состава, если у товара нет ни фасовки, ни заполненного «Формата»
const FORM_BY_CATEGORY: Record<string, string> = {
  'Экстракты': 'жидкий экстракт, 20 мл',
}

export function getUnitPrice(product: Pick<Product, 'category' | 'price'>, variantKey?: string | null) {
  const variant = getProductVariants(product)?.options.find((v) => v.key === variantKey)
  return variant?.price ?? product.price
}

export type BundleLine = {
  key: string
  name: string
  // Форма выпуска для карточки: фасовка, «Формат» товара или форма по категории
  form: string | null
  // Только выбранная фасовка/вкус — в строке состава остальное лишнее
  variant: string | null
  quantity: number
  gift: boolean
  unitPrice: number
  image: string | null
}

export type ResolvedBundle = {
  lines: BundleLine[]
  // Сумма платных позиций по отдельности — показывается зачёркнутой
  regularTotal: number
  giftTotal: number
  // Выгода покупателя: скидка плюс стоимость подарков
  savings: number
  discountPercent: number
}

export function resolveBundle(bundle: Product, productsById: Map<string, Product>): ResolvedBundle {
  const lines = (bundle.bundle?.items ?? []).flatMap((item, i): BundleLine[] => {
    const product = productsById.get(item.product_id)
    // Товар удалили из базы — позиция просто пропадает из состава
    if (!product) return []
    const variant = getProductVariants(product)?.options.find((v) => v.key === item.variant)
    return [{
      key: `${i}:${item.product_id}`,
      name: displayName(product.name),
      form: variant?.label ?? product.spec ?? (product.category && FORM_BY_CATEGORY[product.category]) ?? null,
      variant: variant?.label ?? null,
      quantity: item.quantity,
      gift: Boolean(item.gift),
      unitPrice: variant?.price ?? product.price,
      image: variant?.image ?? product.image_url,
    }]
  })

  const sum = (gift: boolean) =>
    lines.filter((l) => l.gift === gift).reduce((total, l) => total + l.unitPrice * l.quantity, 0)
  const regularTotal = sum(false)
  const giftTotal = sum(true)

  return {
    lines,
    regularTotal,
    giftTotal,
    savings: Math.max(0, regularTotal + giftTotal - bundle.price),
    discountPercent: regularTotal > bundle.price ? Math.round((1 - bundle.price / regularTotal) * 100) : 0,
  }
}

// Состав одной строкой — для корзины, уведомления в Telegram и списка заявок
export function describeBundle(lines: BundleLine[]) {
  const format = (l: BundleLine) => `${l.name}${l.variant ? ` (${l.variant})` : ''} ×${l.quantity}`
  const paid = lines.filter((l) => !l.gift).map(format).join(', ')
  const gifts = lines.filter((l) => l.gift).map(format).join(', ')
  return gifts ? `${paid} + в подарок: ${gifts}` : paid
}
