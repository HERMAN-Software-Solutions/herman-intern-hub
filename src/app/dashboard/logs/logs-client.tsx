'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { upsertLog, deleteLog } from './actions'

type Log = {
  id: string
  date: string
  hours_worked: number
  description: string
  created_at: string
}

export function LogsClient({
  today,
  todayLog,
  logs,
}: {
  today: string
  todayLog: Log | null
  logs: Log[]
}) {
  const router = useRouter()
  const [hours, setHours] = useState(todayLog?.hours_worked ?? '')
  const [description, setDescription] = useState(todayLog?.description ?? '')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    setError(null)
    const h = Number(hours)
    if (!h || h <= 0 || h > 24) {
      setError('Hours must be between 0 and 24')
      return
    }
    if (!description.trim() || description.trim().length < 5) {
      setError('Please describe what you worked on (min 5 characters)')
      return
    }

    startTransition(async () => {
      const res = await upsertLog({
        date: today,
        hours: h,
        description: description.trim(),
      })
      if (res.error) {
        setError(res.error)
        return
      }
      router.refresh()
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this log entry?')) return
    startTransition(async () => {
      const res = await deleteLog(id)
      if (res.error) setError(res.error)
      else router.refresh()
    })
  }

  // Week summary
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const weeklyLogs = logs.filter((l) => new Date(l.date) >= oneWeekAgo)
  const weeklyHours = weeklyLogs.reduce(
    (sum, l) => sum + Number(l.hours_worked),
    0
  )

  return (
    <div className="space-y-8">
      {/* Today's log */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="font-semibold text-slate-900 mb-4">
          {todayLog ? "Update today's log" : "Log today's work"}
        </h2>

        <div className="space-y-4">
          {/* Date + Hours side by side on desktop, stacked on mobile */}
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
           <div>
             <label className="block text-sm font-medium text-slate-700 mb-1.5">
             Date
             </label>
             <input
             type="date"
             value={today}
             disabled
             className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 text-sm"
            />
          </div>

         <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
           Hours worked
          </label>
          <input
          type="number"
          step="0.5"
          min="0"
          max="24"
          inputMode="decimal"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          placeholder="e.g. 6"
          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none text-sm"
         />
        </div>
       </div>

       {/* Full-width description */}
       <div>
         <label className="block text-sm font-medium text-slate-700 mb-1.5">
          What did you work on?
         </label>
         <textarea
         value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        placeholder="Brief summary of your work today…"
        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none text-sm resize-none"
        />
       </div>
      </div>

        {error && (
          <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </div>
        )}

        <div className="mt-4">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-medium px-5 py-2 rounded-lg transition-colors text-sm"
          >
            {isPending ? 'Saving…' : todayLog ? 'Update log' : 'Save log'}
          </button>
        </div>
      </div>

      {/* Week summary */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex items-center justify-between">
        <div>
          <div className="text-sm text-slate-500">Last 7 days</div>
          <div className="text-2xl font-bold text-slate-900">
            {weeklyHours}h logged
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-500">Days logged</div>
          <div className="text-2xl font-bold text-slate-900">
            {weeklyLogs.length}
          </div>
        </div>
      </div>

      {/* History */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          History (last 30 days)
        </h2>

        {logs.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-sm">
            No logs yet. Start logging your work above.
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-left text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Hours</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 w-16"></th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {new Date(log.date).toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-medium">
                      {log.hours_worked}h
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {log.description}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(log.id)}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
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