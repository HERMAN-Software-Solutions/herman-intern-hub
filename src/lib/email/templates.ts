const BRAND = {
  name: 'HERMAN Software Solutions',
  primary: '#0f172a',
  accent: '#2563eb',
  email: 'infohermansoftware@gmail.com',
  phone: '+256 772 723 188',
  location: 'Jinja, Gabula Rd, Uganda',
  site: 'https://herman-software-website.vercel.app',
}

function shell(content: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:32px;">
      <div style="margin-bottom:24px;">
        <div style="font-size:20px;font-weight:700;color:${BRAND.primary};">
          HERMAN
        </div>
        <div style="font-size:11px;color:#64748b;letter-spacing:0.5px;text-transform:uppercase;margin-top:2px;">
          Intern Hub
        </div>
      </div>
      ${content}
    </div>
    <div style="text-align:center;margin-top:24px;font-size:12px;color:#94a3b8;">
      ${BRAND.name} · ${BRAND.location}<br>
      <a href="${BRAND.site}" style="color:${BRAND.accent};text-decoration:none;">${BRAND.site}</a>
    </div>
  </div>
</body>
</html>`
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:${BRAND.primary};color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 24px;border-radius:8px;margin:8px 0;">${label}</a>`
}

function h1(text: string): string {
  return `<h1 style="font-size:22px;font-weight:700;color:${BRAND.primary};margin:0 0 12px;">${text}</h1>`
}

function p(text: string): string {
  return `<p style="font-size:14px;line-height:1.6;color:#334155;margin:0 0 14px;">${text}</p>`
}

