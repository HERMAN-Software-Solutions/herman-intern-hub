import Link from 'next/link'
import { Logo } from './logo'

const NAV_LINKS = [
  { href: '/interns', label: 'Interns' },
  { href: '/success-stories', label: 'Stories' },
  { href: '/apply', label: 'Apply' },
]

export function PublicNav() {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
        <Logo />

        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:inline text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/apply"
            className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Apply now
          </Link>
        </div>
      </div>
    </header>
  )
}