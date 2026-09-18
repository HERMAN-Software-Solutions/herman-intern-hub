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
      <section className="relative overflow-hidden bg-slate-950">
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill='none' stroke='%23ffffff' stroke-width='0.5'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px',
          }}
        />

        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(37, 99, 235, 0.35), transparent 70%), radial-gradient(ellipse 60% 50% at 80% 100%, rgba(139, 92, 246, 0.25), transparent 70%)',
          }}
        />

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-white pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-20 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-3.5 py-1.5 text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <span style={{ color: '#e2e8f0' }}>Applications open</span>
          </div>

          <h1
            className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] max-w-4xl mx-auto"
            style={{ color: '#ffffff' }}
          >
            Launch your software career with{' '}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              HERMAN
            </span>
          </h1>

          <p
            className="text-lg md:text-xl mt-8 leading-relaxed max-w-2xl mx-auto"
            style={{ color: '#cbd5e1' }}
          >
            Real projects. Real mentors. Real software engineering — learn the
            way it&apos;s actually done, from a working team that ships
            production systems every day.
          </p>

          <div className="flex flex-wrap gap-3 mt-10 justify-center">
            <Link
              href="/apply"
              className="group inline-flex items-center gap-2 bg-white hover:bg-slate-100 font-medium px-6 py-3 rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
              style={{ color: '#0f172a' }}
            >
              <span>Apply for internship</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/interns"
              className="inline-flex items-center bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/30 font-medium px-6 py-3 rounded-lg transition-all duration-200 hover:-translate-y-0.5"
              style={{ color: '#ffffff' }}
            >
              Meet our interns
            </Link>
          </div>

          <div
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 mt-10 text-xs"
            style={{ color: '#94a3b8' }}
          >
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1 h-1 bg-green-400 rounded-full" />
              Remote-first
            </span>
            <span className="hidden sm:inline text-white/20">·</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1 h-1 bg-green-400 rounded-full" />
              100% Mentor-led
            </span>
            <span className="hidden sm:inline text-white/20">·</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1 h-1 bg-green-400 rounded-full" />
              Free to apply
            </span>
          </div>
        </div>
      </section>

      {/* ─── STATS STRIP ──────────────────────────────── */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
            <div>
              <AnimatedCounter
                to={30}
                suffix="+"
                className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight"
              />
              <div className="text-sm text-slate-500 mt-1">
                Intern positions planned
              </div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
                100%
              </div>
              <div className="text-sm text-slate-500 mt-1">Mentor-led</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-green-600 tracking-tight">
                Free
              </div>
              <div className="text-sm text-slate-500 mt-1">To apply</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── NOT JUST CODE ─────────────────────────────── */}
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-24">
          {/* CENTERED HEADER */}
          <div className="max-w-3xl mx-auto mb-14 text-center">
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 text-xs font-medium text-amber-800 mb-5">
              <Sparkles className="w-3 h-3" />
              What sets us apart
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Software engineering is more than writing code
            </h2>
            <p className="text-slate-600 mt-5 text-lg leading-relaxed">
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
                  className="
                    group relative bg-white border border-slate-200 rounded-2xl p-6
                    transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                    hover:-translate-y-2 hover:border-blue-600
                    hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.3)]
                    cursor-default
                  "
                >
                  <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-blue-600 group-hover:scale-110 group-hover:rotate-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3
                    className="font-semibold mb-2 transition-colors duration-300 group-hover:text-blue-600"
                    style={{ color: '#0f172a' }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#475569' }}>
                    {item.body}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── LIFE AT HERMAN ────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-24">
          <div className="max-w-3xl mx-auto mb-14 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Life at HERMAN
            </h2>
            <p className="text-slate-600 mt-5 text-lg leading-relaxed">
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
                <div
                  className="absolute bottom-3 left-3 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: '#ffffff' }}
                >
                  {img.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHAT YOU'LL SHIP ──────────────────────────── */}
      <section className="bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-24">
          <div className="max-w-3xl mx-auto mb-14 text-center">
            <h2
              className="text-3xl md:text-4xl font-bold tracking-tight"
              style={{ color: '#ffffff' }}
            >
              What you&apos;ll ship
            </h2>
            <p
              className="mt-5 text-lg leading-relaxed"
              style={{ color: '#cbd5e1' }}
            >
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
                <h3 className="font-semibold mb-2" style={{ color: '#ffffff' }}>
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed mb-3" style={{ color: '#e2e8f0' }}>
                  {item.body}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] bg-white/10 px-2 py-0.5 rounded border border-white/20"
                      style={{ color: '#f1f5f9' }}
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
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-24">
          <div className="max-w-3xl mx-auto mb-14 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              How it works
            </h2>
            <p className="text-slate-600 mt-5 text-lg">
              A structured path from applicant to certified software engineer.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { n: '01', title: 'Apply', body: 'Fill a short application online. No login needed.' },
              { n: '02', title: 'Get approved', body: 'We review personally. If accepted, you get an invite by email.' },
              { n: '03', title: 'Onboard', body: 'Set up your profile, pick your tech stack, sign the agreement.' },
              { n: '04', title: 'Build', body: 'Work on real projects with your mentor. Log daily, submit work.' },
              { n: '05', title: 'Get certified', body: 'Receive a verifiable certificate + experience letter.' },
            ].map((step) => (
              <div
                key={step.n}
                className="group bg-white border border-slate-200 rounded-xl p-5 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-2 hover:border-blue-600 hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.3)]"
              >
                <div className="text-3xl font-bold text-slate-300 group-hover:text-blue-600 transition-colors mb-3">
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

      {/* ─── ABOUT HERMAN ──────────────────────────────── */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-24">
          <div className="max-w-3xl mx-auto mb-14 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              About HERMAN
            </h2>
            <p className="text-slate-600 mt-5 text-lg leading-relaxed">
              A Ugandan software company building production systems for
              clients across East Africa — and training the next generation
              of engineers along the way.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start max-w-5xl mx-auto">
            <div>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>
                  HERMAN Software Solutions is based in Jinja, Uganda, building
                  robust web, mobile, and enterprise systems for clients
                  across East Africa.
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

              <Link
                href="/about"
                className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Learn more about the program
                <ArrowRight className="w-4 h-4" />
              </Link>
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
        <section className="bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-24">
            <div className="max-w-3xl mx-auto mb-14 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                Meet our interns
              </h2>
              <p className="text-slate-600 mt-5 text-lg">
                Talented students building real software with us.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredInterns.map((intern) => (
                <Link
                  key={intern.id}
                  href={`/interns/${intern.id}`}
                  className="group bg-white border border-slate-200 rounded-xl p-5 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-2 hover:border-blue-600 hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.3)]"
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

            <div className="text-center mt-10">
              <Link
                href="/interns"
                className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                See all interns
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── FAQ ───────────────────────────────────────── */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 md:py-24">
          <div className="max-w-3xl mx-auto mb-14 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Common questions
            </h2>
            <p className="text-slate-600 mt-5 text-lg">
              Everything you need to know before applying.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { q: 'Who can apply?', a: 'Any student or recent graduate interested in software engineering. We welcome applicants from any university in Uganda and beyond — and from anywhere in the world that has reliable internet.' },
              { q: 'Is the internship paid?', a: 'Internships are unpaid by default — you gain experience, mentorship, and a verified certificate. However, if you\u2019re assigned to a client project with a signed agreement, compensation is arranged.' },
              { q: 'How long is the internship?', a: 'Typically 3 months, but the duration is set during registration based on your availability and track.' },
              { q: 'Where is the internship based?', a: 'The program is remote-first. You can work from anywhere with a reliable internet connection. In-person meetups in Jinja can be arranged when needed.' },
              { q: 'How much time per week does it take?', a: 'Most interns commit around 15–25 hours per week. You and your mentor will agree on a schedule that works for both of you.' },
              { q: 'Do I need my own laptop?', a: 'Yes. You need access to a computer and reliable internet. A laptop with at least 8GB RAM is recommended but not strictly required.' },
              { q: 'Do I need to know how to code already?', a: 'You should have some programming fundamentals. We\u2019ll teach you the tools, patterns, and professional workflows — but we don\u2019t start from zero.' },
              { q: 'Will I get a certificate?', a: 'Yes. Every intern who completes the program receives a certificate of internship and an experience letter. Each certificate has a unique ID and QR code — anyone can verify it at herman-intern-hub.vercel.app/verify.' },
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
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-24">
        <div className="cta-border-wrapper">
          <div className="cta-border-inner p-8 md:p-16 text-center overflow-hidden">
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at top left, rgba(37, 99, 235, 0.25), transparent 55%), radial-gradient(circle at bottom right, rgba(139, 92, 246, 0.25), transparent 55%)',
              }}
            />

            <div className="relative">
              <h2
                className="text-3xl md:text-4xl font-bold tracking-tight"
                style={{ color: '#ffffff' }}
              >
                Ready to start your career?
              </h2>
              <p
                className="mt-4 text-lg max-w-xl mx-auto"
                style={{ color: '#e2e8f0' }}
              >
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
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}