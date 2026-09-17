'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

export function DrawerLayout({
  sidebar,
  headerRight,
  children,
}: {
  sidebar: React.ReactNode
  headerRight?: React.ReactNode
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Close drawer on route change
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Lock body scroll when open
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

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop sidebar (always visible ≥ lg) */}
      <div className="hidden lg:flex lg:flex-shrink-0">{sidebar}</div>

      {/* Mobile drawer */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
            {sidebar}
          </div>
        </>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200">
          <div className="flex items-center justify-between gap-3 px-4 lg:px-6 py-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setOpen(true)}
              className="lg:hidden w-10 h-10 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 text-slate-700" />
            </button>

            {/* Logo — visible on mobile only when drawer is hidden */}
            <div className="lg:hidden flex-1 min-w-0">
              <div className="font-bold text-slate-900 text-sm truncate">
                HERMAN Intern Hub
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2 ml-auto">
              {headerRight}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main id="main-content" className="flex-1 overflow-x-auto">
          {children}
        </main>
      </div>

      {/* Hidden close button when drawer is open (inside the drawer itself) */}
      {open && (
        <button
          onClick={() => setOpen(false)}
          className="fixed top-3 right-3 z-[60] lg:hidden w-10 h-10 rounded-lg bg-white shadow-lg hover:bg-slate-100 flex items-center justify-center"
          aria-label="Close menu"
        >
          <X className="w-5 h-5 text-slate-700" />
        </button>
      )}
    </div>
  )
}