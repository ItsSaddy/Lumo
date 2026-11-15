import type { Metadata, Viewport } from 'next'
import { Unbounded, Manrope, Golos_Text } from 'next/font/google'
import { CartProvider } from '@/lib/cart-context'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import './globals.css'
import { SITE_NAME, SITE_URL } from '@/lib/site'

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

// Заголовок и описание по умолчанию; страницы задают свой title — он подставится в шаблон «%s — Lumo».
// Картинка превью для соцсетей и мессенджеров — app/opengraph-image.jpg (Next подключает её сам)
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Lumo — экстракты ежовика и кордицепса с доставкой по Казахстану',
    template: '%s — Lumo',
  },
  description: 'Натуральные экстракты ежовика гребенчатого и кордицепса, капсулы и энергетические паучи без никотина. Наборы на курс, рассрочка Kaspi, доставка по Казахстану.',
  applicationName: SITE_NAME,
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    siteName: SITE_NAME,
    title: 'Lumo — экстракты ежовика и кордицепса',
    description: 'Натуральные экстракты ежовика гребенчатого и кордицепса, капсулы и энергетические паучи без никотина. Наборы на курс, рассрочка Kaspi, доставка по Казахстану.',
  },
  twitter: { card: 'summary_large_image' },
}

// Панель браузера на телефоне — в цвет фона сайта, а не белая
export const viewport: Viewport = {
  themeColor: '#0e0c11',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={`${unbounded.variable} ${manrope.variable} ${golos.variable} flex min-h-screen flex-col`}>
        <CartProvider>
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
        </CartProvider>
      </body>
    </html>
  )
}
