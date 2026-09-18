import { LegalLayout } from '@/components/legal/legal-layout'

export const metadata = {
  title: 'Privacy Policy — HERMAN Intern Hub',
  description:
    'How HERMAN Software Solutions Limited collects, uses, and protects your data.',
}

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="September 2026">
      <p>
        HERMAN Software Solutions Limited (&quot;we&quot;, &quot;us&quot;)
        operates HERMAN Intern Hub. This Privacy Policy explains what data we
        collect, why, and how you can control it.
      </p>

      <h2>1. What We Collect</h2>

      <h3>Information you provide</h3>
      <ul>
        <li>
          <strong>Application data:</strong> name, email, phone, university,
          course, year of study, tech stack interests, portfolio link, and
          your message
        </li>
        <li>
          <strong>Account data:</strong> password (hashed), profile photo
          (optional), bio, and mentor assignment
        </li>
        <li>
          <strong>Work data:</strong> daily logs, task submissions, uploaded
          files, and project contributions
        </li>
        <li>
          <strong>Review data:</strong> mentor feedback, performance reviews,
          and certificates
        </li>
      </ul>

      <h3>Information collected automatically</h3>
      <ul>
        <li>
          <strong>Log data:</strong> IP address, browser type, device type,
          pages visited, timestamps
        </li>
        <li>
          <strong>Cookies:</strong> see our{' '}
          <a href="/cookies">Cookie Policy</a> for details
        </li>
      </ul>

      <h2>2. Why We Collect It</h2>
      <ul>
        <li>
          <strong>To run the internship program:</strong> reviewing
          applications, onboarding interns, assigning mentors, tracking
          progress
        </li>
        <li>
          <strong>To issue certificates:</strong> computing performance
          scores, generating PDFs, enabling public verification
        </li>
        <li>
          <strong>To communicate with you:</strong> application updates,
          invitations, notifications, weekly reports
        </li>
        <li>
          <strong>To improve the Service:</strong> aggregated analytics, bug
          tracking, feature planning
        </li>
        <li>
          <strong>To comply with legal obligations:</strong> record-keeping,
          fraud prevention
        </li>
      </ul>

      <h2>3. Who Can See Your Data</h2>
      <ul>
        <li>
          <strong>You:</strong> you can view and edit your own profile,
          logs, submissions, and documents
        </li>
        <li>
          <strong>Your mentor:</strong> assigned mentors can see your tasks,
          submissions, logs, and feedback
        </li>
        <li>
          <strong>HERMAN administrators:</strong> the program team can
          access all intern data for management purposes
        </li>
        <li>
          <strong>The public:</strong> only if you opt-in to the public
          directory. Your name, university, course, bio, and tech stack will
          be visible at <code>/interns</code>. You can disable this anytime.
        </li>
        <li>
          <strong>Certificate verifiers:</strong> if you complete the
          program, anyone with your certificate ID can verify it publicly
          (name, university, score)
        </li>
      </ul>

      <h2>4. Third-Party Services</h2>
      <p>We use the following trusted providers:</p>
      <ul>
        <li>
          <strong>Supabase</strong> — database, authentication, and file
          storage (servers in EU/US)
        </li>
        <li>
          <strong>Vercel</strong> — hosting and CDN
        </li>
        <li>
          <strong>Brevo</strong> — transactional email delivery
        </li>
      </ul>
      <p>
        These providers process data on our behalf under their own privacy
        commitments. We do not sell your data to anyone.
      </p>

      <h2>5. Data Retention</h2>
      <ul>
        <li>
          <strong>Applications:</strong> retained for 2 years if rejected,
          indefinitely if accepted
        </li>
        <li>
          <strong>Account and work data:</strong> retained during and after
          the internship for alumni tracking and certificate verification
        </li>
        <li>
          <strong>Audit logs:</strong> retained indefinitely for security and
          compliance
        </li>
        <li>
          <strong>Uploaded files:</strong> retained while relevant, then
          deleted on request
        </li>
      </ul>

      <h2>6. Your Rights</h2>
      <p>You have the right to:</p>
      <ul>
        <li>
          <strong>Access</strong> the personal data we hold about you
        </li>
        <li>
          <strong>Correct</strong> inaccurate data (most of this you can do
          directly in your profile)
        </li>
        <li>
          <strong>Delete</strong> your account and personal data (subject to
          legal retention requirements)
        </li>
        <li>
          <strong>Export</strong> your data in a portable format
        </li>
        <li>
          <strong>Withdraw consent</strong> for optional data uses (like the
          public directory)
        </li>
        <li>
          <strong>Object</strong> to processing in certain circumstances
        </li>
      </ul>
      <p>
        To exercise any right, email{' '}
        <a href="mailto:infohermansoftware@gmail.com">
          infohermansoftware@gmail.com
        </a>
        . We respond within 30 days.
      </p>

      <h2>7. Security</h2>
      <p>
        We use industry-standard security measures including encryption in
        transit, row-level security on the database, encrypted passwords,
        and access controls. However, no system is 100% secure — please use
        a strong unique password.
      </p>

      <h2>8. Children</h2>
      <p>
        The Service is not intended for users under 18 without guardian
        consent. If we learn a minor has provided personal data without
        consent, we will delete it.
      </p>

      <h2>9. International Transfers</h2>
      <p>
        Your data may be stored and processed outside Uganda (in the EU and
        US through our service providers). We ensure appropriate safeguards
        are in place.
      </p>

      <h2>10. Changes</h2>
      <p>
        We may update this policy. Material changes will be announced on the
        Service. Continued use means you accept the updated policy.
      </p>

      <h2>11. Contact</h2>
      <p>
        For privacy questions or to exercise your rights:
        <br />
        <strong>Email:</strong>{' '}
        <a href="mailto:infohermansoftware@gmail.com">
          infohermansoftware@gmail.com
        </a>
        <br />
        <strong>Phone:</strong> +256 772 723 188
        <br />
        <strong>Address:</strong> Jinja, Gabula Rd, Uganda
      </p>

      <hr />
      <p className="text-sm text-slate-500">
        By using HERMAN Intern Hub, you acknowledge that you have read and
        understood this Privacy Policy.
      </p>
    </LegalLayout>
  )
}