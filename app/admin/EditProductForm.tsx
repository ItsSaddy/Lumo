'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { safeFilePath } from '@/lib/storage'
import { updateProduct } from './actions'
import type { Product } from '@/lib/types'

export default function EditProductForm({ product }: { product: Product }) {
  const [name, setName] = useState(product.name)
  const [description, setDescription] = useState(product.description ?? '')
  const [price, setPrice] = useState(String(product.price))
  const [category, setCategory] = useState(product.category ?? '')
  const [spec, setSpec] = useState(product.spec ?? '')
  const [isAvailable, setIsAvailable] = useState(product.is_available)
  const [isHero, setIsHero] = useState(product.is_hero)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    let imageUrl = product.image_url

    if (file) {
      const supabase = createClient()
      const filePath = safeFilePath(file)
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file)

      if (uploadError) {
        setError('Не получилось загрузить фото: ' + uploadError.message)
        setLoading(false)
        return
      }

      const { data } = supabase.storage.from('products').getPublicUrl(filePath)
      imageUrl = data.publicUrl
    }

    const result = await updateProduct(product.id, {
      name,
      description,
      price: parseFloat(price),
      category,
      spec,
      image_url: imageUrl,
      is_available: isAvailable,
      is_hero: isHero,
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
      {product.image_url && !file && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={product.image_url} alt="" className="h-40 w-40 rounded object-cover" />
      )}
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
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-stone">Формат</label>
        <input type="text" placeholder="Напр. «20 мл» или «60 капсул»" value={spec}
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
        Показывать это фото фоном на главной
      </label>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-stone">Заменить фото (необязательно)</label>
        <input type="file" accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-full text-sm text-stone file:mr-3 file:rounded file:border-0 file:bg-brass/15 file:px-3 file:py-2 file:text-xs file:font-medium file:uppercase file:tracking-wide file:text-brass" />
      </div>
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