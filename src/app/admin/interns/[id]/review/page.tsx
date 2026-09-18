import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ReviewForm } from '@/components/reviews/review-form'

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: intern } = await supabase
    .from('profiles')
    .select('id, full_name, email, university, course, status')
    .eq('id', id)
    .eq('role', 'intern')
    .maybeSingle()

  if (!intern) notFound()

  const { data: review } = await supabase
    .from('performance_reviews')
    .select('*')
    .eq('intern_id', id)
    .maybeSingle()

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl">
      <Link
        href={`/admin/interns/${id}`}
        className="text-sm text-slate-500 hover:text-slate-900"
      >
        ← Back to intern
      </Link>

      <div className="mt-4 mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Performance review
        </h1>
        <p className="text-slate-500 mt-1">
          {intern.full_name ?? intern.email}
          {intern.university && <> · {intern.university}</>}
        </p>
      </div>

      <ReviewForm
        internId={id}
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