'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { Logo } from './logo'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { ConsoleEasterEgg } from './console-easter-egg'
import { FloatActions } from './float-actions'

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
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // Only show breadcrumbs on non-home pages
  const showBreadcrumbs = pathname && pathname !== '/'

  return (
    <>
      <ConsoleEasterEgg />
      <FloatActions />


      {/* Fixed Header Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        {/* Row 1: Menu / Logo / Actions */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="md:hidden w-10 h-10 -ml-2 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
              aria-label="Open menu"
              aria-expanded={open}
            >
              <Menu className="w-5 h-5 text-slate-700" />
            </button>
            <Logo />
          </div>

          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors ${
                  pathname === link.href
                    ? 'text-slate-900 font-medium'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden sm:inline-flex text-sm text-slate-600 hover:text-slate-900 transition-colors px-3 py-2"
            >
              Sign in
            </Link>
            <Link
              href="/apply"
              className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-3 sm:px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
            >
              Apply
            </Link>
          </div>
        </div>

        {/* Row 2: Breadcrumbs */}
        {showBreadcrumbs && (
          <div className="border-t border-slate-100 bg-slate-50/50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2">
              <Breadcrumbs />
            </div>
          </div>
        )}
      </header>

      {/* Mobile Drawer */}
      {open && (
        <div
          className="fixed inset-0 z-[100] md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Main menu"
        >
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          <div className="absolute inset-y-0 left-0 w-[85vw] max-w-sm bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-4 h-16 border-b border-slate-200 flex-shrink-0">
              <Logo />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-10 h-10 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5 text-slate-700" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-1">
                {NAV_LINKS.map((link) => {
                  const active = pathname === link.href
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                          active
                            ? 'bg-slate-900 text-white'
                            : 'text-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        {link.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>

            <div className="flex-shrink-0 p-4 border-t border-slate-200 space-y-2">
              <Link
                href="/login"
                className="block w-full text-center px-4 py-3 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
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
        </div>
      )}
    </>
  )
}