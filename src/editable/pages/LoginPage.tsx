import type { Metadata } from 'next'
import Link from 'next/link'
import { BadgeCheck, ShieldCheck, Sparkles, Store } from 'lucide-react'
import { buildPageMetadata } from '@/lib/seo'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableLocalLoginForm } from '@/editable/components/EditableLocalAuthForms'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { pagesContent } from '@/editable/content/pages.content'

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({ path: '/login', title: 'Sign in', description: pagesContent.auth.login.metadataDescription })
}

const container = 'mx-auto w-full max-w-[var(--editable-container)] px-4 sm:px-6 lg:px-12'

export default function LoginPage() {
  const c = pagesContent.auth.login
  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[var(--slot4-warm)] text-[var(--slot4-page-text)]">
        <section className={`${container} grid min-h-[calc(100vh-12rem)] items-center gap-12 py-16 lg:grid-cols-[1fr_0.95fr] lg:gap-16 lg:py-24`}>
          <EditableReveal index={0}>
            <p className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--slot4-accent)]">
              <Sparkles className="h-3.5 w-3.5" /> {c.badge}
            </p>
            <h1 className="editable-display mt-6 max-w-xl text-[2.5rem] font-medium leading-[1.05] tracking-[-0.035em] sm:text-[3.5rem] lg:text-[4rem]">
              {c.title}
            </h1>
            <p className="mt-6 max-w-lg text-[17px] leading-[1.6] text-[var(--slot4-muted-text)]">{c.description}</p>

            <ul className="mt-8 grid max-w-md gap-3">
              {[
                { icon: Store, label: 'Manage your listings and answers in one place.' },
                { icon: BadgeCheck, label: 'Update prices, photos and stock in seconds.' },
                { icon: ShieldCheck, label: 'Buyer messages come straight to you.' },
              ].map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-start gap-3 text-sm text-[var(--slot4-page-text)]">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </EditableReveal>

          <EditableReveal index={1}>
            <div className="rounded-[var(--editable-radius-xl)] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-7 shadow-[0_18px_44px_rgba(16,16,16,0.08)] sm:p-9">
              <h2 className="editable-display text-[1.5rem] font-medium tracking-[-0.02em]">{c.formTitle}</h2>
              <p className="mt-2 text-sm text-[var(--slot4-muted-text)]">Use the details on your seller account.</p>
              <EditableLocalLoginForm />
              <p className="mt-6 text-sm text-[var(--slot4-muted-text)]">
                New to The Market?{' '}
                <Link href="/signup" className="font-medium text-[var(--slot4-accent)] underline-offset-4 hover:underline">
                  {c.createCta}
                </Link>
              </p>
            </div>
          </EditableReveal>
        </section>
      </main>
    </EditableSiteShell>
  )
}
