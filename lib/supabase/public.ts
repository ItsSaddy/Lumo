import { createClient } from '@supabase/supabase-js'

// Клиент без cookies для публичных данных витрины: страница не зависит от запроса
// и может рендериться статически, а после правок в админке её обновляет revalidatePath('/')
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}
