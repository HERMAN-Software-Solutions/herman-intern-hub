'use client'

import { Download } from 'lucide-react'

/**
 * Renders a link styled as a button that triggers a CSV download.
 * Just wraps an <a href download> — no JS fetch, no state.
 */
export function ExportButton({
  href,
  label = 'Export CSV',
}: {
  href: string
  label?: string
}) {
  return (
    <a
      href={href}
      download
      className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-slate-300 hover:border-slate-400 text-sm font-medium px-3.5 py-2 rounded-lg transition-colors"
    >
      <Download className="w-4 h-4" />
      {label}
    </a>
  )
}