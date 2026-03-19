import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { I18nProvider } from '@/components/I18nProvider'
import '../styles/globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Star Mine Atlas | Star Citizen Mining Helper',
  description: 'Your comprehensive guide to mining in Star Citizen. Browse rock types, minerals, and compositions.',
  icons: {
    icon: [
      {
        url: '/sma-logo.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/sma-logo.png',
        media: '(prefers-color-scheme: dark)',
      },
    ],
    apple: '/sma-logo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <I18nProvider>
          {children}
        </I18nProvider>
        <Analytics />
      </body>
    </html>
  )
}
