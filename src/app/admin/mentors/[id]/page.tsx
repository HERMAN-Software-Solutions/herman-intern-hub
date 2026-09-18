import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui/page-header'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '../../_components/status-badge'

export default async function MentorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: mentor } = await supabase
    .from('profiles')
    .select('id, full_name, email, avatar_url, role, bio, created_at')
    .eq('id', id)
    .in('role', ['mentor', 'admin', 'super_admin'])
    .single()

  if (!mentor) notFound()

  // Assigned interns
  const { data: interns } = await supabase
    .from('profiles')
    .select('id, full_name, email, avatar_url, status, university, course')
    .eq('role', 'intern')
    .eq('mentor_id', id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
      <Link
        href="/admin/mentors"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to mentors
      </Link>

      <div className="flex flex-col sm:flex-row items-start gap-4 mb-8">
        <Avatar
          name={mentor.full_name}
          src={mentor.avatar_url}
          size="xl"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {mentor.full_name ?? 'Unnamed mentor'}
            </h1>
            {mentor.role === 'super_admin' && (
              <Badge variant="info">Super admin</Badge>
            )}
            {mentor.role === 'admin' && <Badge variant="info">Admin</Badge>}
          </div>
          <p className="text-slate-500">{mentor.email}</p>
          <p className="text-xs text-slate-400 mt-1">
            Joined {new Date(mentor.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {mentor.bio && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Bio
          </h2>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">
            {mentor.bio}
          </p>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Assigned interns
          </h2>
          <span className="text-sm text-slate-500">
            {interns?.length ?? 0} assigned
          </span>
        </div>

        {!interns || interns.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
            <p className="text-sm text-slate-500">
              No interns assigned to this mentor yet.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Assign mentors from each intern&apos;s detail page.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {interns.map((intern) => (
              <Link
                key={intern.id}
                href={`/admin/interns/${intern.id}`}
                className="block bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-400 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    name={intern.full_name}
                    src={intern.avatar_url}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900 truncate">
                      {intern.full_name ?? '—'}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {intern.university ?? intern.email}
                    </div>
                  </div>
                  <StatusBadge status={intern.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}