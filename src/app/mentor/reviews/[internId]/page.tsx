import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/ui/page-header'
import { Avatar } from '@/components/ui/avatar'
import { ReviewForm } from '@/components/reviews/review-form'

export default async function MentorReviewDetailPage({
  params,
}: {
  params: Promise<{ internId: string }>
}) {
  const { internId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch intern — must be assigned to this mentor
  const { data: intern } = await supabase
    .from('profiles')
    .select('id, full_name, email, university, course, avatar_url, status')
    .eq('id', internId)
    .eq('role', 'intern')
    .eq('mentor_id', user.id)
    .maybeSingle()

  if (!intern) notFound()

  const { data: review } = await supabase
    .from('performance_reviews')
    .select('*')
    .eq('intern_id', internId)
    .maybeSingle()

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl">
      <Link
        href="/mentor/reviews"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to reviews
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <Avatar
          name={intern.full_name}
          src={intern.avatar_url}
          size="lg"
        />
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {intern.full_name ?? 'Unnamed intern'}
          </h1>
          <p className="text-sm text-slate-500">
            {intern.university && <>{intern.university} · </>}
            {intern.email}
          </p>
        </div>
      </div>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
        This review is used to compute the intern&apos;s final certificate
        score. You can save and edit it as many times as needed before issuing
        their certificate.
      </div>

      <ReviewForm
        internId={internId}
        initial={{
          mentorRating: review?.mentor_rating ?? null,
          peerRating: review?.peer_rating ?? null,
          strengths: review?.strengths ?? '',
          improvements: review?.improvements ?? '',
          comments: review?.comments ?? '',
        }}
      />
    </div>
  )
}