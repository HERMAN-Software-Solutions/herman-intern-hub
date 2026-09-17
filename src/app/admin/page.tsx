import Link from 'next/link'
import { getAdminStats } from './_actions/analytics'
import { KpiCard } from './_components/kpi-card'
import {
  ApplicationsChart,
  SubmissionsPipeline,
} from './_components/analytics-charts'

export const dynamic = 'force-dynamic'

export default async function AdminOverview() {
  const stats = await getAdminStats()
  const { kpis, logGaps, recentActivity, appsTimeline, submissionsByStatus } =
    stats

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Overview</h1>
        <p className="text-slate-500 mt-1">
          Real-time view of your intern program.
        </p>
      </div>

      {/* ─── KPI Grid ─────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard
          label="Active interns"
          value={kpis.activeInterns}
          accent="green"
          href="/admin/interns?status=active"
        />
        <KpiCard
          label="Completed"
          value={kpis.completedInterns}
          accent="blue"
          href="/admin/interns?status=completed"
        />
        <KpiCard
          label="Pending apps"
          value={kpis.pendingApps}
          accent={kpis.pendingApps > 0 ? 'amber' : 'default'}
          href="/admin/applications?status=pending"
        />
        <KpiCard
          label="Apps this month"
          value={kpis.appsThisMonth}
        />
        <KpiCard
          label="Pending reviews"
          value={kpis.submissionsPending}
          accent={kpis.submissionsPending > 0 ? 'amber' : 'default'}
          href="/admin/submissions?status=pending"
        />
        <KpiCard
          label="Certificates"
          value={kpis.certificatesIssued}
        />
      </div>

      {/* ─── Charts ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-semibold text-slate-900 mb-1">
            Applications over 30 days
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Daily submissions through the public form.
          </p>
          <ApplicationsChart data={appsTimeline} />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-semibold text-slate-900 mb-1">
            Submission pipeline
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Where intern work stands right now.
          </p>
          <SubmissionsPipeline data={submissionsByStatus} />
        </div>
      </div>

      {/* ─── Log gaps ─────────────────────────────────── */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Log gaps
            </h2>
            <p className="text-xs text-slate-500">
              Active interns who haven&apos;t logged in 2+ days.
            </p>
          </div>
          {logGaps.length > 0 && (
            <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full font-medium">
              {logGaps.length} attention
            </span>
          )}
        </div>

        {logGaps.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-6 text-center">
            <p className="text-sm text-green-700">
              ✅ All active interns are logging consistently.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-left text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Intern</th>
                  <th className="px-4 py-3">Last log</th>
                  <th className="px-4 py-3 text-right">Days since</th>
                </tr>
              </thead>
              <tbody>
                {logGaps.map((gap) => (
                  <tr key={gap.id} className="border-t border-slate-100">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/interns/${gap.id}`}
                        className="font-medium text-slate-900 hover:text-blue-600"
                      >
                        {gap.name}
                      </Link>
                      <div className="text-xs text-slate-500">{gap.email}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">
                      {gap.lastLog
                        ? new Date(gap.lastLog).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`text-xs font-medium ${
                          (gap.daysSince ?? 999) >= 5
                            ? 'text-red-600'
                            : 'text-amber-600'
                        }`}
                      >
                        {gap.daysSince ?? '∞'}d
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Recent activity ───────────────────────────── */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Recent activity
        </h2>

        {recentActivity.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-6 text-center">
            <p className="text-sm text-slate-500">No recent activity.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
            {recentActivity.map((a: any) => {
              const actorRaw = a.actor
              const actor = Array.isArray(actorRaw) ? actorRaw[0] : actorRaw
              return (
                <div key={a.id} className="p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                    {(actor?.full_name ?? actor?.email ?? 'S')
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-slate-900">
                      <span className="font-medium">
                        {actor?.full_name ?? actor?.email ?? 'System'}
                      </span>{' '}
                      <span className="text-slate-500">
                        {humanizeAction(a.action)}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {new Date(a.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function humanizeAction(action: string): string {
  const map: Record<string, string> = {
    'application.approved': 'approved an application',
    'application.rejected': 'rejected an application',
    'application.reviewing': 'marked an application as reviewing',
    'invitation.created': 'sent an invitation',
    'invitation.accepted': 'accepted an invitation',
    'intern.mentor_assigned': 'assigned a mentor',
    'intern.mentor_unassigned': 'removed a mentor',
    'submission.approved': 'approved a submission',
    'submission.revision_requested': 'requested a revision',
    'performance_review.saved': 'saved a performance review',
    'certificate.issued': 'issued a certificate',
  }
  return map[action] ?? action.replace(/\./g, ' ')
}