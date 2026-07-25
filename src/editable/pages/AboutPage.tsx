import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Check, Heart, ShieldCheck, Sparkles, Store } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableReveal } from '@/editable/shell/EditableReveal'

const container = 'mx-auto w-full max-w-[var(--editable-container)] px-4 sm:px-6 lg:px-12'

const VALUE_ICONS = [Store, ShieldCheck, Heart]

export default function AboutPage() {
  const c = pagesContent.about
  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        {/* Hero band */}
        <section className="relative overflow-hidden border-b border-[var(--editable-border)] bg-[var(--slot4-warm)]">
          <div className="pointer-events-none absolute inset-x-0 -top-40 h-96 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(204,78,0,0.10),transparent_70%)]" />
          <div className={`${container} relative py-20 sm:py-24 lg:py-28`}>
            <EditableReveal index={0} className="max-w-4xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--slot4-accent)]">
                <Sparkles className="h-3.5 w-3.5" /> {c.badge}
              </p>
              <h1 className="editable-display mt-6 text-[2.5rem] font-medium leading-[1.05] tracking-[-0.035em] sm:text-[3.5rem] lg:text-[4.5rem]">
                {c.title}
              </h1>
              <p className="mt-6 max-w-2xl text-[17px] leading-[1.6] text-[var(--slot4-muted-text)] sm:text-[19px]">
                {c.description}
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/classified"
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--slot4-accent-fill)] px-6 py-3 text-sm font-medium text-[var(--slot4-on-accent)] transition hover:bg-[var(--slot4-accent-hover)]"
                >
                  Browse The Market <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border-strong)] px-6 py-3 text-sm font-medium text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-page-text)]"
                >
                  Say hello
                </Link>
              </div>
            </EditableReveal>
          </div>
        </section>

        {/* Story columns */}
        <section className={`${container} py-20 sm:py-24 lg:py-28`}>
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <EditableReveal index={0}>
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-accent)]">Our story</p>
              <h2 className="editable-display mt-4 text-[2rem] font-medium leading-[1.1] tracking-[-0.03em] sm:text-[2.5rem]">
                Built the way we wished a marketplace worked.
              </h2>
              <div className="mt-8 space-y-6 text-[17px] leading-[1.7] text-[var(--slot4-muted-text)]">
                {c.paragraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </EditableReveal>

            <EditableReveal index={1} className="space-y-4">
              {c.values.map((value, i) => {
                const Icon = VALUE_ICONS[i % VALUE_ICONS.length]
                return (
                  <div
                    key={value.title}
                    className="rounded-[var(--editable-radius-lg)] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-6"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <h3 className="editable-display mt-4 text-[1.35rem] font-medium tracking-[-0.02em]">{value.title}</h3>
                    <p className="mt-3 text-sm leading-[1.7] text-[var(--slot4-muted-text)]">{value.description}</p>
                  </div>
                )
              })}
            </EditableReveal>
          </div>
        </section>

        {/* Principles strip */}
        <section className="border-t border-[var(--editable-border)] bg-[var(--slot4-warm)]">
          <div className={`${container} py-20 sm:py-24`}>
            <EditableReveal index={0} className="max-w-2xl">
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-accent)]">Principles</p>
              <h2 className="editable-display mt-4 text-[2rem] font-medium leading-[1.1] tracking-[-0.03em] sm:text-[2.5rem]">
                A short list, kept short on purpose.
              </h2>
            </EditableReveal>

            <div className="mt-12 grid gap-4 md:grid-cols-2">
              {[
                'Listings sorted by freshness — never by who paid to be seen.',
                'Every seller is a real, independent person you can contact directly.',
                'No promoted results, no algorithmic feed, no dark patterns.',
                'Prices, condition and location are always shown before the click.',
                'Search does what search should — find things, quickly.',
                'One product filter: does this help someone find or list a real item?',
              ].map((line, i) => (
                <EditableReveal key={line} index={i}>
                  <div className="flex items-start gap-4 rounded-[var(--editable-radius-lg)] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-6">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <p className="text-[15px] leading-[1.6] text-[var(--slot4-page-text)]">{line}</p>
                  </div>
                </EditableReveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[var(--slot4-page-text)]">
          <div className={`${container} flex flex-col items-start gap-6 py-16 text-white sm:flex-row sm:items-center sm:justify-between sm:py-20`}>
            <EditableReveal index={0} className="max-w-xl">
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-white/70">Ready to browse?</p>
              <h2 className="editable-display mt-3 text-[1.75rem] font-medium leading-[1.15] tracking-[-0.025em] sm:text-[2.25rem]">
                Start on the front shelf of {SITE_CONFIG.name}.
              </h2>
            </EditableReveal>
            <EditableReveal index={1}>
              <Link
                href="/classified"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-[var(--slot4-page-text)] transition hover:bg-[var(--slot4-accent-soft)]"
              >
                Browse The Market <ArrowUpRight className="h-4 w-4" />
              </Link>
            </EditableReveal>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
