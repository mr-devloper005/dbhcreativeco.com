import Link from 'next/link'
import {
  ArrowUpRight, BadgeCheck, BriefcaseBusiness, ChevronDown, Download,
  FileText, Globe, Mail, MapPin, Phone, Search, SlidersHorizontal,
  Store, Tag, UserRound,
} from 'lucide-react'
import { buildTaskMetadata } from '@/lib/seo'
import { CATEGORY_OPTIONS, normalizeCategory } from '@/lib/categories'
import { fetchPaginatedTaskPosts, buildPostUrl } from '@/lib/task-data'
import { getTaskConfig, type TaskKey } from '@/lib/site-config'
import type { SiteFeedPagination, SitePost } from '@/lib/site-connector'
import { taskPageMetadata } from '@/config/site.content'
import { taskPageVoices } from '@/editable/content/task-pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'

export const revalidate = 3

export const taskMetadata = (task: TaskKey, path: string) =>
  buildTaskMetadata(task, {
    path,
    title: taskPageMetadata[task]?.title,
    description: taskPageMetadata[task]?.description,
  })

const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
const asText = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((m) => m?.url).filter((u): u is string => typeof u === 'string' && isUrl(u)) : []
  const images = Array.isArray(content.images) ? content.images.filter((u): u is string => typeof u === 'string' && isUrl(u)) : []
  const image = asText(content.image) || asText(content.featuredImage) || asText(content.thumbnail)
  const logo = asText(content.logo)
  return [...media, ...images, ...(isUrl(image) ? [image] : []), ...(isUrl(logo) ? [logo] : [])].filter(Boolean).slice(0, 8)
}

const placeholder = '/placeholder.svg?height=900&width=1200'
const getImage = (post: SitePost) => getImages(post)[0] || placeholder
const getCategory = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback

