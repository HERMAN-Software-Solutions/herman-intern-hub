import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const metadata = { title: 'Weekly Reports — HERMAN Intern Hub' }

export default async function ReportsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: reports } = await supabase
    .from('weekly_reports')
    .select(
      'id, week_start, week_end, summary, total_hours, pdf_url, generated_at'
    )
    .eq('intern_id', user.id)
    .order('week_start', { ascending: false })

  // Generate signed URLs for each report
  const reportsWithUrls = await Promise.all(
    (reports ?? []).map(async (r) => {
      const { data: signed } = await supabase.storage
        .from('documents')
        .createSignedUrl(r.pdf_url, 60 * 60 * 24 * 7) // 7 days
      return { ...r, signedUrl: signed?.signedUrl ?? null }
    })
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Weekly Reports</h1>
        <p className="text-slate-500 mt-1">
          Auto-generated summaries of your work each week.
        </p>
      </div>

      {reportsWithUrls.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-slate-500">No weekly reports yet.</p>
          <p className="text-sm text-slate-400 mt-1">
            Reports are generated every Sunday at 23:59 EAT.
          </p>
          <p className="text-sm text-slate-400">
            Keep logging your daily work and your first report will appear soon.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reportsWithUrls.map((r) => (
            <div
              key={r.id}
              className="bg-white border border-slate-200 rounded-xl p-5"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="font-semibold text-slate-900">
                    {new Date(r.week_start).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                    })}{' '}
                    –{' '}
                    {new Date(r.week_end).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                  <div className="text-sm text-slate-500 mt-1">
                    {r.summary}
                  </div>
                  <div className="text-xs text-slate-400 mt-2">
                    Total: <strong>{Number(r.total_hours).toFixed(1)}h</strong>{' '}
                    · Generated{' '}
                    {new Date(r.generated_at).toLocaleDateString()}
                  </div>
                </div>

                {r.signedUrl && (
                  <a
                    href={r.signedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
                  >
                    Download PDF
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}