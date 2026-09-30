// Supabase Storage rejects non-ASCII characters in object keys (e.g. Cyrillic filenames),
// so the original file name is discarded and only its extension is kept.
export function safeFilePath(file: File): string {
  const extension = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
  return `${Date.now()}-${crypto.randomUUID()}.${extension}`
}

const MAX_IMAGE_SIDE = 2000
const COMPRESS_THRESHOLD_BYTES = 400 * 1024

// Сжимает фото с телефона (часто 3–10 МБ) до WebP ≤2000px перед загрузкой в Storage.
// Видео, GIF и уже маленькие файлы не трогаем; при любой ошибке возвращаем оригинал.
export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif' || file.size < COMPRESS_THRESHOLD_BYTES) return file

  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.85))
    if (!blob || blob.type !== 'image/webp' || blob.size >= file.size) return file
    return new File([blob], 'photo.webp', { type: 'image/webp' })
  } catch {
    return file
  }
}
