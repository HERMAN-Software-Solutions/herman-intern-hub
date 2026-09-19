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
    .from('applications')
    .select(
      'name, email, phone, university, course, year_of_study, tech_stack_interest, portfolio_url, status, submitted_at'
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
    name: string | null
    email: string | null
    phone: string | null
    university: string | null
    course: string | null
    year_of_study: string | null
    tech_stack_interest: string[] | null
    portfolio_url: string | null
    status: string
    submitted_at: string
  }

  const columns: CsvColumn<Row>[] = [
    { header: 'Name', value: (r) => r.name },
    { header: 'Email', value: (r) => r.email },
    { header: 'Phone', value: (r) => r.phone },
    { header: 'University', value: (r) => r.university },
    { header: 'Course', value: (r) => r.course },
    { header: 'Year of study', value: (r) => r.year_of_study },
    {
      header: 'Tech interests',
      value: (r) => (r.tech_stack_interest ?? []).join('; '),
    },
    { header: 'Portfolio', value: (r) => r.portfolio_url },
    { header: 'Status', value: (r) => r.status },
    {
      header: 'Submitted at',
      value: (r) => new Date(r.submitted_at).toISOString(),
    },
  ]

  const csv = toCsv((rows ?? []) as Row[], columns)
  return csvResponse(csv, datedFilename(`applications-${status}`))
}