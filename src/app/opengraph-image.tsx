import { ImageResponse } from 'next/og'
import { readFileSync } from 'fs'
import { join } from 'path'

export const alt = 'HERMAN Intern Hub — Launch your software career'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Read + cache the logo as a base64 data URL
let logoDataUrl: string | null = null

function getLogoDataUrl(): string | null {
  if (logoDataUrl) return logoDataUrl
  try {
    const path = join(process.cwd(), 'public', 'brand', 'logo.png')
    const buf = readFileSync(path)
    logoDataUrl = `data:image/png;base64,${buf.toString('base64')}`
    return logoDataUrl
  } catch (err) {
    console.error('OG logo load failed:', err)
    return null
  }
}

export default async function Image() {
  const logo = getLogoDataUrl()

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
            marginBottom: 48,
          }}
        >
          {logo ? (
            <img
              src={logo}
              width={72}
              height={72}
              alt="HERMAN"
              style={{
                objectFit: 'contain',
                borderRadius: 12,
              }}
            />
          ) : (
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
          )}
          <div
            style={{
              fontSize: 32,
              fontWeight: 600,
              letterSpacing: 0.5,
              color: 'white',
            }}
          >
            HERMAN Intern Hub
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 76,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: -2.5,
            maxWidth: 950,
            color: 'white',
          }}
        >
          Launch your software career
        </div>

        {/* Subheadline */}
        <div
          style={{
            fontSize: 30,
            color: '#94a3b8',
            marginTop: 28,
            maxWidth: 850,
            lineHeight: 1.3,
          }}
        >
          Real projects. Real mentorship. Real experience.
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: 'flex',
            gap: 24,
            marginTop: 72,
            color: '#94a3b8',
            fontSize: 20,
            alignItems: 'center',
          }}
        >
          <span>Jinja, Uganda</span>
          <span style={{ opacity: 0.5 }}>·</span>
          <span>herman-intern-hub.vercel.app</span>
        </div>
      </div>
    ),
    size
  )
}