import Link from 'next/link'
import { Logo } from './logo'

export function PublicFooter() {
  return (
    <footer className="relative overflow-hidden bg-slate-950 border-t border-white/5">
      {/* Subtle radial glow */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(37, 99, 235, 0.15), transparent 70%)',
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand — spans 2 */}
        <div className="md:col-span-2 lg:col-span-2">
          <div className="flex items-center gap-2.5 mb-4">
            <img
              src="/brand/logo.png"
              alt="HERMAN"
              className="h-8 w-8 rounded object-contain bg-white/10 p-0.5"
            />
            <div>
              <div
                className="font-bold text-base leading-tight"
                style={{ color: '#ffffff' }}
              >
                HERMAN
              </div>
              <div
                className="text-[10px] leading-tight uppercase tracking-wider"
                style={{ color: '#94a3b8' }}
              >
                Intern Hub
              </div>
            </div>
          </div>

          <p
            className="text-sm leading-relaxed max-w-sm"
            style={{ color: '#94a3b8' }}
          >
            Real projects. Real mentorship. Real experience. A structured
            internship program by HERMAN Software Solutions Limited.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <span
              className="text-[11px] bg-white/5 border border-white/10 px-2.5 py-1 rounded-full"
              style={{ color: '#cbd5e1' }}
            >
              🇺🇬 Built in Uganda
            </span>
            <span
              className="text-[11px] bg-white/5 border border-white/10 px-2.5 py-1 rounded-full"
              style={{ color: '#cbd5e1' }}
            >
              Remote-first
            </span>
          </div>
        </div>

        {/* Explore */}
        <div>
          <h3
            className="text-xs font-semibold uppercase tracking-wider mb-4"
            style={{ color: '#ffffff' }}
          >
            Explore
          </h3>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link
                href="/about"
                className="transition-colors hover:text-white"
                style={{ color: '#94a3b8' }}
              >
                About the Hub
              </Link>
            </li>
            <li>
              <Link
                href="/interns"
                className="transition-colors hover:text-white"
                style={{ color: '#94a3b8' }}
              >
                Meet our interns
              </Link>
            </li>
            <li>
              <Link
                href="/success-stories"
                className="transition-colors hover:text-white"
                style={{ color: '#94a3b8' }}
              >
                Success stories
              </Link>
            </li>
            <li>
              <Link
                href="/apply"
                className="transition-colors hover:text-white"
                style={{ color: '#94a3b8' }}
              >
                Apply
              </Link>
            </li>
            <li>
              <Link
                href="/apply/status"
                className="transition-colors hover:text-white"
                style={{ color: '#94a3b8' }}
              >
                Check application
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3
            className="text-xs font-semibold uppercase tracking-wider mb-4"
            style={{ color: '#ffffff' }}
          >
            Legal
          </h3>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link
                href="/terms"
                className="transition-colors hover:text-white"
                style={{ color: '#94a3b8' }}
              >
                Terms &amp; Conditions
              </Link>
            </li>
            <li>
              <Link
                href="/privacy"
                className="transition-colors hover:text-white"
                style={{ color: '#94a3b8' }}
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/cookies"
                className="transition-colors hover:text-white"
                style={{ color: '#94a3b8' }}
              >
                Cookie Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3
            className="text-xs font-semibold uppercase tracking-wider mb-4"
            style={{ color: '#ffffff' }}
          >
            Contact
          </h3>
          <ul className="space-y-2.5 text-sm">
            <li style={{ color: '#94a3b8' }}>Jinja, Gabula Rd, Uganda</li>
            <li>
              <a
                href="mailto:infohermansoftware@gmail.com"
                className="transition-colors hover:text-white break-all"
                style={{ color: '#94a3b8' }}
              >
                infohermansoftware@gmail.com
              </a>
            </li>
            <li>
              <a
                href="tel:+256772723188"
                className="transition-colors hover:text-white"
                style={{ color: '#94a3b8' }}
              >
                +256 772 723 188
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div style={{ color: '#64748b' }}>
            © {new Date().getFullYear()} HERMAN Software Solutions Limited
          </div>
          <div>
            <a
              href="https://herman-software-website.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-white"
              style={{ color: '#64748b' }}
            >
              Developed by the HERMAN Internship Team →
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}