import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { Toaster } from 'sonner'
import { CookieBanner } from '@/components/legal/cookie-banner'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? 'https://herman-intern-hub.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'HERMAN Intern Hub',
    template: '%s · HERMAN Intern Hub',
  },
  description:
    'Real projects. Real mentorship. Real experience. A structured internship program by HERMAN Software Solutions Limited, Jinja, Uganda.',
  keywords: [
    'HERMAN',
    'internship',
    'Uganda',
    'software engineering',
    'Jinja',
    'Next.js',
    'mentorship',
    'students',
    'software internship',
    'tech internship Uganda',
  ],
  authors: [{ name: 'HERMAN Software Solutions Limited' }],
  creator: 'HERMAN Software Solutions Limited',
  publisher: 'HERMAN Software Solutions Limited',
  applicationName: 'HERMAN Intern Hub',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Intern Hub',
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/apple-touch-icon.png',
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BASE_URL,
    siteName: 'HERMAN Intern Hub',
    title: 'HERMAN Intern Hub — Launch your software career',
    description:
      'Join HERMAN Software Solutions as an intern. Real projects, real mentorship, real experience.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HERMAN Intern Hub',
    description:
      'Real projects. Real mentorship. Real experience. Apply for a software internship in Jinja, Uganda.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // Uncomment and add your code after verifying with Google Search Console
  verification: {
    google: 'ARKdvcChjPgHXFnujH-TH_CYT-XjvmN2ATFRLXfxG24',
  },
}

export const viewport: Viewport = {
  themeColor: '#0F172A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-slate-900 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:font-medium"
        >
          Skip to content
        </a>
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              borderRadius: '10px',
              fontSize: '14px',
            },
          }}
        />
        <CookieBanner />

        {/* Register service worker for PWA (push + offline) */}
        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').catch(function(err) {
                  console.warn('SW registration failed:', err);
                });
              });
            }
          `}
        </Script>
      </body>
    </html>
  )
}