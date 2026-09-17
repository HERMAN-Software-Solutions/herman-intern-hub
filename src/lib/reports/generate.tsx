import 'server-only'
import { renderToBuffer } from '@react-pdf/renderer'
import { createAdminClient } from '@/lib/supabase/admin'
import { WeeklyReportDocument } from './template'
import type { WeeklyReportData } from './types'
import { sendEmail } from '@/lib/email/client'

// ─── Date helpers ──────────────────────────────────
function getWeekBounds(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  // Monday = 1, Sunday = 0
  const dayOfWeek = d.getDay()
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(d)
  monday.setDate(d.getDate() + diffToMonday)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return { monday, sunday }
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

// ─── Main generator ────────────────────────────────
export async function generateWeeklyReport(
  internId: string,
  weekStartDate?: Date
): Promise<{ success: true; reportId: string } | { success: false; error: string }> {
  const supabase = createAdminClient()

  // Determine week bounds
  const targetDate = weekStartDate ?? new Date()
  const { monday, sunday } = getWeekBounds(targetDate)
  const weekStart = isoDate(monday)
  const weekEnd = isoDate(sunday)

  // 1. Fetch intern + mentor
  const { data: intern } = await supabase
    .from('profiles')
    .select(
      `id, full_name, email,
       mentor:mentor_id (full_name, email)`
    )
    .eq('id', internId)
    .single()

  if (!intern) return { success: false, error: 'Intern not found' }

  const mentorRaw = (intern as any).mentor
  const mentor = Array.isArray(mentorRaw) ? mentorRaw[0] : mentorRaw

  // 2. Fetch daily logs for the week
  const { data: logs } = await supabase
    .from('daily_logs')
    .select('date, hours_worked, description')
    .eq('intern_id', internId)
    .gte('date', weekStart)
    .lte('date', weekEnd)
    .order('date', { ascending: true })

  const dailyEntries = (logs ?? []).map((l) => ({
    date: new Date(l.date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }),
    hours: Number(l.hours_worked),
    description: l.description,
  }))

  const totalHours = dailyEntries.reduce((sum, e) => sum + e.hours, 0)
  const daysLogged = dailyEntries.length

  // 3. Count tasks completed this week
  const { count: tasksCompletedThisWeek } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('assigned_to', internId)
    .eq('status', 'done')
    .gte('updated_at', weekStart)
    .lte('updated_at', weekEnd + 'T23:59:59')

  // 4. Count submissions this week
  const { count: submissionsThisWeek } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('intern_id', internId)
    .gte('submitted_at', weekStart)
    .lte('submitted_at', weekEnd + 'T23:59:59')

  // 5. Extract highlights from longer log entries
  const highlights = (logs ?? [])
    .filter((l) => l.description.length > 60)
    .slice(0, 5)
    .map((l) => {
      const d = new Date(l.date).toLocaleDateString('en-US', {
        weekday: 'long',
      })
      return `${d}: ${l.description.slice(0, 100)}${
        l.description.length > 100 ? '…' : ''
      }`
    })

  // 6. Build report data
  const reportData: WeeklyReportData = {
    internName: intern.full_name ?? intern.email,
    internEmail: intern.email,
    mentorName: mentor?.full_name ?? mentor?.email ?? null,
    weekStart,
    weekEnd,
    totalHours,
    daysLogged,
    daysInWeek: 7,
    tasksCompletedThisWeek: tasksCompletedThisWeek ?? 0,
    submissionsThisWeek: submissionsThisWeek ?? 0,
    highlights,
    dailyEntries,
    internId,
  }

  // 7. Render PDF
  const buffer = await renderToBuffer(
    <WeeklyReportDocument data={reportData} />
  )

  // 8. Upload to Supabase Storage
  const path = `${internId}/weekly-report-${weekStart}.pdf`
  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(path, buffer, {
      contentType: 'application/pdf',
      upsert: true,
    })

  if (uploadError) {
    console.error('Report upload failed:', uploadError)
    return { success: false, error: 'Failed to upload report' }
  }

  // 9. Upsert weekly_reports row
  const { data: reportRow, error: dbError } = await supabase
    .from('weekly_reports')
    .upsert(
      {
        intern_id: internId,
        week_start: weekStart,
        week_end: weekEnd,
        summary: `Logged ${totalHours}h across ${daysLogged} days. ${tasksCompletedThisWeek ?? 0} tasks completed.`,
        total_hours: totalHours,
        pdf_url: path,
        generated_at: new Date().toISOString(),
      },
      { onConflict: 'intern_id,week_start' }
    )
    .select()
    .single()

  if (dbError || !reportRow) {
    console.error('Report DB error:', dbError)
    return { success: false, error: 'Failed to save report row' }
  }

  // 10. Send emails (fire-and-forget)
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? 'https://herman-intern-hub.vercel.app'
  const dashboardUrl = `${appUrl}/dashboard/reports`

  const emailHtml = `
    <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
      <h2 style="color:#0f172a;">Your weekly report — ${weekStart} to ${weekEnd}</h2>
      <p style="color:#334155;line-height:1.6;">
        You logged <strong>${totalHours}h</strong> across
        <strong>${daysLogged} days</strong> this week.
        ${tasksCompletedThisWeek ? `${tasksCompletedThisWeek} task(s) completed.` : ''}
      </p>
      <p style="color:#334155;line-height:1.6;">
        Download the full PDF report from your dashboard.
      </p>
      <p>
        <a href="${dashboardUrl}" style="background:#0f172a;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;display:inline-block;font-weight:600;">
          View my reports →
        </a>
      </p>
      <p style="color:#94a3b8;font-size:12px;margin-top:32px;">
        HERMAN Software Solutions Limited · Jinja, Uganda
      </p>
    </div>
  `

  sendEmail({
    to: intern.email,
    toName: intern.full_name ?? undefined,
    subject: `Weekly report — ${weekStart} to ${weekEnd}`,
    htmlContent: emailHtml,
  }).catch((err) => console.error('Intern report email failed:', err))

  if (mentor?.email) {
    sendEmail({
      to: mentor.email,
      toName: mentor.full_name ?? undefined,
      subject: `${intern.full_name ?? intern.email} — Weekly report`,
      htmlContent: emailHtml,
    }).catch((err) => console.error('Mentor report email failed:', err))
  }

  return { success: true, reportId: reportRow.id }
}

/**
 * Generate reports for all active interns for the given week.
 */
export async function generateAllWeeklyReports(
  weekStartDate?: Date
): Promise<{ generated: number; failed: number }> {
  const supabase = createAdminClient()

  const { data: interns } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'intern')
    .eq('status', 'active')

  let generated = 0
  let failed = 0

  for (const intern of interns ?? []) {
    const result = await generateWeeklyReport(intern.id, weekStartDate)
    if (result.success) generated++
    else {
      failed++
      console.error(`Report failed for ${intern.id}:`, result.error)
    }
  }

  return { generated, failed }
}