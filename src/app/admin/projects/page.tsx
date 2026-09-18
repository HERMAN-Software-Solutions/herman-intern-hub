import Link from 'next/link'
import { Plus, Users, Calendar, ChevronRight, Briefcase } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { Badge } from '@/components/ui/badge'

export const metadata = { title: 'Projects — HERMAN Admin' }

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

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'planning', label: 'Planning' },
  { key: 'active', label: 'Active' },
  { key: 'review', label: 'Review' },
  { key: 'completed', label: 'Completed' },
  { key: 'archived', label: 'Archived' },
]

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const activeFilter = params.status ?? 'all'
  const supabase = await createClient()

  let query = supabase
    .from('projects')
    .select(
      `id, title, description, status, start_date, due_date,
       is_client_project, created_at, created_by`
    )
    .order('created_at', { ascending: false })

  if (activeFilter !== 'all') {
    query = query.eq('status', activeFilter)
  }

  const { data: projects } = await query

  // Counts
  const { data: allProjects } = await supabase
    .from('projects')
    .select('status')

  const counts = {
    all: allProjects?.length ?? 0,
    planning: allProjects?.filter((p) => p.status === 'planning').length ?? 0,
    active: allProjects?.filter((p) => p.status === 'active').length ?? 0,
    review: allProjects?.filter((p) => p.status === 'review').length ?? 0,
    completed: allProjects?.filter((p) => p.status === 'completed').length ?? 0,
    archived: allProjects?.filter((p) => p.status === 'archived').length ?? 0,
  }

  // Assignments per project
  const projectIds = (projects ?? []).map((p) => p.id)
  const assignmentCounts = new Map<string, number>()

  if (projectIds.length > 0) {
    const { data: assignments } = await supabase
      .from('project_assignments')
      .select('project_id')

    for (const a of assignments ?? []) {
      if (projectIds.includes(a.project_id)) {
        assignmentCounts.set(
          a.project_id,
          (assignmentCounts.get(a.project_id) ?? 0) + 1
        )
      }
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl">
      <PageHeader
        title="Projects"
        description="Manage client and internal projects."
        action={
          <Link
            href="/admin/projects/new"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New project
          </Link>
        }
      />

      {/* Filters */}
      <div className="flex gap-1 mb-6 border-b border-slate-200 overflow-x-auto">
        {FILTERS.map((f) => {
          const active = activeFilter === f.key
          return (
            <Link
              key={f.key}
              href={`/admin/projects?status=${f.key}`}
              className={`px-4 py-2 text-sm border-b-2 whitespace-nowrap transition-colors ${
                active
                  ? 'border-slate-900 text-slate-900 font-medium'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {f.label}
              <span className="ml-2 text-xs text-slate-400">
                {counts[f.key as keyof typeof counts] ?? 0}
              </span>
            </Link>
          )
        })}
      </div>

      {!projects || projects.length === 0 ? (
        <EmptyState
          icon="📁"
          title="No projects here"
          description="Create a project to assign interns and track work."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {projects.map((p) => {
            const internCount = assignmentCounts.get(p.id) ?? 0
            return (
              <Link
                key={p.id}
                href={`/admin/projects/${p.id}`}
                className="group bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-400 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={STATUS_VARIANTS[p.status] ?? 'default'}>
                      {p.status}
                    </Badge>
                    {p.is_client_project && (
                      <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-medium">
                        <Briefcase className="w-3 h-3" />
                        Client
                      </span>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />
                </div>

                <h3 className="font-semibold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">
                  {p.title}
                </h3>

                {p.description && (
                  <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                    {p.description}
                  </p>
                )}

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 gap-3 flex-wrap">
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="w-3 h-3" />
                    {internCount} {internCount === 1 ? 'intern' : 'interns'}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    {p.due_date
                      ? `Due ${new Date(p.due_date).toLocaleDateString()}`
                      : 'No due date'}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}