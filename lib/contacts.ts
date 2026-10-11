export const WHATSAPP_PHONE = '992993333366' // код страны без «+» и без пробелов
// Телефон для звонков (футер, документы) — отдельно от WhatsApp
export const PHONE = '77479935395'
export const PHONE_DISPLAY = '+7 747 993 53 95'

// Пустая строка — пункт не показывается в футере и в документах
export const EMAIL = 'lumo.help@bk.ru'
export const INSTAGRAM = 'lumo.energy' // ник без «@»

// Страница оплаты Kaspi Pay (ИП Алимоллаев): покупатель вводит сумму сам, оплату менеджер сверяет вручную
export const KASPI_PAY_LINK = 'https://pay.kaspi.kz/pay/u2xid9jo'

export const COMPANY = {
  name: 'ИП Алимоллаев',
  bin: '940516050612',
  city: 'Алматы',
}

export const INSTAGRAM_URL = INSTAGRAM ? `https://www.instagram.com/${INSTAGRAM}/` : ''

export function whatsappLink(text?: string) {
  return `https://wa.me/${WHATSAPP_PHONE}${text ? `?text=${encodeURIComponent(text)}` : ''}`
}
