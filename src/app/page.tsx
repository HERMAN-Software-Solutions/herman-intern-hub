import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="font-bold text-slate-900">HERMAN Intern Hub</div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/apply" className="text-slate-600 hover:text-slate-900">
              Apply
            </Link>
            <Link
              href="/login"
              className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium"
            >
              Sign in
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-5xl mx-auto px-6 py-20">
        <div className="max-w-2xl">
          <h1 className="text-5xl font-bold text-slate-900 leading-tight">
            Launch your software career with HERMAN
          </h1>
          <p className="text-lg text-slate-600 mt-6">
            Real projects. Real mentorship. Real experience. Join HERMAN
            Software Solutions as an intern and build production-grade
            software with a team that cares about your growth.
          </p>
          <div className="mt-8 flex gap-3">
            <Link
              href="/apply"
              className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Apply now →
            </Link>
            <Link
              href="/login"
              className="border border-slate-300 hover:border-slate-500 text-slate-700 font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* Quick facts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
          <Fact title="Invitation-only" body="We review every application personally. No automated rejections." />
          <Fact title="Mentor-led" body="You'll be paired with an experienced mentor from day one." />
          <Fact title="Real work" body="Contribute to live projects for real clients — not toy exercises." />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-20">
        <div className="max-w-5xl mx-auto px-6 py-8 text-sm text-slate-500">
          © HERMAN Software Solutions Limited · Jinja, Uganda ·{' '}
          <a href="mailto:infohermansoftware@gmail.com" className="hover:text-slate-900">
            infohermansoftware@gmail.com
          </a>
        </div>
      </footer>
    </div>
  )
}

function Fact({ title, body }: { title: string; body: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-600 mt-2">{body}</p>
    </div>
  )
}