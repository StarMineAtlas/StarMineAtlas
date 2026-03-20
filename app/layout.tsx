import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { I18nProvider } from '@/components/I18nProvider'
import '../styles/globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Star Mine Atlas',
  description: "Star Mine Atlas is the ultimate mining guide for Star Citizen: discover rocks, minerals, modules, gadgets, market prices, and optimize your mining sessions. Tips, comparisons, and tools for all miners, beginners or experts.",
  icons: {
    icon: [
      {
        url: '/icon1.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon1.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon0.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
    shortcut: '/favicon.ico',
  },
  openGraph: {
    title: 'Star Mine Atlas',
    description: "The complete mining guide for Star Citizen: rocks, minerals, modules, gadgets, market prices, and tips.",
    url: 'https://star-mine-atlas.vercel.app',
    siteName: 'Star Mine Atlas',
    images: [
      {
        url: '/icon1.png',
        width: 512,
        height: 512,
        alt: 'Star Mine Atlas logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Star Mine Atlas',
    description: "Mining guide for Star Citizen: rocks, minerals, modules, gadgets, prices, and tips.",
    images: ['/icon1.png'],
    site: '@StarMineAtlas',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/svg+xml" href="/icon1.svg" />
        <meta name="apple-mobile-web-app-title" content="Star Mine Atlas" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <I18nProvider>
          {children}
        </I18nProvider>
        <Analytics />
      </body>
    </html>
  )
}
