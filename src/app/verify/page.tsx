import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ShieldCheck, Search } from 'lucide-react'
import { StandaloneLayout } from '@/components/layout/standalone-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export const metadata = {
  title: 'Verify Certificate — HERMAN Software Solutions',
  description:
    'Verify the authenticity of a HERMAN Software Solutions internship certificate by entering its unique ID.',
}

async function handleVerify(formData: FormData) {
  'use server'
  const id = formData.get('certificateId') as string
  if (id?.trim()) {
    redirect(`/verify/${id.trim()}`)
  }
}

export default function VerifyLandingPage() {
  return (
    <StandaloneLayout>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          {/* Icon */}
          <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <ShieldCheck className="w-7 h-7 text-blue-600" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-slate-900 text-center">
            Verify a certificate
          </h1>
          <p className="text-sm text-slate-500 mt-2 text-center leading-relaxed">
            Enter the certificate ID from the PDF to confirm its authenticity.
          </p>

          {/* Form */}
          <form action={handleVerify} className="mt-8 space-y-4">
            <div>
              <label
                htmlFor="certificateId"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Certificate ID
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="certificateId"
                  name="certificateId"
                  type="text"
                  required
                  placeholder="HRM-2026-0001"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-colors uppercase"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1.5">
                Format: HRM-YYYY-NNNN (e.g., HRM-2026-0001)
              </p>
            </div>

            <Button type="submit" variant="primary" size="md" fullWidth>
              Verify certificate
            </Button>
          </form>

          {/* Help */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
            <p className="mb-2">
              Can&apos;t find the ID? It&apos;s printed at the bottom of the
              certificate PDF.
            </p>
            <a
              href="mailto:infohermansoftware@gmail.com"
              className="text-blue-600 hover:underline font-medium"
            >
              Contact us for help
            </a>
          </div>
        </div>

        {/* Back link */}
        <p className="text-center text-sm text-slate-500 mt-6">
          <Link href="/" className="text-blue-600 hover:underline font-medium">
            ← Back to home
          </Link>
        </p>
      </div>
    </StandaloneLayout>
  )
}