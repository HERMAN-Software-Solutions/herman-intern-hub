'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'

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
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">{sidebar}</div>

      {/* Mobile drawer */}
      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
            {sidebar}
          </div>
        </>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
          {/* Row 1: menu / logo / notifications */}
          <div className="flex items-center justify-between gap-3 px-4 lg:px-6 py-3">
            <button
              onClick={() => setOpen(true)}
              className="lg:hidden w-10 h-10 -ml-2 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 text-slate-700" />
            </button>

            <div className="lg:hidden flex-1 min-w-0">
              <div className="font-bold text-slate-900 text-sm truncate">
                HERMAN Intern Hub
              </div>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              {headerRight}
            </div>
          </div>

          {/* Row 2: breadcrumbs */}
          <div className="px-4 lg:px-6 py-2 border-t border-slate-100 bg-slate-50/50">
            <Breadcrumbs />
          </div>
        </header>

        {/* Page content */}
        <main id="main-content" className="flex-1 overflow-x-auto">
          {children}
        </main>
      </div>

      {/* Close button overlay (only when drawer is open) */}
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