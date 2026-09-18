import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui/page-header'
import { DocumentList } from './document-list'

export const metadata = { title: 'My Documents — HERMAN Intern Hub' }

export default async function DocumentsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: documents } = await supabase
    .from('documents')
    .select(
      'id, type, title, file_url, issued_date, certificate_id, performance_score, created_at'
    )
    .eq('intern_id', user.id)
    .order('created_at', { ascending: false })

  const documentsWithUrls = await Promise.all(
    (documents ?? []).map(async (doc) => {
      const { data: signed } = await supabase.storage
        .from('documents')
        .createSignedUrl(doc.file_url, 60 * 60 * 24 * 7)

      return {
        ...doc,
        signedUrl: signed?.signedUrl ?? null,
      }
    })
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
      <PageHeader
        title="My Documents"
        description="Your certificates, letters, and official records."
      />

      <DocumentList documents={documentsWithUrls} />
    </div>
  )
}