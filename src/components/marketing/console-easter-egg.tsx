'use client'

import { useEffect } from 'react'

const HERMAN_ASCII = `
  ██╗  ██╗███████╗██████╗ ███╗   ███╗ █████╗ ███╗   ██╗
  ██║  ██║██╔════╝██╔══██╗████╗ ████║██╔══██╗████╗  ██║
  ███████║█████╗  ██████╔╝██╔████╔██║███████║██╔██╗ ██║
  ██╔══██║██╔══╝  ██╔══██╗██║╚██╔╝██║██╔══██║██║╚██╗██║
  ██║  ██║███████╗██║  ██║██║ ╚═╝ ██║██║  ██║██║ ╚████║
  ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝
              I N T E R N   H U B
`

const BANNER_STYLE =
  'color:#2563eb;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:11px;line-height:1.2;font-weight:700;'
const TITLE_STYLE =
  'color:#0f172a;font-size:20px;font-weight:700;padding:6px 0;'
const TEXT_STYLE =
  'color:#334155;font-size:13px;line-height:1.6;padding:2px 0;'
const ACCENT_STYLE =
  'color:#2563eb;font-size:13px;font-weight:600;padding:4px 0;'
const MUTED_STYLE =
  'color:#94a3b8;font-size:11px;padding:2px 0;'

export function ConsoleEasterEgg() {
  useEffect(() => {
    const appUrl =
      typeof window !== 'undefined'
        ? window.location.origin
        : 'https://herman-intern-hub.vercel.app'

    // The ASCII banner
    console.log(
      `%c${HERMAN_ASCII}`,
      BANNER_STYLE
    )

    // Greeting
    console.log(
      '%c👋 Hey, you found the console.',
      TITLE_STYLE
    )

    console.log(
      '%cThat means you\'re curious. We like curious people.',
      TEXT_STYLE
    )

    console.log('')

    // Pitch
    console.log(
      '%cWe\'re HERMAN Software Solutions — based in Jinja, Uganda. We build production software and train the next generation of engineers.',
      TEXT_STYLE
    )

    console.log('')

    // CTA
    console.log(
      '%cWant to build with us?',
      ACCENT_STYLE
    )
    console.log(
      `%c  → Apply for an internship: ${appUrl}/apply`,
      TEXT_STYLE
    )
    console.log(
      `%c  → See our interns: ${appUrl}/interns`,
      TEXT_STYLE
    )
    console.log(
      `%c  → Verify a certificate: ${appUrl}/verify`,
      TEXT_STYLE
    )

    console.log('')

    // Nerd-out footer
    console.log(
      '%cBuilt with Next.js, Supabase, Tailwind, and a lot of curiosity.',
      MUTED_STYLE
    )
    console.log(
      '%cIf you\'re reading this because you love the web — we should talk.',
      MUTED_STYLE
    )
  }, [])

  return null
}