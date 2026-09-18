import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PublicNav } from '@/components/marketing/nav'
import { PublicFooter } from '@/components/marketing/footer'

export const metadata = {
  title: 'Success Stories — HERMAN Intern Hub',
  description:
    'Where our HERMAN alumni are now. Real stories from interns who built real software with us.',
}

export default async function SuccessStoriesPage() {
  const supabase = await createClient()

  // Step 1: Get all completed interns who are directory-visible
  const { data: alumni, error: alumniError } = await supabase
    .from('profiles')
    .select('id, full_name, university, course, bio, avatar_url, start_date, end_date')
    .eq('role', 'intern')
    .eq('status', 'completed')
    .eq('directory_visible', true)
    .not('full_name', 'is', null)
    .order('end_date', { ascending: false })
    .limit(50)

  if (alumniError) {
    console.error('Success stories query error:', alumniError)
  }

  // Step 2: Get all certificates for these interns
  const alumniIds = (alumni ?? []).map((a) => a.id)
  const { data: certificates } = alumniIds.length
    ? await supabase
        .from('documents')
        .select('intern_id, certificate_id, performance_score')
        .in('intern_id', alumniIds)
        .eq('type', 'certificate')
        .not('certificate_id', 'is', null)
    : { data: [] }

  // Step 3: Map certificates to their interns
  const certMap = new Map(
    (certificates ?? []).map((c) => [c.intern_id, c])
  )

  // Step 4: Only show alumni who have a certificate
  const filtered = (alumni ?? []).filter((a) => certMap.has(a.id))

  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="max-w-2xl mb-14">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
            Success stories
          </h1>
          <p className="text-lg text-slate-600 mt-4">
            HERMAN interns who completed the program and earned their
            certificate. Real skills, real projects, real outcomes.
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-16 text-center">
            <div className="text-4xl mb-4">🌟</div>
            <p className="text-slate-500">No alumni stories yet.</p>
            <p className="text-sm text-slate-400 mt-1">
              Check back soon as our first cohort completes.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {filtered.map((alum: any) => {
              const cert = certMap.get(alum.id)

              const start = alum.start_date
                ? new Date(alum.start_date).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                  })
                : null
              const end = alum.end_date
                ? new Date(alum.end_date).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                  })
                : null

              return (
                <article
                  key={alum.id}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 transition-colors"
                >
                  <div className="grid grid-cols-1 md:grid-cols-[200px_1fr]">
                    {/* Left column */}
                    <div className="bg-slate-50 p-6 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-slate-200">
                      {alum.avatar_url ? (
                        <img
                          src={alum.avatar_url}
                          alt={alum.full_name}
                          className="w-20 h-20 rounded-full object-cover mb-3"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-slate-900 text-white flex items-center justify-center text-2xl font-semibold mb-3">
                          {(alum.full_name ?? 'A').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="font-semibold text-slate-900">
                        {alum.full_name}
                      </div>
                      {alum.course && (
                        <div className="text-xs text-slate-500 mt-0.5">
                          {alum.course}
                        </div>
                      )}
                      {alum.university && (
                        <div className="text-xs text-slate-400 mt-0.5">
                          {alum.university}
                        </div>
                      )}
                    </div>

                    {/* Right column */}
                    <div className="p-6">
                      {start && end && (
                        <div className="text-xs text-slate-500 mb-3">
                          Interned {start} – {end}
                        </div>
                      )}

                      {alum.bio && (
                        <p className="text-sm text-slate-700 leading-relaxed mb-4">
                          {alum.bio}
                        </p>
                      )}

                      {cert?.certificate_id && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between gap-3 flex-wrap">
                          <div className="text-xs text-green-800">
                            🎓 Certified ·{' '}
                            <span className="font-mono">
                              {cert.certificate_id}
                            </span>
                            {cert.performance_score != null && (
                              <>
                                {' '}
                                ·{' '}
                                {Number(cert.performance_score).toFixed(1)}
                                /5.0
                              </>
                            )}
                          </div>
                          <Link
                            href={`/verify/${cert.certificate_id}`}
                            className="text-xs text-green-800 hover:text-green-900 font-medium"
                          >
                            Verify →
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      <PublicFooter />
    </div>
  )
}