import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

const STATUS_COLORS: Record<string, string> = {
  planning: 'bg-slate-100 text-slate-700',
  active: 'bg-blue-100 text-blue-700',
  review: 'bg-amber-100 text-amber-700',
  completed: 'bg-green-100 text-green-700',
  archived: 'bg-slate-100 text-slate-500',
}

export const metadata = { title: 'Projects — HERMAN Intern Hub' }

export default async function ProjectsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: assignments } = await supabase
    .from('project_assignments')
    .select(
      `id, role, compensation_type, assigned_at,
       project:project_id (
         id, title, description, status, start_date, due_date, is_client_project
       )`
    )
    .eq('intern_id', user.id)
    .order('assigned_at', { ascending: false })

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">My Projects</h1>
        <p className="text-slate-500 mt-1">
          Projects you've been assigned to.
        </p>
      </div>

      {!assignments || assignments.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <p className="text-slate-500">No projects assigned yet.</p>
          <p className="text-sm text-slate-400 mt-1">
            Your mentor will assign projects soon.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments.map((a: any) => {
            const p = a.project
            if (!p) return null
            return (
              <Link
                key={a.id}
                href={`/dashboard/projects/${p.id}`}
                className="block bg-white border border-slate-200 rounded-xl p-6 hover:border-slate-400 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      STATUS_COLORS[p.status] ?? 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {p.status}
                  </span>
                  <span className="text-xs text-slate-400 capitalize">
                    {a.role}
                  </span>
                </div>

                <h3 className="font-semibold text-slate-900 text-lg">
                  {p.title}
                </h3>

                {p.description && (
                  <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                    {p.description}
                  </p>
                )}

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>
                    {p.due_date
                      ? `Due ${new Date(p.due_date).toLocaleDateString()}`
                      : 'No due date'}
                  </span>
                  {p.is_client_project && (
                    <span className="text-blue-600 font-medium">
                      Client project
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}