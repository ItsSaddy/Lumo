'use client'

import { createClient } from '@/lib/supabase/client'
import { safeFilePath } from '@/lib/storage'

export type PhotoItem =
  | { kind: 'url'; url: string }
  | { kind: 'file'; file: File; preview: string }

export function photosFromUrls(urls: string[]): PhotoItem[] {
  return urls.map((url) => ({ kind: 'url', url }))
}

// Загружает новые файлы в Storage и возвращает итоговый список URL в выбранном порядке
export async function uploadPhotos(photos: PhotoItem[]): Promise<{ urls: string[]; error: string | null }> {
  const supabase = createClient()
  const urls: string[] = []

  for (const photo of photos) {
    if (photo.kind === 'url') {
      urls.push(photo.url)
      continue
    }
    const filePath = safeFilePath(photo.file)
    const { error } = await supabase.storage.from('products').upload(filePath, photo.file)
    if (error) return { urls: [], error: 'Не получилось загрузить фото: ' + error.message }
    urls.push(supabase.storage.from('products').getPublicUrl(filePath).data.publicUrl)
  }

  return { urls, error: null }
}

export default function ProductImagesField({
  photos,
  onChange,
}: {
  photos: PhotoItem[]
  onChange: (photos: PhotoItem[]) => void
}) {
  function addFiles(files: FileList | null) {
    if (!files) return
    const added: PhotoItem[] = Array.from(files).map((file) => ({ kind: 'file', file, preview: URL.createObjectURL(file) }))
    onChange([...photos, ...added])
  }

  function remove(index: number) {
    const photo = photos[index]
    if (photo.kind === 'file') URL.revokeObjectURL(photo.preview)
    onChange(photos.filter((_, j) => j !== index))
  }

  function move(index: number, delta: number) {
    const target = index + delta
    if (target < 0 || target >= photos.length) return
    const next = [...photos]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  return (
    <div>
      <label className="mb-1 block text-xs uppercase tracking-wide text-stone">
        Фото — первое показывается главным, остальные листаются в карточке
      </label>

      {photos.length > 0 && (
        <div className="mb-3 grid grid-cols-3 gap-2">
          {photos.map((photo, i) => (
            <div key={photo.kind === 'url' ? photo.url : photo.preview} className="relative overflow-hidden rounded bg-paper">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.kind === 'url' ? photo.url : photo.preview} alt="" className="aspect-4/5 w-full object-cover" />
              {i === 0 && (
                <span className="absolute left-1 top-1 rounded bg-brass px-1.5 py-0.5 text-[10px] font-semibold uppercase text-paper">Главное</span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-paper/80 text-ink">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0}
                  className="px-2 py-1 text-sm disabled:opacity-30" aria-label="Сдвинуть влево">←</button>
                <button type="button" onClick={() => remove(i)}
                  className="px-2 py-1 text-sm text-red-400" aria-label="Удалить фото">✕</button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === photos.length - 1}
                  className="px-2 py-1 text-sm disabled:opacity-30" aria-label="Сдвинуть вправо">→</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <input type="file" accept="image/*" multiple
        onChange={(e) => {
          addFiles(e.target.files)
          e.target.value = ''
        }}
        className="w-full text-sm text-stone file:mr-3 file:rounded file:border-0 file:bg-brass/15 file:px-3 file:py-2 file:text-xs file:font-medium file:uppercase file:tracking-wide file:text-brass" />
    </div>
  )
}
