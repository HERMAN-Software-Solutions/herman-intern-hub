import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import { computeScore } from './compute-score'
import { generateCertificateId } from './generate-id'
import { renderCertificatePdf, renderExperienceLetterPdf } from './pdf/render'
import type { CertificateData } from './types'
import QRCode from 'qrcode'
import { sendCertificateIssued } from '@/lib/email/send'
import { createNotification } from '@/lib/notifications/create'

type GenerateResult =
  | {
      success: true
      certificateId: string
      certificateUrl: string
      experienceLetterUrl: string
      score: number
    }
  | { success: false; error: string }

export async function generateCertificate(
  internId: string,
  issuedByUserId: string
): Promise<GenerateResult> {
  const supabase = createAdminClient()

  // 1. Check no certificate exists
  const { data: existing } = await supabase
    .from('documents')
    .select('id, certificate_id, file_url')
    .eq('intern_id', internId)
    .eq('type', 'certificate')
    .maybeSingle()

  if (existing) {
    return {
      success: false,
      error: 'A certificate already exists for this intern.',
    }
  }

  // 2. Fetch intern details
  const { data: intern } = await supabase
    .from('profiles')
    .select(
      `id, full_name, email, university, course,
       start_date, end_date,
       mentor:mentor_id (full_name, email)`
    )
    .eq('id', internId)
    .single()

  if (!intern) return { success: false, error: 'Intern not found' }

  // 3. Compute score
  const scoreRes = await computeScore(internId)
  if (!scoreRes.success) return { success: false, error: scoreRes.error }
  const { score, band, breakdown } = scoreRes.result

  // 4. Get primary tech stack (track)
  const { data: stackRows } = await supabase
    .from('intern_tech_stacks')
    .select('is_primary, tech_stack:tech_stack_id (name)')
    .eq('intern_id', internId)

  let track = 'Software Development'
  const primary = stackRows?.find((s: any) => s.is_primary)
  if (primary) {
    const tsRaw = (primary as any).tech_stack
    const ts = Array.isArray(tsRaw) ? tsRaw[0] : tsRaw
    if (ts?.name) track = ts.name
  } else if (stackRows && stackRows.length > 0) {
    const firstRaw = (stackRows[0] as any).tech_stack
    const first = Array.isArray(firstRaw) ? firstRaw[0] : firstRaw
    if (first?.name) track = first.name
  }

  // 5. Get highlights (top 5 tasks marked as highlight)
  const { data: highlights } = await supabase
    .from('tasks')
    .select('title')
    .eq('assigned_to', internId)
    .eq('is_highlight', true)
    .eq('status', 'done')
    .limit(5)

  const highlightTitles = (highlights ?? []).map((h) => h.title)
  // Fallback: if no highlights, use top 5 completed tasks
  if (highlightTitles.length === 0) {
    const { data: doneTasks } = await supabase
      .from('tasks')
      .select('title')
      .eq('assigned_to', internId)
      .eq('status', 'done')
      .limit(5)
    for (const t of doneTasks ?? []) highlightTitles.push(t.title)
  }

  // 6. Generate certificate ID
  const certificateId = await generateCertificateId()

  // 7. Compute dates
  const startDate = intern.start_date
    ? new Date(intern.start_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '—'
  const endDate = intern.end_date
    ? new Date(intern.end_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '—'

  const durationWeeks =
    intern.start_date && intern.end_date
      ? Math.max(
          1,
          Math.round(
            (new Date(intern.end_date).getTime() -
              new Date(intern.start_date).getTime()) /
              (7 * 86400000)
          )
        )
      : 12

  // 8. QR code
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? 'https://herman-intern-hub.vercel.app'
  const verifyUrl = `${appUrl}/verify/${certificateId}`
  const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, {
    margin: 1,
    width: 120,
  })

  // 9. Mentor name
  const mentorRaw = (intern as any).mentor
  const mentor = Array.isArray(mentorRaw) ? mentorRaw[0] : mentorRaw
  const mentorName = mentor?.full_name ?? mentor?.email ?? 'HERMAN Mentor'

  const issueDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const ceoName = process.env.HERMAN_CEO_NAME ?? 'Robert Kisitu'

  // 10. Assemble CertificateData
  const data: CertificateData = {
    internName: intern.full_name ?? intern.email,
    internEmail: intern.email,
    university: intern.university,
    course: intern.course,
    track,
    startDate,
    endDate,
    durationWeeks,
    score,
    band,
    stars: Math.round(score),
    tasksCompleted: breakdown.tasks_completed,
    tasksAssigned: breakdown.tasks_assigned,
    daysLogged: breakdown.days_logged,
    workingDays: breakdown.working_days,
    highlights: highlightTitles,
    mentorName,
    ceoName,
    certificateId,
    issueDate,
    verifyUrl,
    qrCodeDataUrl,
  }

  // 11. Generate PDFs
  const [certBuffer, letterBuffer] = await Promise.all([
    renderCertificatePdf(data),
    renderExperienceLetterPdf(data),
  ])

  // 12. Upload to Supabase Storage
  const certPath = `${internId}/certificate-${certificateId}.pdf`
  const letterPath = `${internId}/experience-letter-${certificateId}.pdf`

  const { error: certUploadError } = await supabase.storage
    .from('documents')
    .upload(certPath, certBuffer, {
      contentType: 'application/pdf',
      upsert: true,   // ← CHANGED: retry-safe, overwrites if a prior attempt left a file
    })

  if (certUploadError) {
    console.error('Certificate upload failed:', certUploadError)
    return { success: false, error: 'Failed to upload certificate' }
  }

  const { error: letterUploadError } = await supabase.storage
    .from('documents')
    .upload(letterPath, letterBuffer, {
      contentType: 'application/pdf',
      upsert: true,   // ← CHANGED
    })

  if (letterUploadError) {
    console.error('Letter upload failed:', letterUploadError)
    return { success: false, error: 'Failed to upload experience letter' }
  }

  // 13. Insert into documents table
  const { error: docError } = await supabase.from('documents').insert([
    {
      intern_id: internId,
      type: 'certificate',
      title: `Certificate of Internship — ${certificateId}`,
      file_url: certPath,
      issued_by: issuedByUserId,
      certificate_id: certificateId,
      performance_score: score,
      verified: true,
    },
    {
      intern_id: internId,
      type: 'experience_letter',
      title: `Experience Letter — ${certificateId}`,
      file_url: letterPath,
      issued_by: issuedByUserId,
      certificate_id: certificateId,
      performance_score: score,   // ← ADDED
      verified: true,             // ← ADDED (this was the bug)
    },
  ])

  if (docError) {
    console.error('Documents insert error:', docError)
    return { success: false, error: 'Failed to save document records' }
  }

  // 14. Audit
  await supabase.from('audit_log').insert({
    actor_id: issuedByUserId,
    action: 'certificate.issued',
    entity: 'profiles',
    entity_id: internId,
    metadata: { certificateId, score },
  })

  // 15. In-app notification (fire-and-forget)
  createNotification({
    userId: internId,
    type: 'certificate_issued',
    title: '🎓 Certificate issued!',
    body: `Your certificate ${certificateId} is ready to download.`,
    link: '/dashboard/documents',
    metadata: { certificateId },
  }).catch((err) => {
    console.error('Certificate notification failed:', err)
  })

  // 16. Email notification (fire-and-forget)
  if (intern.email) {
    sendCertificateIssued({
      to: intern.email,
      fullName: intern.full_name,
      certificateId,
      score,
      verifyUrl,
    }).then((res) => {
      if (!res.success) {
        console.error('Certificate email failed:', res.error)
      }
    })
  }

  return {
    success: true,
    certificateId,
    certificateUrl: certPath,
    experienceLetterUrl: letterPath,
    score,
  }
}