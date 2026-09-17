import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PublicNav } from '@/components/marketing/nav'
import { PublicFooter } from '@/components/marketing/footer'
import { AnimatedCounter } from '@/components/marketing/animated-counter'

export const metadata = {
  title: 'HERMAN Intern Hub — Launch your software career',
  description:
    'Join HERMAN Software Solutions as an intern. Real projects, real mentorship, real experience. Apply today.',
}

export default async function Home() {
  const supabase = await createClient()

  const { data: featuredInterns } = await supabase
    .from('profiles')
    .select('id, full_name, university, course, avatar_url, bio')
    .eq('role', 'intern')
    .in('status', ['active', 'completed'])
    .eq('directory_visible', true)
    .not('full_name', 'is', null)
    .order('created_at', { ascending: false })
    .limit(4)

  return (
    <div id="main-content" className="min-h-screen bg-white">
      <PublicNav />

      {/* ─── Hero ─────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/40" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-3 py-1 text-xs font-medium text-blue-700 mb-6">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
              Applications open
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-[1.1]">
              Launch your software career with{' '}
              <span className="text-blue-600">HERMAN</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-600 mt-6 leading-relaxed max-w-2xl">
              Work on real projects with real mentors — learning the same
              tools and patterns we use for paying clients. From Jinja, for
              anyone with an internet connection.
            </p>

            <div className="flex flex-wrap gap-3 mt-8">
              <Link
                href="/apply"
                className="group inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              >
                <span>Apply for internship</span>
                <svg
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
              <Link
                href="/interns"
                className="inline-flex items-center border border-slate-300 hover:border-slate-500 text-slate-700 font-medium px-6 py-3 rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                Meet our interns
              </Link>
            </div>

            {/* Stats — animated counter + solid numbers */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl">
              <div className="text-center sm:text-left">
                <AnimatedCounter
                  to={30}
                  suffix="+"
                  className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight"
                />
                <div className="text-sm text-slate-500 mt-1">
                  Intern positions planned
                </div>
              </div>

              <div className="text-center sm:text-left">
                <div className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
                  100%
                </div>
                <div className="text-sm text-slate-500 mt-1">Mentor-led</div>
              </div>

              <div className="text-center sm:text-left">
                <div className="text-4xl md:text-5xl font-bold text-green-600 tracking-tight">
                  Free
                </div>
                <div className="text-sm text-slate-500 mt-1">To apply</div>
              </div>
            </div>

            {/* Status line */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-6 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="font-medium">Now accepting applications</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-slate-200" />
              <div className="flex items-center gap-2 text-slate-500">
                <span>Remote-first</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── What you'll work with ─────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <div className="max-w-2xl mb-10 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            What you&apos;ll work with
          </h2>
          <p className="text-slate-600 mt-4 text-lg">
            The same tools and patterns we use to ship real products for
            clients — not toy exercises.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {[
            'React',
            'Next.js',
            'Tailwind CSS',
            'Node.js',
            'Python',
            'PostgreSQL',
            'MongoDB',
            'Docker',
            'AWS',
            'React Native',
            'Flutter',
            'Git',
          ].map((tech) => (
            <span
              key={tech}
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm font-medium text-slate-700 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors cursor-default"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* ─── How it works ────────────────────────────── */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-20">
          <div className="max-w-2xl mb-12 md:mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              How it works
            </h2>
            <p className="text-slate-600 mt-4 text-lg">
              A structured path from applicant to certified intern.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              {
                n: '01',
                title: 'Apply',
                body: 'Fill a short application online. No login needed.',
              },
              {
                n: '02',
                title: 'Get approved',
                body: 'We review personally. If accepted, you get an invite by email.',
              },
              {
                n: '03',
                title: 'Onboard',
                body: 'Set up your profile, pick your tech stack, sign the agreement.',
              },
              {
                n: '04',
                title: 'Build',
                body: 'Work on real projects with your mentor. Log daily, submit work.',
              },
              {
                n: '05',
                title: 'Get certified',
                body: 'Receive a verifiable certificate + experience letter.',
              },
            ].map((step) => (
              <div
                key={step.n}
                className="group bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-900 hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-3xl font-bold text-slate-300 group-hover:text-slate-900 transition-colors mb-3">
                  {step.n}
                </div>
                <div className="font-semibold text-slate-900 mb-1">
                  {step.title}
                </div>
                <div className="text-sm text-slate-600 leading-relaxed">
                  {step.body}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Why HERMAN ──────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <div className="max-w-2xl mb-12 md:mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Why intern with HERMAN
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Real projects',
              body: 'Contribute to live client systems — schools, voting portals, enterprise apps. Your code ships.',
              icon: (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              ),
              bg: 'bg-blue-50',
              text: 'text-blue-600',
            },
            {
              title: 'Mentor-led',
              body: 'You are paired with an experienced engineer. Regular feedback, code reviews, and guidance.',
              icon: (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              ),
              bg: 'bg-green-50',
              text: 'text-green-600',
            },
            {
              title: 'Verifiable certificate',
              body: 'Each certificate has a unique ID and QR code. Anyone can verify it online at any time.',
              icon: (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              ),
              bg: 'bg-amber-50',
              text: 'text-amber-600',
            },
          ].map((f) => (
            <div
              key={f.title}
              className="group bg-white border border-slate-200 rounded-2xl p-6 hover:border-slate-900 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div
                className={`w-11 h-11 rounded-xl ${f.bg} ${f.text} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
              >
                {f.icon}
              </div>
              <h3 className="font-semibold text-slate-900 text-lg mb-2">
                {f.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── About HERMAN ────────────────────────────── */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-20">
          <div className="max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              About HERMAN
            </h2>
            <div className="mt-6 space-y-4 text-slate-600 leading-relaxed">
              <p>
                HERMAN Software Solutions is a Ugandan software company based
                in Jinja, building robust web, mobile, and enterprise systems
                for clients across East Africa.
              </p>
              <p>
                We&apos;ve shipped production systems for schools,
                cooperatives, retailers, and media platforms — including a
                school platform serving 40+ pages, a voting portal handling
                multiple live elections, and a desktop app now live on the
                Microsoft Store.
              </p>
              <p>
                Our internship program exists because we believe the best way
                to learn software engineering is to build real software. Our
                mentors are engineers who ship code every day.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 text-sm">
              <span className="bg-white border border-slate-200 px-3 py-1.5 rounded-full text-slate-700 hover:border-slate-400 transition-colors">
                🇺🇬 Built in Jinja, Uganda
              </span>
              <span className="bg-white border border-slate-200 px-3 py-1.5 rounded-full text-slate-700 hover:border-slate-400 transition-colors">
                Remote-first
              </span>
              <span className="bg-white border border-slate-200 px-3 py-1.5 rounded-full text-slate-700 hover:border-slate-400 transition-colors">
                Production clients since 2024
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Current cohort ──────────────────────────── */}
      {featuredInterns && featuredInterns.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-20">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                Meet our interns
              </h2>
              <p className="text-slate-600 mt-2">
                Talented students building real software with us.
              </p>
            </div>
            <Link
              href="/interns"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              See all →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredInterns.map((intern) => (
              <Link
                key={intern.id}
                href={`/interns/${intern.id}`}
                className="group bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-900 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-14 h-14 bg-slate-900 text-white rounded-full flex items-center justify-center font-semibold text-lg mb-4 group-hover:scale-110 group-hover:bg-blue-600 transition-all duration-300">
                  {(intern.full_name ?? 'A').charAt(0).toUpperCase()}
                </div>
                <div className="font-medium text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                  {intern.full_name}
                </div>
                <div className="text-xs text-slate-500 mt-1 truncate">
                  {intern.course ?? intern.university ?? 'Intern'}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ─── FAQ ─────────────────────────────────────── */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 md:py-20">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight text-center mb-12">
            Common questions
          </h2>

          <div className="space-y-3">
            {[
              {
                q: 'Who can apply?',
                a: 'Any student or recent graduate interested in software engineering. We welcome applicants from any university in Uganda and beyond — and from anywhere in the world that has reliable internet.',
              },
              {
                q: 'Is the internship paid?',
                a: 'Internships are unpaid by default — you gain experience, mentorship, and a verified certificate. However, if you\u2019re assigned to a client project with a signed agreement, compensation is arranged.',
              },
              {
                q: 'How long is the internship?',
                a: 'Typically 3 months, but the duration is set during registration based on your availability and track.',
              },
              {
                q: 'Where is the internship based?',
                a: 'The program is remote-first. You can work from anywhere with a reliable internet connection. In-person meetups in Jinja can be arranged when needed.',
              },
              {
                q: 'How much time per week does it take?',
                a: 'Most interns commit around 15–25 hours per week. You and your mentor will agree on a schedule that works for both of you.',
              },
              {
                q: 'Do I need my own laptop?',
                a: 'Yes. You need access to a computer and reliable internet. A laptop with at least 8GB RAM is recommended but not strictly required.',
              },
              {
                q: 'Do I need to know how to code already?',
                a: 'You should have some programming fundamentals. We\u2019ll teach you the tools, patterns, and professional workflows — but we don\u2019t start from zero.',
              },
              {
                q: 'Will I get a certificate?',
                a: 'Yes. Every intern who completes the program receives a certificate of internship and an experience letter. Each certificate has a unique ID and QR code — anyone can verify it at herman-intern-hub.vercel.app/verify.',
              },
            ].map((faq, i) => (
              <details
                key={i}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden group hover:border-slate-400 transition-colors"
              >
                <summary className="cursor-pointer px-5 py-4 font-medium text-slate-900 hover:bg-slate-50 transition-colors list-none flex items-center justify-between gap-4">
                  <span>{faq.q}</span>
                  <span className="text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0">
                    ▾
                  </span>
                </summary>
                <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <div className="bg-slate-900 rounded-3xl p-8 md:p-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Ready to start?
          </h2>
          <p className="text-slate-300 mt-4 text-lg max-w-xl mx-auto">
            Applications take 5 minutes. We review every one personally.
          </p>
          <div className="mt-8">
            <Link
              href="/apply"
              className="group inline-flex items-center gap-2 bg-white text-slate-900 font-medium px-8 py-3 rounded-lg hover:bg-slate-100 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <span>Apply for internship</span>
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}