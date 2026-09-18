import Link from 'next/link'
import {
  ArrowRight,
  Palette,
  FileText,
  MessageSquare,
  GitBranch,
  ClipboardCheck,
  Award,
  Sparkles,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PublicNav } from '@/components/marketing/nav'
import { PublicFooter } from '@/components/marketing/footer'
import { AnimatedCounter } from '@/components/marketing/animated-counter'

export const metadata = {
  title: 'HERMAN Intern Hub — Launch your software career',
  description:
    'Join HERMAN Software Solutions as an intern. Work on real projects, learn from senior engineers, and ship production software.',
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

      {/* ─── HERO ──────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/40" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-3 py-1 text-xs font-medium text-blue-700 mb-6">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
              Applications open
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-[1.05]">
              Launch your software career with{' '}
              <span className="text-blue-600">HERMAN</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-600 mt-6 leading-relaxed max-w-2xl">
              Learn software engineering the way it&apos;s actually done — real
              projects, code reviews, design discussions, documentation, and
              mentorship from engineers who ship production systems every day.
            </p>

            <div className="flex flex-wrap gap-3 mt-8">
              <Link
                href="/apply"
                className="group inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              >
                <span>Apply for internship</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/interns"
                className="inline-flex items-center border border-slate-300 hover:border-slate-500 text-slate-700 font-medium px-6 py-3 rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                Meet our interns
              </Link>
            </div>

            {/* Stats */}
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
              <div className="text-slate-500">Remote-first</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── NOT JUST CODE ─────────────────────────────── */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-20">
          <div className="max-w-3xl mb-12">
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 text-xs font-medium text-amber-800 mb-4">
              <Sparkles className="w-3 h-3" />
              What sets us apart
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Software engineering is more than writing code
            </h2>
            <p className="text-slate-600 mt-4 text-lg leading-relaxed">
              At HERMAN, interns learn the full craft — from understanding a
              problem to shipping a solution. Real clients. Real deadlines.
              Real reviews.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Palette,
                title: 'Design & UX',
                body: 'Wireframes, user flows, and interface thinking. You ship screens that real people use — not just endpoints.',
              },
              {
                icon: FileText,
                title: 'Documentation',
                body: 'Specs, API docs, and READMEs. You learn how to explain your work so teams can build on it.',
              },
              {
                icon: GitBranch,
                title: 'Version control',
                body: 'Branches, pull requests, code reviews. Every line of code you write goes through a real review process.',
              },
              {
                icon: MessageSquare,
                title: 'Client communication',
                body: 'Standups, demos, feedback rounds. You present your work to real stakeholders.',
              },
              {
                icon: ClipboardCheck,
                title: 'Testing & quality',
                body: 'You write tests, handle edge cases, and learn what "production-ready" actually means.',
              },
              {
                icon: Award,
                title: 'Professional habits',
                body: 'Time management, clear communication, and owning your work — the skills that separate juniors from engineers.',
              },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.title}
                  className="group bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-900 hover:shadow-sm transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {item.body}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── LIFE AT HERMAN (Photos) ────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <div className="max-w-2xl mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Life at HERMAN
          </h2>
          <p className="text-slate-600 mt-4 text-lg">
            A working studio — pairing, designing, reviewing, shipping.
            Remote-first, but never alone.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {[
            { src: '/brand/team/pair-programming.avif', label: 'Pair programming' },
            { src: '/brand/team/developers-meeting.avif', label: 'Team sync' },
            { src: '/brand/team/whiteboard-planning.avif', label: 'Planning sessions' },
            { src: '/brand/team/laptop-code.avif', label: 'Deep work' },
            { src: '/brand/team/team-standup.avif', label: 'Daily standups' },
          ].map((img, i) => (
            <div
              key={i}
              className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border border-slate-200"
            >
              <img
                src={img.src}
                alt={img.label}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-3 left-3 text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                {img.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── WHAT YOU'LL SHIP ──────────────────────────── */}
      <section className="bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-20">
          <div className="max-w-2xl mb-12">
            <h2 className="text-white text-3xl md:text-4xl font-bold tracking-tight">
              What you&apos;ll ship
            </h2>
            <p className="text-slate-300 mt-4 text-lg leading-relaxed">
              You won&apos;t build toy apps. You&apos;ll work on systems that
              real people use every day — for schools, cooperatives, and
              businesses across East Africa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                title: 'Web applications',
                body: 'Next.js, React, Tailwind CSS. Full-stack dashboards, marketing sites, and admin panels.',
                tags: ['Next.js', 'React', 'Tailwind'],
              },
              {
                title: 'Backend services',
                body: 'Node.js and Python APIs, PostgreSQL databases, authentication, and background jobs.',
                tags: ['Node.js', 'PostgreSQL', 'Python'],
              },
              {
                title: 'Mobile apps',
                body: 'Cross-platform apps in React Native and Flutter for offline-first use cases.',
                tags: ['React Native', 'Flutter'],
              },
              {
                title: 'Real deployments',
                body: 'Vercel, Docker, and cloud infrastructure. Everything you build ships to real users.',
                tags: ['Vercel', 'Docker', 'AWS'],
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors"
              >
                <h3 className="text-white font-semibold mb-2">
                  {item.title}
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-3">
                  {item.body}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] bg-white/10 text-slate-100 px-2 py-0.5 rounded border border-white/10"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ──────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <div className="max-w-2xl mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            How it works
          </h2>
          <p className="text-slate-600 mt-4 text-lg">
            A structured path from applicant to certified software engineer.
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
      </section>

      {/* ─── ABOUT HERMAN ──────────────────────────────── */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                About HERMAN
              </h2>
              <div className="mt-6 space-y-4 text-slate-600 leading-relaxed">
                <p>
                  HERMAN Software Solutions is a Ugandan software company based
                  in Jinja, building robust web, mobile, and enterprise
                  systems for clients across East Africa.
                </p>
                <p>
                  We&apos;ve shipped production systems for schools,
                  cooperatives, retailers, and media platforms — including a
                  school platform serving 40+ pages, a voting portal handling
                  multiple live elections, and a desktop app now live on the
                  Microsoft Store.
                </p>
                <p>
                  Our internship program exists because we believe the best
                  way to learn software engineering is to build real software.
                  Our mentors are engineers who ship code every day.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-3 text-sm">
                <span className="bg-white border border-slate-200 px-3 py-1.5 rounded-full text-slate-700">
                  🇺🇬 Built in Jinja, Uganda
                </span>
                <span className="bg-white border border-slate-200 px-3 py-1.5 rounded-full text-slate-700">
                  Remote-first
                </span>
                <span className="bg-white border border-slate-200 px-3 py-1.5 rounded-full text-slate-700">
                  Production clients since 2024
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '5+', label: 'Years building' },
                { value: '10+', label: 'Production systems' },
                { value: '100%', label: 'Mentor-led' },
                { value: '30+', label: 'Interns planned' },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-white border border-slate-200 rounded-xl p-6"
                >
                  <div className="text-3xl font-bold text-slate-900">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-500 mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CURRENT COHORT ───────────────────────────── */}
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

      {/* ─── FAQ ───────────────────────────────────────── */}
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

      {/* ─── CTA ──────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <div className="bg-slate-900 rounded-3xl p-8 md:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-transparent to-purple-600/30" />
          <div className="relative">
            <h2 className="text-white text-3xl md:text-4xl font-bold tracking-tight">
              Ready to start your career?
            </h2>
            <p className="text-slate-200 mt-4 text-lg max-w-xl mx-auto">
              Applications take 5 minutes. We review every one personally.
            </p>
            <div className="mt-8">
              <Link
                href="/apply"
                className="group inline-flex items-center gap-2 bg-white text-slate-900 font-medium px-8 py-3 rounded-lg hover:bg-slate-100 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              >
                <span>Apply for internship</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}