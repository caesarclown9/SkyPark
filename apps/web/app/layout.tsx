import './globals.css'
import { Inter } from 'next/font/google'
import { Metadata, Viewport } from 'next'
import { ErrorBoundary } from '@/components/ui'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: 'Sky Park | Детские развлекательные центры Бишкека',
  description: 'Лучшие детские развлекательные центры в Бишкеке. Безопасные игровые зоны, современные аттракционы, система лояльности и удобное бронирование через приложение.',
  keywords: 'sky park, детские центры, развлечения, бишкек, кыргызстан, игровые зоны, аттракционы',
  authors: [{ name: 'Sky Park Development Team' }],
  creator: 'Sky Park',
  publisher: 'Sky Park',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'ru_KG',
    url: 'https://skypark.kg',
    siteName: 'Sky Park',
    title: 'Sky Park | Детские развлекательные центры Бишкека',
    description: 'Лучшие детские развлекательные центры в Бишкеке',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Sky Park - Детские развлекательные центры',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sky Park | Детские развлекательные центры Бишкека',
    description: 'Лучшие детские развлекательные центры в Бишкеке',
    images: ['/og-image.jpg'],
  },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <head>
        <meta name="theme-color" content="#0ea5e9" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={inter.className}>
        <div id="root">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </div>
        <div id="modal-root" />
        <div id="toast-root" />
      </body>
    </html>
  )
} 