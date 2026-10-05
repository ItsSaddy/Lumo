'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Product } from '@/lib/types'
import { BUNDLE_CATEGORY } from '@/lib/bundles'
import { addProduct } from './actions'
import ProductImagesField, { uploadPhotos, type PhotoItem } from './ProductImagesField'
import BundleFields, { bundleDraftFrom, type BundleDraft } from './BundleFields'

// products — обычные товары, из которых собирается состав набора
export default function AddProductForm({ products }: { products: Product[] }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [spec, setSpec] = useState('')
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [bundle, setBundle] = useState<BundleDraft>(() => bundleDraftFrom())
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

    const result = await addProduct({
      name,
      description,
      price: parseFloat(price),
      category,
      spec,
      images: urls,
      bundle: isBundleForm ? { items: bundle.items, badge: bundle.badge } : undefined,
    })

    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setName('')
    setDescription('')
    setPrice('')
    setCategory('')
    setSpec('')
    setPhotos([])
    setBundle(bundleDraftFrom())
    setLoading(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex max-w-md flex-col gap-4">
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
      <ProductImagesField photos={photos} onChange={setPhotos} />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button type="submit" disabled={loading}
        className="mt-2 rounded-full bg-brass py-3 text-sm font-semibold uppercase tracking-[0.15em] text-paper transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100">
        {loading ? 'Сохраняю...' : isBundleForm ? 'Добавить набор' : 'Добавить товар'}
      </button>
    </form>
  )
}