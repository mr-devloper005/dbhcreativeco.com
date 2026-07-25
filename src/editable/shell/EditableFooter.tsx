'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { CATEGORY_OPTIONS } from '@/lib/categories'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

/*
  Reference-style footer: dark warm slab, brand mark + tagline top-left,
  three columns (The Market by category, Site, Sell), bottom rule with
  copyright + social. Marketplace discovery lives here and on the home,
  never in the navbar.
*/

export function EditableFooter() {
  const year = new Date().getFullYear()
  const { session, logout } = useEditableLocalAuthSession()

  // The Market column pulls its links directly from the real archive
  // categories (same list the archive filter/rail uses), so footer stays in
  // sync with what actually filters listings. First 6 kept for footer length.
  const marketColumn = {
    title: 'The Market',
    links: [
      { label: 'Everything', href: '/classified' },
      ...CATEGORY_OPTIONS.slice(0, 6).map((c) => ({
        label: c.name,
        href: `/classified?category=${c.slug}`,
      })),
    ],
  }
  const columns = [marketColumn, ...globalContent.footer.columns.filter((c) => c.title !== 'The Market')]

  return (
    <footer className="mt-20 bg-[var(--editable-footer-bg)] text-[var(--editable-footer-text)]">
      <div className="mx-auto grid w-full max-w-[var(--editable-container)] gap-14 px-4 py-20 sm:px-6 lg:grid-cols-[1.3fr_1fr_1fr_1fr] lg:px-12">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[var(--slot4-accent)] text-[var(--slot4-on-accent)]">
              <img src="/favicon.png?v=20260413" alt={SITE_CONFIG.name} className="h-10 w-10 object-contain" />
            </span>
            <span className="editable-display text-[1.5rem] font-medium tracking-[-0.02em]">{SITE_CONFIG.name}</span>
          </Link>
          <p className="mt-6 max-w-md text-[15px] leading-[1.6] text-white/70">{globalContent.footer.description}</p>
          
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="text-[11px] font-medium uppercase tracking-[0.24em] text-white/50">{col.title}</h3>
            <div className="mt-5 grid gap-3">
              {col.links.map((link) => (
                <Link
                  key={`${col.title}-${link.href}`}
                  href={link.href}
                  className="group inline-flex items-center gap-1.5 text-[15px] font-medium text-white/80 transition duration-300 hover:text-[var(--slot4-accent)]"
                >
                  {link.label}
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
                </Link>
              ))}
              {col.title === 'Sell' && session ? (
                <button
                  type="button"
                  onClick={logout}
                  className="text-left text-[15px] font-medium text-white/80 transition hover:text-[var(--slot4-accent)]"
                >
                  Sign out
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-[var(--editable-container)] flex-col items-start gap-3 px-4 py-6 text-xs font-medium text-white/55 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-12">
          <span>© {year} {SITE_CONFIG.name}. {globalContent.footer.bottomNote}</span>
          <span className="tracking-[0.12em] uppercase">{globalContent.footer.tagline}</span>
        </div>
      </div>
    </footer>
  )
}
