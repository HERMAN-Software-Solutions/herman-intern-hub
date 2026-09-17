'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { Logo } from './logo'

const NAV_LINKS = [
  { href: '/interns', label: 'Interns' },
  { href: '/success-stories', label: 'Stories' },
  { href: '/apply', label: 'Apply' },
]

export function PublicNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
        {/* Left: menu button (mobile) + logo */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => setOpen(true)}
            className="md:hidden w-10 h-10 -ml-2 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-slate-700" />
          </button>
          <Logo />
        </div>

        {/* Desktop nav */}
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

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden sm:inline text-sm text-slate-600 hover:text-slate-900 transition-colors px-3 py-2"
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

      {/* Mobile drawer */}
      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white z-50 md:hidden flex flex-col shadow-xl">
            <div className="px-4 py-4 border-b border-slate-200 flex items-center justify-between">
              <Logo />
              <button
                onClick={() => setOpen(false)}
                className="w-10 h-10 rounded-lg hover:bg-slate-100 flex items-center justify-center"
                aria-label="Close menu"
              >
                <X className="w-5 h-5 text-slate-700" />
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t border-slate-200 space-y-2">
              <Link
                href="/login"
                className="block w-full text-center px-4 py-3 rounded-lg border border-slate-300 text-slate-700 font-medium hover:border-slate-500 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/apply"
                className="block w-full text-center px-4 py-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium transition-colors"
              >
                Apply now
              </Link>
            </div>
          </div>
        </>
      )}
    </header>
  )
}