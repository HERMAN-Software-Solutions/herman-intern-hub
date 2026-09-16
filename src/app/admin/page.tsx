import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from './_components/status-badge'

export default async function AdminOverview() {
  const supabase = await createClient()

  const { count: internCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'intern')

  const { count: activeCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'intern')
    .eq('status', 'active')

  const { count: appCount } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  const { data: recentApps } = await supabase
    .from('applications')
    .select('id, name, email, university, status, submitted_at')
    .order('submitted_at', { ascending: false })
    .limit(5)

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-3xl font-bold text-slate-900">Overview</h1>
      <p className="text-slate-500 mt-1">
        Welcome back. Here's what's happening.
      </p>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <KPI label="Total interns" value={internCount ?? 0} />
        <KPI label="Active interns" value={activeCount ?? 0} accent="green" />
        <KPI
          label="Pending applications"
          value={appCount ?? 0}
          accent={appCount && appCount > 0 ? 'amber' : undefined}
        />
      </div>

      {/* Recent applications */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Recent applications
          </h2>
          <Link
            href="/admin/applications"
            className="text-sm text-blue-600 hover:underline"
          >
            View all →
          </Link>
        </div>

        {!recentApps || recentApps.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
            <p className="text-slate-500">No applications yet.</p>
            <p className="text-sm text-slate-400 mt-1">
              Share the apply link:{' '}
              <a
                href="/apply"
                className="text-blue-600 hover:underline"
                target="_blank"
              >
                /apply
              </a>
            </p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-left text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">University</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {recentApps.map((app) => (
                  <tr key={app.id} className="border-t border-slate-100">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/applications/${app.id}`}
                        className="font-medium text-slate-900 hover:text-blue-600"
                      >
                        {app.name}
                      </Link>
                      <div className="text-xs text-slate-500">{app.email}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {app.university}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {new Date(app.submitted_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function KPI({
  label,
  value,
  accent,
}: {
  label: string
  value: number
  accent?: 'green' | 'amber'
}) {
  const valueColor =
    accent === 'green'
      ? 'text-green-600'
      : accent === 'amber'
        ? 'text-amber-600'
        : 'text-slate-900'

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${valueColor}`}>{value}</p>
    </div>
  )
}