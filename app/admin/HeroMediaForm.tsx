'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { safeFilePath } from '@/lib/storage'
import { updateHeroMedia } from './actions'

export default function HeroMediaForm({
  currentUrl,
  currentType,
}: {
  currentUrl: string | null
  currentType: 'image' | 'video' | null
}) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    setLoading(true)
    setError(null)

    const mediaType: 'image' | 'video' = file.type.startsWith('video/') ? 'video' : 'image'
    const supabase = createClient()
    const filePath = safeFilePath(file)
    const { error: uploadError } = await supabase.storage.from('products').upload(filePath, file)

    if (uploadError) {
      setError('Не получилось загрузить файл: ' + uploadError.message)
      setLoading(false)
      return
    }

    const { data } = supabase.storage.from('products').getPublicUrl(filePath)
    const result = await updateHeroMedia(data.publicUrl, mediaType)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setFile(null)
    setLoading(false)
    router.refresh()
  }

  async function handleClear() {
    setLoading(true)
    setError(null)
    const result = await updateHeroMedia(null, null)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="mt-6">
      {currentUrl && (
        <div className="mb-4 h-40 w-full overflow-hidden rounded bg-paper">
          {currentType === 'video' ? (
            <video src={currentUrl} className="h-full w-full object-cover" muted loop autoPlay playsInline />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={currentUrl} alt="" className="h-full w-full object-cover" />
          )}
        </div>
      )}
      <form onSubmit={handleUpload} className="flex flex-wrap items-center gap-3">
        <input type="file" accept="image/*,video/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="text-sm text-stone file:mr-3 file:rounded file:border-0 file:bg-brass/15 file:px-3 file:py-2 file:text-xs file:font-medium file:uppercase file:tracking-wide file:text-brass" />
        <button type="submit" disabled={!file || loading}
          className="rounded-full bg-brass px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-paper disabled:opacity-50">
          {loading ? 'Загружаю...' : 'Загрузить'}
        </button>
        {currentUrl && (
          <button type="button" onClick={handleClear} disabled={loading}
            className="rounded-full border border-stone/30 px-5 py-2.5 text-xs text-stone transition-colors hover:border-brass hover:text-brass disabled:opacity-50">
            Убрать
          </button>
        )}
      </form>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      <p className="mt-2 text-xs text-stone">
        Картинка или видео (mp4) — видео будет крутиться в цикле без звука. Если ничего не загружено, фон подберётся автоматически из фото товаров.
      </p>
    </div>
  )
}
