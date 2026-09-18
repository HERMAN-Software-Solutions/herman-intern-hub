import Link from 'next/link'
import { PublicNav } from '@/components/marketing/nav'
import { PublicFooter } from '@/components/marketing/footer'

export function LegalLayout({
  title,
  lastUpdated,
  children,
}: {
  title: string
  lastUpdated: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            {title}
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Last updated: {lastUpdated}
          </p>
        </div>

        {/* Content — uses prose */}
        <article
          className="prose prose-slate max-w-none
            prose-headings:text-slate-900 prose-headings:font-semibold prose-headings:tracking-tight
            prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
            prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2
            prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-4
            prose-ul:my-4 prose-ul:pl-6 prose-li:text-slate-700 prose-li:mb-1
            prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-slate-900 prose-strong:font-semibold
            prose-hr:my-10 prose-hr:border-slate-200
            prose-code:text-slate-900 prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-normal
            prose-code:before:content-none prose-code:after:content-none"
        >
          {children}
        </article>

        {/* Contact */}
        <div className="mt-14 pt-8 border-t border-slate-200 text-sm text-slate-500">
          Questions?{' '}
          <a
            href="mailto:infohermansoftware@gmail.com"
            className="text-blue-600 hover:underline font-medium"
          >
            infohermansoftware@gmail.com
          </a>
        </div>

        {/* Cross-links */}
        <div className="mt-8 flex flex-wrap gap-4 text-sm">
          <Link
            href="/terms"
            className="text-slate-500 hover:text-slate-900 transition-colors"
          >
            Terms
          </Link>
          <Link
            href="/privacy"
            className="text-slate-500 hover:text-slate-900 transition-colors"
          >
            Privacy
          </Link>
          <Link
            href="/cookies"
            className="text-slate-500 hover:text-slate-900 transition-colors"
          >
            Cookies
          </Link>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}