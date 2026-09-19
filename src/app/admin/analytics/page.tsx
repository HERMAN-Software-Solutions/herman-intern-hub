import Link from 'next/link'
import { redirect } from 'next/navigation'
import nextDynamic from 'next/dynamic'
import { Award, TrendingUp, Calendar, Star } from 'lucide-react'
import { getCertificateAnalytics } from './actions'
import { EmptyState } from '@/components/ui/empty-state'

export const metadata = { title: 'Analytics — HERMAN Admin' }
export const dynamic = 'force-dynamic'

const MonthlyTrendChart = nextDynamic(
  () => import('./charts').then((m) => m.MonthlyTrendChart),
  { loading: () => <div className="h-64 bg-slate-100 rounded animate-pulse" /> }
)

const TechStackChart = nextDynamic(
  () => import('./charts').then((m) => m.TechStackChart),
  { loading: () => <div className="h-64 bg-slate-100 rounded animate-pulse" /> }
)

export default async function AnalyticsPage() {
  const data = await getCertificateAnalytics()
  if (!data) redirect('/dashboard')

  const { kpis, monthlyTrend, topPerformers, techStackDistribution } = data
  const hasData = kpis.total > 0

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-500 mt-1">
          Certificate issuance trends and performance insights.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi
          icon={<Award className="w-4 h-4" />}
          label="Total certificates"
          value={kpis.total}
        />
        <Kpi
          icon={<Calendar className="w-4 h-4" />}
          label="This month"
          value={kpis.thisMonth}
        />
        <Kpi
          icon={<TrendingUp className="w-4 h-4" />}
          label="Last 30 days"
          value={kpis.last30Days}
        />
        <Kpi
          icon={<Star className="w-4 h-4" />}
          label="Avg. score"
          value={
            kpis.averageScore != null
              ? `${kpis.averageScore.toFixed(2)}/5`
              : '—'
          }
        />
      </div>

      {!hasData ? (
        <div className="mt-8">
          <EmptyState
            icon="📊"
            title="No certificates issued yet"
            description="Once you issue certificates to interns, trends and insights will appear here."
          />
        </div>
      ) : (
        <>
          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h2 className="font-semibold text-slate-900 mb-1">
                Certificates issued
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Monthly trend, last 6 months.
              </p>
              <MonthlyTrendChart data={monthlyTrend} />
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h2 className="font-semibold text-slate-900 mb-1">
                Tech stack distribution
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Skills across all certified interns.
              </p>
              {techStackDistribution.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No tech stacks recorded for certified interns.
                </p>
              ) : (
                <TechStackChart data={techStackDistribution} />
              )}
            </div>
          </div>

          {/* Top performers */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-1">
              Top performers
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Highest-scoring certified interns.
            </p>

            {topPerformers.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-6 text-center">
                <p className="text-sm text-slate-500">
                  No scored certificates yet.
                </p>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500 text-left text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3 w-12">#</th>
                      <th className="px-4 py-3">Intern</th>
                      <th className="px-4 py-3">Certificate</th>
                      <th className="px-4 py-3 text-right">Score</th>
                      <th className="px-4 py-3 text-right">Issued</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topPerformers.map((p, idx) => (
                      <tr key={p.internId} className="border-t border-slate-100">
                        <td className="px-4 py-3 text-slate-400 font-mono text-xs">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/interns/${p.internId}`}
                            className="font-medium text-slate-900 hover:text-blue-600 transition-colors"
                          >
                            {p.name}
                          </Link>
                          <div className="text-xs text-slate-500">
                            {p.email}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs font-mono text-slate-500">
                          {p.certificateId ? (
                            <Link
                              href={`/verify/${p.certificateId}`}
                              className="hover:text-blue-600 transition-colors"
                              target="_blank"
                            >
                              {p.certificateId}
                            </Link>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-slate-900">
                          {p.score.toFixed(2)}/5
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-slate-500 whitespace-nowrap">
                          {new Date(p.issuedDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function Kpi({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="flex items-center gap-1.5 text-slate-400 mb-2">
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
    </div>
  )
}