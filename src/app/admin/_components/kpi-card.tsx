import Link from 'next/link'

export function KpiCard({
  label,
  value,
  hint,
  href,
  accent,
}: {
  label: string
  value: number | string
  hint?: string
  href?: string
  accent?: 'default' | 'green' | 'amber' | 'blue' | 'red'
}) {
  const colors = {
    default: 'text-slate-900',
    green: 'text-green-600',
    amber: 'text-amber-600',
    blue: 'text-blue-600',
    red: 'text-red-600',
  }

  const inner = (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-400 transition-colors h-full">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${colors[accent ?? 'default']}`}>
        {value}
      </p>
      {hint && <p className="text-xs text-slate-400 mt-2">{hint}</p>}
    </div>
  )

  return href ? (
    <Link href={href} className="block">
      {inner}
    </Link>
  ) : (
    inner
  )
}