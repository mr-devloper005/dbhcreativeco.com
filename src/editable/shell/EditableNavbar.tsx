'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CornerDownLeft, LogIn, LogOut, Menu, Search, X } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

/*
  Reference-style four-column top nav. On the home hero (burnt-orange
  background) it renders white-on-orange with no backdrop; on every
  other page it renders dark-on-white with a hairline border.
*/

export function EditableNavbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const { session, logout } = useEditableLocalAuthSession()
  const links = globalContent.nav.primaryLinks

  const onHero = pathname === '/'

  useEffect(() => {
    if (!onHero) return
    const onScroll = () => setScrolled(window.scrollY > 80)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [onHero])

  const overlay = onHero && !scrolled
  const shellCls = overlay
    ? 'text-white'
    : 'bg-[var(--editable-nav-bg)] text-[var(--slot4-page-text)] border-b border-[var(--editable-border)]'
  const borderCls = overlay ? 'border-white/25' : 'border-[var(--editable-border-strong)]'
  const linkCls = overlay
    ? 'text-white/90 hover:text-white'
    : 'text-[var(--slot4-page-text)] hover:text-[var(--slot4-accent)]'
  const mutedCls = overlay ? 'text-white/70' : 'text-[var(--slot4-muted-text)]'

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  // On home the nav sits over the hero (absolute so hero starts at y=0);
  // on every other page it sticks to the top with a solid backdrop.
  const positionCls = onHero && !scrolled ? 'absolute top-0 inset-x-0' : 'sticky top-0'

  return (
    <header className={`${positionCls} z-50 ${overlay ? 'bg-transparent' : ''} ${shellCls} transition-colors duration-500`}>
      <nav
        className={`mx-auto grid w-full max-w-[var(--editable-container)] items-start gap-6 px-4 pb-6 pt-6 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] lg:gap-10 lg:px-12`}
      >
        {/* Column 1 — logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className={`editable-display text-[1.75rem] font-medium leading-none tracking-[-0.03em] ${overlay ? 'text-white' : 'text-[var(--slot4-page-text)]'}`}>
            {SITE_CONFIG.name}
          </span>
        </Link>

        {/* Column 2 — primary menu (About, Contact, Search) */}
        <div className="hidden flex-col gap-3 lg:flex">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`w-fit text-[15px] font-medium transition duration-300 ${linkCls} ${isActive(item.href) ? (overlay ? 'text-white' : 'text-[var(--slot4-accent)]') : ''}`}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/search" className={`w-fit text-[15px] font-medium transition duration-300 ${linkCls}`}>
            Search
          </Link>
        </div>

        {/* Column 3 — quick facts */}
        <div className={`hidden flex-col gap-3 text-[15px] font-medium lg:flex ${overlay ? 'text-white' : 'text-[var(--slot4-page-text)]'}`}>
          <span>{globalContent.marketplace.label}</span>
          <span className={mutedCls}>{globalContent.nav.tagline}</span>
          <Link href="/create" className={`w-fit text-[15px] font-medium transition duration-300 ${linkCls}`}>
            Post a listing
          </Link>
        </div>

        {/* Column 4 — CONTACT / auth */}
        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/contact"
            className={`hidden items-center gap-2 text-[12px] font-medium uppercase tracking-[0.22em] transition duration-300 sm:inline-flex ${overlay ? 'text-white hover:text-white/80' : 'text-[var(--slot4-page-text)] hover:text-[var(--slot4-accent)]'}`}
          >
            <CornerDownLeft className="h-4 w-4 rotate-180" /> Contact
          </Link>
          <Link
            href="/search"
            className={`flex h-10 w-10 items-center justify-center rounded-full border transition duration-300 lg:hidden ${borderCls} ${overlay ? 'text-white hover:bg-white/10' : 'text-[var(--slot4-page-text)] hover:border-[var(--slot4-page-text)]'}`}
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </Link>
          {session ? (
            <button
              type="button"
              onClick={logout}
              className={`hidden items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition duration-300 sm:inline-flex ${borderCls} ${overlay ? 'text-white hover:bg-white/10' : 'text-[var(--slot4-page-text)] hover:border-[var(--slot4-page-text)]'}`}
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          ) : (
            <Link
              href="/login"
              className={`hidden items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition duration-300 sm:inline-flex ${borderCls} ${overlay ? 'text-white hover:bg-white/10' : 'text-[var(--slot4-page-text)] hover:border-[var(--slot4-page-text)]'}`}
            >
              <LogIn className="h-4 w-4" /> Sign in
            </Link>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={`flex h-10 w-10 items-center justify-center rounded-full border transition duration-300 lg:hidden ${borderCls} ${overlay ? 'text-white' : 'text-[var(--slot4-page-text)]'}`}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {open ? (
        <div className={`border-t px-4 pb-6 pt-4 sm:px-6 lg:hidden ${overlay ? 'border-white/15 bg-[var(--slot4-accent)]' : 'border-[var(--editable-border)] bg-[var(--editable-nav-bg)]'}`}>
          <div className="grid gap-1">
            {[...links, { label: 'Search', href: '/search' }, { label: 'Post a listing', href: '/create' }].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-4 py-3 text-base font-medium transition ${overlay ? 'text-white hover:bg-white/10' : 'text-[var(--slot4-page-text)] hover:bg-[var(--slot4-panel-bg)]'}`}
              >
                {item.label}
              </Link>
            ))}
            <div className={`mt-3 grid gap-2 border-t pt-4 ${overlay ? 'border-white/15' : 'border-[var(--editable-border)]'}`}>
              {session ? (
                <button
                  type="button"
                  onClick={() => { logout(); setOpen(false) }}
                  className={`inline-flex items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-medium ${overlay ? 'border-white/30 text-white' : 'border-[var(--editable-border)] text-[var(--slot4-page-text)]'}`}
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className={`inline-flex items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-medium ${overlay ? 'border-white/30 text-white' : 'border-[var(--editable-border)] text-[var(--slot4-page-text)]'}`}
                >
                  <LogIn className="h-4 w-4" /> Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}
