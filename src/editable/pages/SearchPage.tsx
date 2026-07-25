import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Filter, MapPin, Search, Sparkles, Tag } from 'lucide-react'
import { buildPageMetadata } from '@/lib/seo'
import { fetchSiteFeed } from '@/lib/site-connector'
import { getPostTaskKey } from '@/lib/task-data'
import { getMockPostsForTask } from '@/lib/mock-posts'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { toPlainText } from '@/editable/cards/PostCards'
import { pagesContent } from '@/editable/content/pages.content'
import { isUiHiddenTask } from '@/editable/content/global.content'

export const revalidate = 3

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/search',
    title: pagesContent.search.metadata.title,
    description: pagesContent.search.metadata.description,
  })
}

const container = 'mx-auto w-full max-w-[var(--editable-container)] px-4 sm:px-6 lg:px-12'

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ')
const compactText = (value: unknown) => typeof value === 'string' ? stripHtml(value).replace(/\s+/g, ' ').trim().toLowerCase() : ''
const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
const compactRaw = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const getImage = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.find((m) => typeof m?.url === 'string')?.url : ''
  const images = Array.isArray(content.images) ? content.images.find((v) => typeof v === 'string') as string | undefined : ''
  return media || compactRaw(content.featuredImage) || compactRaw(content.image) || compactRaw(content.thumbnail) || images || ''
}
const summaryOf = (post: SitePost) => {
  const content = getContent(post)
  return toPlainText(
    (typeof post.summary === 'string' && post.summary) ||
    compactRaw(content.description) ||
    compactRaw(content.excerpt) ||
    compactRaw(content.body) ||
    '',
  )
}
const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const k of keys) {
    const v = compactRaw(content[k])
    if (v) return v
  }
  return ''
}

const matches = (post: SitePost, query: string, category: string, task: string) => {
  const content = getContent(post)
  const typeText = compactText(content.type)
  if (typeText === 'comment') return false
  const derivedTask = getPostTaskKey(post) || typeText
  // Hide every result that resolves to a UI-hidden task (profile).
  if (derivedTask && isUiHiddenTask(String(derivedTask))) return false
  if (task && derivedTask !== task) return false
  const categoryText = compactText(content.category)
  const tagsText = compactText(Array.isArray(post.tags) ? post.tags.join(' ') : '')
  if (category && !(categoryText || tagsText).includes(category)) return false
  if (!query) return true
  return [post.title, post.summary, content.description, content.body, content.excerpt, content.category, Array.isArray(post.tags) ? post.tags.join(' ') : '']
    .some((v) => compactText(v).includes(query))
}

function SearchResultCard({ post, index }: { post: SitePost; index: number }) {
  const task = getPostTaskKey(post) as TaskKey | null
  const taskRoute = SITE_CONFIG.tasks.find((t) => t.key === task)?.route
  const href = `${taskRoute || `/${task || 'classified'}`}/${post.slug}`
  const image = getImage(post)
  const summary = summaryOf(post)
  const taskLabel = task === 'classified' ? 'Listing' : SITE_CONFIG.tasks.find((t) => t.key === task)?.label || 'Result'
  const price = getField(post, ['price', 'amount', 'budget'])
  const location = getField(post, ['location', 'address', 'city'])
  return (
    <EditableReveal index={index}>
      <Link
        href={href}
        className="group flex h-full flex-col overflow-hidden rounded-[var(--editable-radius-lg)] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(16,16,16,0.10)]"
      >
        {image ? (
          <div className="relative aspect-[4/3] overflow-hidden bg-[var(--slot4-media-bg)]">
            <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
            {price ? (
              <span className="absolute right-3 top-3 rounded-full bg-[var(--slot4-accent)] px-3 py-1 text-[13px] font-medium text-[var(--slot4-on-accent)]">{price}</span>
            ) : null}
            <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--slot4-page-text)]">
              {taskLabel}
            </span>
          </div>
        ) : null}
        <div className="flex flex-1 flex-col p-5">
          {!image ? (
            <span className="w-fit rounded-full bg-[var(--slot4-accent-soft)] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--slot4-accent)]">
              {taskLabel}
            </span>
          ) : null}
          <h2 className="editable-display mt-3 line-clamp-3 text-[1.25rem] font-medium leading-[1.2] tracking-[-0.015em] text-[var(--slot4-page-text)]">
            {post.title}
          </h2>
          {summary ? <p className="mt-2 line-clamp-3 flex-1 text-sm leading-[1.6] text-[var(--slot4-muted-text)]">{summary}</p> : null}
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--editable-border)] pt-3 text-xs font-medium text-[var(--slot4-muted-text)]">
            <span className="inline-flex items-center gap-1.5">
              {location ? (<><MapPin className="h-3.5 w-3.5" /> {location}</>) : (<><Tag className="h-3.5 w-3.5" /> The Market</>)}
            </span>
            <ArrowUpRight className="h-4 w-4 text-[var(--slot4-accent)] transition group-hover:translate-x-0.5" />
          </div>
        </div>
      </Link>
    </EditableReveal>
  )
}

