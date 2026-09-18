'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  FolderKanban,
  ListChecks,
  Calendar,
  FileText,
  FileBarChart,
  Bell,
  User,
  LogOut,
} from 'lucide-react'

type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  exact?: boolean
}

type NavGroup = {
  label?: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      {
        href: '/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        exact: true,
      },
    ],
  },
  {
    label: 'Work',
    items: [
      { href: '/dashboard/projects', label: 'Projects', icon: FolderKanban },
      { href: '/dashboard/tasks', label: 'Tasks', icon: ListChecks },
      { href: '/dashboard/logs', label: 'Daily log', icon: Calendar },
    ],
  },
  {
    label: 'Records',
    items: [
      { href: '/dashboard/reports', label: 'Weekly reports', icon: FileBarChart },
      { href: '/dashboard/documents', label: 'Documents', icon: FileText },
    ],
  },
  {
    label: 'You',
    items: [
      { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
      { href: '/dashboard/profile', label: 'Profile', icon: User },
    ],
  },
]

export function InternSidebar({ internName }: { internName: string }) {
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
      <div className="px-5 py-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <img
            src="/brand/logo.png"
            alt=""
            className="h-8 w-8 rounded object-contain bg-white/10 p-0.5"
          />
          <div>
            <div className="text-white font-bold text-sm leading-tight">
              HERMAN
            </div>
            <div className="text-[10px] text-slate-400 leading-tight uppercase tracking-wider">
              Intern Hub
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi} className={gi > 0 ? 'mt-5' : ''}>
            {group.label && (
              <div className="px-3 mb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                {group.label}
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon
                const active = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                      active
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                    }`}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-500 rounded-full" />
                    )}
                    <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-slate-800 p-3">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
            {internName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-white truncate leading-tight">
              {internName}
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-white mt-0.5 transition-colors"
            >
              <LogOut className="w-3 h-3" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}