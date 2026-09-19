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
    .from('profiles')
    .select(
      `id, full_name, email, phone, status, university, course, year_of_study,
       start_date, end_date, directory_visible,
       mentor:mentor_id (full_name, email)`
    )
    .eq('role', 'intern')
    .eq('is_demo', false)
    .order('created_at', { ascending: false })

  if (status !== 'all') {
    query = query.eq('status', status)
  }

  const { data: rows, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  type Row = {
    id: string
    full_name: string | null
    email: string
    phone: string | null
    status: string
    university: string | null
    course: string | null
    year_of_study: string | null
    start_date: string | null
    end_date: string | null
    directory_visible: boolean
    mentor: { full_name: string | null; email: string } | { full_name: string | null; email: string }[] | null
  }

  const columns: CsvColumn<Row>[] = [
    { header: 'Name', value: (r) => r.full_name },
    { header: 'Email', value: (r) => r.email },
    { header: 'Phone', value: (r) => r.phone },
    { header: 'Status', value: (r) => r.status },
    { header: 'University', value: (r) => r.university },
    { header: 'Course', value: (r) => r.course },
    { header: 'Year of study', value: (r) => r.year_of_study },
    {
      header: 'Mentor',
      value: (r) => {
        const m = Array.isArray(r.mentor) ? r.mentor[0] : r.mentor
        if (!m) return ''
        return m.full_name ?? m.email
      },
    },
    { header: 'Start date', value: (r) => r.start_date },
    { header: 'End date', value: (r) => r.end_date },
    {
      header: 'Directory visible',
      value: (r) => (r.directory_visible ? 'Yes' : 'No'),
    },
  ]

  const csv = toCsv((rows ?? []) as Row[], columns)
  return csvResponse(csv, datedFilename(`interns-${status}`))
}