import Link from 'next/link'
import {
  ArrowRight,
  Target,
  Eye,
  Heart,
  Users,
  Compass,
  Sparkles,
} from 'lucide-react'
import { PublicNav } from '@/components/marketing/nav'
import { PublicFooter } from '@/components/marketing/footer'

export const metadata = {
  title: 'About — HERMAN Intern Hub',
  description:
    'The story, mission, and values behind HERMAN Intern Hub — a structured internship program by HERMAN Software Solutions Limited.',
}

export default function AboutPage() {
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
              'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(37, 99, 235, 0.35), transparent 70%)',
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-white pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-24 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-3.5 py-1.5 text-xs font-medium mb-6">
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span style={{ color: '#e2e8f0' }}>About the program</span>
          </div>

          <h1
            className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] max-w-3xl mx-auto"
            style={{ color: '#ffffff' }}
          >
            Building engineers who{' '}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              ship real software
            </span>
          </h1>

          <p
            className="text-lg md:text-xl mt-6 leading-relaxed max-w-2xl mx-auto"
            style={{ color: '#cbd5e1' }}
          >
            HERMAN Intern Hub is more than a portal. It&apos;s our answer to a
            simple question: how do you train a software engineer the way real
            companies do?
          </p>
        </div>
      </section>

      {/* ─── OUR STORY ─────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 md:py-24">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-blue-600 uppercase tracking-wider mb-3">
              <Compass className="w-3.5 h-3.5" />
              Our story
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Why we built this
            </h2>
          </div>

          <div className="space-y-5 text-slate-600 leading-relaxed text-lg">
            <p>
              HERMAN Software Solutions has been shipping production software
              for schools, cooperatives, retailers, and media platforms across
              East Africa for years. Every project taught us the same lesson:{' '}
              <strong className="text-slate-900">
                the best way to learn software engineering is to build real
                software, with real users, under real constraints.
              </strong>
            </p>
            <p>
              But when we started taking on interns, we hit a wall. Traditional
              internships — spreadsheets, WhatsApp groups, manual certificates
              — couldn&apos;t scale, couldn&apos;t track work, and couldn&apos;t
              give interns the structure they deserved.
            </p>
            <p>
              So we built our own system. HERMAN Intern Hub is a full platform
              for running an internship program: applications, approvals,
              onboarding, project assignments, task reviews, daily logs,
              weekly reports, and verifiable certificates. Everything a
              structured program needs.
            </p>
            <p>
              We&apos;re using it ourselves. And we&apos;re opening it up to
              interns who want to learn what software engineering actually
              looks like in production.
            </p>
          </div>
        </div>
      </section>

      {/* ─── MISSION & VISION ──────────────────────────── */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-24">
          <div className="max-w-3xl mx-auto mb-14 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              What drives us
            </h2>
            <p className="text-slate-600 mt-5 text-lg">
              Two guiding principles behind everything we build.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-white border border-slate-200 rounded-2xl p-8">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Our mission
              </h3>
              <p className="text-slate-600 leading-relaxed">
                To close the gap between academic learning and production
                software engineering — by giving every intern the tools,
                mentorship, and real project experience to become a
                confident, employable engineer.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-8">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Our vision
              </h3>
              <p className="text-slate-600 leading-relaxed">
                To become East Africa&apos;s most trusted pipeline of
                production-ready software engineers — with a program so good
                that companies recruit directly from our alumni.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── OUR VALUES ────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-24">
          <div className="max-w-3xl mx-auto mb-14 text-center">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-blue-600 uppercase tracking-wider mb-3">
              <Heart className="w-3.5 h-3.5" />
              What we stand for
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Our values
            </h2>
            <p className="text-slate-600 mt-5 text-lg">
              Four principles we hold every intern, mentor, and project to.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                icon: Users,
                title: 'Mentorship over lectures',
                body: 'You learn from engineers who write code every day. Not from videos, not from slides — from real people working through real problems alongside you.',
              },
              {
                icon: Sparkles,
                title: 'Real work, not exercises',
                body: 'Every project you touch ships to real users. Your code gets reviewed, deployed, and used. That is what makes an engineer.',
              },
              {
                icon: Compass,
                title: 'Craft over shortcuts',
                body: 'We teach the full discipline — design, documentation, testing, code review, and communication. Software engineering is more than syntax.',
              },
              {
                icon: Target,
                title: 'Ownership and honesty',
                body: 'You own your work, log your progress, ask for help when you need it. Transparency is not optional in a professional team.',
              },
            ].map((value, i) => {
              const Icon = value.icon
              return (
                <div
                  key={i}
                  className="group bg-white border border-slate-200 rounded-2xl p-6 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-2 hover:border-blue-600 hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.3)]"
                >
                  <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-blue-600 group-hover:scale-110">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-lg text-slate-900 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {value.body}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── WHO WE'RE LOOKING FOR ─────────────────────── */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 md:py-24">
          <div className="max-w-3xl mx-auto mb-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Who we&apos;re looking for
            </h2>
            <p className="text-slate-600 mt-5 text-lg">
              Not everyone. But maybe you.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-10">
            <p className="text-slate-600 leading-relaxed mb-6">
              We&apos;re not looking for the most experienced applicant.
              We&apos;re looking for someone who:
            </p>

            <ul className="space-y-4">
              {[
                'Already has some programming fundamentals — you can read and write basic code in at least one language.',
                'Is genuinely curious about how software works beyond what tutorials teach.',
                'Can commit 15–25 hours per week for the duration of the program.',
                'Wants honest feedback and is willing to be uncomfortable to grow.',
                'Works well with others — writes clearly, asks questions, and follows through.',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2.5 flex-shrink-0" />
                  <span className="text-slate-700 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-24">
          <div className="cta-border-wrapper">
            <div className="cta-border-inner p-10 md:p-16 text-center overflow-hidden">
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(circle at top left, rgba(37, 99, 235, 0.25), transparent 55%), radial-gradient(circle at bottom right, rgba(139, 92, 246, 0.25), transparent 55%)',
                }}
              />

              <div className="relative">
                <h2
                  className="text-3xl md:text-4xl font-bold tracking-tight max-w-2xl mx-auto"
                  style={{ color: '#ffffff' }}
                >
                  Ready to find out if we&apos;re the right fit?
                </h2>
                <p
                  className="mt-4 text-lg max-w-xl mx-auto"
                  style={{ color: '#e2e8f0' }}
                >
                  Applications take 5 minutes. We review every one personally
                  — and we&apos;ll tell you honestly if it&apos;s a match.
                </p>
                <div className="mt-8 flex flex-wrap gap-3 justify-center">
                  <Link
                    href="/apply"
                    className="group inline-flex items-center gap-2 bg-white text-slate-900 font-medium px-8 py-3 rounded-lg hover:bg-slate-100 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <span>Apply now</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <a
                    href="mailto:infohermansoftware@gmail.com"
                    className="inline-flex items-center bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/30 font-medium px-8 py-3 rounded-lg transition-all duration-200 hover:-translate-y-0.5"
                    style={{ color: '#ffffff' }}
                  >
                    Ask a question
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}