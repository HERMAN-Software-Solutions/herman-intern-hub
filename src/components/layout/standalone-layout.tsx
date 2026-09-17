import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export function StandaloneLayout({
  children,
  showFooter = true,
}: {
  children: React.ReactNode
  showFooter?: boolean
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 group"
            aria-label="Back to HERMAN Intern Hub home"
          >
            <img
              src="/brand/logo.png"
              alt=""
              className="h-8 w-8 rounded object-contain"
            />
            <span className="text-base font-bold text-slate-900 tracking-tight group-hover:text-slate-700 transition-colors">
              HERMAN Intern Hub
            </span>
          </Link>

          <Link
            href="/"
            className="text-sm text-slate-500 hover:text-slate-900 transition-colors inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to home</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        {children}
      </main>

      {/* Footer */}
      {showFooter && (
        <footer className="py-4 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} HERMAN Software Solutions Limited
        </footer>
      )}
    </div>
  )
}