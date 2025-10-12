import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { I18nextProvider } from './i18n-provider'
import PWARegistration from '../components/PWARegistration'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Serene | Your Personalized Anxiety Relief Assistant',
  description: 'An AI-powered application that analyzes your anxiety symptoms and provides personalized, evidence-based coping exercises to help you find calm and relief.',
  keywords: ['anxiety', 'mental health', 'wellness', 'AI', 'coping strategies', 'mindfulness', 'therapy'],
  authors: [{ name: 'Serene Team' }],
  creator: 'Serene',
  publisher: 'Serene',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Serene | Your Personalized Anxiety Relief Assistant',
    description: 'AI-powered anxiety relief with personalized coping exercises and mental wellness support.',
    url: '/',
    siteName: 'Serene',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Serene | Your Personalized Anxiety Relief Assistant',
    description: 'AI-powered anxiety relief with personalized coping exercises and mental wellness support.',
    creator: '@serene',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Serene',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0d9488',
  colorScheme: 'light dark',
}

export default function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: { lang: string }
}>) {
  return (
    <html lang={params.lang ?? 'en'}>
      <head>
        <meta name="theme-color" content="#0d9488" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Serene" />
        <link rel="apple-touch-icon" href="/icon-192.svg" />
        <link rel="icon" type="image/svg+xml" sizes="192x192" href="/icon-192.svg" />
        <link rel="icon" type="image/svg+xml" sizes="512x512" href="/icon-512.svg" />
      </head>
      <body className={inter.className}>
        <I18nextProvider>
          <Providers>
            {children}
          </Providers>
        </I18nextProvider>
        <PWARegistration />
      </body>
    </html>
  )
}
