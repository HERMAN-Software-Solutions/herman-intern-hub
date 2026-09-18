'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { Fragment } from 'react'

const LABELS: Record<string, string> = {
  admin: 'Admin',
  applications: 'Applications',
  interns: 'Interns',
  submissions: 'Submissions',
  projects: 'Projects',
  documents: 'Documents',
  dashboard: 'Dashboard',
  tasks: 'Tasks',
  logs: 'Daily log',
  reports: 'Weekly reports',
  notifications: 'Notifications',
  profile: 'Profile',
  onboarding: 'Onboarding',
  welcome: 'Welcome',
  'tech-stack': 'Tech stack',
  pending: 'Pending',
  apply: 'Apply',
  status: 'Status',
  success: 'Success',
  'success-stories': 'Success stories',
  verify: 'Verify',
  review: 'Review',
  'issue-certificate': 'Issue certificate',
}

function humanizeSegment(segment: string): string {
  // UUID pattern → "Details"
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(segment)) {
    return 'Details'
  }
  // Certificate ID (HRM-2026-0001) → keep as-is
  if (/^HRM-\d{4}-\d{4}$/i.test(segment)) {
    return segment
  }
  // Check known labels first
  if (LABELS[segment]) return LABELS[segment]
  // Otherwise title-case
  return segment
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function Breadcrumbs({
  homeHref = '/',
  homeLabel = 'Home',
  className = '',
}: {
  homeHref?: string
  homeLabel?: string
  className?: string
}) {
  const pathname = usePathname()

  // Skip on home page
  if (!pathname || pathname === '/') return null

  const segments = pathname.split('/').filter(Boolean)

  const crumbs = segments.map((segment, i) => ({
    label: humanizeSegment(segment),
    href: '/' + segments.slice(0, i + 1).join('/'),
    isLast: i === segments.length - 1,
  }))

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-1.5 text-sm min-w-0 ${className}`}
    >
      <Link
        href={homeHref}
        className="text-slate-500 hover:text-slate-900 transition-colors inline-flex items-center gap-1 flex-shrink-0"
      >
        <Home className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{homeLabel}</span>
      </Link>

      {crumbs.map((crumb) => (
        <Fragment key={crumb.href}>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
          {crumb.isLast ? (
            <span
              className="text-slate-900 font-medium truncate"
              aria-current="page"
            >
              {crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.href}
              className="text-slate-500 hover:text-slate-900 transition-colors truncate"
            >
              {crumb.label}
            </Link>
          )}
        </Fragment>
      ))}
    </nav>
  )
}