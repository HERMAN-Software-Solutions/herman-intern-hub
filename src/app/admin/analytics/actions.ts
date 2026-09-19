'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const MONTHS_BACK = 6
const TOP_PERFORMERS_LIMIT = 5

export type AnalyticsData = {
  kpis: {
    total: number
    thisMonth: number
    last30Days: number
    averageScore: number | null
  }
  monthlyTrend: { month: string; count: number }[]
  topPerformers: {
    internId: string
    name: string
    email: string
    score: number
    certificateId: string | null
    issuedDate: string
  }[]
  techStackDistribution: { name: string; count: number }[]
}

export async function getCertificateAnalytics(): Promise<AnalyticsData | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: actor } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!actor || (actor.role !== 'admin' && actor.role !== 'super_admin')) {
    return null
  }

  const admin = createAdminClient()
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000)
  const sixMonthsAgo = new Date(
    now.getFullYear(),
    now.getMonth() - (MONTHS_BACK - 1),
    1
  )

  // ─── Real (non-demo) intern IDs ───────────────────────
  const { data: realInternProfiles } = await admin
    .from('profiles')
    .select('id')
    .eq('role', 'intern')
    .eq('is_demo', false)

  const realInternIds = (realInternProfiles ?? []).map((p) => p.id)

  if (realInternIds.length === 0) {
    return {
      kpis: { total: 0, thisMonth: 0, last30Days: 0, averageScore: null },
      monthlyTrend: emptyTrend(now),
      topPerformers: [],
      techStackDistribution: [],
    }
  }

  // ─── Fetch all certificates for real interns ──────────
  const { data: certificates } = await admin
    .from('documents')
    .select(
      `id, certificate_id, performance_score, issued_date, intern_id,
       intern:intern_id (id, full_name, email)`
    )
    .eq('type', 'certificate')
    .in('intern_id', realInternIds)
    .order('issued_date', { ascending: false })

  const certs = certificates ?? []

  // ─── KPIs ─────────────────────────────────────────────
  const startOfMonthISO = startOfMonth.toISOString().slice(0, 10)
  const thirtyDaysAgoISO = thirtyDaysAgo.toISOString().slice(0, 10)

  const thisMonth = certs.filter((c) => c.issued_date >= startOfMonthISO).length
  const last30Days = certs.filter(
    (c) => c.issued_date >= thirtyDaysAgoISO
  ).length

  const scored = certs.filter((c) => c.performance_score != null)
  const averageScore =
    scored.length > 0
      ? scored.reduce((sum, c) => sum + Number(c.performance_score), 0) /
        scored.length
      : null

  // ─── Monthly trend (last N months) ────────────────────
  const monthlyTrend = buildMonthlyTrend(certs, sixMonthsAgo, now)

  // ─── Top performers ───────────────────────────────────
  const topPerformers = certs
    .filter((c) => c.performance_score != null)
    .sort(
      (a, b) => Number(b.performance_score) - Number(a.performance_score)
    )
    .slice(0, TOP_PERFORMERS_LIMIT)
    .map((c) => {
      const internRaw = (c as any).intern
      const intern = Array.isArray(internRaw) ? internRaw[0] : internRaw
      return {
        internId: c.intern_id,
        name: intern?.full_name ?? intern?.email ?? 'Unknown',
        email: intern?.email ?? '',
        score: Number(c.performance_score),
        certificateId: c.certificate_id ?? null,
        issuedDate: c.issued_date,
      }
    })

  // ─── Tech stack distribution ──────────────────────────
  const { data: internStacks } = await admin
    .from('intern_tech_stacks')
    .select('intern_id, tech_stack:tech_stack_id (name)')
    .in(
      'intern_id',
      certs.map((c) => c.intern_id)
    )

  const stackCount = new Map<string, number>()
  for (const row of (internStacks ?? []) as any[]) {
    const stackRaw = row.tech_stack
    const stack = Array.isArray(stackRaw) ? stackRaw[0] : stackRaw
    if (!stack?.name) continue
    stackCount.set(stack.name, (stackCount.get(stack.name) ?? 0) + 1)
  }

  const techStackDistribution = Array.from(stackCount.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  return {
    kpis: {
      total: certs.length,
      thisMonth,
      last30Days,
      averageScore,
    },
    monthlyTrend,
    topPerformers,
    techStackDistribution,
  }
}

/* ─────────────────────── Helpers ─────────────────────── */

function buildMonthlyTrend(
  certs: { issued_date: string }[],
  from: Date,
  to: Date
): { month: string; count: number }[] {
  const buckets = new Map<string, number>()

  // Seed buckets in order
  for (let i = 0; i < MONTHS_BACK; i++) {
    const d = new Date(from.getFullYear(), from.getMonth() + i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    buckets.set(key, 0)
  }

  for (const c of certs) {
    const key = c.issued_date.slice(0, 7) // YYYY-MM
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + 1)
    }
  }

  const MONTH_LABELS = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]

  return Array.from(buckets.entries()).map(([key, count]) => {
    const [year, month] = key.split('-').map(Number)
    return {
      month: `${MONTH_LABELS[month - 1]} ${String(year).slice(-2)}`,
      count,
    }
  })
}

function emptyTrend(now: Date): { month: string; count: number }[] {
  return buildMonthlyTrend(
    [],
    new Date(now.getFullYear(), now.getMonth() - (MONTHS_BACK - 1), 1),
    now
  )
}