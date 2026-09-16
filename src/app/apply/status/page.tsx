import { StatusForm } from './status-form'

export const metadata = {
  title: 'Check application status — HERMAN Intern Hub',
}

export default function StatusPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Check your application status
        </h1>
        <p className="text-sm text-slate-500 mt-1 mb-6">
          Enter the email you used to apply.
        </p>
        <StatusForm />
      </div>
    </div>
  )
}