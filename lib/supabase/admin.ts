import { createClient } from '@supabase/supabase-js'

// Клиент с секретным ключом — обходит RLS. Только для серверного кода без сессии админа:
// вебхук оплаты и проверка статуса заказа. Никогда не импортировать в клиентские компоненты.
// null, пока SUPABASE_SECRET_KEY не задан — оплата по QR тогда просто выключена
export function createAdminClient() {
  const key = process.env.SUPABASE_SECRET_KEY
  if (!key) return null
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
