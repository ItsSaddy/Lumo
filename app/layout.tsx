import type { Metadata } from 'next'
import { Unbounded, Manrope, Golos_Text } from 'next/font/google'
import { CartProvider } from '@/lib/cart-context'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import './globals.css'
import WhatsAppButton from '@/components/WhatsAppButton'

const unbounded = Unbounded({
  subsets: ['latin', 'cyrillic'],
  weight: ['600', '700'],
  variable: '--font-unbounded',
  display: 'swap',
})

const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-manrope',
  display: 'swap',
})

const golos = Golos_Text({
  subsets: ['latin', 'cyrillic'],
  weight: ['700'],
  variable: '--font-golos',
  display: 'swap',
  // Шрифт цен нужен только ниже первого экрана — не тормозим им начальную загрузку
  preload: false,
})

export const metadata: Metadata = {
  title: 'Lumo',
  description: 'Lumo — премиальные растительные экстракты',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={`${unbounded.variable} ${manrope.variable} ${golos.variable} flex min-h-screen flex-col`}>
        <CartProvider>
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
          <WhatsAppButton />
        </CartProvider>
      </body>
    </html>
  )
}