export default async function SearchPage({ searchParams }: { searchParams?: Promise<{ q?: string; category?: string; task?: string; master?: string }> }) {
  const resolved = (await searchParams) || {}
  const query = (resolved.q || '').trim()
  const normalized = query.toLowerCase()
  const category = (resolved.category || '').trim().toLowerCase()
  const task = (resolved.task || '').trim().toLowerCase()
  const useMaster = resolved.master !== '0'
  const feed = await fetchSiteFeed(useMaster ? 1000 : 300, useMaster ? { fresh: true, category: category || undefined, task: task || undefined } : undefined)
  // Never fall back to mock posts for hidden tasks — they must not surface.
  const fallback = SITE_CONFIG.tasks
    .filter((t) => t.enabled && !isUiHiddenTask(t.key))
    .flatMap((t) => getMockPostsForTask(t.key))
  const posts = feed?.posts?.length ? feed.posts : useMaster ? [] : fallback
  const results = posts.filter((p) => matches(p, normalized, category, task)).slice(0, normalized ? 80 : 36)
  // Task filter must only show public tasks — hidden tasks (profile) are removed.
  const publicTasks = SITE_CONFIG.tasks.filter((t) => t.enabled && !isUiHiddenTask(t.key))

  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        {/* Hero + search band */}
        <section className="relative overflow-hidden border-b border-[var(--editable-border)] bg-[var(--slot4-warm)]">
          <div className="pointer-events-none absolute inset-x-0 -top-40 h-96 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(204,78,0,0.10),transparent_70%)]" />
          <div className={`${container} relative py-16 sm:py-20 lg:py-24`}>
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <EditableReveal index={0}>
                <p className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--slot4-accent)]">
                  <Sparkles className="h-3.5 w-3.5" /> {pagesContent.search.hero.badge}
                </p>
                <h1 className="editable-display mt-6 text-[2.5rem] font-medium leading-[1.05] tracking-[-0.035em] sm:text-[3.5rem] lg:text-[4rem]">
                  {pagesContent.search.hero.title}
                </h1>
                <p className="mt-6 max-w-xl text-[17px] leading-[1.6] text-[var(--slot4-muted-text)]">{pagesContent.search.hero.description}</p>
              </EditableReveal>

              <EditableReveal index={1}>
                <form action="/search" className="rounded-[var(--editable-radius-xl)] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-4 shadow-[0_18px_44px_rgba(16,16,16,0.06)] sm:p-5">
                  <input type="hidden" name="master" value="1" />
                  <label className="flex items-center gap-3 rounded-full border border-[var(--editable-border-strong)] bg-[var(--slot4-surface-bg)] px-4 py-3">
                    <Search className="h-4 w-4 shrink-0 text-[var(--slot4-muted-text)]" />
                    <input
                      name="q"
                      defaultValue={query}
                      placeholder={pagesContent.search.hero.placeholder}
                      className="min-w-0 flex-1 bg-transparent text-sm text-[var(--slot4-page-text)] outline-none placeholder:text-[var(--slot4-muted-text)]"
                    />
                  </label>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <label className="flex items-center gap-2 rounded-full border border-[var(--editable-border)] px-4 py-2.5">
                      <Filter className="h-4 w-4 shrink-0 text-[var(--slot4-muted-text)]" />
                      <input
                        name="category"
                        defaultValue={category}
                        placeholder="Category"
                        className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--slot4-muted-text)]"
                      />
                    </label>
                    <select
                      name="task"
                      defaultValue={task}
                      className="rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-4 py-2.5 text-sm outline-none"
                    >
                      <option value="">All types</option>
                      {publicTasks.map((t) => <option key={t.key} value={t.key}>{t.key === 'classified' ? 'Listings' : t.label}</option>)}
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[var(--slot4-accent-fill)] px-5 text-sm font-medium text-[var(--slot4-on-accent)] transition hover:bg-[var(--slot4-accent-hover)]"
                  >
                    Search The Market <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              </EditableReveal>
            </div>
          </div>
        </section>

        {/* Results */}
        <section className={`${container} py-16 sm:py-20 lg:py-24`}>
          <EditableReveal index={0} className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-accent)]">{results.length} results</p>
              <h2 className="editable-display mt-3 text-[1.75rem] font-medium leading-[1.15] tracking-[-0.025em] sm:text-[2.25rem]">
                {query ? `Results for “${query}”` : pagesContent.search.resultsTitle}
              </h2>
            </div>
            <Link href="/classified" className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--slot4-page-text)] hover:text-[var(--slot4-accent)]">
              Browse everything <ArrowRight className="h-4 w-4" />
            </Link>
          </EditableReveal>

          {results.length ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {results.map((post, index) => <SearchResultCard key={post.id || post.slug} post={post} index={index} />)}
            </div>
          ) : (
            <EditableReveal className="mt-8 rounded-[var(--editable-radius-lg)] border border-dashed border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-10 text-center">
              <Search className="mx-auto h-7 w-7 text-[var(--slot4-muted-text)]" />
              <p className="editable-display mt-5 text-[1.5rem] font-medium tracking-[-0.02em]">No matching listings.</p>
              <p className="mt-2 text-sm text-[var(--slot4-muted-text)]">Try a different keyword or category. Or browse the full shelf.</p>
              <Link
                href="/classified"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--slot4-accent-fill)] px-5 py-2.5 text-sm font-medium text-[var(--slot4-on-accent)] transition hover:bg-[var(--slot4-accent-hover)]"
              >
                Browse The Market <ArrowUpRight className="h-4 w-4" />
              </Link>
            </EditableReveal>
          )}
        </section>
      </main>
    </EditableSiteShell>
  )
}
