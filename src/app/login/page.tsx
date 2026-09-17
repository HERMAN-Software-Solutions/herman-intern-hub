import Link from 'next/link'
import { LoginForm } from './login-form'
import { StandaloneLayout } from '@/components/layout/standalone-layout'

export const metadata = {
  title: 'Sign in — HERMAN Intern Hub',
}

export default function LoginPage() {
  return (
    <StandaloneLayout>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl font-bold text-slate-900">
              Welcome back
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Sign in to your HERMAN account
            </p>
          </div>
          <LoginForm />
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Don&apos;t have an account?{' '}
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