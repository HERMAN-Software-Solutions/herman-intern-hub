import { createClient } from '@/lib/supabase/client'

export default async function Home() {
  const supabase = createClient()
  const { data, error } = await supabase.auth.getSession()

  return (
    <main className="p-8 font-sans">
      <h1 className="text-3xl font-bold">HERMAN Intern Hub</h1>
      <p className="mt-4 text-slate-600">
        {error ? `❌ Error: ${error.message}` : '✅ Connected to Supabase'}
      </p>
      <pre className="mt-4 p-4 bg-slate-100 rounded text-xs">
        {JSON.stringify({ session: data?.session ?? null }, null, 2)}
      </pre>
    </main>
  )
}