// ─────────────────────────────────────────────
// 1. Application received
// ─────────────────────────────────────────────
export function applicationReceivedEmail(name: string): {
  subject: string
  html: string
} {
  return {
    subject: 'We received your application — HERMAN Intern Hub',
    html: shell(`
      ${h1(`Thanks for applying, ${name}`)}
      ${p(`We've received your application to join HERMAN Software Solutions as an intern.`)}
      ${p(`Our team reviews every application personally. You'll hear from us within <strong>5 working days</strong>.`)}
      ${p(`In the meantime, feel free to check the status of your application anytime.`)}
      <div style="margin-top:24px;">
        ${button(`${process.env.NEXT_PUBLIC_APP_URL}/apply/status`, 'Check status')}
      </div>
      ${p(`If you have any questions, reply to this email or contact us at ${BRAND.email}.`)}
      ${p(`— The HERMAN team`)}
    `),
  }
}

// ─────────────────────────────────────────────────────
// 6. New application — admin notification
// ─────────────────────────────────────────────────────
export function newApplicationAdminEmail(input: {
  applicationId: string
  applicantName: string
  applicantEmail: string
  university: string
  course: string
  phone: string | null
  techStackInterest: string[]
  portfolioUrl: string | null
  message: string
}): { subject: string; html: string } {
  const reviewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/applications/${input.applicationId}`

  const techTags = input.techStackInterest
    .map(
      (t) =>
        `<span style="display:inline-block;background:#f1f5f9;color:#334155;font-size:12px;padding:4px 10px;border-radius:12px;margin:2px 4px 2px 0;">${t}</span>`
    )
    .join('')

  const messagePreview =
    input.message.length > 400
      ? input.message.slice(0, 400) + '…'
      : input.message

  return {
    subject: `New application: ${input.applicantName}`,
    html: shell(`
      ${h1('📥 New internship application')}
      ${p(`<strong>${input.applicantName}</strong> from ${input.university} just submitted an application to the HERMAN Intern Hub.`)}

      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin:20px 0;">
        <table style="width:100%;font-size:13px;color:#334155;border-collapse:collapse;">
          <tr>
            <td style="padding:6px 0;width:120px;color:#64748b;">Name</td>
            <td style="padding:6px 0;font-weight:600;">${input.applicantName}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748b;">Email</td>
            <td style="padding:6px 0;">
              <a href="mailto:${input.applicantEmail}" style="color:${BRAND.accent};text-decoration:none;">${input.applicantEmail}</a>
            </td>
          </tr>
          ${
            input.phone
              ? `<tr>
                  <td style="padding:6px 0;color:#64748b;">Phone</td>
                  <td style="padding:6px 0;">${input.phone}</td>
                </tr>`
              : ''
          }
          <tr>
            <td style="padding:6px 0;color:#64748b;">University</td>
            <td style="padding:6px 0;">${input.university}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748b;">Course</td>
            <td style="padding:6px 0;">${input.course}</td>
          </tr>
          ${
            input.portfolioUrl
              ? `<tr>
                  <td style="padding:6px 0;color:#64748b;">Portfolio</td>
                  <td style="padding:6px 0;">
                    <a href="${input.portfolioUrl}" style="color:${BRAND.accent};text-decoration:none;word-break:break-all;">${input.portfolioUrl}</a>
                  </td>
                </tr>`
              : ''
          }
        </table>
      </div>

      ${
        techTags
          ? p(`<strong>Tech interests:</strong><br>${techTags}`)
          : ''
      }

      <p style="font-size:13px;color:#64748b;margin:20px 0 8px;"><strong>Message:</strong></p>
      <div style="background:#f1f5f9;border-radius:8px;padding:14px;font-size:13px;line-height:1.6;color:#334155;white-space:pre-wrap;">${messagePreview}</div>

      <div style="margin-top:24px;">
        ${button(reviewUrl, 'Review application →')}
      </div>

      <p style="font-size:12px;color:#64748b;margin-top:20px;">
        Or open your dashboard:
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/applications" style="color:${BRAND.accent};text-decoration:none;">/admin/applications</a>
      </p>
    `),
  }
}

// ─────────────────────────────────────────────
// 2. Invitation email (with token link)
// ─────────────────────────────────────────────
export function invitationEmail(input: {
  fullName: string | null
  token: string
  role?: string | null
  startDate?: string | null
  welcomeMessage?: string | null
}): { subject: string; html: string } {
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${input.token}`

  const role = input.role ?? 'intern'
  const isMentor = role === 'mentor'

  // Role-specific copy
  const roleLabel = isMentor ? 'mentor' : 'intern'
  const roleTitle = isMentor ? 'Mentor' : 'Intern'

  const subject = isMentor
    ? "You're invited to join HERMAN as a mentor"
    : "You're invited to join HERMAN as an intern"

  const defaultWelcome = isMentor
    ? `We'd love to have you join HERMAN Software Solutions as a mentor. Your experience and guidance will help shape the next generation of software engineers.`
    : `We're excited to offer you an internship at HERMAN Software Solutions. Your application stood out and we'd love to have you on board.`

  const stepCopy = isMentor
    ? `Click the button below to set your password and access your mentor dashboard. This link expires in <strong>7 days</strong>.`
    : `Click the button below to set your password and complete your onboarding. This link expires in <strong>7 days</strong>.`

  const buttonLabel = isMentor
    ? 'Accept invitation →'
    : 'Accept invitation →'

  return {
    subject,
    html: shell(`
      ${h1(`Welcome${input.fullName ? `, ${input.fullName}` : ''}! 🎉`)}
      ${p(input.welcomeMessage ?? defaultWelcome)}
      ${
        !isMentor && input.startDate
          ? p(
              `<strong>Proposed start date:</strong> ${new Date(input.startDate).toLocaleDateString()}`
            )
          : ''
      }
      ${p(stepCopy)}
      <div style="margin-top:24px;">
        ${button(inviteUrl, buttonLabel)}
      </div>
      ${p(`If the button doesn't work, copy this link into your browser:`)}
      <p style="font-size:12px;color:#64748b;word-break:break-all;background:#f1f5f9;padding:10px;border-radius:6px;font-family:monospace;">
        ${inviteUrl}
      </p>
      ${p(`— The HERMAN team`)}
    `),
  }
}

// ─────────────────────────────────────────────
// 3. Welcome / activated email
// ─────────────────────────────────────────────
export function activatedEmail(input: {
  fullName: string | null
  mentorName: string | null
}): { subject: string; html: string } {
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`

  return {
    subject: "You're all set — welcome to HERMAN",
    html: shell(`
      ${h1(`You're activated${input.fullName ? `, ${input.fullName}` : ''}! ✅`)}
      ${p(`Your onboarding is complete and your internship is now officially active.`)}
      ${
        input.mentorName
          ? p(`Your mentor is <strong>${input.mentorName}</strong>. They'll guide you through your projects and give you feedback on your work.`)
          : ''
      }
      ${p(`Log in to your dashboard to see your projects, tasks, and daily logs.`)}
      <div style="margin-top:24px;">
        ${button(dashboardUrl, 'Go to dashboard →')}
      </div>
      ${p(`We're glad to have you here. — The HERMAN team`)}
    `),
  }
}

// ─────────────────────────────────────────────
// 4. Application rejected (optional, gentle)
// ─────────────────────────────────────────────
export function rejectionEmail(name: string): {
  subject: string
  html: string
} {
  return {
    subject: 'About your HERMAN internship application',
    html: shell(`
      ${h1(`Hello ${name},`)}
      ${p(`Thank you for your interest in interning with HERMAN Software Solutions.`)}
      ${p(`After careful review, we are unable to offer you a position in this cohort. This isn't a reflection of your potential — we receive more applications than we can accommodate.`)}
      ${p(`We encourage you to apply again in the future as your skills grow.`)}
      ${p(`Wishing you the very best,<br>— The HERMAN team`)}
    `),
  }
}

// ─────────────────────────────────────────────
// 5. Certificate issued
// ─────────────────────────────────────────────
export function certificateIssuedEmail(input: {
  fullName: string | null
  certificateId: string
  score: number
  verifyUrl: string
}): { subject: string; html: string } {
  return {
    subject: `🎓 Your HERMAN certificate is ready`,
    html: shell(`
      ${h1(`Congratulations${input.fullName ? `, ${input.fullName.split(' ')[0]}` : ''}! 🎓`)}
      ${p(`Your internship certificate has been issued. We hope your time at HERMAN was as valuable for you as it was for us.`)}
      ${p(`<strong>Certificate ID:</strong> ${input.certificateId}<br>
           <strong>Performance:</strong> ${input.score.toFixed(1)} / 5.0`)}
      ${p(`You can download your certificate and experience letter anytime from your dashboard.`)}
      <div style="margin-top:24px;">
        ${button(
          `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/documents`,
          'View my documents'
        )}
      </div>
      ${p(`Anyone can verify your certificate at any time using this link:`)}
      <p style="font-size:12px;color:#64748b;word-break:break-all;background:#f1f5f9;padding:10px;border-radius:6px;font-family:monospace;">
        ${input.verifyUrl}
      </p>
      ${p(`Feel free to add this to your LinkedIn profile or CV. We wish you the very best in your career.`)}
      ${p(`— The HERMAN team`)}
    `),
  }
}

// ─────────────────────────────────────────────────────
// 7. Announcement
// ─────────────────────────────────────────────────────
export function announcementEmail(input: {
  recipientName: string | null
  subject: string
  body: string
  senderName: string
}): { subject: string; html: string } {
  // Convert newlines to <br> for simple formatting
  const formattedBody = input.body
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>')

  return {
    subject: `📢 ${input.subject}`,
    html: shell(`
      ${h1(input.subject)}
      ${p(
        input.recipientName
          ? `Hi ${input.recipientName.split(' ')[0]},`
          : 'Hi,'
      )}
      <div style="font-size:14px;line-height:1.7;color:#334155;margin:0 0 20px;">
        ${formattedBody}
      </div>
      ${p(`— ${input.senderName}, HERMAN Software Solutions`)}
      <div style="margin-top:24px;">
        ${button(
          `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/announcements`,
          'Open in HERMAN Intern Hub'
        )}
      </div>
    `),
  }
}

// ─────────────────────────────────────────────────────
// 8. Client error alert (admin)
// ─────────────────────────────────────────────────────
export function clientErrorAlertEmail(input: {
  label: string
  message: string
  url: string | null
  userAgent: string | null
  stack: string | null
  digest: string | null
  timestamp: string
}): { subject: string; html: string } {
  // Sanitize stack for HTML
  const safeStack = (input.stack ?? 'No stack trace')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .slice(0, 3000)

  const subjectLine = `🚨 Client error: ${input.message.slice(0, 80)}`

  return {
    subject: subjectLine,
    html: shell(`
      ${h1('🚨 A user hit an error')}
      ${p('Someone just experienced an error in HERMAN Intern Hub. Here are the details.')}

      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px;margin:20px 0;">
        <table style="width:100%;font-size:13px;color:#334155;border-collapse:collapse;">
          <tr>
            <td style="padding:6px 0;width:120px;color:#64748b;">Where</td>
            <td style="padding:6px 0;font-weight:600;">${input.label}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748b;">When</td>
            <td style="padding:6px 0;">${new Date(input.timestamp).toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748b;">URL</td>
            <td style="padding:6px 0;word-break:break-all;">
              ${input.url ? `<a href="${input.url}" style="color:${BRAND.accent};text-decoration:none;">${input.url}</a>` : '—'}
            </td>
          </tr>
          ${input.digest ? `
          <tr>
            <td style="padding:6px 0;color:#64748b;">Error ID</td>
            <td style="padding:6px 0;font-family:monospace;">${input.digest}</td>
          </tr>` : ''}
          <tr>
            <td style="padding:6px 0;color:#64748b;">Device</td>
            <td style="padding:6px 0;font-size:12px;word-break:break-all;">${input.userAgent ?? '—'}</td>
          </tr>
        </table>
      </div>

      ${p(`<strong>Error message:</strong>`)}
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:12px;font-family:monospace;font-size:12px;color:#991b1b;word-break:break-word;">
        ${input.message}
      </div>

      ${p(`<strong>Stack trace (top of it):</strong>`)}
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;font-family:monospace;font-size:11px;color:#334155;white-space:pre-wrap;word-break:break-word;max-height:300px;overflow:auto;">
        ${safeStack}
      </div>

      <div style="margin-top:24px;">
        ${button(
          'https://vercel.com/dashboard',
          'Open Vercel Logs →'
        )}
      </div>

      ${p(`<span style="color:#94a3b8;font-size:12px;">This alert is rate-limited to 1 per unique error per 30 minutes. If the same error keeps happening, you won't be flooded.</span>`)}
    `),
  }
}