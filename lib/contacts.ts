export const WHATSAPP_PHONE = '992993333366' // код страны без «+» и без пробелов

export function whatsappLink(text?: string) {
  return `https://wa.me/${WHATSAPP_PHONE}${text ? `?text=${encodeURIComponent(text)}` : ''}`
}
