import Link from 'next/link'
import { ApplyForm } from './apply-form'
import { PublicNav } from '@/components/marketing/nav'
import { PublicFooter } from '@/components/marketing/footer'

export const metadata = {
  title: 'Apply for an Internship — HERMAN Intern Hub',
  description:
    'Join HERMAN Software Solutions as an intern. Real projects, real mentorship, real experience.',
}

export default function ApplyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <PublicNav />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Apply for an internship
          </h1>
          <p className="text-slate-600 mt-2">
            Takes about 5 minutes. We review every application personally.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <ApplyForm />
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already applied?{' '}
          <Link
            href="/apply/status"
            className="text-blue-600 hover:underline font-medium"
          >
            Check your status
          </Link>
        </p>
      </main>

      <PublicFooter />
    </div>
  )
}