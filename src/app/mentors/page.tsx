import { createClient } from '@/lib/supabase/server'
import { PublicNav } from '@/components/marketing/nav'
import { PublicFooter } from '@/components/marketing/footer'

export const metadata = {
  title: 'Our Mentors — HERMAN Intern Hub',
  description:
    'Meet the engineers who guide our interns through real projects at HERMAN Software Solutions.',
}

export default async function MentorsPage() {
  const supabase = await createClient()

  const { data: mentors } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, bio, university, course')
    .eq('role', 'mentor')
    .eq('status', 'active')
    .eq('directory_visible', true)
    .eq('is_demo', false)
    .not('full_name', 'is', null)
    .order('full_name', { ascending: true })

  return (
    <div id="main-content" className="min-h-screen bg-white">
      <PublicNav />

      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="max-w-2xl mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
            Our mentors
          </h1>
          <p className="text-lg text-slate-600 mt-4">
            Experienced engineers who guide every HERMAN intern through real
            projects, code reviews, and professional growth.
          </p>
        </div>

        {!mentors || mentors.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-16 text-center">
            <div className="text-4xl mb-4">🤝</div>
            <p className="text-slate-500">Mentor profiles coming soon.</p>
            <p className="text-sm text-slate-400 mt-1">
              We&apos;re finalizing our mentor roster.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {mentors.map((m) => (
              <article
                key={m.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-slate-400 hover:shadow-sm transition-all"
              >
                <div className="flex items-start gap-4 mb-4">
                  {m.avatar_url ? (
                    <img
                      src={m.avatar_url}
                      alt={m.full_name ?? 'Mentor'}
                      className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-slate-900 text-white flex items-center justify-center text-lg font-semibold flex-shrink-0">
                      {(m.full_name ?? 'M').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">
                      {m.full_name}
                    </h3>
                    {m.course && (
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        {m.course}
                      </p>
                    )}
                    {m.university && (
                      <p className="text-xs text-slate-400 mt-0.5 truncate">
                        {m.university}
                      </p>
                    )}
                  </div>
                </div>

                {m.bio && (
                  <p className="text-sm text-slate-600 line-clamp-3">
                    {m.bio}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}

        <div className="mt-16 pt-8 border-t border-slate-200 text-center">
          <p className="text-sm text-slate-500 mb-4">
            Interested in being mentored by our team?
          </p>
          <a
            href="/apply"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium px-5 py-3 rounded-lg transition-colors"
          >
            Apply for an internship →
          </a>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}