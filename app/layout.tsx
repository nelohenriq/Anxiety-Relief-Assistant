import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { I18nextProvider } from './i18n-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Anxiety Relief Assistant',
  description: 'Your personal companion for anxiety relief and mental wellness',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <I18nextProvider>
          <Providers>
            {children}
          </Providers>
        </I18nextProvider>
      </body>
    </html>
  )
}