'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Trash2, Calendar, Clock } from 'lucide-react'
import { upsertLog, deleteLog } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

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
  const [hours, setHours] = useState(todayLog?.hours_worked?.toString() ?? '')
  const [description, setDescription] = useState(todayLog?.description ?? '')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    setError(null)
    const h = Number(hours)
    if (!h || h <= 0 || h > 24) {
      setError('Hours must be between 0 and 24')
      toast.error('Hours must be between 0 and 24')
      return
    }
    if (!description.trim() || description.trim().length < 5) {
      setError('Please describe what you worked on (min 5 characters)')
      toast.error('Description too short', {
        description: 'Please write at least 5 characters.',
      })
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
        toast.error(res.error)
        return
      }
      toast.success(todayLog ? 'Log updated' : 'Log saved', {
        description: `${h}h logged for today.`,
      })
      router.refresh()
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this log entry?')) return
    startTransition(async () => {
      const res = await deleteLog(id)
      if (res.error) {
        setError(res.error)
        toast.error(res.error)
      } else {
        toast.success('Log deleted')
        router.refresh()
      }
    })
  }

  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const weeklyLogs = logs.filter((l) => new Date(l.date) >= oneWeekAgo)
  const weeklyHours = weeklyLogs.reduce(
    (sum, l) => sum + Number(l.hours_worked),
    0
  )

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Today's log form */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
        <h2 className="font-semibold text-slate-900 mb-4 text-base sm:text-lg">
          {todayLog ? "Update today's log" : "Log today's work"}
        </h2>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Date
              </label>
              <div className="flex items-center gap-2 w-full px-3.5 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 text-sm">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span>
                  {new Date(today).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Hours worked
              </label>
              <div className="relative">
                <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  inputMode="decimal"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  placeholder="e.g. 6"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-colors"
                />
              </div>
            </div>
          </div>

          <Textarea
            name="description"
            label="What did you work on?"
            rows={3}
            placeholder="Brief summary of your work today…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            hint={`${description.length} characters (min 5)`}
          />
        </div>

        {error && (
          <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </div>
        )}

        <div className="mt-4">
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleSave}
            loading={isPending}
            className="w-full sm:w-auto"
          >
            {isPending ? 'Saving…' : todayLog ? 'Update log' : 'Save log'}
          </Button>
        </div>
      </div>

      {/* Week summary */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs sm:text-sm text-slate-500">Last 7 days</div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            {weeklyHours}h
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs sm:text-sm text-slate-500">Days logged</div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            {weeklyLogs.length}
          </div>
        </div>
      </div>

      {/* History */}
      <div>
        <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4">
          History (last 30 days)
        </h2>

        {logs.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-sm">
            No logs yet. Start logging your work above.
          </div>
        ) : (
          <>
            {/* Mobile: cards */}
            <div className="sm:hidden space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="bg-white border border-slate-200 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="text-sm font-medium text-slate-900">
                      {new Date(log.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="text-sm font-semibold text-slate-900 whitespace-nowrap">
                      {log.hours_worked}h
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed mb-3">
                    {log.description}
                  </p>
                  <button
                    onClick={() => handleDelete(log.id)}
                    className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-medium transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden sm:block bg-white border border-slate-200 rounded-xl overflow-hidden">
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
                    <tr
                      key={log.id}
                      className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                        {new Date(log.date).toLocaleDateString('en-US', {
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
                          className="text-slate-400 hover:text-red-600 transition-colors"
                          aria-label="Delete log"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}