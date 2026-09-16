import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PublicNav } from '@/components/marketing/nav'
import { PublicFooter } from '@/components/marketing/footer'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: intern } = await supabase
    .from('profiles')
    .select('full_name, university, course')
    .eq('id', id)
    .eq('role', 'intern')
    .eq('directory_visible', true)
    .in('status', ['active', 'completed'])
    .maybeSingle()

  if (!intern) return { title: 'Intern not found' }

  return {
    title: `${intern.full_name} — HERMAN Intern`,
    description: intern.full_name
      ? `${intern.full_name}${intern.course ? ` studying ${intern.course}` : ''}${intern.university ? ` at ${intern.university}` : ''} — HERMAN Software Solutions intern.`
      : undefined,
  }
}

export default async function InternProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: intern } = await supabase
    .from('profiles')
    .select(
      `id, full_name, university, course, year_of_study, bio, avatar_url,
       status, start_date, end_date, created_at`
    )
    .eq('id', id)
    .eq('role', 'intern')
    .eq('directory_visible', true)
    .in('status', ['active', 'completed'])
    .maybeSingle()

  if (!intern || !intern.full_name) notFound()

  // Tech stacks
  const { data: stacksRaw } = await supabase
    .from('intern_tech_stacks')
    .select('is_primary, proficiency, tech_stack:tech_stack_id (name, category)')
    .eq('intern_id', id)

  const stacks = (stacksRaw ?? [])
    .map((s: any) => {
      const ts = Array.isArray(s.tech_stack) ? s.tech_stack[0] : s.tech_stack
      return {
        name: ts?.name,
        category: ts?.category,
        isPrimary: s.is_primary,
        proficiency: s.proficiency,
      }
    })
    .filter((s) => s.name)

  // Completed tasks count (public display — no content)
  const { count: completedTasksCount } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('assigned_to', id)
    .eq('status', 'done')

  // Certificates (public metadata only)
  const { data: certificates } = await supabase
    .from('documents')
    .select('certificate_id, performance_score, issued_date')
    .eq('intern_id', id)
    .eq('type', 'certificate')

  const isAlumni = intern.status === 'completed'
  const initials = (intern.full_name ?? 'A')
    .split(' ')
    .map((p: string) => p.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      <section className="max-w-4xl mx-auto px-6 py-12">
        <Link
          href="/interns"
          className="text-sm text-slate-500 hover:text-slate-900"
        >
          ← All interns
        </Link>

        {/* Header */}
        <div className="mt-8 flex flex-col sm:flex-row items-start gap-6">
          {intern.avatar_url ? (
            <img
              src={intern.avatar_url}
              alt={intern.full_name}
              className="w-24 h-24 rounded-2xl object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-2xl font-semibold flex-shrink-0">
              {initials}
            </div>
          )}

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900">
                {intern.full_name}
              </h1>
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  isAlumni
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {isAlumni ? 'Alumni' : 'Current intern'}
              </span>
            </div>

            <p className="text-slate-600 mt-2">
              {intern.course ?? 'Software Engineering'}
              {intern.university && (
                <>
                  {' '}· {intern.university}
                </>
              )}
            </p>

            {intern.year_of_study && (
              <p className="text-sm text-slate-500 mt-0.5">
                {intern.year_of_study}
              </p>
            )}

            {intern.start_date && (
              <p className="text-sm text-slate-400 mt-3">
                {isAlumni ? 'Interned' : 'Interning'}{' '}
                {new Date(intern.start_date).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })}
                {intern.end_date && (
                  <>
                    {' '}
                    –{' '}
                    {new Date(intern.end_date).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric',
                    })}
                  </>
                )}
              </p>
            )}
          </div>
        </div>

        {/* Bio */}
        {intern.bio && (
          <div className="mt-10">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              About
            </h2>
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
              {intern.bio}
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="mt-10 grid grid-cols-3 gap-4">
          <Stat
            label="Tasks completed"
            value={completedTasksCount ?? 0}
          />
          <Stat
            label="Tech stack"
            value={stacks.length}
          />
          <Stat
            label="Certificates"
            value={certificates?.length ?? 0}
          />
        </div>

        {/* Tech stack */}
        {stacks.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Tech stack
            </h2>
            <div className="space-y-2">
              {stacks.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900 text-sm">
                      {s.name}
                    </span>
                    {s.isPrimary && (
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                        Primary
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 capitalize">
                    {s.proficiency}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certificate */}
        {certificates && certificates.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Certificate
            </h2>
            {certificates.map((cert) => (
              <div
                key={cert.certificate_id}
                className="bg-green-50 border border-green-200 rounded-xl p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium text-green-900">
                      Certificate of Internship
                    </div>
                    <div className="text-xs text-green-700 mt-1">
                      ID: <code>{cert.certificate_id}</code> · Issued{' '}
                      {new Date(cert.issued_date).toLocaleDateString()}
                      {cert.performance_score != null && (
                        <> · Score {Number(cert.performance_score).toFixed(1)}/5.0</>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/verify/${cert.certificate_id}`}
                    className="text-xs bg-white border border-green-300 hover:border-green-500 text-green-800 font-medium px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                  >
                    Verify →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <PublicFooter />
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-xs text-slate-500 mt-1">{label}</div>
    </div>
  )
}