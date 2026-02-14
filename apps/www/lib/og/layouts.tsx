import { ImageResponse } from 'next/og'

export const OG_SIZE = { width: 1200, height: 630 }

export async function loadInterFonts() {
  const [boldRes, regularRes] = await Promise.all([
    fetch('https://rsms.me/inter/font-files/Inter-Bold.woff'),
    fetch('https://rsms.me/inter/font-files/Inter-Regular.woff'),
  ])
  return [
    { name: 'Inter', data: await boldRes.arrayBuffer(), weight: 700 as const, style: 'normal' as const },
    { name: 'Inter', data: await regularRes.arrayBuffer(), weight: 400 as const, style: 'normal' as const },
  ]
}

/** Default OG: brand + tagline */
export function DefaultOGLayout() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
      }}
    >
      {/* Swiss Red top bar */}
      <div style={{ width: '100%', height: '8px', backgroundColor: '#D52B1E' }} />

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px 80px',
        }}
      >
        {/* Red accent block with book icon */}
        <div
          style={{
            width: '64px',
            height: '64px',
            backgroundColor: '#D52B1E',
            marginBottom: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '2px',
          }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
          </svg>
        </div>

        <div
          style={{
            fontSize: '72px',
            fontWeight: 700,
            fontFamily: 'Inter',
            color: '#0a0a0a',
            letterSpacing: '-2px',
            lineHeight: 1,
            marginBottom: '24px',
          }}
        >
          Shelvd
        </div>

        <div
          style={{
            fontSize: '28px',
            fontWeight: 400,
            fontFamily: 'Inter',
            color: '#737373',
            lineHeight: 1.4,
            maxWidth: '700px',
          }}
        >
          Professional collection management for
          <br />
          antiquarian books &amp; rare editions
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 80px 40px',
        }}
      >
        <div
          style={{
            fontSize: '16px',
            fontWeight: 400,
            fontFamily: 'Inter',
            color: '#a3a3a3',
            letterSpacing: '3px',
            textTransform: 'uppercase' as const,
          }}
        >
          shelvd.org
        </div>
        <div style={{ width: '120px', height: '3px', backgroundColor: '#D52B1E' }} />
      </div>
    </div>
  )
}

/** Blog article OG: title + author + date */
export function BlogOGLayout({ title, author, date }: { title: string; author: string; date: string }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
      }}
    >
      {/* Swiss Red top bar */}
      <div style={{ width: '100%', height: '8px', backgroundColor: '#D52B1E' }} />

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px 80px',
        }}
      >
        {/* Section label */}
        <div
          style={{
            fontSize: '14px',
            fontWeight: 700,
            fontFamily: 'Inter',
            color: '#D52B1E',
            letterSpacing: '3px',
            textTransform: 'uppercase' as const,
            marginBottom: '24px',
          }}
        >
          Marginalia — The Shelvd Blog
        </div>

        {/* Article title */}
        <div
          style={{
            fontSize: title.length > 60 ? '40px' : '52px',
            fontWeight: 700,
            fontFamily: 'Inter',
            color: '#0a0a0a',
            letterSpacing: '-1px',
            lineHeight: 1.15,
            marginBottom: '32px',
            maxWidth: '900px',
          }}
        >
          {title}
        </div>

        {/* Author + date */}
        <div
          style={{
            fontSize: '18px',
            fontWeight: 400,
            fontFamily: 'Inter',
            color: '#737373',
          }}
        >
          {author} · {date}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 80px 40px',
        }}
      >
        <div
          style={{
            fontSize: '16px',
            fontWeight: 400,
            fontFamily: 'Inter',
            color: '#a3a3a3',
            letterSpacing: '3px',
            textTransform: 'uppercase' as const,
          }}
        >
          shelvd.org/blog
        </div>
        <div style={{ width: '120px', height: '3px', backgroundColor: '#D52B1E' }} />
      </div>
    </div>
  )
}

/** Wiki article OG: title + category */
export function WikiOGLayout({ title, category }: { title: string; category: string }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
      }}
    >
      {/* Swiss Red top bar */}
      <div style={{ width: '100%', height: '8px', backgroundColor: '#D52B1E' }} />

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px 80px',
        }}
      >
        {/* Section label */}
        <div
          style={{
            fontSize: '14px',
            fontWeight: 700,
            fontFamily: 'Inter',
            color: '#D52B1E',
            letterSpacing: '3px',
            textTransform: 'uppercase' as const,
            marginBottom: '24px',
          }}
        >
          Shelvd Wiki — {category}
        </div>

        {/* Article title */}
        <div
          style={{
            fontSize: title.length > 50 ? '44px' : '56px',
            fontWeight: 700,
            fontFamily: 'Inter',
            color: '#0a0a0a',
            letterSpacing: '-1px',
            lineHeight: 1.15,
            maxWidth: '900px',
          }}
        >
          {title}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 80px 40px',
        }}
      >
        <div
          style={{
            fontSize: '16px',
            fontWeight: 400,
            fontFamily: 'Inter',
            color: '#a3a3a3',
            letterSpacing: '3px',
            textTransform: 'uppercase' as const,
          }}
        >
          shelvd.org/wiki
        </div>
        <div style={{ width: '120px', height: '3px', backgroundColor: '#D52B1E' }} />
      </div>
    </div>
  )
}

/** Page-specific OG: page title + optional subtitle */
export function PageOGLayout({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
      }}
    >
      {/* Swiss Red top bar */}
      <div style={{ width: '100%', height: '8px', backgroundColor: '#D52B1E' }} />

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px 80px',
        }}
      >
        {/* Red accent block with book icon */}
        <div
          style={{
            width: '48px',
            height: '48px',
            backgroundColor: '#D52B1E',
            marginBottom: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '2px',
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
          </svg>
        </div>

        <div
          style={{
            fontSize: '64px',
            fontWeight: 700,
            fontFamily: 'Inter',
            color: '#0a0a0a',
            letterSpacing: '-2px',
            lineHeight: 1,
            marginBottom: subtitle ? '20px' : '0',
          }}
        >
          {title}
        </div>

        {subtitle && (
          <div
            style={{
              fontSize: '26px',
              fontWeight: 400,
              fontFamily: 'Inter',
              color: '#737373',
              lineHeight: 1.4,
              maxWidth: '700px',
            }}
          >
            {subtitle}
          </div>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 80px 40px',
        }}
      >
        <div
          style={{
            fontSize: '16px',
            fontWeight: 400,
            fontFamily: 'Inter',
            color: '#a3a3a3',
            letterSpacing: '3px',
            textTransform: 'uppercase' as const,
          }}
        >
          shelvd.org
        </div>
        <div style={{ width: '120px', height: '3px', backgroundColor: '#D52B1E' }} />
      </div>
    </div>
  )
}

export function createOGResponse(element: React.ReactElement, fonts: Awaited<ReturnType<typeof loadInterFonts>>) {
  return new ImageResponse(element, {
    ...OG_SIZE,
    fonts,
  })
}
