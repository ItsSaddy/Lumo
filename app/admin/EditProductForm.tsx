'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateProduct } from './actions'
import type { Product } from '@/lib/types'
import { getProductImages } from '@/lib/product-info'
import { BUNDLE_CATEGORY } from '@/lib/bundles'
import ProductImagesField, { photosFromUrls, uploadPhotos, type PhotoItem } from './ProductImagesField'
import BundleFields, { bundleDraftFrom, type BundleDraft } from './BundleFields'

// products — обычные товары, из которых собирается состав набора
export default function EditProductForm({ product, products }: { product: Product; products: Product[] }) {
  const [name, setName] = useState(product.name)
  const [description, setDescription] = useState(product.description ?? '')
  const [price, setPrice] = useState(String(product.price))
  const [category, setCategory] = useState(product.category ?? '')
  const [spec, setSpec] = useState(product.spec ?? '')
  const [isAvailable, setIsAvailable] = useState(product.is_available)
  const [isHero, setIsHero] = useState(product.is_hero)
  const [photos, setPhotos] = useState<PhotoItem[]>(() => photosFromUrls(getProductImages(product)))
  const [bundle, setBundle] = useState<BundleDraft>(() => bundleDraftFrom(product))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const isBundleForm = category === BUNDLE_CATEGORY

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Проверяем до загрузки фото, чтобы не оставлять в Storage лишних файлов
    if (isBundleForm && !bundle.items.some((item) => !item.gift)) {
      setError('Добавьте в набор хотя бы один продукт, который не идёт в подарок')
      setLoading(false)
      return
    }

    const { urls, error: uploadError } = await uploadPhotos(photos)
    if (uploadError) {
      setError(uploadError)
      setLoading(false)
      return
    }

    const result = await updateProduct(product.id, {
      name,
      description,
      price: parseFloat(price),
      category,
      spec,
      images: urls,
      is_available: isAvailable,
      is_hero: isHero,
      bundle: isBundleForm ? { items: bundle.items, badge: bundle.badge } : undefined,
    })

    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="card-glow mt-8 flex flex-col gap-4 rounded-lg bg-mist p-6 sm:p-8">
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-stone">Название</label>
        <input type="text" value={name}
          onChange={(e) => setName(e.target.value)} required
          className="w-full rounded border border-stone/30 bg-paper px-4 py-2.5 text-ink outline-none transition-colors focus:border-brass" />
      </div>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-stone">Описание</label>
        <textarea value={description} rows={3}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded border border-stone/30 bg-paper px-4 py-2.5 text-ink outline-none transition-colors focus:border-brass" />
      </div>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-stone">Цена, ₸</label>
        <input type="number" step="0.01" value={price}
          onChange={(e) => setPrice(e.target.value)} required
          className="w-full rounded border border-stone/30 bg-paper px-4 py-2.5 text-ink outline-none transition-colors focus:border-brass" />
      </div>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-stone">Категория</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded border border-stone/30 bg-paper px-4 py-2.5 text-ink outline-none transition-colors focus:border-brass">
          <option value="">Категория — не выбрана</option>
          <option value="Экстракты">Экстракты</option>
          <option value="Капсулы">Капсулы</option>
          <option value="Подушечки">Подушечки</option>
          <option value={BUNDLE_CATEGORY}>Наборы (комбо)</option>
        </select>
      </div>
      {isBundleForm && (
        <BundleFields products={products} value={bundle} onChange={setBundle} price={price} onPriceChange={setPrice} />
      )}
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-stone">{isBundleForm ? 'Срок курса' : 'Формат'}</label>
        <input type="text" placeholder={isBundleForm ? 'Напр. «30 дней» или «3 месяца»' : 'Напр. «20 мл» или «60 капсул»'} value={spec}
          onChange={(e) => setSpec(e.target.value)}
          className="w-full rounded border border-stone/30 bg-paper px-4 py-2.5 text-ink outline-none transition-colors focus:border-brass" />
      </div>
      <label className="flex items-center gap-2 text-sm text-stone">
        <input type="checkbox" checked={isAvailable}
          onChange={(e) => setIsAvailable(e.target.checked)} />
        В наличии
      </label>
      <label className="flex items-center gap-2 text-sm text-stone">
        <input type="checkbox" checked={isHero}
          onChange={(e) => setIsHero(e.target.checked)} />
        Показывать главное фото фоном на главной
      </label>
      <ProductImagesField photos={photos} onChange={setPhotos} />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="mt-2 flex gap-4">
        <button type="submit" disabled={loading}
          className="rounded-full bg-brass px-6 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-paper transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100">
          {loading ? 'Сохраняю...' : 'Сохранить изменения'}
        </button>
        <a href="/admin" className="rounded-full border border-stone/30 px-6 py-3 text-sm text-stone transition-colors hover:border-brass hover:text-brass">Отмена</a>
      </div>
    </form>
  )
}