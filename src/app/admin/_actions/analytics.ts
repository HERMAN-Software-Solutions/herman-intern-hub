'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export async function getAdminStats() {
  const supabase = createAdminClient()
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000).toISOString()
  const twoDaysAgo = new Date(now.getTime() - 2 * 86400000)
    .toISOString()
    .slice(0, 10)

  // ─── KPI counts in parallel ─────────────────────────
  const [
    activeInterns,
    completedInterns,
    pendingApps,
    appsThisMonth,
    submissionsPending,
    certificatesIssued,
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'intern')
      .eq('status', 'active'),
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'intern')
      .eq('status', 'completed'),
    supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .gte('submitted_at', startOfMonth),
    supabase
      .from('submissions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'certificate'),
  ])

  // ─── Log gaps: active interns who haven't logged in 2+ days ───
  const { data: activeInternProfiles } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('role', 'intern')
    .eq('status', 'active')

  const internIds = (activeInternProfiles ?? []).map((p) => p.id)
  let logGaps: Array<{
    id: string
    name: string
    email: string
    lastLog: string | null
    daysSince: number | null
  }> = []

  if (internIds.length > 0) {
    // Get the most recent log per intern
    const { data: recentLogs } = await supabase
      .from('daily_logs')
      .select('intern_id, date')
      .in('intern_id', internIds)
      .order('date', { ascending: false })

    const lastLogByIntern = new Map<string, string>()
    for (const log of recentLogs ?? []) {
      if (!lastLogByIntern.has(log.intern_id)) {
        lastLogByIntern.set(log.intern_id, log.date)
      }
    }

    logGaps = (activeInternProfiles ?? [])
      .map((p) => {
        const lastLog = lastLogByIntern.get(p.id) ?? null
        const daysSince = lastLog
          ? Math.floor(
              (Date.now() - new Date(lastLog).getTime()) / 86400000
            )
          : null
        return {
          id: p.id,
          name: p.full_name ?? p.email,
          email: p.email,
          lastLog,
          daysSince,
        }
      })
      .filter((i) => i.lastLog === null || (i.daysSince ?? 0) >= 2)
      .sort((a, b) => (b.daysSince ?? 999) - (a.daysSince ?? 999))
  }

  // ─── Recent audit activity ─────────────────────────────
  const { data: recentActivity } = await supabase
    .from('audit_log')
    .select('id, action, entity, metadata, created_at, actor:actor_id (full_name, email)')
    .order('created_at', { ascending: false })
    .limit(15)

  // ─── Applications over last 30 days (grouped by day) ───
  const { data: recentApps } = await supabase
    .from('applications')
    .select('submitted_at, status')
    .gte('submitted_at', thirtyDaysAgo)

  const appsByDay = new Map<string, number>()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000)
    const key = d.toISOString().slice(0, 10)
    appsByDay.set(key, 0)
  }
  for (const app of recentApps ?? []) {
    const key = app.submitted_at.slice(0, 10)
    if (appsByDay.has(key)) {
      appsByDay.set(key, (appsByDay.get(key) ?? 0) + 1)
    }
  }
  const appsTimeline = Array.from(appsByDay.entries()).map(([date, count]) => ({
    date: date.slice(5), // MM-DD
    count,
  }))

  // ─── Submission pipeline breakdown ─────────────────
  const { data: allSubs } = await supabase
    .from('submissions')
    .select('status')

  const submissionsByStatus = {
    pending: allSubs?.filter((s) => s.status === 'pending').length ?? 0,
    approved: allSubs?.filter((s) => s.status === 'approved').length ?? 0,
    needs_revision:
      allSubs?.filter((s) => s.status === 'needs_revision').length ?? 0,
  }

  return {
    kpis: {
      activeInterns: activeInterns.count ?? 0,
      completedInterns: completedInterns.count ?? 0,
      pendingApps: pendingApps.count ?? 0,
      appsThisMonth: appsThisMonth.count ?? 0,
      submissionsPending: submissionsPending.count ?? 0,
      certificatesIssued: certificatesIssued.count ?? 0,
    },
    logGaps,
    recentActivity: recentActivity ?? [],
    appsTimeline,
    submissionsByStatus,
  }
}