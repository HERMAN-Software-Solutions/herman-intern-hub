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

// ─────────────────────────────────────────────
// 2. Invitation email (with token link)
// ─────────────────────────────────────────────
export function invitationEmail(input: {
  fullName: string | null
  token: string
  startDate?: string | null
  welcomeMessage?: string | null
}): { subject: string; html: string } {
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${input.token}`

  return {
    subject: "You're invited to join HERMAN as an intern",
    html: shell(`
      ${h1(`Welcome${input.fullName ? `, ${input.fullName}` : ''}! 🎉`)}
      ${p(
        input.welcomeMessage ??
          `We're excited to offer you an internship at HERMAN Software Solutions. Your application stood out and we'd love to have you on board.`
      )}
      ${
        input.startDate
          ? p(
              `<strong>Proposed start date:</strong> ${new Date(input.startDate).toLocaleDateString()}`
            )
          : ''
      }
      ${p(`Click the button below to set your password and complete your onboarding. This link expires in <strong>7 days</strong>.`)}
      <div style="margin-top:24px;">
        ${button(inviteUrl, 'Accept invitation →')}
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