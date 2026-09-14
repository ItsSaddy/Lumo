'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { safeFilePath } from '@/lib/storage'
import { addProduct } from './actions'

export default function AddProductForm() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [spec, setSpec] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    let imageUrl: string | null = null

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

    const result = await addProduct({
      name,
      description,
      price: parseFloat(price),
      category,
      spec,
      image_url: imageUrl,
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
    setFile(null)
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
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-stone">Формат</label>
        <input type="text" placeholder="Напр. «20 мл» или «60 капсул»" value={spec}
          onChange={(e) => setSpec(e.target.value)}
          className="w-full rounded border border-stone/30 bg-paper px-4 py-2.5 text-ink outline-none transition-colors focus:border-brass" />
      </div>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-stone">Фото</label>
        <input type="file" accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-full text-sm text-stone file:mr-3 file:rounded file:border-0 file:bg-brass/15 file:px-3 file:py-2 file:text-xs file:font-medium file:uppercase file:tracking-wide file:text-brass" />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button type="submit" disabled={loading}
        className="mt-2 rounded-full bg-brass py-3 text-sm font-semibold uppercase tracking-[0.15em] text-paper transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100">
        {loading ? 'Сохраняю...' : 'Добавить товар'}
      </button>
    </form>
  )
}