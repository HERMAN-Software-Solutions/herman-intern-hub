import Link from 'next/link'
import { UserPlus, Users, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui/page-header'
import { Card } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'

export const metadata = { title: 'Mentors — HERMAN Admin' }

export default async function MentorsPage() {
  const supabase = await createClient()

  const { data: mentors } = await supabase
    .from('profiles')
    .select('id, full_name, email, avatar_url, role, status, created_at')
    .in('role', ['mentor', 'admin', 'super_admin'])
    .order('created_at', { ascending: false })

  // For each mentor, count assigned interns
  const mentorIds = (mentors ?? []).map((m) => m.id)

  const { data: internCounts } = mentorIds.length
    ? await supabase
        .from('profiles')
        .select('mentor_id')
        .eq('role', 'intern')
        .in('mentor_id', mentorIds)
    : { data: [] }

  const countMap = new Map<string, number>()
  for (const row of internCounts ?? []) {
    if (row.mentor_id) {
      countMap.set(row.mentor_id, (countMap.get(row.mentor_id) ?? 0) + 1)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl">
      <PageHeader
        title="Mentors"
        description="Manage mentors who guide interns through their program."
        action={
          <Link
            href="/admin/mentors/invite"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Invite mentor
          </Link>
        }
      />

      {!mentors || mentors.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No mentors yet"
          description="Invite your first mentor to start guiding interns."
        />
      ) : (
        <div className="space-y-3">
          {mentors.map((mentor) => {
            const internCount = countMap.get(mentor.id) ?? 0
            return (
              <Link
                key={mentor.id}
                href={`/admin/mentors/${mentor.id}`}
                className="block bg-white border border-slate-200 rounded-xl p-4 sm:p-5 hover:border-slate-400 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-4">
                  <Avatar
                    name={mentor.full_name}
                    src={mentor.avatar_url}
                    size="md"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="font-medium text-slate-900 truncate">
                        {mentor.full_name ?? '—'}
                      </div>
                      {mentor.role === 'super_admin' && (
                        <Badge variant="info">Super admin</Badge>
                      )}
                      {mentor.role === 'admin' && (
                        <Badge variant="info">Admin</Badge>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 truncate mt-0.5">
                      {mentor.email}
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                      <Users className="w-3 h-3" />
                      <span>
                        {internCount}{' '}
                        {internCount === 1 ? 'intern' : 'interns'} assigned
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}