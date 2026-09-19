import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { toCsv, csvResponse, datedFilename, type CsvColumn } from '@/lib/csv'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const status = req.nextUrl.searchParams.get('status') ?? 'all'

  const admin = createAdminClient()
  let query = admin
    .from('submissions')
    .select(
      `id, content, file_url, status, submitted_at,
       intern:intern_id (full_name, email),
       task:task_id (title, project:project_id (title))`
    )
    .order('submitted_at', { ascending: false })

  if (status !== 'all') {
    query = query.eq('status', status)
  }

  const { data: rows, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  type Row = {
    id: string
    content: string | null
    file_url: string | null
    status: string
    submitted_at: string
    intern:
      | { full_name: string | null; email: string }
      | { full_name: string | null; email: string }[]
      | null
    task:
      | {
          title: string
          project:
            | { title: string }
            | { title: string }[]
            | null
        }
      | {
          title: string
          project:
            | { title: string }
            | { title: string }[]
            | null
        }[]
      | null
  }

  function pickOne<T>(v: T | T[] | null): T | null {
    if (!v) return null
    return Array.isArray(v) ? (v[0] ?? null) : v
  }

  const columns: CsvColumn<Row>[] = [
    {
      header: 'Intern',
      value: (r) => {
        const i = pickOne(r.intern)
        if (!i) return ''
        return i.full_name ?? i.email
      },
    },
    { header: 'Intern email', value: (r) => pickOne(r.intern)?.email ?? '' },
    { header: 'Task', value: (r) => pickOne(r.task)?.title ?? '' },
    {
      header: 'Project',
      value: (r) => {
        const t = pickOne(r.task)
        return pickOne(t?.project ?? null)?.title ?? ''
      },
    },
    { header: 'Status', value: (r) => r.status },
    {
      header: 'Content',
      value: (r) => {
        const c = r.content ?? ''
        return c.length > 200 ? c.slice(0, 200) + '…' : c
      },
    },
    { header: 'File attached', value: (r) => (r.file_url ? 'Yes' : 'No') },
    {
      header: 'Submitted at',
      value: (r) => new Date(r.submitted_at).toISOString(),
    },
  ]

  const csv = toCsv((rows ?? []) as Row[], columns)
  return csvResponse(csv, datedFilename(`submissions-${status}`))
}