import { NextResponse, type NextRequest } from 'next/server'
import { generateAllWeeklyReports } from '@/lib/reports/generate'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes for Vercel Pro, 10s for Hobby

export async function GET(req: NextRequest) {
  // Protect the endpoint
  const authHeader = req.headers.get('authorization')
  const expectedSecret = process.env.CRON_SECRET

  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await generateAllWeeklyReports()
    return NextResponse.json({
      success: true,
      ...result,
      ranAt: new Date().toISOString(),
    })
  } catch (err) {
    console.error('Cron job error:', err)
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}