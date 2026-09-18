import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function EmptyState({
  icon = '📭',
  title,
  description,
  action,
}: {
  icon?: string | React.ReactNode
  title: string
  description?: string
  action?: { label: string; href: string }
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-12 sm:p-16 text-center">
      {/* Icon circle */}
      <div className="w-16 h-16 mx-auto mb-5 bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 rounded-full flex items-center justify-center">
        <span className="text-2xl">{icon}</span>
      </div>

      <h3 className="font-semibold text-slate-900 text-base sm:text-lg">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-slate-500 mt-2.5 max-w-sm mx-auto leading-relaxed">
          {description}
        </p>
      )}

      {action && (
        <Link
          href={action.href}
          className="group inline-flex items-center gap-1.5 mt-6 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
        >
          <span>{action.label}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}
    </div>
  )
}