import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { toCsv, csvResponse, datedFilename, type CsvColumn } from '@/lib/csv'

export async function GET() {
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

  const admin = createAdminClient()
  const { data: rows, error } = await admin
    .from('documents')
    .select(
      `id, type, title, file_url, issued_date,
       intern:intern_id (full_name, email)`
    )
    .order('issued_date', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  type Row = {
    id: string
    type: string
    title: string | null
    file_url: string
    issued_date: string
    intern:
      | { full_name: string | null; email: string }
      | { full_name: string | null; email: string }[]
      | null
  }

  function pickOne<T>(v: T | T[] | null): T | null {
    if (!v) return null
    return Array.isArray(v) ? (v[0] ?? null) : v
  }

  const columns: CsvColumn<Row>[] = [
    { header: 'Type', value: (r) => r.type },
    { header: 'Title', value: (r) => r.title },
    {
      header: 'Intern',
      value: (r) => {
        const i = pickOne(r.intern)
        if (!i) return ''
        return i.full_name ?? i.email
      },
    },
    { header: 'Intern email', value: (r) => pickOne(r.intern)?.email ?? '' },
    { header: 'Issued date', value: (r) => r.issued_date },
    { header: 'File URL', value: (r) => r.file_url },
  ]

  const csv = toCsv((rows ?? []) as Row[], columns)
  return csvResponse(csv, datedFilename('documents'))
}