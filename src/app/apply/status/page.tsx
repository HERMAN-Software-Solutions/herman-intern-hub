import Link from 'next/link'
import { StatusForm } from './status-form'
import { StandaloneLayout } from '@/components/layout/standalone-layout'

export const metadata = {
  title: 'Check application status — HERMAN Intern Hub',
}

export default function StatusPage() {
  return (
    <StandaloneLayout>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Check your application
          </h1>
          <p className="text-sm text-slate-500 mt-1 mb-6">
            Enter the email you used to apply.
          </p>
          <StatusForm />
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Haven&apos;t applied yet?{' '}
          <Link
            href="/apply"
            className="text-blue-600 hover:underline font-medium"
          >
            Apply for an internship
          </Link>
        </p>
      </div>
    </StandaloneLayout>
  )
}