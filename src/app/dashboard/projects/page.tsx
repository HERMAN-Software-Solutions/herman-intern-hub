import Link from 'next/link'
import { Calendar, Briefcase } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/ui/page-header'
import { Badge } from '@/components/ui/badge'

const STATUS_VARIANTS: Record<
  string,
  'default' | 'info' | 'warning' | 'success' | 'neutral'
> = {
  planning: 'default',
  active: 'info',
  review: 'warning',
  completed: 'success',
  archived: 'neutral',
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
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl">
      <PageHeader
        title="My Projects"
        description="Projects you've been assigned to."
      />

      {!assignments || assignments.length === 0 ? (
        <EmptyState
          icon="📁"
          title="No projects yet"
          description="Your mentor will assign you to a project soon. This is where your work will appear."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments.map((a: any) => {
            const p = a.project
            if (!p) return null
            return (
              <Link
                key={a.id}
                href={`/dashboard/projects/${p.id}`}
                className="group block bg-white border border-slate-200 rounded-xl p-5 sm:p-6 hover:border-slate-400 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between mb-3 gap-3">
                  <Badge variant={STATUS_VARIANTS[p.status] ?? 'default'}>
                    {p.status}
                  </Badge>
                  <span className="text-xs text-slate-400 capitalize">
                    {a.role}
                  </span>
                </div>

                <h3 className="font-semibold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">
                  {p.title}
                </h3>

                {p.description && (
                  <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                    {p.description}
                  </p>
                )}

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 gap-2">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    {p.due_date
                      ? `Due ${new Date(p.due_date).toLocaleDateString()}`
                      : 'No due date'}
                  </span>
                  {p.is_client_project && (
                    <span className="text-blue-600 font-medium inline-flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      Client
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