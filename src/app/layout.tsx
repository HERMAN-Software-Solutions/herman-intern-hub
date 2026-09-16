import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

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
  // verification: {
  //   google: 'YOUR-VERIFICATION-CODE',
  // },
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}