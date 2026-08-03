'use client'

import { useEffect, useState } from 'react'
import { ExternalLink, Mail, Phone } from 'lucide-react'

export function ClassifiedStickyBar({
  title,
  price,
  primaryContact,
  hasPhone,
  hasEmail,
}: {
  title: string
  price: string
  primaryContact: string
  hasPhone: boolean
  hasEmail: boolean
}) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 360)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="sticky top-0 z-40 border-b border-[var(--tk-line)] bg-[var(--tk-surface)]/95 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[var(--editable-container)] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-12">
        <div className="flex min-w-0 items-center gap-4">
          {scrolled ? (
            <>
              <span className="editable-display truncate text-[1.05rem] font-medium tracking-[-0.015em] text-[var(--tk-text)]">
                {title}
              </span>
              {price ? (
                <span className="hidden shrink-0 rounded-full bg-[var(--tk-accent-soft)] px-3 py-1 text-sm font-medium text-[var(--tk-accent)] sm:inline-flex">
                  {price}
                </span>
              ) : null}
            </>
          ) : null}
        </div>
        <a
          href={primaryContact}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[var(--tk-accent)] px-4 py-2 text-sm font-medium text-[var(--tk-on-accent)] transition hover:opacity-90"
        >
          {hasPhone ? <Phone className="h-4 w-4" /> : hasEmail ? <Mail className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
          Contact seller
        </a>
      </div>
    </div>
  )
}
