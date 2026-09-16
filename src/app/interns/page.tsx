import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PublicNav } from '@/components/marketing/nav'
import { PublicFooter } from '@/components/marketing/footer'

export const metadata = {
  title: 'Our Interns — HERMAN Intern Hub',
  description:
    'Meet the talented interns building real software at HERMAN Software Solutions.',
}

export default async function InternsDirectoryPage() {
  const supabase = await createClient()

  const { data: interns } = await supabase
    .from('profiles')
    .select(
      `id, full_name, university, course, avatar_url, bio, status, created_at,
       intern_tech_stacks (
         is_primary,
         tech_stack:tech_stack_id (name)
       )`
    )
    .eq('role', 'intern')
    .in('status', ['active', 'completed'])
    .eq('directory_visible', true)
    .not('full_name', 'is', null)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="max-w-2xl mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
            Our interns
          </h1>
          <p className="text-lg text-slate-600 mt-4">
            Talented students and graduates building real software with us.
          </p>
        </div>

        {!interns || interns.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-16 text-center">
            <div className="text-4xl mb-4">👋</div>
            <p className="text-slate-500">
              No interns are publicly listed yet.
            </p>
            <p className="text-sm text-slate-400 mt-1">
              Check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {interns.map((intern: any) => {
              const stacks = (intern.intern_tech_stacks ?? [])
                .map((s: any) => {
                  const ts = Array.isArray(s.tech_stack)
                    ? s.tech_stack[0]
                    : s.tech_stack
                  return ts?.name
                })
                .filter(Boolean)
                .slice(0, 4)

              return (
                <Link
                  key={intern.id}
                  href={`/interns/${intern.id}`}
                  className="group bg-white border border-slate-200 rounded-2xl p-6 hover:border-slate-400 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start gap-4 mb-4">
                    {intern.avatar_url ? (
                      <img
                        src={intern.avatar_url}
                        alt={intern.full_name ?? 'Intern'}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-slate-900 text-white flex items-center justify-center text-lg font-semibold">
                        {(intern.full_name ?? 'A').charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                        {intern.full_name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        {intern.course ?? 'Software Engineering'}
                      </p>
                      {intern.university && (
                        <p className="text-xs text-slate-400 mt-0.5 truncate">
                          {intern.university}
                        </p>
                      )}
                    </div>
                  </div>

                  {intern.bio && (
                    <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                      {intern.bio}
                    </p>
                  )}

                  {stacks.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {stacks.map((name: string, i: number) => (
                        <span
                          key={i}
                          className="text-xs bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </section>

      <PublicFooter />
    </div>
  )
}