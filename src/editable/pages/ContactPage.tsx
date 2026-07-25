'use client'

import { Handshake, HelpCircle, MapPin, Phone, ShieldCheck, Sparkles, Store } from 'lucide-react'
import { pagesContent } from '@/editable/content/pages.content'
import { EditableContactLeadForm } from '@/editable/components/EditableContactLeadForm'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableReveal } from '@/editable/shell/EditableReveal'

/*
  Contact page — reference-styled around the existing lead form.
  Note: EditableContactLeadForm markup is intentionally NOT modified.
*/

const container = 'mx-auto w-full max-w-[var(--editable-container)] px-4 sm:px-6 lg:px-12'

const LANES = [
  {
    icon: Store,
    title: 'Seller questions',
    body: 'Post-a-listing help, seller account issues, price/photo guidance.',
  },
  {
    icon: HelpCircle,
    title: 'Buyer support',
    body: 'Report a listing, ask about a seller, or flag a broken contact link.',
  },
  {
    icon: Handshake,
    title: 'Partnerships & press',
    body: 'Coverage, integrations, sponsorships and everything else that is not day-to-day.',
  },
]

export default function ContactPage() {
  const c = pagesContent.contact
  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        {/* Hero band */}
        <section className="relative overflow-hidden border-b border-[var(--editable-border)] bg-[var(--slot4-warm)]">
          <div className="pointer-events-none absolute inset-x-0 -top-40 h-96 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(204,78,0,0.10),transparent_70%)]" />
          <div className={`${container} relative py-16 sm:py-20 lg:py-24`}>
            <EditableReveal index={0} className="max-w-3xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--slot4-accent)]">
                <Sparkles className="h-3.5 w-3.5" /> {c.eyebrow}
              </p>
              <h1 className="editable-display mt-6 text-[2.5rem] font-medium leading-[1.05] tracking-[-0.035em] sm:text-[3.5rem] lg:text-[4rem]">
                {c.title}
              </h1>
              <p className="mt-6 max-w-2xl text-[17px] leading-[1.6] text-[var(--slot4-muted-text)] sm:text-[19px]">
                {c.description}
              </p>
            </EditableReveal>
          </div>
        </section>

        {/* Lanes + form */}
        <section className={`${container} py-20 sm:py-24 lg:py-28`}>
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start lg:gap-14">
            <EditableReveal index={0}>
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-accent)]">Where to send it</p>
              <h2 className="editable-display mt-3 text-[1.75rem] font-medium leading-[1.15] tracking-[-0.025em] sm:text-[2.25rem]">
                Pick the lane that fits, then send.
              </h2>

              <div className="mt-8 space-y-4">
                {LANES.map((lane) => (
                  <div
                    key={lane.title}
                    className="rounded-[var(--editable-radius-lg)] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-6"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]">
                      <lane.icon className="h-4 w-4" />
                    </span>
                    <h3 className="editable-display mt-4 text-[1.15rem] font-medium tracking-[-0.02em]">{lane.title}</h3>
                    <p className="mt-2 text-sm leading-[1.6] text-[var(--slot4-muted-text)]">{lane.body}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid gap-3 rounded-[var(--editable-radius-lg)] bg-[var(--slot4-warm)] p-6">
                <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-accent)]">
                  Reach us directly
                </p>
               
                <p className="inline-flex items-center gap-2 text-sm text-[var(--slot4-page-text)]">
                  <Phone className="h-4 w-4 text-[var(--slot4-accent)]" /> Monday–Friday, business hours
                </p>
                <p className="inline-flex items-center gap-2 text-sm text-[var(--slot4-page-text)]">
                  <MapPin className="h-4 w-4 text-[var(--slot4-accent)]" /> Remote, independent, small
                </p>
                <p className="inline-flex items-center gap-2 text-xs text-[var(--slot4-muted-text)]">
                  <ShieldCheck className="h-3.5 w-3.5 text-[var(--slot4-accent)]" /> A real person reads every message.
                </p>
              </div>
            </EditableReveal>

            <EditableReveal index={1}>
              <div className="rounded-[var(--editable-radius-xl)] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-7 shadow-[0_18px_44px_rgba(16,16,16,0.06)] sm:p-9">
                <h2 className="editable-display text-[1.5rem] font-medium tracking-[-0.02em]">{c.formTitle}</h2>
                <p className="mt-2 text-sm text-[var(--slot4-muted-text)]">Tell us what you are trying to do — we will route it through the right lane.</p>
                <EditableContactLeadForm />
              </div>
            </EditableReveal>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
