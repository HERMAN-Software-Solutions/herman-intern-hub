import Link from 'next/link'
import { Users, FileCheck2, Star, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/ui/page-header'
import { Card } from '@/components/ui/card'

export const metadata = { title: 'Mentor Overview — HERMAN' }

export default async function MentorOverviewPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, bio')
    .eq('id', user.id)
    .single()

  // Count assigned interns
  const { count: internCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'intern')
    .eq('mentor_id', user.id)

  // Pending submissions from assigned interns
  const { data: assignedInterns } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'intern')
    .eq('mentor_id', user.id)

  const internIds = (assignedInterns ?? []).map((i) => i.id)

  let pendingCount = 0
  let activeInternCount = 0

  if (internIds.length > 0) {
    const { count } = await supabase
      .from('submissions')
      .select('*', { count: 'exact', head: true })
      .in('intern_id', internIds)
      .eq('status', 'pending')
    pendingCount = count ?? 0

    const { count: activeCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .in('id', internIds)
      .eq('status', 'active')
    activeInternCount = activeCount ?? 0
  }

  const displayName = profile?.full_name?.split(' ')[0] ?? 'there'

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl">
      <PageHeader
        title={`Welcome, ${displayName}`}
        description="Your mentoring overview."
      />

      {/* KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500">Assigned interns</div>
              <div className="text-3xl font-bold text-slate-900 mt-1">
                {internCount ?? 0}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {activeInternCount} active
              </div>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500">Pending reviews</div>
              <div className="text-3xl font-bold text-slate-900 mt-1">
                {pendingCount}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {pendingCount === 0
                  ? 'All caught up'
                  : 'Needs your attention'}
              </div>
            </div>
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <FileCheck2 className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500">Performance reviews</div>
              <div className="text-3xl font-bold text-slate-900 mt-1">—</div>
              <div className="text-xs text-slate-400 mt-1">
                Coming soon
              </div>
            </div>
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/mentor/interns"
          className="group bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-400 hover:shadow-sm transition-all"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                My interns
              </div>
              <p className="text-sm text-slate-500 mt-1">
                View the interns assigned to you and track their progress.
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
          </div>
        </Link>

        <Link
          href="/mentor/submissions"
          className="group bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-400 hover:shadow-sm transition-all"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                Review queue
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Approve submissions or request revisions.
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
          </div>
        </Link>
      </div>
    </div>
  )
}