import Link from 'next/link'
import { Logo } from './logo'

export function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 mt-20 bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="md:col-span-2">
          <Logo size="sm" />
          <p className="text-sm text-slate-500 mt-4 max-w-sm leading-relaxed">
            Real projects. Real mentorship. Real experience. A structured
            internship program by HERMAN Software Solutions Limited.
          </p>
        </div>

        {/* Explore */}
        <div>
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-4">
            Explore
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/interns" className="text-slate-600 hover:text-slate-900">
                Meet our interns
              </Link>
            </li>
            <li>
              <Link href="/success-stories" className="text-slate-600 hover:text-slate-900">
                Success stories
              </Link>
            </li>
            <li>
              <Link href="/apply" className="text-slate-600 hover:text-slate-900">
                Apply
              </Link>
            </li>
            <li>
              <Link href="/apply/status" className="text-slate-600 hover:text-slate-900">
                Check application
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-4">
            Contact
          </h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>Jinja, Gabula Rd, Uganda</li>
            <li>
              <a
                href="mailto:infohermansoftware@gmail.com"
                className="hover:text-slate-900"
              >
                infohermansoftware@gmail.com
              </a>
            </li>
            <li>
              <a href="tel:+256772723188" className="hover:text-slate-900">
                +256 772 723 188
              </a>
            </li>
          </ul>
        </div>
      </div>

            <div className="border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} HERMAN Software Solutions Limited
          </div>
          <div>
            <a
              href="https://herman-software-website.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 transition-colors"
            >
              Developed by the HERMAN Internship Team →
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}