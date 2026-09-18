import { LegalLayout } from '@/components/legal/legal-layout'

export const metadata = {
  title: 'Cookie Policy — HERMAN Intern Hub',
  description:
    'How HERMAN Intern Hub uses cookies and similar technologies.',
}

export default function CookiesPage() {
  return (
    <LegalLayout title="Cookie Policy" lastUpdated="September 2026">
      <p>
        This Cookie Policy explains how HERMAN Intern Hub uses cookies and
        similar technologies, and how you can control them.
      </p>

      <h2>1. What Are Cookies</h2>
      <p>
        Cookies are small text files stored on your device when you visit a
        website. They help websites remember your preferences, keep you
        logged in, and understand how visitors use the site.
      </p>

      <h2>2. Categories We Use</h2>

      <h3>Strictly necessary (always on)</h3>
      <p>
        These are required for the Service to function. Without them, you
        cannot log in or use most features.
      </p>
      <ul>
        <li>
          <strong>Authentication cookies</strong> — keep you signed in to
          your account
        </li>
        <li>
          <strong>Security cookies</strong> — protect against CSRF and other
          attacks
        </li>
        <li>
          <strong>Session cookies</strong> — remember your temporary state
          (like form progress)
        </li>
        <li>
          <strong>Consent cookie</strong> — remember your cookie preference
          so we don&apos;t ask again
        </li>
      </ul>

      <h3>Analytics (opt-in)</h3>
      <p>
        These help us understand how visitors use the site so we can improve
        it. They are only set if you click &quot;Accept all&quot; on the
        cookie banner.
      </p>
      <ul>
        <li>Page views and session duration</li>
        <li>Referrer sources</li>
        <li>Aggregate usage patterns (never tied to your identity)</li>
      </ul>

      <h3>We do NOT use</h3>
      <ul>
        <li>Advertising or tracking cookies</li>
        <li>Third-party social media trackers</li>
        <li>Cross-site behavioral profiling</li>
      </ul>

      <h2>3. Third-Party Cookies</h2>
      <p>
        Authentication is provided by Supabase. Their session cookies are
        strictly necessary for login.
      </p>
      <p>
        If you accept analytics cookies, we may use privacy-respecting
        analytics that does not track you across sites.
      </p>

      <h2>4. Managing Cookies</h2>
      <p>
        You can change your preference anytime by clearing your browser data
        for this site — the cookie banner will reappear on your next visit.
      </p>
      <p>
        Most browsers also allow you to block or delete cookies entirely via
        their settings. Note that disabling strictly necessary cookies will
        prevent you from using the Service (you won&apos;t be able to log in).
      </p>

      <h2>5. How Long Cookies Last</h2>
      <ul>
        <li>
          <strong>Session cookies:</strong> deleted when you close your
          browser
        </li>
        <li>
          <strong>Persistent cookies:</strong> up to 1 year (e.g., login
          sessions, consent preference)
        </li>
      </ul>

      <h2>6. Changes to This Policy</h2>
      <p>
        We may update this Cookie Policy from time to time. Material changes
        will be announced on the Service.
      </p>

      <h2>7. Contact</h2>
      <p>
        Questions about cookies? Email{' '}
        <a href="mailto:infohermansoftware@gmail.com">
          infohermansoftware@gmail.com
        </a>
        .
      </p>

      <hr />
      <p className="text-sm text-slate-500">
        See also: <a href="/terms">Terms &amp; Conditions</a> ·{' '}
        <a href="/privacy">Privacy Policy</a>
      </p>
    </LegalLayout>
  )
}