const stripHtml = (value: string) => value
  .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/&lt;/gi, '<')
  .replace(/&gt;/gi, '>')
  .replace(/&quot;/gi, '"')
  .replace(/&#0?39;|&apos;/gi, "'")
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()

const getSummary = (post: SitePost) => stripHtml(post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || asText(getContent(post).body))
const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}
const cleanDomain = (value: string) => value.replace(/^https?:\/\//, '').replace(/\/$/, '')

function pageHref(basePath: string, category: string, page: number) {
  const params = new URLSearchParams()
  if (category && category !== 'all') params.set('category', category)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

const taskGrid: Record<TaskKey, string> = {
  article: 'grid gap-8 md:grid-cols-2 xl:grid-cols-3',
  listing: 'grid gap-6 xl:grid-cols-2',
  classified: 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  image: 'columns-1 gap-6 [column-fill:_balance] sm:columns-2 xl:columns-3',
  sbm: 'grid gap-6 md:grid-cols-2 xl:grid-cols-3',
  pdf: 'grid gap-6 md:grid-cols-2 xl:grid-cols-3',
  profile: 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
}

const cardBase =
  'group block h-full rounded-[var(--editable-radius-lg)] border border-[var(--tk-line)] bg-[var(--tk-surface)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(16,16,16,0.10)]'

export async function EditableTaskArchiveRoute({
  task,
  searchParams,
  basePath,
}: {
  task: TaskKey
  searchParams?: Promise<{ category?: string; page?: string }>
  basePath?: string
}) {
  const resolved = (await searchParams) || {}
  const page = Math.max(1, Math.floor(Number(resolved.page) || 1))
  const category = resolved.category ? normalizeCategory(resolved.category) : 'all'
  const taskConfig = getTaskConfig(task)
  const { posts, pagination } = await fetchPaginatedTaskPosts(task, { page, limit: 24, category })
  return <TaskArchiveView task={task} posts={posts} pagination={pagination} category={category} basePath={basePath || taskConfig?.route || `/${task}`} />
}

export function TaskArchiveView({ task, posts, pagination, category, basePath }: { task: TaskKey; posts: SitePost[]; pagination: SiteFeedPagination; category: string; basePath: string }) {
  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        {task === 'classified' ? (
          <ClassifiedArchiveView posts={posts} pagination={pagination} category={category} basePath={basePath} />
        ) : task === 'profile' ? (
          <ProfileArchiveView posts={posts} pagination={pagination} category={category} basePath={basePath} />
        ) : (
          <GenericArchiveView task={task} posts={posts} pagination={pagination} category={category} basePath={basePath} />
        )}
      </main>
    </EditableSiteShell>
  )
}

/* ============================================================
   CLASSIFIED ARCHIVE — split hero, sticky category rail,
   sidebar filter, spotlight-mixed grid, dark seller-prompt.
   ============================================================ */
function ClassifiedArchiveView({ posts, pagination, category, basePath }: { posts: SitePost[]; pagination: SiteFeedPagination; category: string; basePath: string }) {
  const page = pagination.page || 1
  const voice = taskPageVoices.classified
  const categoryLabel = category === 'all' ? 'All categories' : CATEGORY_OPTIONS.find((item) => item.slug === category)?.name || category
  const conditions = uniqueField(posts, ['condition', 'availability', 'type']).slice(0, 6)
  const locations = uniqueField(posts, ['location', 'city']).slice(0, 6)
  const featuredCategories = CATEGORY_OPTIONS.slice(0, 10)

  return (
    <>
      {/* ---------------- Split editorial hero ---------------- */}
      <header className="relative overflow-hidden border-b border-[var(--tk-line)] bg-[var(--tk-surface)]">
        <div className="pointer-events-none absolute -right-24 top-0 h-[520px] w-[520px] rounded-full bg-[var(--tk-glow)] blur-3xl" />
        <div className="relative mx-auto grid w-full max-w-[var(--editable-container)] gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:px-12 lg:py-24">
          <EditableReveal index={0}>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] bg-[var(--slot4-warm)] px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--tk-accent)]">
              <Store className="h-3.5 w-3.5" /> The Market
              <span className="h-1 w-1 rounded-full bg-[var(--tk-accent)] opacity-60" />
              <span className="text-[var(--tk-muted)]">{categoryLabel}</span>
            </div>
            <h1 className="editable-display mt-6 max-w-3xl text-balance text-[2.5rem] font-medium leading-[1.05] tracking-[-0.035em] sm:text-[3.5rem] lg:text-[4.25rem]">
              {category === 'all'
                ? 'The whole shelf. Sorted by freshness.'
                : `Everything in ${categoryLabel}, from independent sellers.`}
            </h1>
            <p className="mt-6 max-w-2xl text-[17px] leading-[1.6] text-[var(--tk-muted)] sm:text-[19px]">
              {voice.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {voice.chips.map((chip) => (
                <span key={chip} className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] bg-[var(--slot4-warm)] px-3.5 py-1.5 text-xs font-medium text-[var(--tk-muted)]">
                  <BadgeCheck className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {chip}
                </span>
              ))}
            </div>
          </EditableReveal>

          {/* Stats card */}
          <EditableReveal index={1}>
            <div className="rounded-[var(--editable-radius-xl)] bg-[var(--slot4-page-text)] p-6 text-white sm:p-8">
              <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-white/60">Live on the shelf</p>
              <div className="mt-6 grid grid-cols-2 gap-6">
                <MetricTile label="Listings shown" value={String(posts.length)} accent />
                <MetricTile label="Total pages" value={String(pagination.totalPages || 1)} />
                <MetricTile label="Categories" value={String(CATEGORY_OPTIONS.length)} />
                <MetricTile label="Sellers" value="Independent" />
              </div>
              <Link
                href="/create"
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-3 text-sm font-medium text-[var(--tk-on-accent)] transition hover:opacity-90"
              >
                Post a listing <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </EditableReveal>
        </div>
      </header>

      {/* ---------------- Sticky category pill rail ---------------- */}
      <div className="sticky top-0 z-30 border-b border-[var(--tk-line)] bg-[var(--tk-surface)]/95 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[var(--editable-container)] items-center gap-3 overflow-x-auto px-4 py-3 sm:px-6 lg:px-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Link
            href={basePath}
            className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-xs font-medium transition ${
              category === 'all'
                ? 'border-[var(--tk-accent)] bg-[var(--tk-accent)] text-[var(--tk-on-accent)]'
                : 'border-[var(--tk-line)] text-[var(--tk-text)] hover:border-[var(--tk-accent)]'
            }`}
          >
            All
          </Link>
          {featuredCategories.map((c) => (
            <Link
              key={c.slug}
              href={`${basePath}?category=${c.slug}`}
              className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-xs font-medium transition ${
                category === c.slug
                  ? 'border-[var(--tk-accent)] bg-[var(--tk-accent)] text-[var(--tk-on-accent)]'
                  : 'border-[var(--tk-line)] text-[var(--tk-text)] hover:border-[var(--tk-accent)]'
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>

      {/* ---------------- Two-column body: filter sidebar + grid ---------------- */}
      <section className="mx-auto grid w-full max-w-[var(--editable-container)] gap-10 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12 lg:px-12 lg:py-20">
        {/* Filter sidebar (form GET → same basePath) */}
        <aside className="min-w-0 lg:sticky lg:top-20 lg:self-start">
          <EditableReveal index={0}>
            <form action={basePath} className="rounded-[var(--editable-radius-lg)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--tk-muted)]">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> Filters
                </div>
                {category !== 'all' ? (
                  <Link href={basePath} className="text-[11px] font-medium text-[var(--tk-accent)] hover:underline">Reset</Link>
                ) : null}
              </div>

              {/* Category */}
              <div className="mt-5">
                <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--tk-muted)]">Category</p>
                <div className="mt-3 grid gap-1.5">
                  <label className={`flex items-center gap-2 rounded-[var(--editable-radius)] border px-3 py-2 text-sm cursor-pointer transition ${
                    category === 'all' ? 'border-[var(--tk-accent)] bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]' : 'border-[var(--tk-line)] text-[var(--tk-text)] hover:border-[var(--tk-accent)]'
                  }`}>
                    <input type="radio" name="category" value="all" defaultChecked={category === 'all'} className="sr-only" />
                    All categories
                  </label>
                  {CATEGORY_OPTIONS.slice(0, 10).map((c) => (
                    <label
                      key={c.slug}
                      className={`flex items-center gap-2 rounded-[var(--editable-radius)] border px-3 py-2 text-sm cursor-pointer transition ${
                        category === c.slug ? 'border-[var(--tk-accent)] bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]' : 'border-[var(--tk-line)] text-[var(--tk-text)] hover:border-[var(--tk-accent)]'
                      }`}
                    >
                      <input type="radio" name="category" value={c.slug} defaultChecked={category === c.slug} className="sr-only" />
                      {c.name}
                    </label>
                  ))}
                </div>
              </div>

              {/* Condition (visual filter — surfaces what's on the current page) */}
              {conditions.length ? (
                <div className="mt-6">
                  <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--tk-muted)]">On the shelf</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {conditions.map((c) => (
                      <span key={c} className="inline-flex items-center gap-1 rounded-full border border-[var(--tk-line)] bg-[var(--slot4-warm)] px-2.5 py-1 text-[11px] font-medium text-[var(--tk-muted)]">
                        <BadgeCheck className="h-3 w-3 text-[var(--tk-accent)]" /> {c}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Locations */}
              {locations.length ? (
                <div className="mt-6">
                  <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--tk-muted)]">Locations</p>
                  <ul className="mt-3 space-y-1.5">
                    {locations.map((loc) => (
                      <li key={loc} className="inline-flex items-center gap-2 text-xs font-medium text-[var(--tk-muted)]">
                        <MapPin className="h-3 w-3 text-[var(--tk-accent)]" /> {loc}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <button type="submit" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-3 text-sm font-medium text-[var(--tk-on-accent)] transition hover:opacity-90">
                Apply filters
              </button>
              <p className="mt-3 text-center text-[10px] text-[var(--tk-muted)]">
                Sorted by freshness. No promoted listings, ever.
              </p>
            </form>
          </EditableReveal>
        </aside>

        {/* Results grid — spotlight card at position 0 and every 7th */}
        <div className="min-w-0">
          <EditableReveal index={0} className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--tk-accent)]">Results</p>
              <h2 className="editable-display mt-1.5 text-[1.5rem] font-medium leading-[1.15] tracking-[-0.02em] sm:text-[1.75rem]">
                {posts.length} {posts.length === 1 ? 'listing' : 'listings'} · {categoryLabel}
              </h2>
            </div>
            <span className="hidden text-xs font-medium text-[var(--tk-muted)] sm:inline-flex">
              Page {page} of {pagination.totalPages || 1}
            </span>
          </EditableReveal>

          {posts.length ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, i) => {
                const href = `${basePath}/${post.slug}`
                const isSpotlight = i === 0 || (i > 0 && i % 7 === 0)
                return (
                  <EditableReveal
                    key={post.id || post.slug}
                    index={i}
                    className={isSpotlight ? 'sm:col-span-2 lg:col-span-2' : ''}
                  >
                    {isSpotlight
                      ? <ClassifiedSpotlightCard post={post} href={href} />
                      : <ClassifiedShelfCard post={post} href={href} />}
                  </EditableReveal>
                )
              })}
            </div>
          ) : (
            <EditableReveal className="rounded-[var(--editable-radius-lg)] border border-dashed border-[var(--tk-line)] bg-[var(--tk-surface)] px-8 py-16 text-center">
              <Search className="mx-auto h-7 w-7 text-[var(--tk-muted)]" />
              <h2 className="editable-display mt-5 text-2xl font-medium tracking-[-0.02em]">Nothing on this shelf yet.</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--tk-muted)]">Try another category, or check back after new listings are posted.</p>
              <Link href="/create" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-2.5 text-sm font-medium text-[var(--tk-on-accent)] transition hover:opacity-90">
                Post the first listing <ArrowUpRight className="h-4 w-4" />
              </Link>
            </EditableReveal>
          )}

          {posts.length ? (
            <nav className="mt-14 flex items-center justify-between gap-3 border-t border-[var(--tk-line)] pt-8 text-sm">
              {pagination.hasPrevPage ? (
                <Link href={pageHref(basePath, category, page - 1)} className="rounded-full border border-[var(--tk-line)] px-5 py-2.5 font-medium transition hover:border-[var(--tk-accent)]">
                  ← Previous
                </Link>
              ) : <span />}
              <span className="rounded-full bg-[var(--slot4-warm)] px-5 py-2.5 font-medium text-[var(--tk-muted)]">
                Page {page} of {pagination.totalPages || 1}
              </span>
              {pagination.hasNextPage ? (
                <Link href={pageHref(basePath, category, page + 1)} className="rounded-full border border-[var(--tk-line)] px-5 py-2.5 font-medium transition hover:border-[var(--tk-accent)]">
                  Next →
                </Link>
              ) : <span />}
            </nav>
          ) : null}
        </div>
      </section>

      {/* ---------------- Post-a-listing prompt ---------------- */}
      <section className="border-t border-[var(--tk-line)] bg-[var(--slot4-page-text)]">
        <div className="mx-auto flex w-full max-w-[var(--editable-container)] flex-col gap-6 px-4 py-16 text-white sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-12">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-white/60">Selling something?</p>
            <h2 className="editable-display mt-3 text-[1.75rem] font-medium leading-[1.15] tracking-[-0.025em] sm:text-[2.25rem]">
              Put it on The Market in minutes.
            </h2>
          </div>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-[var(--slot4-page-text)] transition hover:bg-[var(--tk-accent-soft)]"
          >
            Post a listing <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  )
}

/* ============================================================
   PROFILE ARCHIVE — editorial hero, featured sellers row,
   directory-style list of horizontal cards.
   Note: this archive is UI-hidden per contract, kept functional
   (direct URL only) so anyone landing here gets a clean view.
   ============================================================ */
function ProfileArchiveView({ posts, pagination, category, basePath }: { posts: SitePost[]; pagination: SiteFeedPagination; category: string; basePath: string }) {
  const page = pagination.page || 1
  const voice = taskPageVoices.profile
  const featured = posts.slice(0, 3)
  const directory = posts.slice(featured.length)
  const locations = uniqueField(posts, ['location', 'city']).slice(0, 6)

  return (
    <>
      <header className="relative overflow-hidden border-b border-[var(--tk-line)] bg-[var(--tk-surface)]">
        <div className="pointer-events-none absolute -left-32 top-8 h-[420px] w-[420px] rounded-full bg-[var(--tk-glow)] blur-3xl" />
        <div className="relative mx-auto w-full max-w-[var(--editable-container)] px-4 py-16 sm:px-6 sm:py-20 lg:px-12 lg:py-24">
          <EditableReveal index={0}>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] bg-[var(--slot4-warm)] px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--tk-accent)]">
              <UserRound className="h-3.5 w-3.5" /> Sellers directory
            </div>
            <h1 className="editable-display mt-6 max-w-4xl text-balance text-[2.5rem] font-medium leading-[1.05] tracking-[-0.035em] sm:text-[3.5rem] lg:text-[4.25rem]">
              {voice.headline}
            </h1>
            <p className="mt-6 max-w-2xl text-[17px] leading-[1.6] text-[var(--tk-muted)] sm:text-[19px]">
              {voice.description}
            </p>

            {/* Meta strip */}
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-[var(--tk-line)] pt-6 text-sm text-[var(--tk-muted)]">
              <span className="inline-flex items-center gap-2">
                <span className="editable-display text-[1.35rem] font-medium text-[var(--tk-text)]">{posts.length}</span>
                {posts.length === 1 ? 'seller' : 'sellers'} shown
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="editable-display text-[1.35rem] font-medium text-[var(--tk-text)]">{pagination.totalPages || 1}</span> pages
              </span>
              {locations.length ? (
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[var(--tk-accent)]" /> {locations.slice(0, 3).join(' · ')}
                </span>
              ) : null}
            </div>
          </EditableReveal>
        </div>
      </header>

      {/* Featured sellers row (portrait cards) */}
      {featured.length ? (
        <section className="border-b border-[var(--tk-line)] bg-[var(--slot4-warm)]">
          <div className="mx-auto w-full max-w-[var(--editable-container)] px-4 py-16 sm:px-6 sm:py-20 lg:px-12">
            <EditableReveal index={0} className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--tk-accent)]">Featured sellers</p>
                <h2 className="editable-display mt-3 text-[1.75rem] font-medium leading-[1.15] tracking-[-0.025em] sm:text-[2.25rem]">
                  On the front shelf this week
                </h2>
              </div>
            </EditableReveal>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((post, i) => (
                <EditableReveal key={post.id || post.slug} index={i}>
                  <ProfileFeaturedCard post={post} href={`${basePath}/${post.slug}`} />
                </EditableReveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Directory list */}
      <section className="mx-auto w-full max-w-[var(--editable-container)] px-4 py-16 sm:px-6 sm:py-20 lg:px-12">
        <EditableReveal index={0} className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--tk-accent)]">Full directory</p>
            <h2 className="editable-display mt-3 text-[1.75rem] font-medium leading-[1.15] tracking-[-0.025em] sm:text-[2.25rem]">
              Every seller, A → Z
            </h2>
          </div>
          <span className="hidden text-xs font-medium text-[var(--tk-muted)] sm:inline-flex">
            Page {page} of {pagination.totalPages || 1}
          </span>
        </EditableReveal>

        {directory.length ? (
          <div className="grid gap-3">
            {directory.map((post, i) => (
              <EditableReveal key={post.id || post.slug} index={i}>
                <ProfileDirectoryRow post={post} href={`${basePath}/${post.slug}`} />
              </EditableReveal>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <EditableReveal className="rounded-[var(--editable-radius-lg)] border border-dashed border-[var(--tk-line)] bg-[var(--tk-surface)] px-8 py-16 text-center">
            <Search className="mx-auto h-7 w-7 text-[var(--tk-muted)]" />
            <h2 className="editable-display mt-5 text-2xl font-medium tracking-[-0.02em]">No sellers yet.</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--tk-muted)]">Sellers will appear here once they set up their shopfronts.</p>
          </EditableReveal>
        ) : null}

        {posts.length ? (
          <nav className="mt-14 flex items-center justify-between gap-3 border-t border-[var(--tk-line)] pt-8 text-sm">
            {pagination.hasPrevPage ? (
              <Link href={pageHref(basePath, category, page - 1)} className="rounded-full border border-[var(--tk-line)] px-5 py-2.5 font-medium transition hover:border-[var(--tk-accent)]">
                ← Previous
              </Link>
            ) : <span />}
            <span className="rounded-full bg-[var(--slot4-warm)] px-5 py-2.5 font-medium text-[var(--tk-muted)]">
              Page {page} of {pagination.totalPages || 1}
            </span>
            {pagination.hasNextPage ? (
              <Link href={pageHref(basePath, category, page + 1)} className="rounded-full border border-[var(--tk-line)] px-5 py-2.5 font-medium transition hover:border-[var(--tk-accent)]">
                Next →
              </Link>
            ) : <span />}
          </nav>
        ) : null}
      </section>
    </>
  )
}

/* ============================================================
   GENERIC ARCHIVE — kept for non-user-visible tasks
   (article/listing/image/sbm/pdf) that aren't enabled in this build
   but keep working if flipped on.
   ============================================================ */
function GenericArchiveView({ task, posts, pagination, category, basePath }: { task: TaskKey; posts: SitePost[]; pagination: SiteFeedPagination; category: string; basePath: string }) {
  const taskConfig = getTaskConfig(task)
  const voice = taskPageVoices[task]
  const theme = getTaskTheme(task)
  const page = pagination.page || 1
  const label = taskConfig?.label || task
  const categoryLabel = category === 'all' ? 'All categories' : CATEGORY_OPTIONS.find((item) => item.slug === category)?.name || category

  return (
    <>
      <header className="relative overflow-hidden border-b border-[var(--tk-line)] bg-[var(--slot4-warm)]">
        <div className="pointer-events-none absolute inset-x-0 -top-40 h-96 bg-[radial-gradient(60%_60%_at_50%_0%,var(--tk-glow),transparent_70%)]" />
        <div className="relative mx-auto w-full max-w-[var(--editable-container)] px-4 py-20 sm:px-6 sm:py-24 lg:px-12 lg:py-28">
          <EditableReveal index={0}>
            <div className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--tk-accent)]">
              <span>{theme.kicker}</span>
              <span className="h-1 w-1 rounded-full bg-[var(--tk-accent)] opacity-60" />
              <span className="text-[var(--tk-muted)]">{label}</span>
            </div>
            <h1 className="editable-display mt-6 max-w-3xl text-balance text-[2.5rem] font-medium leading-[1.05] tracking-[-0.035em] sm:text-[3.5rem] lg:text-[4.25rem]">
              {voice?.headline || `Browse ${label}`}
            </h1>
            <p className="mt-6 max-w-2xl text-[17px] leading-[1.55] text-[var(--tk-muted)] sm:text-[19px]">{voice?.description || theme.note}</p>
          </EditableReveal>

          <EditableReveal index={1} className="mt-14 flex flex-col gap-4 border-t border-[var(--tk-line)] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[var(--tk-muted)]">
              <span className="font-medium text-[var(--tk-text)]">{posts.length}</span> · {categoryLabel}
            </p>
            <form action={basePath} className="flex items-center gap-2.5">
              <div className="relative">
                <select name="category" defaultValue={category} className="h-11 appearance-none rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] pl-4 pr-10 text-sm font-medium text-[var(--tk-text)] outline-none transition focus:border-[var(--tk-accent)]" aria-label="Filter">
                  <option value="all">All categories</option>
                  {CATEGORY_OPTIONS.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tk-muted)]" />
              </div>
              <button className="inline-flex h-11 items-center rounded-full bg-[var(--tk-accent)] px-5 text-sm font-medium text-[var(--tk-on-accent)] transition hover:opacity-90">Apply</button>
            </form>
          </EditableReveal>
        </div>
      </header>

      <section className="mx-auto w-full max-w-[var(--editable-container)] px-4 py-20 sm:px-6 sm:py-24 lg:px-12">
        {posts.length ? (
          <div className={taskGrid[task]}>
            {posts.map((post, index) => (
              <EditableReveal key={post.id || post.slug} index={index}>
                <ArchivePostCard post={post} task={task} basePath={basePath} index={index} />
              </EditableReveal>
            ))}
          </div>
        ) : (
          <EditableReveal className="mx-auto max-w-xl rounded-[var(--editable-radius-lg)] border border-dashed border-[var(--tk-line)] bg-[var(--tk-surface)] px-8 py-16 text-center">
            <Search className="mx-auto h-7 w-7 text-[var(--tk-muted)]" />
            <h2 className="editable-display mt-5 text-2xl font-medium tracking-[-0.02em]">Nothing here yet.</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--tk-muted)]">Try another category or check back soon.</p>
          </EditableReveal>
        )}

        {posts.length ? (
          <nav className="mt-16 flex items-center justify-center gap-3 text-sm">
            {pagination.hasPrevPage ? <Link href={pageHref(basePath, category, page - 1)} className="rounded-full border border-[var(--tk-line)] px-5 py-2.5 font-medium transition hover:border-[var(--tk-accent)]">← Previous</Link> : null}
            <span className="rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] px-5 py-2.5 font-medium text-[var(--tk-muted)]">Page {page} of {pagination.totalPages || 1}</span>
            {pagination.hasNextPage ? <Link href={pageHref(basePath, category, page + 1)} className="rounded-full border border-[var(--tk-line)] px-5 py-2.5 font-medium transition hover:border-[var(--tk-accent)]">Next →</Link> : null}
          </nav>
        ) : null}
      </section>
    </>
  )
}

/* ---------- small helpers used by the archive views ---------- */

function uniqueField(posts: SitePost[], keys: string[]): string[] {
  const set = new Set<string>()
  for (const p of posts) {
    const v = getField(p, keys)
    if (v && v.length < 40) set.add(v)
  }
  return Array.from(set)
}

function MetricTile({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className={`editable-display text-[1.75rem] font-medium leading-none tracking-[-0.02em] ${accent ? 'text-[var(--tk-accent)]' : 'text-white'}`}>{value}</p>
      <p className="mt-2 text-xs text-white/60">{label}</p>
    </div>
  )
}

/* Big spotlight card used at grid position 0 and every 7th slot. */
function ClassifiedSpotlightCard({ post, href }: { post: SitePost; href: string }) {
  const image = getImage(post)
  const price = getField(post, ['price', 'amount', 'budget'])
  const condition = getField(post, ['condition', 'type', 'availability'])
  const location = getField(post, ['location', 'address', 'city'])
  return (
    <Link
      href={href}
      className="group grid h-full gap-0 overflow-hidden rounded-[var(--editable-radius-xl)] border border-[var(--tk-line)] bg-[var(--tk-surface)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(16,16,16,0.10)] sm:grid-cols-[1.1fr_1fr]"
    >
      <div className="relative min-h-[280px] overflow-hidden bg-[var(--tk-raised)]">
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--tk-text)]">
          Spotlight
        </span>
        {price ? (
          <span className="absolute right-4 top-4 rounded-full bg-[var(--tk-accent)] px-3 py-1 text-[13px] font-medium text-[var(--tk-on-accent)]">
            {price}
          </span>
        ) : null}
      </div>
      <div className="flex flex-col p-6 sm:p-7">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--tk-accent)]">{getCategory(post, 'The Market')}</p>
        <h3 className="editable-display mt-3 text-[1.5rem] font-medium leading-[1.15] tracking-[-0.02em] text-[var(--tk-text)] sm:text-[1.75rem]">
          {post.title}
        </h3>
        <p className="mt-3 line-clamp-3 flex-1 text-[15px] leading-[1.6] text-[var(--tk-muted)]">{getSummary(post)}</p>
        <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-medium">
          {condition ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tk-line)] px-3 py-1 text-[var(--tk-text)]">
              <BadgeCheck className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {condition}
            </span>
          ) : null}
          {location ? (
            <span className="inline-flex items-center gap-1.5 text-[var(--tk-muted)]">
              <MapPin className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {location}
            </span>
          ) : null}
          <span className="ml-auto inline-flex items-center gap-1 text-[var(--tk-accent)]">
            View listing <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}

/* Standard shelf card used elsewhere in the grid. */
function ClassifiedShelfCard({ post, href }: { post: SitePost; href: string }) {
  const image = getImage(post)
  const price = getField(post, ['price', 'amount', 'budget'])
  const location = getField(post, ['location', 'address', 'city'])
  const condition = getField(post, ['condition', 'type', 'availability'])
  return (
    <Link href={href} className={`${cardBase} flex h-full flex-col overflow-hidden`}>
      <div className="relative aspect-[4/5] overflow-hidden bg-[var(--tk-raised)]">
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
        {condition ? (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--tk-text)]">
            {condition}
          </span>
        ) : null}
        {price ? (
          <span className="absolute right-3 top-3 rounded-full bg-[var(--tk-accent)] px-3 py-1 text-[13px] font-medium text-[var(--tk-on-accent)]">
            {price}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--tk-accent)]">{getCategory(post, 'The Market')}</p>
        <h2 className="editable-display mt-2 line-clamp-2 text-[1.15rem] font-medium leading-[1.2] tracking-[-0.015em]">{post.title}</h2>
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-[1.55] text-[var(--tk-muted)]">{getSummary(post)}</p>
        <div className="mt-4 flex items-center justify-between border-t border-[var(--tk-line)] pt-3 text-xs font-medium text-[var(--tk-muted)]">
          <span className="inline-flex items-center gap-1">
            {location ? (<><MapPin className="h-3.5 w-3.5" /> {location}</>) : 'Independent seller'}
          </span>
          <ArrowUpRight className="h-4 w-4 text-[var(--tk-accent)] transition group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  )
}

/* Tall portrait card used in the profile "featured sellers" row. */
function ProfileFeaturedCard({ post, href }: { post: SitePost; href: string }) {
  const avatar = getImages(post)[0]
  const role = getField(post, ['role', 'designation', 'company', 'title'])
  const location = getField(post, ['location', 'city', 'address'])
  return (
    <Link
      href={href}
      className="group relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-[var(--editable-radius-xl)] border border-[var(--tk-line)] bg-[var(--slot4-page-text)] text-white transition duration-500 hover:-translate-y-1"
    >
      {avatar ? (
        <img src={avatar} alt="" className="absolute inset-0 h-full w-full object-cover opacity-90 transition duration-700 group-hover:scale-[1.03]" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(135deg,var(--tk-accent-soft),var(--slot4-warm))]">
          <span className="editable-display text-[5rem] font-medium text-[var(--tk-accent)]">{getInitials(post.title)}</span>
        </div>
      )}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgba(0,0,0,0.75)_100%)]" />
      <div className="relative z-10 p-6 sm:p-7">
        <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-white/70">Featured seller</p>
        <h3 className="editable-display mt-3 text-[1.5rem] font-medium leading-[1.15] tracking-[-0.02em] sm:text-[1.75rem]">{post.title}</h3>
        {role ? <p className="mt-1 text-sm text-white/80">{role}</p> : null}
        {location ? (
          <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-white/70">
            <MapPin className="h-3 w-3 text-[var(--tk-accent)]" /> {location}
          </p>
        ) : null}
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--tk-accent)]">
          View shopfront <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  )
}

/* Directory-style horizontal row for the profile "full directory" list. */
function ProfileDirectoryRow({ post, href }: { post: SitePost; href: string }) {
  const avatar = getImages(post)[0]
  const role = getField(post, ['role', 'designation', 'company', 'title'])
  const location = getField(post, ['location', 'city', 'address'])
  const website = getField(post, ['website', 'url'])
  const email = getField(post, ['email'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  return (
    <Link
      href={href}
      className="group grid items-center gap-5 rounded-[var(--editable-radius-lg)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-5 transition duration-500 hover:-translate-y-0.5 hover:border-[var(--tk-accent)] hover:shadow-[0_18px_44px_rgba(16,16,16,0.08)] sm:grid-cols-[64px_minmax(0,1.2fr)_minmax(0,1fr)_auto]"
    >
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--tk-line)] bg-[var(--tk-raised)]">
        {avatar ? (
          <img src={avatar} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="editable-display text-lg font-medium text-[var(--tk-accent)]">{getInitials(post.title)}</span>
        )}
      </div>
      <div className="min-w-0">
        <h3 className="editable-display truncate text-[1.15rem] font-medium tracking-[-0.015em] text-[var(--tk-text)]">{post.title}</h3>
        {role ? <p className="mt-0.5 text-xs font-medium uppercase tracking-[0.14em] text-[var(--tk-accent)]">{role}</p> : null}
        <p className="mt-1.5 line-clamp-1 text-sm text-[var(--tk-muted)]">{getSummary(post)}</p>
      </div>
      <div className="flex flex-wrap gap-2 text-xs font-medium text-[var(--tk-muted)]">
        {location ? <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {location}</span> : null}
        {phone ? <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {phone}</span> : null}
        {email ? <span className="inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> Email</span> : null}
        {website ? <span className="inline-flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> Website</span> : null}
      </div>
      <ArrowUpRight className="hidden h-5 w-5 shrink-0 text-[var(--tk-muted)] transition group-hover:text-[var(--tk-accent)] sm:block" />
    </Link>
  )
}

function getInitials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase() || '').join('') || 'S'
}

/* ---------- shared card router ---------- */
function ArchivePostCard({ post, task, basePath, index }: { post: SitePost; task: TaskKey; basePath: string; index: number }) {
  const href = `${basePath}/${post.slug}` || buildPostUrl(task, post.slug)
  if (task === 'listing') return <ListingArchiveCard post={post} href={href} />
  if (task === 'classified') return <ClassifiedArchiveCard post={post} href={href} />
  if (task === 'image') return <ImageArchiveCard post={post} href={href} index={index} />
  if (task === 'sbm') return <BookmarkArchiveCard post={post} href={href} index={index} />
  if (task === 'pdf') return <PdfArchiveCard post={post} href={href} />
  if (task === 'profile') return <ProfileArchiveCard post={post} href={href} />
  return <ArticleArchiveCard post={post} href={href} index={index} />
}

function CardArrow({ label }: { label: string }) {
  return (
    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--tk-accent)]">
      {label} <ArrowUpRight className="h-4 w-4 transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </span>
  )
}

/* Classified shelf card — price-first, condition/location chips, hover lift. */
function ClassifiedArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const image = getImage(post)
  const price = getField(post, ['price', 'amount', 'budget'])
  const location = getField(post, ['location', 'address', 'city'])
  const condition = getField(post, ['condition', 'type', 'availability'])
  return (
    <Link href={href} className={`${cardBase} flex flex-col overflow-hidden`}>
      <div className="relative aspect-[4/5] overflow-hidden bg-[var(--tk-raised)]">
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
        {condition ? (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--tk-text)]">
            {condition}
          </span>
        ) : null}
        {price ? (
          <span className="absolute right-3 top-3 rounded-full bg-[var(--tk-accent)] px-3 py-1 text-[13px] font-medium text-[var(--tk-on-accent)]">
            {price}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--tk-accent)]">{getCategory(post, 'The Market')}</p>
        <h2 className="editable-display mt-2 line-clamp-2 text-[1.15rem] font-medium leading-[1.2] tracking-[-0.015em]">{post.title}</h2>
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-[1.55] text-[var(--tk-muted)]">{getSummary(post)}</p>
        <div className="mt-4 flex items-center justify-between border-t border-[var(--tk-line)] pt-3 text-xs font-medium text-[var(--tk-muted)]">
          <span className="inline-flex items-center gap-1">
            {location ? (<><MapPin className="h-3.5 w-3.5" /> {location}</>) : 'Independent seller'}
          </span>
          <ArrowUpRight className="h-4 w-4 text-[var(--tk-accent)] transition group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  )
}

function ArticleArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const image = getImage(post)
  const category = getCategory(post, 'Guide')
  return (
    <Link href={href} className={`${cardBase} overflow-hidden`}>
      <div className="aspect-[16/10] overflow-hidden bg-[var(--tk-raised)]">
        <img src={image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
      </div>
      <div className="p-6 sm:p-7">
        <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--tk-accent)]">
          <span>{category}</span>
          <span className="text-[var(--tk-muted)]">· No. {String(index + 1).padStart(2, '0')}</span>
        </div>
        <h2 className="editable-display mt-3 text-[1.5rem] font-medium leading-[1.2] tracking-[-0.02em]">{post.title}</h2>
        <p className="mt-3 line-clamp-2 text-[15px] leading-[1.55] text-[var(--tk-muted)]">{getSummary(post)}</p>
        <CardArrow label="Read guide" />
      </div>
    </Link>
  )
}

function ListingArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const logo = getImages(post)[0]
  const location = getField(post, ['location', 'address', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const website = getField(post, ['website', 'url'])
  return (
    <Link href={href} className={`${cardBase} flex items-center gap-5 p-5 sm:p-6`}>
      <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[var(--editable-radius)] border border-[var(--tk-line)] bg-[var(--tk-raised)]">
        {logo ? <img src={logo} alt="" className="h-full w-full object-cover" /> : <BriefcaseBusiness className="h-9 w-9 text-[var(--tk-muted)]" />}
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="editable-display truncate text-xl font-medium tracking-[-0.02em]">{post.title}</h2>
        <p className="mt-2 line-clamp-1 text-sm leading-6 text-[var(--tk-muted)]">{getSummary(post)}</p>
        <div className="mt-3 flex flex-wrap gap-3 text-xs font-medium text-[var(--tk-muted)]">
          {location ? <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {location}</span> : null}
          {phone ? <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {phone}</span> : null}
          {website ? <span className="inline-flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> Website</span> : null}
        </div>
      </div>
      <ArrowUpRight className="h-5 w-5 shrink-0 text-[var(--tk-muted)] transition group-hover:text-[var(--tk-accent)]" />
    </Link>
  )
}

function ImageArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const image = getImage(post)
  return (
    <Link href={href} className="group mb-6 block break-inside-avoid overflow-hidden rounded-[var(--editable-radius-lg)] border border-[var(--tk-line)] bg-[var(--tk-surface)] transition duration-500 hover:-translate-y-1">
      <div className={`relative overflow-hidden ${index % 3 === 0 ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}>
        <img src={image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(0,0,0,0.72))] opacity-85" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <h2 className="editable-display line-clamp-2 text-lg font-medium leading-[1.2] tracking-[-0.02em] text-white">{post.title}</h2>
        </div>
      </div>
    </Link>
  )
}

function BookmarkArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const website = getField(post, ['website', 'url', 'link'])
  return (
    <Link href={href} className={`${cardBase} flex gap-4 p-6`}>
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
        <Globe className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">Resource · {String(index + 1).padStart(2, '0')}</span>
        <h2 className="editable-display mt-1.5 text-lg font-medium leading-[1.25] tracking-[-0.015em]">{post.title}</h2>
        <p className="mt-2 line-clamp-2 text-sm leading-[1.55] text-[var(--tk-muted)]">{getSummary(post)}</p>
        {website ? <p className="mt-3 truncate text-xs font-medium text-[var(--tk-accent)]">{cleanDomain(website)}</p> : null}
      </div>
    </Link>
  )
}

function PdfArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const category = getCategory(post, 'Download')
  return (
    <Link href={href} className={`${cardBase} flex flex-col p-6 sm:p-7`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]"><FileText className="h-6 w-6" /></div>
        <span className="rounded-full border border-[var(--tk-line)] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--tk-muted)]">{category}</span>
      </div>
      <h2 className="editable-display mt-6 text-xl font-medium leading-[1.2] tracking-[-0.02em]">{post.title}</h2>
      <p className="mt-3 line-clamp-3 flex-1 text-sm leading-[1.55] text-[var(--tk-muted)]">{getSummary(post)}</p>
      <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--tk-accent)]">Open document <Download className="h-4 w-4" /></span>
    </Link>
  )
}

function ProfileArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const avatar = getImages(post)[0]
  const role = getField(post, ['role', 'designation', 'company', 'location'])
  return (
    <Link href={href} className={`${cardBase} flex flex-col items-center p-7 text-center`}>
      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-[var(--tk-line)] bg-[var(--tk-raised)]">
        {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-10 w-10 text-[var(--tk-muted)]" />}
      </div>
      <h2 className="editable-display mt-5 text-lg font-medium tracking-[-0.02em]">{post.title}</h2>
      {role ? <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.16em] text-[var(--tk-accent)]"><Tag className="h-3 w-3" /> {role}</p> : null}
      <p className="mt-3 line-clamp-2 text-sm leading-[1.55] text-[var(--tk-muted)]">{getSummary(post)}</p>
    </Link>
  )
}
