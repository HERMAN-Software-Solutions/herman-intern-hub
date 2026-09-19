import Link from 'next/link'
import { StandaloneLayout } from '@/components/layout/standalone-layout'
import { ForgotForm } from './forgot-form'

export const metadata = {
  title: 'Forgot password — HERMAN Intern Hub',
}

export default function ForgotPasswordPage() {
  return (
    <StandaloneLayout showBreadcrumbs={false}>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">
              Forgot your password?
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Enter your email and we&apos;ll send you a reset link.
            </p>
          </div>

          <ForgotForm />
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Remembered it?{' '}
          <Link
            href="/login"
            className="text-blue-600 hover:underline font-medium"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </StandaloneLayout>
  )
}