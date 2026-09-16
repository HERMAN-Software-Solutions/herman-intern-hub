'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/admin', label: 'Overview', icon: '◫' },
  { href: '/admin/applications', label: 'Applications', icon: '◱' },
  { href: '/admin/interns', label: 'Interns', icon: '☰' },
  { href: '/admin/submissions', label: 'Submissions', icon: '✎' },
  { href: '/admin/projects', label: 'Projects', icon: '◈' },
  { href: '/admin/documents', label: 'Documents', icon: '◇' },
]

export function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col min-h-screen">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-slate-800">
        <div className="text-white font-bold text-lg">HERMAN</div>
        <div className="text-xs text-slate-400 mt-0.5">Intern Hub · Admin</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((item) => {
          const active =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-slate-800 p-4">
        <div className="text-sm text-white truncate">{adminName}</div>
        <button
          onClick={handleSignOut}
          className="text-xs text-slate-400 hover:text-white mt-2"
        >
          Sign out →
        </button>
      </div>
    </aside>
  )
}