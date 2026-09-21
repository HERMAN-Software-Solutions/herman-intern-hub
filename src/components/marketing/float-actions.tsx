'use client'

import { useEffect, useState } from 'react'
import { ArrowUp, MessageCircle } from 'lucide-react'

const WHATSAPP_NUMBER = '256754789403' // no + or spaces — required by wa.me
const WHATSAPP_MESSAGE =
  "Hi HERMAN! I'd like to know more about the internship program."

function whatsappHref(): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    WHATSAPP_MESSAGE
  )}`
}

export function FloatActions() {
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    function onScroll() {
      setShowTop(window.scrollY > 400)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div
      aria-label="Quick actions"
      className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2 sm:bottom-6 sm:right-6"
    >
      {/* Back to top — only visible after scrolling */}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Back to top"
        className={`w-11 h-11 rounded-full bg-white border border-slate-300 hover:border-slate-500 text-slate-700 shadow-lg flex items-center justify-center transition-all duration-300 ${
          showTop
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        <ArrowUp className="w-4 h-4" />
      </button>

      {/* WhatsApp float — always visible */}
      <a
        href={whatsappHref()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        title="Chat with us on WhatsApp"
        className="group w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
      >
        <MessageCircle className="w-6 h-6" aria-hidden="true" />
        <span className="sr-only">WhatsApp</span>
      </a>
    </div>
  )
}