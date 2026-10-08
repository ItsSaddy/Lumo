import { COMPANY, EMAIL, PHONE_DISPLAY } from '@/lib/contacts'

// Общие данные для «Документов». Тексты — шаблон: перед публикацией их стоит показать юристу
export const SITE_DOMAIN = 'health-lumo.org'
export const LEGAL_UPDATED = '6 октября 2026 г.'

export const OPERATOR = `${COMPANY.name} (БИН ${COMPANY.bin}, г. ${COMPANY.city}, Республика Казахстан)`

export const CONTACT_LINE = `WhatsApp и телефон ${PHONE_DISPLAY}${EMAIL ? `, email ${EMAIL}` : ''}`

export const PERSONAL_DATA_LAW = 'Закон Республики Казахстан от 21 мая 2013 года № 94-V «О персональных данных и их защите»'
