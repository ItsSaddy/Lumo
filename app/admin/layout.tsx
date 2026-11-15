import type { Metadata } from 'next'
import type { ReactNode } from 'react'

// Админку не индексируем, даже если поисковик найдёт ссылку (robots.txt её тоже закрывает)
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children
}
