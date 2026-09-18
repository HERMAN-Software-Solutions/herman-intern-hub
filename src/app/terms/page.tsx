import { LegalLayout } from '@/components/legal/legal-layout'

export const metadata = {
  title: 'Terms & Conditions — HERMAN Intern Hub',
  description:
    'Terms of use for HERMAN Intern Hub, operated by HERMAN Software Solutions Limited.',
}

export default function TermsPage() {
  return (
    <LegalLayout title="Terms & Conditions" lastUpdated="September 2026">
      <p>
        These Terms &amp; Conditions govern your use of HERMAN Intern Hub
        (&quot;the Service&quot;), operated by <strong>HERMAN Software Solutions
        Limited</strong> (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;), a
        company registered in Uganda.
      </p>
      <p>
        By accessing or using the Service, you agree to be bound by these
        terms. If you do not agree, please do not use the Service.
      </p>

      <h2>1. About the Service</h2>
      <p>
        HERMAN Intern Hub is a platform for managing software engineering
        internships at HERMAN Software Solutions Limited. It handles
        applications, onboarding, project work, task submissions, mentor
        reviews, and certificate issuance.
      </p>

      <h2>2. Eligibility</h2>
      <p>You may apply for an internship if you:</p>
      <ul>
        <li>Are at least 18 years old, or have guardian consent</li>
        <li>Have some programming fundamentals</li>
        <li>Have access to a computer and reliable internet</li>
        <li>Can commit the time required by the program</li>
      </ul>

      <h2>3. Application & Acceptance</h2>
      <p>
        Submitting an application does not guarantee acceptance. We review
        every application personally. If accepted, you will receive an
        invitation by email with instructions to activate your account.
      </p>
      <p>
        Invitations expire 7 days after they are sent. You may request a new
        invitation if yours has expired.
      </p>

      <h2>4. Your Account</h2>
      <p>
        There is no public sign-up. Accounts are created only through an
        accepted invitation. You are responsible for:
      </p>
      <ul>
        <li>Keeping your password secure</li>
        <li>Not sharing your account credentials with anyone</li>
        <li>Notifying us immediately of any unauthorized use</li>
      </ul>
      <p>
        You must not attempt to access accounts, data, or systems that do not
        belong to you.
      </p>

      <h2>5. Internship Terms</h2>
      <p>
        Specific internship terms — including duration, working hours, code
        ownership, confidentiality, and compensation — are governed by the
        separate <strong>Internship Agreement</strong> that you sign during
        onboarding.
      </p>
      <p>
        If any conflict exists between these Terms and the Internship
        Agreement, the Internship Agreement takes precedence for your
        internship relationship.
      </p>

      <h2>6. Acceptable Use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Submit false, misleading, or impersonated information</li>
        <li>Upload files that contain malware or malicious code</li>
        <li>Attempt to reverse engineer, scrape, or overload the Service</li>
        <li>Use the Service for unlawful purposes</li>
        <li>Harass, threaten, or discriminate against others</li>
      </ul>

      <h2>7. Intellectual Property</h2>
      <p>
        The Service, its design, code, and content (excluding content you
        submit) are owned by HERMAN Software Solutions Limited.
      </p>
      <p>
        Work you produce during your internship is governed by the Internship
        Agreement and belongs to the Company or its clients unless otherwise
        agreed in writing.
      </p>

      <h2>8. Certificates</h2>
      <p>
        Certificates of internship are issued at the sole discretion of
        HERMAN Software Solutions Limited, based on demonstrated completion
        of program requirements. Each certificate has a unique ID and can be
        publicly verified on this website.
      </p>
      <p>
        We may revoke a certificate if we discover it was issued based on
        fraudulent information.
      </p>

      <h2>9. Availability</h2>
      <p>
        We aim to keep the Service available at all times but do not guarantee
        uninterrupted service. We may perform maintenance or make changes
        without notice.
      </p>

      <h2>10. Disclaimer</h2>
      <p>
        The Service is provided &quot;as is&quot; without warranties of any
        kind, express or implied. We are not liable for indirect, incidental,
        or consequential damages arising from your use of the Service.
      </p>

      <h2>11. Termination</h2>
      <p>
        We may suspend or terminate your access if you violate these Terms,
        breach the Internship Agreement, or misuse the Service.
      </p>
      <p>
        You may stop using the Service at any time and request deletion of
        your account (see our <a href="/privacy">Privacy Policy</a>).
      </p>

      <h2>12. Changes to These Terms</h2>
      <p>
        We may update these Terms from time to time. Material changes will be
        announced on the Service. Continued use after a change means you
        accept the updated Terms.
      </p>

      <h2>13. Governing Law</h2>
      <p>
        These Terms are governed by the laws of the Republic of Uganda. Any
        disputes will be resolved in Ugandan courts.
      </p>

      <h2>14. Contact</h2>
      <p>
        For questions about these Terms, contact us at{' '}
        <a href="mailto:infohermansoftware@gmail.com">
          infohermansoftware@gmail.com
        </a>{' '}
        or +256 772 723 188.
      </p>

      <hr />
      <p className="text-sm text-slate-500">
        By using HERMAN Intern Hub, you acknowledge that you have read and
        agree to these Terms &amp; Conditions.
      </p>
    </LegalLayout>
  )
}