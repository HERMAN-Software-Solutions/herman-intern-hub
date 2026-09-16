import { LoginForm } from './login-form'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">HERMAN Intern Hub</h1>
            <p className="text-sm text-slate-500 mt-1">Sign in to your account</p>
          </div>
          <LoginForm />
        </div>
        <p className="text-center text-sm text-slate-500 mt-6">
          Don&apos;t have an account?{' '}
          <a href="/apply" className="text-blue-600 hover:underline font-medium">
            Apply for an internship
          </a>
        </p>
      </div>
    </div>
  )
}