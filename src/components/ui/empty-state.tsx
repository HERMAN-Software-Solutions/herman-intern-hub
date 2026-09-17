import Link from 'next/link'

export function EmptyState({
  icon = '📭',
  title,
  description,
  action,
}: {
  icon?: string
  title: string
  description?: string
  action?: { label: string; href: string }
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="font-semibold text-slate-900">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
          {description}
        </p>
      )}
      {action && (
        <Link
          href={action.href}
          className="inline-block mt-5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {action.label}
        </Link>
      )}
    </div>
  )
}