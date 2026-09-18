import Link from 'next/link'
import { Star, ChevronRight, CheckCircle2, Circle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/ui/page-header'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'

export const metadata = { title: 'Performance Reviews — HERMAN Mentor Panel' }

export default async function MentorReviewsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get assigned interns
  const { data: interns } = await supabase
    .from('profiles')
    .select('id, full_name, email, avatar_url, status, university, course')
    .eq('role', 'intern')
    .eq('mentor_id', user.id)
    .order('created_at', { ascending: false })

  const internIds = (interns ?? []).map((i) => i.id)

  // Fetch existing reviews
  const { data: reviews } = internIds.length
    ? await supabase
        .from('performance_reviews')
        .select('intern_id, mentor_rating, peer_rating, updated_at')
        .in('intern_id', internIds)
    : { data: [] }

  const reviewMap = new Map(
    (reviews ?? []).map((r) => [r.intern_id, r])
  )

  const reviewed = (reviews ?? []).length

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl">
      <PageHeader
        title="Performance reviews"
        description="Rate and provide feedback for your assigned interns."
      />

      {/* Summary */}
      {interns && interns.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="text-xs text-slate-500">Total interns</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {interns.length}
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="text-xs text-slate-500">Reviews completed</div>
            <div className="text-2xl font-bold text-green-600 mt-1">
              {reviewed}/{interns.length}
            </div>
          </div>
        </div>
      )}

      {!interns || interns.length === 0 ? (
        <EmptyState
          icon="⭐"
          title="No interns assigned yet"
          description="Once an admin assigns interns to you, you can start writing their performance reviews here."
        />
      ) : (
        <div className="space-y-3">
          {interns.map((intern) => {
            const review = reviewMap.get(intern.id)
            const hasReview = !!review

            return (
              <Link
                key={intern.id}
                href={`/mentor/reviews/${intern.id}`}
                className="block bg-white border border-slate-200 rounded-xl p-4 sm:p-5 hover:border-slate-400 hover:shadow-sm transition-all"
              >
                <div className="flex items-start gap-4">
                  <Avatar
                    name={intern.full_name}
                    src={intern.avatar_url}
                    size="md"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="font-medium text-slate-900 truncate">
                        {intern.full_name ?? 'Unnamed intern'}
                      </div>
                      {hasReview ? (
                        <Badge variant="success">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Reviewed
                        </Badge>
                      ) : (
                        <Badge variant="warning">
                          <Circle className="w-3 h-3 mr-1" />
                          Not yet reviewed
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 truncate mt-0.5">
                      {intern.university ?? intern.email}
                    </div>

                    {hasReview && review && (
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {Number(review.mentor_rating).toFixed(1)}/5.0
                        </span>
                        <span>·</span>
                        <span>
                          Updated{' '}
                          {new Date(review.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0 mt-1" />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}