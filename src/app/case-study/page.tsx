import Link from 'next/link'
import {
  ArrowRight,
  Layers,
  Lock,
  Zap,
  Database,
  GitBranch,
  Award,
  Users,
  FileCheck2,
  BarChart3,
  Code2,
  Server,
} from 'lucide-react'
import { PublicNav } from '@/components/marketing/nav'
import { PublicFooter } from '@/components/marketing/footer'

export const metadata = {
  title: 'Case Study — HERMAN Intern Hub',
  description:
    'How HERMAN Software Solutions built its own intern management system — a case study in architecture-led engineering.',
}

export default function CaseStudyPage() {
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

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-24 md:py-32">
          <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-3.5 py-1.5 text-xs font-medium mb-6">
            <Code2 className="w-3 h-3 text-blue-400" />
            <span style={{ color: '#e2e8f0' }}>Case study</span>
          </div>

          <h1
            className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] max-w-3xl"
            style={{ color: '#ffffff' }}
          >
            We built our own{' '}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              intern management system
            </span>
          </h1>

          <p
            className="text-lg md:text-xl mt-6 leading-relaxed max-w-2xl"
            style={{ color: '#cbd5e1' }}
          >
            When spreadsheets and WhatsApp stopped working, we designed and
            shipped the platform we wished existed. Here&apos;s how it works,
            and what we learned.
          </p>
        </div>
      </section>

      {/* ─── THE PROBLEM ───────────────────────────────── */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 md:py-24">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-blue-600 uppercase tracking-wider mb-3">
            The problem
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-6">
            Internships, run on spreadsheets, don&apos;t scale
          </h2>
          <div className="space-y-5 text-slate-600 leading-relaxed text-lg">
            <p>
              At HERMAN Software Solutions, our internship program was growing.
              More applicants, more interns, more projects, more certificates.
              But the tools were the same ones we&apos;d used since day one: a
              spreadsheet for applications, a WhatsApp group for coordination,
              email threads for feedback, and hand-typed certificates.
            </p>
            <p>
              The problems compounded:
            </p>
            <ul className="space-y-3 mt-2">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-3 flex-shrink-0" />
                <span>
                  <strong className="text-slate-900">No single source of truth.</strong>{' '}
                  Applications lived in Gmail, approvals in a spreadsheet, and
                  actual progress in three different WhatsApp groups.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-3 flex-shrink-0" />
                <span>
                  <strong className="text-slate-900">Mentor time was invisible.</strong>{' '}
                  We couldn&apos;t tell which interns were stuck, which were
                  coasting, or which were quietly burning out.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-3 flex-shrink-0" />
                <span>
                  <strong className="text-slate-900">Certificates were a liability.</strong>{' '}
                  Hand-typed PDFs with no verification. Anyone could forge one,
                  and nobody could check.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-3 flex-shrink-0" />
                <span>
                  <strong className="text-slate-900">No institutional memory.</strong>{' '}
                  When an intern left, so did their logs, tasks, and
                  contributions. Every cohort started from scratch.
                </span>
              </li>
            </ul>
            <p>
              We could have bought an off-the-shelf tool. We built our own
              instead — because the internship program <em>is</em> the product,
              and it deserved to be engineered with the same care as our client
              work.
            </p>
          </div>
        </div>
      </section>

      {/* ─── WHAT WE BUILT ─────────────────────────────── */}
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-24">
          <div className="max-w-3xl mx-auto mb-14 text-center">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-blue-600 uppercase tracking-wider mb-3">
              What we built
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              A complete lifecycle platform
            </h2>
            <p className="text-slate-600 mt-5 text-lg leading-relaxed">
              From the first application to the final certificate — every step
              handled, tracked, and auditable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: FileCheck2,
                title: 'Applications & approvals',
                body: 'Public application form → admin review queue → approval with invitation email. Every decision logged.',
              },
              {
                icon: Users,
                title: 'Intern onboarding',
                body: 'Guided multi-step onboarding: profile, tech-stack selection, agreement signing. No more manual setup.',
              },
              {
                icon: GitBranch,
                title: 'Projects & tasks',
                body: 'Admins and mentors create projects, assign tasks, and track status from backlog to done.',
              },
              {
                icon: FileCheck2,
                title: 'Work submission & review',
                body: 'Interns submit completed work, mentors review with feedback, revisions tracked in one place.',
              },
              {
                icon: Award,
                title: 'Verifiable certificates',
                body: 'Auto-generated PDFs with unique IDs and QR codes. Anyone can verify authenticity at a public URL.',
              },
              {
                icon: BarChart3,
                title: 'Analytics & reporting',
                body: 'Real-time KPIs on active interns, submission pipeline, application trends, and certificate issuance.',
              },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.title}
                  className="group bg-white border border-slate-200 rounded-2xl p-6 transition-all duration-300 hover:border-blue-600 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.25)]"
                >
                  <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-blue-600 group-hover:scale-110">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">
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

      {/* ─── TECH STACK ────────────────────────────────── */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 md:py-24">
          <div className="max-w-3xl mx-auto mb-14 text-center">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-blue-600 uppercase tracking-wider mb-3">
              The stack
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Engineered for the long run
            </h2>
            <p className="text-slate-600 mt-5 text-lg leading-relaxed">
              We used the same tools we ship to clients. No experimental
              frameworks, no hype — just proven, boring technology that
              works.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                icon: Layers,
                title: 'Next.js 16 + React 19',
                body: 'App Router, Server Components, Server Actions. Fast by default, with progressive enhancement when needed.',
              },
              {
                icon: Database,
                title: 'PostgreSQL via Supabase',
                body: 'Real SQL, row-level security on every table, and a single source of truth for auth, storage, and realtime.',
              },
              {
                icon: Lock,
                title: 'RLS-first security',
                body: 'Every table locked down at the database level. Middleware handles UX routing; RLS handles the real protection.',
              },
              {
                icon: Zap,
                title: 'Tailwind + design system',
                body: 'Custom UI primitives (Button, Card, Input, Select) built once, reused everywhere. Consistent, accessible.',
              },
              {
                icon: Server,
                title: 'Vercel + Edge',
                body: 'Deployed on Vercel with edge middleware, ISR where it helps, and full server-side rendering where it matters.',
              },
              {
                icon: Award,
                title: 'PDF + QR certificates',
                body: 'Auto-generated via React-PDF, signed with unique IDs, and verifiable through a public check page.',
              },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.title}
                  className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-slate-400 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1.5">
                        {item.title}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {item.body}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── OUTCOMES ──────────────────────────────────── */}
      <section className="bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 md:py-24">
          <div className="max-w-3xl mx-auto mb-14 text-center">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-blue-400 uppercase tracking-wider mb-3">
              Outcomes
            </div>
            <h2
              className="text-3xl md:text-4xl font-bold tracking-tight"
              style={{ color: '#ffffff' }}
            >
              What changed
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                value: '6',
                label: 'User roles',
                detail: 'Intern, mentor, admin, super-admin, client, public',
              },
              {
                value: '15',
                label: 'Database tables',
                detail: 'All RLS-protected, all audited',
              },
              {
                value: '100%',
                label: 'Certificate verifiability',
                detail: 'Every cert has a QR-verifiable URL',
              },
              {
                value: '0',
                label: 'Manual steps',
                detail: 'From approval to onboarding to cert issuance',
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-2xl p-6"
              >
                <div
                  className="text-4xl font-bold tracking-tight mb-2"
                  style={{ color: '#ffffff' }}
                >
                  {stat.value}
                </div>
                <div
                  className="text-sm font-medium mb-1"
                  style={{ color: '#e2e8f0' }}
                >
                  {stat.label}
                </div>
                <div className="text-xs leading-relaxed" style={{ color: '#94a3b8' }}>
                  {stat.detail}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── UNDER THE HOOD ────────────────────────────── */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 md:py-24">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-blue-600 uppercase tracking-wider mb-3">
            Under the hood
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-6">
            Architecture notes
          </h2>
          <div className="space-y-5 text-slate-600 leading-relaxed text-lg">
            <p>
              A few design decisions we&apos;re especially proud of — and that
              we&apos;d make again:
            </p>

            <div className="space-y-6 mt-6">
              <div>
                <h3 className="font-semibold text-slate-900 text-base mb-2">
                  Authentication by invitation only
                </h3>
                <p className="text-base">
                  No account is created without an accepted invitation. The
                  invitations table is the gatekeeper — every signup traces back
                  to an admin approval. No spam accounts, no orphan users.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 text-base mb-2">
                  Row-Level Security as the last line of defense
                </h3>
                <p className="text-base">
                  Middleware handles UX routing (redirects, role gates). But the
                  real protection lives in Postgres policies. Even if a server
                  action is compromised, RLS stops unauthorized reads and
                  writes at the database layer.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 text-base mb-2">
                  Audit log for every sensitive action
                </h3>
                <p className="text-base">
                  Application decisions, mentor assignments, status changes,
                  task creation and deletion, certificate issuance — each one
                  writes an immutable row to the audit_log table with actor,
                  entity, and metadata.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 text-base mb-2">
                  Verifiable certificates by design
                </h3>
                <p className="text-base">
                  Certificates are PDFs with unique IDs, a QR code pointing to a
                  public verification URL, and a database record. Anyone —
                  employer, university, family — can verify a certificate in
                  seconds without contacting us.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ───────────────────────────────────────── */}
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
                  Want to be part of the next cohort?
                </h2>
                <p
                  className="mt-4 text-lg max-w-xl mx-auto"
                  style={{ color: '#e2e8f0' }}
                >
                  Applications take 5 minutes. We review every one personally.
                </p>
                <div className="mt-8 flex flex-wrap gap-3 justify-center">
                  <Link
                    href="/apply"
                    className="group inline-flex items-center gap-2 bg-white text-slate-900 font-medium px-8 py-3 rounded-lg hover:bg-slate-100 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <span>Apply for internship</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <a
                    href="mailto:infohermansoftware@gmail.com"
                    className="inline-flex items-center bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/30 font-medium px-8 py-3 rounded-lg transition-all duration-200 hover:-translate-y-0.5"
                    style={{ color: '#ffffff' }}
                  >
                    Talk to us
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