import { ImageResponse } from 'next/og'

export const alt = 'HERMAN Intern Hub — Launch your software career'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 80,
          background:
            'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          color: 'white',
          fontFamily: 'system-ui',
        }}
      >
        {/* Logo row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              background: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 40,
              fontWeight: 700,
            }}
          >
            H
          </div>
          <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: 0.5 }}>
            HERMAN Intern Hub
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: -2,
            maxWidth: 900,
          }}
        >
          Launch your software career
        </div>

        <div
          style={{
            fontSize: 32,
            color: '#94a3b8',
            marginTop: 24,
            maxWidth: 800,
          }}
        >
          Real projects. Real mentorship. Real experience.
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: 'flex',
            gap: 40,
            marginTop: 60,
            color: '#94a3b8',
            fontSize: 20,
          }}
        >
          <span>Jinja, Uganda</span>
          <span>·</span>
          <span>herman-intern-hub.vercel.app</span>
        </div>
      </div>
    ),
    size
  )
}