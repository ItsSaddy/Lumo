// Supabase Storage rejects non-ASCII characters in object keys (e.g. Cyrillic filenames),
// so the original file name is discarded and only its extension is kept.
export function safeFilePath(file: File): string {
  const extension = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
  return `${Date.now()}-${crypto.randomUUID()}.${extension}`
}
