import { createClient } from '@/lib/supabase/server'
import { DocumentList } from './document-list'

export const metadata = { title: 'My Documents — HERMAN Intern Hub' }

export default async function DocumentsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch all documents for this intern
  const { data: documents } = await supabase
    .from('documents')
    .select(
      'id, type, title, file_url, issued_date, certificate_id, performance_score, created_at'
    )
    .eq('intern_id', user.id)
    .order('created_at', { ascending: false })

  // Get a signed URL for each document (batch)
  const documentsWithUrls = await Promise.all(
    (documents ?? []).map(async (doc) => {
      const { data: signed } = await supabase.storage
        .from('documents')
        .createSignedUrl(doc.file_url, 60 * 60 * 24 * 7) // 7 days

      return {
        ...doc,
        signedUrl: signed?.signedUrl ?? null,
      }
    })
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">My Documents</h1>
        <p className="text-slate-500 mt-1">
          Your certificates, letters, and official records.
        </p>
      </div>

      <DocumentList documents={documentsWithUrls} />
    </div>
  )
}