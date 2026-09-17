'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  Inbox,
  Users,
  FileCheck2,
  FolderKanban,
  FileText,
  LogOut,
} from 'lucide-react'

const NAV = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/applications', label: 'Applications', icon: Inbox },
  { href: '/admin/interns', label: 'Interns', icon: Users },
  { href: '/admin/submissions', label: 'Submissions', icon: FileCheck2 },
  { href: '/admin/projects', label: 'Projects', icon: FolderKanban },
  { href: '/admin/documents', label: 'Documents', icon: FileText },
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
    <aside className="w-72 lg:w-64 bg-slate-900 text-slate-300 flex flex-col h-full lg:h-screen lg:sticky lg:top-0">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-slate-800">
        <div className="text-white font-bold text-lg">HERMAN</div>
        <div className="text-xs text-slate-400 mt-0.5">Intern Hub · Admin</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map((item) => {
          const Icon = item.icon
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
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
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-white mt-2"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  )
}