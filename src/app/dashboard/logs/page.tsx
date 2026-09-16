import { createClient } from '@/lib/supabase/server'
import { LogsClient } from './logs-client'

export const metadata = { title: 'Daily log — HERMAN Intern Hub' }

export default async function LogsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch last 30 days of logs
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: logs } = await supabase
    .from('daily_logs')
    .select('id, date, hours_worked, description, created_at')
    .eq('intern_id', user.id)
    .gte('date', thirtyDaysAgo.toISOString().slice(0, 10))
    .order('date', { ascending: false })

  const today = new Date().toISOString().slice(0, 10)
  const todayLog = logs?.find((l) => l.date === today)

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Daily Log</h1>
        <p className="text-slate-500 mt-1">
          Log your work each day. We compile weekly reports automatically.
        </p>
      </div>

      <LogsClient
        today={today}
        todayLog={todayLog ?? null}
        logs={logs ?? []}
      />
    </div>
  )
}