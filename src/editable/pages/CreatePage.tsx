'use client'

import { FormEvent, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, CheckCircle2, Lock, PackageOpen, Send, Sparkles, Store } from 'lucide-react'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'
import { isUiHiddenTask } from '@/editable/content/global.content'

type DraftPost = {
  id: string
  task: TaskKey
  title: string
  category: string
  summary: string
  url: string
  image: string
  body: string
  createdAt: string
}

const STORE_KEY = 'slot4:created-posts'
const container = 'mx-auto w-full max-w-[var(--editable-container)] px-4 sm:px-6 lg:px-12'

const fieldClass =
  'rounded-[var(--editable-radius)] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-4 py-3 text-sm text-[var(--slot4-page-text)] outline-none transition placeholder:text-[var(--slot4-muted-text)] focus:border-[var(--slot4-accent)]'

const saveDraft = (draft: DraftPost) => {
  try {
    const existing = JSON.parse(window.localStorage.getItem(STORE_KEY) || '[]')
    const list = Array.isArray(existing) ? existing : []
    window.localStorage.setItem(STORE_KEY, JSON.stringify([draft, ...list].slice(0, 50)))
  } catch {
    window.localStorage.setItem(STORE_KEY, JSON.stringify([draft]))
  }
}

export default function CreatePage() {
  const { session } = useEditableLocalAuthSession()
  // Hidden tasks (profile) must never appear in the picker.
  const enabledTasks = useMemo(
    () => SITE_CONFIG.tasks.filter((t) => t.enabled && !isUiHiddenTask(t.key)),
    [],
  )
  const [task, setTask] = useState<TaskKey>((enabledTasks[0]?.key || 'classified') as TaskKey)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [summary, setSummary] = useState('')
  const [price, setPrice] = useState('')
  const [location, setLocation] = useState('')
  const [image, setImage] = useState('')
  const [body, setBody] = useState('')
  const [created, setCreated] = useState<DraftPost | null>(null)

  const activeTask = enabledTasks.find((t) => t.key === task) || enabledTasks[0]

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const draft: DraftPost = {
      id: `draft-${Date.now()}`,
      task,
      title: title.trim(),
      category: category.trim() || 'uncategorized',
      summary: summary.trim(),
      url: '',
      image: image.trim(),
      body: [price && `Price: ${price.trim()}`, location && `Location: ${location.trim()}`, body.trim()].filter(Boolean).join('\n\n'),
      createdAt: new Date().toISOString(),
    }
    saveDraft(draft)
    setCreated(draft)
    setTitle(''); setCategory(''); setSummary(''); setPrice(''); setLocation(''); setImage(''); setBody('')
  }

  /* -------- Locked (no session) -------- */
  if (!session) {
    return (
      <EditableSiteShell>
        <main className="min-h-screen bg-[var(--slot4-warm)] text-[var(--slot4-page-text)]">
          <section className={`${container} grid min-h-[calc(100vh-12rem)] items-center gap-12 py-16 md:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:py-24`}>
            <EditableReveal index={0} className="flex h-full min-h-72 items-center justify-center rounded-[var(--editable-radius-xl)] bg-[var(--slot4-page-text)] p-12 text-white">
              <div className="text-center">
                <Lock className="mx-auto h-16 w-16 opacity-80" />
                <p className="editable-display mt-6 text-[1.75rem] font-medium tracking-[-0.02em]">Sellers only</p>
                <p className="mt-3 max-w-xs text-sm text-white/70">Your seller account keeps buyer messages in one place.</p>
              </div>
            </EditableReveal>
            <EditableReveal index={1}>
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-accent)]">{pagesContent.create.locked.badge}</p>
              <h1 className="editable-display mt-5 text-[2.5rem] font-medium leading-[1.05] tracking-[-0.035em] sm:text-[3.5rem] lg:text-[4.5rem]">
                {pagesContent.create.locked.title}
              </h1>
              <p className="mt-6 max-w-xl text-[17px] leading-[1.6] text-[var(--slot4-muted-text)]">{pagesContent.create.locked.description}</p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/login" className="inline-flex items-center gap-2 rounded-full bg-[var(--slot4-accent-fill)] px-6 py-3 text-sm font-medium text-[var(--slot4-on-accent)] transition hover:bg-[var(--slot4-accent-hover)]">
                  Sign in <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/signup" className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border-strong)] px-6 py-3 text-sm font-medium text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-page-text)]">
                  Create a seller account
                </Link>
              </div>
            </EditableReveal>
          </section>
        </main>
      </EditableSiteShell>
    )
  }

  /* -------- Signed-in publishing surface -------- */
  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[var(--slot4-warm)] text-[var(--slot4-page-text)]">
        <section className={`${container} py-16 lg:py-24`}>
          <EditableReveal index={0} className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--slot4-accent)]">
              <Sparkles className="h-3.5 w-3.5" /> {pagesContent.create.hero.badge}
            </p>
            <h1 className="editable-display mt-6 text-[2.5rem] font-medium leading-[1.05] tracking-[-0.035em] sm:text-[3.5rem] lg:text-[4.5rem]">
              {pagesContent.create.hero.title}
            </h1>
            <p className="mt-6 max-w-2xl text-[17px] leading-[1.6] text-[var(--slot4-muted-text)]">{pagesContent.create.hero.description}</p>
          </EditableReveal>

          <div className="mt-12 grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <EditableReveal index={0}>
              <div className="rounded-[var(--editable-radius-xl)] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-6 sm:p-8">
                <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-accent)]">Listing type</p>
                <div className="mt-5 grid gap-3">
                  {enabledTasks.map((item) => {
                    const active = item.key === task
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setTask(item.key)}
                        className={`group flex items-start gap-4 rounded-[var(--editable-radius)] border p-4 text-left transition ${
                          active
                            ? 'border-[var(--slot4-page-text)] bg-[var(--slot4-page-text)] text-white'
                            : 'border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] hover:border-[var(--slot4-page-text)]'
                        }`}
                      >
                        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${active ? 'bg-white/15 text-white' : 'bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]'}`}>
                          {item.key === 'classified' ? <Store className="h-4 w-4" /> : <PackageOpen className="h-4 w-4" />}
                        </span>
                        <span className="min-w-0">
                          <span className={`block text-sm font-medium ${active ? 'text-white' : 'text-[var(--slot4-page-text)]'}`}>{item.label}</span>
                          <span className={`mt-1 block text-xs ${active ? 'text-white/70' : 'text-[var(--slot4-muted-text)]'}`}>{item.description}</span>
                        </span>
                      </button>
                    )
                  })}
                </div>

                <div className="mt-6 rounded-[var(--editable-radius)] bg-[var(--slot4-warm)] p-4 text-xs text-[var(--slot4-muted-text)]">
                  You are posting as{' '}
                  <span className="font-medium text-[var(--slot4-page-text)]">{session.name}</span>.
                  Listings appear on the front shelf as soon as you submit.
                </div>
              </div>
            </EditableReveal>

            <EditableReveal index={1}>
              <form onSubmit={submit} className="rounded-[var(--editable-radius-xl)] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-6 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--slot4-accent)]">
                      New {activeTask?.label?.toLowerCase() || 'listing'}
                    </p>
                    <h2 className="editable-display mt-1 text-[1.75rem] font-medium tracking-[-0.02em]">{pagesContent.create.formTitle}</h2>
                  </div>
                </div>

                <div className="mt-6 grid gap-4">
                  <label className="grid gap-1.5">
                    <span className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--slot4-muted-text)]">Title</span>
                    <input className={fieldClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Oak roll-top desk, restored" required />
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-1.5">
                      <span className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--slot4-muted-text)]">Category</span>
                      <input className={fieldClass} value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Furniture · Vintage · Tools…" />
                    </label>
                    <label className="grid gap-1.5">
                      <span className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--slot4-muted-text)]">Asking price</span>
                      <input className={fieldClass} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. $420" />
                    </label>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-1.5">
                      <span className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--slot4-muted-text)]">Location</span>
                      <input className={fieldClass} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City or region" />
                    </label>
                    <label className="grid gap-1.5">
                      <span className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--slot4-muted-text)]">Featured image URL</span>
                      <input className={fieldClass} value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://…" />
                    </label>
                  </div>
                  <label className="grid gap-1.5">
                    <span className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--slot4-muted-text)]">Short summary</span>
                    <textarea className={`${fieldClass} min-h-24`} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="One line buyers see on the card" required />
                  </label>
                  <label className="grid gap-1.5">
                    <span className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--slot4-muted-text)]">Full description</span>
                    <textarea className={`${fieldClass} min-h-52`} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Condition, dimensions, pickup/delivery, story behind the item…" required />
                  </label>
                </div>

                {created ? (
                  <div className="mt-6 flex items-start gap-3 rounded-[var(--editable-radius)] border border-[var(--slot4-accent)]/30 bg-[var(--slot4-accent-soft)] p-4">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-[var(--slot4-accent)]" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--slot4-page-text)]">{pagesContent.create.successTitle}</p>
                      <p className="mt-1 text-sm text-[var(--slot4-muted-text)]">
                        <span className="font-medium">{created.title}</span> — saved locally as a draft.
                      </p>
                    </div>
                  </div>
                ) : null}

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-[var(--slot4-muted-text)]">Free to post. Free to edit. Free to take down.</p>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-full bg-[var(--slot4-accent-fill)] px-6 py-3 text-sm font-medium text-[var(--slot4-on-accent)] transition hover:bg-[var(--slot4-accent-hover)]"
                  >
                    <Send className="h-4 w-4" /> {pagesContent.create.submitLabel}
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </EditableReveal>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
