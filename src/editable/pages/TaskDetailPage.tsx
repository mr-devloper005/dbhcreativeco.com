import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft, ArrowUpRight, BadgeCheck, Bookmark, Building2, Camera, CheckCircle2,
  Download, ExternalLink, FileText, Globe2, Mail, MapPin, Phone, ShieldCheck,
  Store, Tag,
} from 'lucide-react'
import { buildPostMetadata, buildTaskMetadata } from '@/lib/seo'
import { fetchArticleComments, fetchTaskPostBySlug, fetchTaskPosts } from '@/lib/task-data'
import { getTaskConfig, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableArticleComments } from '@/editable/components/EditableArticleComments'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'
import { isUiHiddenTask } from '@/editable/content/global.content'

export const revalidate = 3

export async function generateEditableDetailMetadata(task: TaskKey, params: Promise<{ slug?: string; username?: string }>) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  return post ? await buildPostMetadata(task, post) : await buildTaskMetadata(task)
}

export async function EditableTaskDetailRoute({ task, params }: { task: TaskKey; params: Promise<{ slug?: string; username?: string }> }) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  if (!post) notFound()
  // Skip related-fetch for hidden tasks (profile) — the detail page must not
  // show a "more profiles" strip anywhere.
  const related = isUiHiddenTask(task)
    ? []
    : (await fetchTaskPosts(task, 7)).filter((item) => item.slug !== post.slug).slice(0, 4)
  const comments = task === 'article' ? await fetchArticleComments(post.slug, 50) : []
  return <TaskDetailView task={task} post={post} related={related} comments={comments} />
}

/* ---------- helpers (kept identical to prior behavior) ---------- */

const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
const asText = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((m) => m?.url).filter((u): u is string => typeof u === 'string' && isUrl(u)) : []
  const images = Array.isArray(content.images) ? content.images.filter((u): u is string => typeof u === 'string' && isUrl(u)) : []
  const singleImages = ['image', 'featuredImage', 'thumbnail', 'logo', 'avatar'].map((k) => asText(content[k])).filter((u) => u && isUrl(u))
  return [...media, ...images, ...singleImages].filter(Boolean).slice(0, 12)
}

const getBody = (post: SitePost) => {
  const content = getContent(post)
  return asText(content.body) || asText(content.description) || asText(content.details) || post.summary || 'Details will appear here once available.'
}

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const safeUrl = (value: string) => /^https?:\/\//i.test(value) ? value : '#'

const linkifyMarkdown = (value: string) => value
  .replace(/\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/gi, (_m, label, url) => `<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${label}</a>`)

const linkifyText = (value: string) => linkifyMarkdown(value)
  .replace(/(^|[\s(>])((https?:\/\/)[^\s<)]+)/gi, (_m, prefix, url) => `${prefix}<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${url}</a>`)

const hardenLinks = (html: string) => html.replace(/<a\s+([^>]*href=["'][^"']+["'][^>]*)>/gi, (_m, attrs) => {
  let next = String(attrs).replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  if (!/\starget=/i.test(next)) next += ' target="_blank"'
  if (!/\srel=/i.test(next)) next += ' rel="nofollow noopener noreferrer"'
  return `<a ${next}>`
})

const sanitizeHtml = (html: string) => hardenLinks(html
  .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  .replace(/<(iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, '')
  .replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  .replace(/(href|src)=(['"])javascript:[\s\S]*?\2/gi, '$1="#"'))

const formatPlainText = (raw: string) => {
  const value = raw.trim()
  if (!value) return ''
  if (/<[a-z][\s\S]*>/i.test(value)) return sanitizeHtml(linkifyMarkdown(value))
  return value
    .split(/\n{2,}/)
    .map((part) => `<p>${linkifyText(escapeHtml(part).replace(/\n/g, '<br />'))}</p>`)
    .join('')
}

const summaryText = (post: SitePost) => post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || ''
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const leadText = (post: SitePost) => {
  const summary = summaryText(post)
  if (!summary) return ''
  const lead = stripHtml(summary)
  return lead && lead !== stripHtml(getBody(post)) ? lead : ''
}
const categoryOf = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
const mapSrcFor = (post: SitePost) => {
  const address = getField(post, ['address', 'location', 'city'])
  const lat = getField(post, ['lat', 'latitude'])
  const lng = getField(post, ['lng', 'lon', 'longitude'])
  if (lat && lng) return `https://maps.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=14&output=embed`
  if (address) return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=13&output=embed`
  return ''
}
const initialsOf = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase() || '').join('') || 'S'

/* ---------- Top-level view router ---------- */

export function TaskDetailView({ task, post, related, comments = [] }: { task: TaskKey; post: SitePost; related: SitePost[]; comments?: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        {task === 'listing' ? <ListingDetail post={post} related={related} /> : null}
        {task === 'classified' ? <ClassifiedDetail post={post} related={related} /> : null}
        {task === 'image' ? <ImageDetail post={post} related={related} /> : null}
        {task === 'sbm' ? <BookmarkDetail post={post} related={related} /> : null}
        {task === 'pdf' ? <PdfDetail post={post} related={related} /> : null}
        {task === 'profile' ? <ProfileDetail post={post} /> : null}
        {task === 'article' ? <ArticleDetail post={post} related={related} comments={comments} /> : null}
      </main>
    </EditableSiteShell>
  )
}

/* ---------- Shared building blocks ---------- */

function BackLink({ task }: { task: TaskKey }) {
  // Hidden tasks (profile) never show a back-to-archive link — the archive
  // page is not user-visible.
  if (isUiHiddenTask(task)) return null
  const taskConfig = getTaskConfig(task)
  const label = task === 'classified' ? 'The Market' : (taskConfig?.label || 'posts')
  return (
    <Link
      href={taskConfig?.route || '/'}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--tk-muted)] transition hover:text-[var(--tk-text)]"
    >
      <ArrowLeft className="h-4 w-4" /> Back to {label}
    </Link>
  )
}

function Kicker({ task, children }: { task: TaskKey; children: React.ReactNode }) {
  const theme = getTaskTheme(task)
  return (
    <div className="flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--tk-accent)]">
      <span>{theme.kicker}</span>
      <span className="h-1 w-1 rounded-full bg-[var(--tk-accent)] opacity-60" />
      <span className="text-[var(--tk-muted)]">{children}</span>
    </div>
  )
}

function BodyContent({ post, compact = false }: { post: SitePost; compact?: boolean }) {
  return (
    <div
      className={`article-content mt-8 max-w-none text-[var(--tk-text)] ${compact ? 'text-[15px] leading-[1.7]' : 'text-[1.0625rem] leading-[1.75]'}`}
      dangerouslySetInnerHTML={{ __html: formatPlainText(getBody(post)) }}
    />
  )
}

function TagChips({ tags }: { tags?: string[] }) {
  const list = (tags || []).filter(Boolean).slice(0, 8)
  if (!list.length) return null
  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {list.map((tag) => (
        <span key={tag} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] px-3 py-1 text-xs font-medium text-[var(--tk-muted)]">
          <Tag className="h-3 w-3 text-[var(--tk-accent)]" /> {tag}
        </span>
      ))}
    </div>
  )
}

function MapBox({ src, label }: { src: string; label: string }) {
  return (
    <div className="overflow-hidden rounded-[var(--editable-radius-lg)] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
      <div className="flex items-center gap-2 border-b border-[var(--tk-line)] p-4 text-sm font-medium">
        <MapPin className="h-4 w-4 text-[var(--tk-accent)]" /> {label || 'Map location'}
      </div>
      <iframe src={src} title="Map" loading="lazy" className="h-72 w-full border-0" />
    </div>
  )
}

/* ============================================================
   CLASSIFIED DETAIL — full-bleed magazine hero, sticky action bar,
   split gallery + seller layout, spec table, trust band, snap rail.
   ============================================================ */
function ClassifiedDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const gallery = images.length ? images : ['/placeholder.svg?height=1400&width=2000']
  const hero = gallery[0]
  const thumbs = gallery.slice(1, 6)
  const price = getField(post, ['price', 'amount', 'budget'])
  const condition = getField(post, ['condition', 'availability', 'type'])
  const category = getField(post, ['category']) || post.tags?.[0] || 'The Market'
  const location = getField(post, ['location', 'address', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  const sellerName = getField(post, ['sellerName', 'seller', 'authorName', 'name', 'company']) || 'Independent seller'
  const dimensions = getField(post, ['dimensions', 'size', 'measurements'])
  const material = getField(post, ['material', 'made', 'materials'])
  const brand = getField(post, ['brand', 'maker'])
  const mapSrc = mapSrcFor(post)
  const relatedInCategory = related.filter((p) => (asText(getContent(p).category) || p.tags?.[0] || '') === category)
  const strip = relatedInCategory.length ? relatedInCategory : related
  const primaryContact = phone ? `tel:${phone}` : email ? `mailto:${email}` : website || '#'

  // Always keep the four core rows; append optional ones only when populated.
  const coreSpecs: Array<[string, string]> = [
    ['Price', price || 'Open offer'],
    ['Condition', condition || 'As shown'],
    ['Category', category],
    ['Location', location || 'Ask seller'],
    ['Seller', sellerName],
    ...(brand ? [['Brand / maker', brand] as [string, string]] : []),
    ...(material ? [['Materials', material] as [string, string]] : []),
    ...(dimensions ? [['Dimensions', dimensions] as [string, string]] : []),
  ]

  return (
    <>
      {/* ---------------- Breadcrumb strip ---------------- */}
      <div className="border-b border-[var(--tk-line)] bg-[var(--tk-surface)]">
        <div className="mx-auto flex w-full max-w-[var(--editable-container)] items-center justify-between gap-4 px-4 py-4 text-xs font-medium text-[var(--tk-muted)] sm:px-6 lg:px-12">
          <div className="flex min-w-0 items-center gap-2 truncate">
            <Link href="/" className="hover:text-[var(--tk-text)]">Home</Link>
            <span className="opacity-40">/</span>
            <Link href="/classified" className="hover:text-[var(--tk-text)]">The Market</Link>
            <span className="opacity-40">/</span>
            <span className="truncate text-[var(--tk-text)]">{category}</span>
          </div>
          <BackLink task="classified" />
        </div>
      </div>

      {/* ---------------- Full-bleed hero image with overlay ---------------- */}
      <section className="relative overflow-hidden bg-[var(--slot4-page-text)]">
        <div className="relative aspect-[16/9] w-full sm:aspect-[21/9] lg:aspect-[24/9] lg:min-h-[560px]">
          <img src={hero} alt={post.title} className="absolute inset-0 h-full w-full object-cover" loading="eager" fetchPriority="high" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.28)_0%,rgba(0,0,0,0.05)_45%,rgba(0,0,0,0.78)_100%)]" />
          <div className="absolute inset-x-0 bottom-0">
            <div className="mx-auto w-full max-w-[var(--editable-container)] px-4 pb-10 sm:px-6 sm:pb-14 lg:px-12 lg:pb-16">
              <EditableReveal index={0}>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--slot4-page-text)]">
                  <Store className="h-3 w-3 text-[var(--tk-accent)]" /> The Market · {category}
                </div>
                <h1 className="editable-display mt-5 max-w-4xl text-balance text-[2.25rem] font-medium leading-[1.05] tracking-[-0.035em] text-white sm:text-[3.25rem] lg:text-[4rem]">
                  {post.title}
                </h1>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  {price ? (
                    <span className="inline-flex items-center rounded-full bg-[var(--tk-accent)] px-5 py-2 text-[15px] font-medium text-[var(--tk-on-accent)]">
                      {price}
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-white/95 px-5 py-2 text-[15px] font-medium text-[var(--slot4-page-text)]">
                      Open offer
                    </span>
                  )}
                  {condition ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                      <BadgeCheck className="h-4 w-4" /> {condition}
                    </span>
                  ) : null}
                  {location ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                      <MapPin className="h-4 w-4" /> {location}
                    </span>
                  ) : null}
                </div>
              </EditableReveal>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Sticky mini action bar ---------------- */}
      <div className="sticky top-0 z-40 border-b border-[var(--tk-line)] bg-[var(--tk-surface)]/95 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[var(--editable-container)] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-12">
          <div className="flex min-w-0 items-center gap-4">
            <span className="editable-display truncate text-[1.05rem] font-medium tracking-[-0.015em] text-[var(--tk-text)]">
              {post.title}
            </span>
            {price ? (
              <span className="hidden shrink-0 rounded-full bg-[var(--tk-accent-soft)] px-3 py-1 text-sm font-medium text-[var(--tk-accent)] sm:inline-flex">
                {price}
              </span>
            ) : null}
          </div>
          <a
            href={primaryContact}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[var(--tk-accent)] px-4 py-2 text-sm font-medium text-[var(--tk-on-accent)] transition hover:opacity-90"
          >
            {phone ? <Phone className="h-4 w-4" /> : email ? <Mail className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
            Contact seller
          </a>
        </div>
      </div>

      {/* ---------------- Gallery + seller (two-column) ---------------- */}
      <section className="mx-auto grid w-full max-w-[var(--editable-container)] gap-10 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] lg:gap-12 lg:px-12 lg:py-20">
        {/* Gallery: main + vertical thumb rail on desktop, horizontal snap on mobile */}
        <EditableReveal index={0} className="min-w-0">
          <div className="grid gap-3 sm:grid-cols-[100px_minmax(0,1fr)]">
            {/* Thumbs column (desktop) */}
            {thumbs.length ? (
              <div className="hidden max-h-[560px] flex-col gap-3 overflow-hidden sm:flex">
                {thumbs.map((src, i) => (
                  <a
                    key={`${src}-${i}`}
                    href={`#photo-${i + 1}`}
                    className="relative aspect-square w-full overflow-hidden rounded-[var(--editable-radius)] border border-[var(--tk-line)] bg-[var(--tk-raised)] transition hover:border-[var(--tk-accent)]"
                  >
                    <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
                  </a>
                ))}
              </div>
            ) : null}
            {/* Main image */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--editable-radius-lg)] border border-[var(--tk-line)] bg-[var(--tk-raised)]">
              <img src={hero} alt={post.title} className="absolute inset-0 h-full w-full object-cover" />
            </div>
          </div>

          {/* Mobile horizontal thumb rail */}
          {thumbs.length ? (
            <div className="mt-3 flex snap-x gap-3 overflow-x-auto pb-2 sm:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {thumbs.map((src, i) => (
                <div key={`m-${src}-${i}`} className="relative aspect-square w-24 shrink-0 snap-start overflow-hidden rounded-[var(--editable-radius)] border border-[var(--tk-line)] bg-[var(--tk-raised)]">
                  <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
                </div>
              ))}
            </div>
          ) : null}
        </EditableReveal>

        {/* Seller / actions */}
        <aside className="min-w-0 space-y-6 lg:sticky lg:top-24 lg:self-start">
          <EditableReveal index={0}>
            <div className="overflow-hidden rounded-[var(--editable-radius-lg)] border border-[var(--tk-line)] bg-[var(--tk-surface)] shadow-[0_18px_44px_rgba(16,16,16,0.06)]">
              {/* Header band */}
              <div className="border-b border-[var(--tk-line)] bg-[linear-gradient(180deg,var(--tk-accent-soft),transparent)] px-6 pt-6 pb-5">
                <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-[var(--tk-muted)]">Sold by</p>
                <div className="mt-3 flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--tk-accent)] text-sm font-medium text-white">
                    {initialsOf(sellerName)}
                  </span>
                  <div className="min-w-0">
                    <p className="editable-display truncate text-[1.15rem] font-medium tracking-[-0.015em]">{sellerName}</p>
                    <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-[var(--tk-muted)]">
                      <BadgeCheck className="h-3 w-3 text-[var(--tk-accent)]" /> Verified independent seller
                    </p>
                  </div>
                </div>
              </div>

              {/* Price / condition tiles */}
              <div className="grid grid-cols-2 divide-x divide-[var(--tk-line)] border-b border-[var(--tk-line)]">
                <div className="px-6 py-4">
                  <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--tk-muted)]">Asking</p>
                  <p className="editable-display mt-1 text-[1.35rem] font-medium tracking-[-0.02em] text-[var(--tk-accent)]">{price || 'Open'}</p>
                </div>
                <div className="px-6 py-4">
                  <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--tk-muted)]">Condition</p>
                  <p className="editable-display mt-1 text-[1.35rem] font-medium tracking-[-0.02em] text-[var(--tk-text)]">{condition || 'As shown'}</p>
                </div>
              </div>

              {/* Contact rows */}
              <div className="divide-y divide-[var(--tk-line)]">
                {location ? (
                  <ContactRow icon={MapPin} label="Location" value={location} href={mapSrc ? `https://maps.google.com/maps?q=${encodeURIComponent(location)}` : undefined} external />
                ) : null}
                {phone ? <ContactRow icon={Phone} label="Phone" value={phone} href={`tel:${phone}`} /> : null}
                {email ? <ContactRow icon={Mail} label="Email" value={email} href={`mailto:${email}`} /> : null}
                {website ? <ContactRow icon={Globe2} label="Website" value={website.replace(/^https?:\/\//, '')} href={website} external /> : null}
                {!location && !phone && !email && !website ? (
                  <div className="p-4 text-xs text-[var(--tk-muted)]">Seller contact details will appear here.</div>
                ) : null}
              </div>

              {/* CTA stack */}
              <div className="grid gap-2 border-t border-[var(--tk-line)] p-4">
                <a
                  href={primaryContact}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-3 text-sm font-medium text-[var(--tk-on-accent)] transition hover:opacity-90"
                >
                  {phone ? <Phone className="h-4 w-4" /> : email ? <Mail className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
                  Contact seller
                </a>
                <Link
                  href="/classified"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[var(--tk-line)] px-5 py-3 text-sm font-medium text-[var(--tk-text)] transition hover:border-[var(--tk-accent)]"
                >
                  Keep browsing The Market
                </Link>
              </div>
            </div>
          </EditableReveal>

          {/* Trust panel */}
          <EditableReveal index={1}>
            <div className="rounded-[var(--editable-radius-lg)] bg-[var(--slot4-page-text)] p-6 text-white">
              <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-white/60">Why buy here</p>
              <ul className="mt-4 space-y-3">
                {[
                  { icon: BadgeCheck, label: 'Independent seller — no chain or reseller.' },
                  { icon: ShieldCheck, label: 'Prices up front. No hidden fees.' },
                  { icon: CheckCircle2, label: 'Direct contact. No inbox in the middle.' },
                ].map(({ icon: Icon, label }) => (
                  <li key={label} className="flex items-start gap-3 text-sm text-white/85">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[var(--tk-accent)]">
                      <Icon className="h-3 w-3" />
                    </span>
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          </EditableReveal>
        </aside>
      </section>

      {/* ---------------- Description + spec table (full-width band) ---------------- */}
      <section className="border-y border-[var(--tk-line)] bg-[var(--slot4-warm)]">
        <div className="mx-auto grid w-full max-w-[var(--editable-container)] gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:px-12">
          <EditableReveal index={0} className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--tk-accent)]">Description</p>
            <h2 className="editable-display mt-3 text-[1.75rem] font-medium leading-[1.15] tracking-[-0.025em] sm:text-[2.25rem]">
              About this listing
            </h2>
            {leadText(post) ? (
              <p className="mt-5 max-w-2xl text-[17px] leading-[1.65] text-[var(--tk-text)]">{leadText(post)}</p>
            ) : null}
            <BodyContent post={post} />
            <TagChips tags={post.tags} />
          </EditableReveal>

          {/* Spec table */}
          <EditableReveal index={1} className="min-w-0">
            <div className="rounded-[var(--editable-radius-lg)] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
              <div className="border-b border-[var(--tk-line)] px-6 py-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-[var(--tk-muted)]">At a glance</p>
                <p className="editable-display mt-1 text-[1.15rem] font-medium tracking-[-0.015em]">Listing details</p>
              </div>
              <dl className="divide-y divide-[var(--tk-line)]">
                {coreSpecs.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[130px_minmax(0,1fr)] gap-3 px-6 py-3">
                    <dt className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--tk-muted)]">{k}</dt>
                    <dd className={`text-sm font-medium ${k === 'Price' ? 'text-[var(--tk-accent)]' : 'text-[var(--tk-text)]'}`}>{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </EditableReveal>
        </div>
      </section>

      {/* ---------------- Inline map (if available) ---------------- */}
      {mapSrc ? (
        <section className="mx-auto w-full max-w-[var(--editable-container)] px-4 py-14 sm:px-6 sm:py-16 lg:px-12">
          <EditableReveal index={0}>
            <MapBox src={mapSrc} label={location || post.title} />
          </EditableReveal>
        </section>
      ) : null}

      {/* ---------------- Similar items — horizontal snap rail ---------------- */}
      {strip.length ? (
        <section className="border-t border-[var(--tk-line)] bg-[var(--slot4-page-bg)]">
          <div className="mx-auto w-full max-w-[var(--editable-container)] px-4 py-16 sm:px-6 sm:py-20 lg:px-12">
            <EditableReveal index={0} className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--tk-accent)]">Keep browsing</p>
                <h2 className="editable-display mt-3 text-[1.75rem] font-medium leading-[1.15] tracking-[-0.025em] sm:text-[2.25rem]">
                  More in {category}
                </h2>
              </div>
              <Link href="/classified" className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--tk-accent)]">
                See all <ArrowUpRight className="h-4 w-4" />
              </Link>
            </EditableReveal>
            <div className="mt-8 flex snap-x gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {strip.slice(0, 6).map((item, i) => (
                <EditableReveal key={item.id || item.slug} index={i} className="w-[280px] shrink-0 snap-start sm:w-[320px]">
                  <StripCard task="classified" post={item} />
                </EditableReveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  )
}

function ContactRow({ icon: Icon, label, value, href, external }: { icon: typeof MapPin; label: string; value: string; href?: string; external?: boolean }) {
  const inner = (
    <div className="flex items-center gap-3 p-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--tk-muted)]">{label}</p>
        <p className="truncate text-sm font-medium text-[var(--tk-text)]">{value}</p>
      </div>
      {href ? <ArrowUpRight className="h-4 w-4 shrink-0 text-[var(--tk-muted)] transition group-hover:text-[var(--tk-accent)]" /> : null}
    </div>
  )
  if (!href) return inner
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="group block transition hover:bg-[var(--tk-raised)]"
    >
      {inner}
    </a>
  )
}

function StripCard({ task, post }: { task: TaskKey; post: SitePost }) {
  const href = `${getTaskConfig(task)?.route || `/${task}`}/${post.slug}`
  const image = getImages(post)[0]
  const price = getField(post, ['price', 'amount', 'budget'])
  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-[var(--editable-radius-lg)] border border-[var(--tk-line)] bg-[var(--tk-surface)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(16,16,16,0.10)]"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-[var(--tk-raised)]">
        {image ? <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" /> : null}
        {price ? (
          <span className="absolute right-3 top-3 rounded-full bg-[var(--tk-accent)] px-3 py-1 text-[13px] font-medium text-[var(--tk-on-accent)]">{price}</span>
        ) : null}
      </div>
      <div className="p-5">
        <h3 className="editable-display line-clamp-2 text-[1.05rem] font-medium leading-[1.2] tracking-[-0.015em]">{post.title}</h3>
   
      </div>
    </Link>
  )
}

/* ============================================================
   PROFILE DETAIL — hidden, direct URL only.
   Split-screen portrait hero, pull-quote, wide body,
   masonry work gallery, full-width dark contact panel.
   No back link. No related-profiles strip. No date.
   ============================================================ */
function ProfileDetail({ post }: { post: SitePost }) {
  const images = getImages(post)
  const portrait = images[0]
  const role = getField(post, ['role', 'designation', 'company', 'title'])
  const location = getField(post, ['location', 'city', 'address'])
  const tagline = getField(post, ['tagline', 'headline', 'oneLiner'])
  const website = getField(post, ['website', 'url'])
  const email = getField(post, ['email'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const twitter = getField(post, ['twitter', 'x'])
  const instagram = getField(post, ['instagram'])
  const workImages = images.slice(1, 13)
  const pullQuote = leadText(post) || tagline || ''

  const contactItems = [
    location ? { icon: MapPin, label: 'Based in', value: location } : null,
    role ? { icon: Building2, label: 'Role', value: role } : null,
    phone ? { icon: Phone, label: 'Phone', value: phone, href: `tel:${phone}` } : null,
    email ? { icon: Mail, label: 'Email', value: email, href: `mailto:${email}` } : null,
    website ? { icon: Globe2, label: 'Website', value: website.replace(/^https?:\/\//, ''), href: website, external: true } : null,
    twitter ? { icon: ExternalLink, label: 'Twitter', value: twitter, href: twitter.startsWith('http') ? twitter : `https://twitter.com/${twitter.replace('@', '')}`, external: true } : null,
    instagram ? { icon: ExternalLink, label: 'Instagram', value: instagram, href: instagram.startsWith('http') ? instagram : `https://instagram.com/${instagram.replace('@', '')}`, external: true } : null,
  ].filter(Boolean) as Array<{ icon: typeof MapPin; label: string; value: string; href?: string; external?: boolean }>

  return (
    <>
      {/* ---------------- SPLIT-SCREEN HERO ---------------- */}
      <section className="relative grid min-h-[calc(100svh-72px)] w-full lg:grid-cols-[1.05fr_0.95fr]">
        {/* Portrait (left) */}
        <div className="relative min-h-[420px] overflow-hidden bg-[var(--tk-raised)] lg:min-h-full">
          {portrait ? (
            <img src={portrait} alt="" className="absolute inset-0 h-full w-full object-cover" loading="eager" fetchPriority="high" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(135deg,var(--tk-accent-soft),var(--slot4-warm))]">
              <span className="editable-display text-[8rem] font-medium leading-none tracking-[-0.04em] text-[var(--tk-accent)]">
                {initialsOf(post.title)}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_45%,rgba(0,0,0,0.35)_100%)] lg:bg-[linear-gradient(90deg,rgba(0,0,0,0.1)_0%,rgba(0,0,0,0)_35%)]" />
          {/* Floating badge */}
          <div className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--slot4-page-text)]">
            <BadgeCheck className="h-3 w-3 text-[var(--tk-accent)]" /> Verified independent
          </div>
        </div>

        {/* Info panel (right) — dark themed */}
        <div className="relative flex flex-col justify-center overflow-hidden bg-[var(--slot4-page-text)] px-6 py-14 text-white sm:px-10 lg:px-14 lg:py-20">
          <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-[var(--tk-accent)] opacity-25 blur-3xl" />
          <EditableReveal index={0} className="relative">
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/60">Seller · Independent</p>
            <h1 className="editable-display mt-4 text-balance text-[2.5rem] font-medium leading-[1.02] tracking-[-0.035em] sm:text-[3.5rem] lg:text-[4rem]">
              {post.title}
            </h1>
            {role || location ? (
              <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] text-white/80">
                {role ? <span>{role}</span> : null}
                {role && location ? <span className="h-1 w-1 rounded-full bg-white/40" /> : null}
                {location ? (
                  <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {location}</span>
                ) : null}
              </p>
            ) : null}

            {/* Compact contact chip row */}
            {contactItems.length ? (
              <div className="mt-8 flex flex-wrap gap-2">
                {contactItems.slice(0, 5).map((c) => {
                  const Icon = c.icon
                  const body = (
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-4 py-2 text-xs font-medium text-white/90 transition hover:border-[var(--tk-accent)] hover:text-white">
                      <Icon className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {c.label}
                    </span>
                  )
                  return c.href ? (
                    <a key={c.label} href={c.href} {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{body}</a>
                  ) : (
                    <span key={c.label}>{body}</span>
                  )
                })}
              </div>
            ) : null}

            {/* Primary CTAs */}
            <div className="mt-10 flex flex-wrap items-center gap-4">
              {website ? (
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-6 py-3 text-sm font-medium text-[var(--tk-on-accent)] transition hover:opacity-90"
                >
                  Visit shopfront <ArrowUpRight className="h-4 w-4" />
                </a>
              ) : null}
              {email ? (
                <a
                  href={`mailto:${email}`}
                  className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition ${
                    website
                      ? 'border border-white/30 text-white hover:bg-white/10'
                      : 'bg-[var(--tk-accent)] text-[var(--tk-on-accent)] hover:opacity-90'
                  }`}
                >
                  <Mail className="h-4 w-4" /> Send an email
                </a>
              ) : null}
              {!website && !email && phone ? (
                <a
                  href={`tel:${phone}`}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-6 py-3 text-sm font-medium text-[var(--tk-on-accent)] transition hover:opacity-90"
                >
                  <Phone className="h-4 w-4" /> Call the seller
                </a>
              ) : null}
            </div>

            {/* Anchor nav (in-page) */}
            <div className="mt-14 flex flex-wrap gap-6 border-t border-white/10 pt-6 text-xs font-medium uppercase tracking-[0.22em] text-white/60">
              <a href="#about" className="transition hover:text-white">About</a>
              {workImages.length ? <a href="#work" className="transition hover:text-white">Their work</a> : null}
              <a href="#contact" className="transition hover:text-white">Contact</a>
            </div>
          </EditableReveal>
        </div>
      </section>

      {/* ---------------- Pull-quote band ---------------- */}
      {pullQuote ? (
        <section className="border-y border-[var(--tk-line)] bg-[var(--slot4-warm)]">
          <div className="mx-auto w-full max-w-5xl px-6 py-16 sm:py-20 lg:px-8 lg:py-24">
            <EditableReveal index={0}>
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--tk-accent)]">In their words</p>
              <blockquote className="editable-display mt-6 text-balance text-[1.75rem] font-medium leading-[1.25] tracking-[-0.02em] text-[var(--tk-text)] sm:text-[2.25rem] lg:text-[2.5rem]">
                <span className="text-[var(--tk-accent)]">“</span>{pullQuote}<span className="text-[var(--tk-accent)]">”</span>
              </blockquote>
            </EditableReveal>
          </div>
        </section>
      ) : null}

      {/* ---------------- About (wide body, no sidebar) ---------------- */}
      <section id="about" className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
        <EditableReveal index={0}>
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--tk-accent)]">About the seller</p>
          <h2 className="editable-display mt-3 text-[1.75rem] font-medium leading-[1.15] tracking-[-0.025em] sm:text-[2.25rem]">
            The story behind the shopfront
          </h2>
          <BodyContent post={post} />
          <TagChips tags={post.tags} />
        </EditableReveal>
      </section>

      {/* ---------------- Masonry work gallery ---------------- */}
      {workImages.length ? (
        <section id="work" className="border-t border-[var(--tk-line)] bg-[var(--slot4-page-bg)]">
          <div className="mx-auto w-full max-w-[var(--editable-container)] px-4 py-16 sm:px-6 sm:py-20 lg:px-12 lg:py-24">
            <EditableReveal index={0} className="max-w-2xl">
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--tk-accent)]">Their work</p>
              <h2 className="editable-display mt-3 text-[1.75rem] font-medium leading-[1.15] tracking-[-0.025em] sm:text-[2.25rem]">
                Selected pieces, listings and drops
              </h2>
            </EditableReveal>
            <div className="mt-10 columns-1 gap-4 [column-fill:_balance] sm:columns-2 lg:columns-3">
              {workImages.map((src, i) => (
                <EditableReveal
                  key={`${src}-${i}`}
                  index={i}
                  className={`mb-4 block break-inside-avoid overflow-hidden rounded-[var(--editable-radius-lg)] border border-[var(--tk-line)] bg-[var(--tk-raised)] ${
                    i % 5 === 0 ? 'aspect-[3/4]' : i % 4 === 0 ? 'aspect-square' : 'aspect-[4/3]'
                  }`}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                </EditableReveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ---------------- Full-width contact panel ---------------- */}
      <section id="contact" className="bg-[var(--slot4-page-text)] text-white">
        <div className="mx-auto w-full max-w-[var(--editable-container)] px-4 py-16 sm:px-6 sm:py-20 lg:px-12 lg:py-24">
          <EditableReveal index={0} className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-16">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-white/60">Contact</p>
              <h2 className="editable-display mt-3 text-[2rem] font-medium leading-[1.1] tracking-[-0.03em] sm:text-[2.75rem]">
                Reach {post.title.split(/\s+/)[0] || 'the seller'} directly.
              </h2>
              <p className="mt-4 max-w-md text-[15px] leading-[1.6] text-white/70">
                Every seller on The Market handles their own listings, questions and delivery — no queue, no intermediary.
              </p>
            </div>

            {contactItems.length ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {contactItems.map((c) => {
                  const Icon = c.icon
                  const inner = (
                    <div className="group flex items-center gap-3 rounded-[var(--editable-radius-lg)] border border-white/15 bg-white/5 p-4 transition hover:border-[var(--tk-accent)] hover:bg-white/10">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--tk-accent)] text-white">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/55">{c.label}</p>
                        <p className="truncate text-sm font-medium text-white">{c.value}</p>
                      </div>
                      {c.href ? <ArrowUpRight className="h-4 w-4 shrink-0 text-white/60 transition group-hover:text-[var(--tk-accent)]" /> : null}
                    </div>
                  )
                  return c.href ? (
                    <a key={c.label} href={c.href} {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{inner}</a>
                  ) : (
                    <div key={c.label}>{inner}</div>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-[var(--editable-radius-lg)] border border-white/15 bg-white/5 p-6 text-sm text-white/70">
                Contact details will appear here once the seller adds them.
              </div>
            )}
          </EditableReveal>
        </div>
      </section>
    </>
  )
}

/* ============================================================
   Remaining task detail views — untouched surface, tokens only
   (Not user-visible but kept functional per contract.)
   ============================================================ */

function ArticleDetail({ post, related, comments }: { post: SitePost; related: SitePost[]; comments: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  const images = getImages(post)
  return (
    <>
      <article className="mx-auto max-w-4xl px-6 py-14 sm:py-20">
        <BackLink task="article" />
        <p className="mt-10 text-xs font-medium uppercase tracking-[0.24em] text-[var(--tk-accent)]">{categoryOf(post, 'Guide')}</p>
        <h1 className="editable-display mt-5 text-balance text-[2.5rem] font-medium leading-[1.05] tracking-[-0.035em] sm:text-[3.5rem]">{post.title}</h1>
        {images[0] ? <img src={images[0]} alt="" className="mt-10 aspect-[16/9] w-full rounded-[var(--editable-radius-lg)] border border-[var(--tk-line)] object-cover" /> : null}
        <BodyContent post={post} />
        <EditableArticleComments slug={post.slug} comments={comments} />
      </article>
      <RelatedStrip task="article" related={related} />
    </>
  )
}

function ListingDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const logo = images[0]
  const address = getField(post, ['address', 'location', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  const mapSrc = mapSrcFor(post)
  return (
    <section className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-20 lg:px-12">
      <BackLink task="listing" />
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
        <article className="min-w-0">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-[var(--editable-radius-lg)] border border-[var(--tk-line)] bg-[var(--tk-raised)]">
              {logo ? <img src={logo} alt="" className="h-full w-full object-cover" /> : <Building2 className="h-12 w-12 text-[var(--tk-muted)]" />}
            </div>
            <div className="min-w-0">
              <Kicker task="listing">Storefront</Kicker>
              <h1 className="editable-display mt-4 text-[2.5rem] font-medium leading-[1.05] tracking-[-0.035em] sm:text-[3.25rem]">{post.title}</h1>
            </div>
          </div>
          {leadText(post) ? <p className="mt-7 max-w-2xl text-lg leading-[1.6] text-[var(--tk-muted)]">{leadText(post)}</p> : null}
          <BodyContent post={post} />
        </article>
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {mapSrc ? <MapBox src={mapSrc} label={address || post.title} /> : null}
          <ContactAction website={website} phone={phone} email={email} />
        </aside>
      </div>
      <RelatedStrip task="listing" related={related} />
    </section>
  )
}

function ImageDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const gallery = images.length ? images : ['/placeholder.svg?height=900&width=1200']
  return (
    <>
      <section className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-20 lg:px-12">
        <BackLink task="image" />
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="columns-1 gap-5 [column-fill:_balance] sm:columns-2">
            {gallery.map((image, index) => (
              <figure key={`${image}-${index}`} className="mb-5 break-inside-avoid overflow-hidden rounded-[var(--editable-radius-lg)] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
                <img src={image} alt="" className="w-full object-cover" />
              </figure>
            ))}
          </div>
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-3.5 py-1.5 text-xs font-medium text-[var(--tk-muted)]"><Camera className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> Showcase</div>
            <h1 className="editable-display mt-6 text-[2.25rem] font-medium leading-[1.06] tracking-[-0.035em] sm:text-[3rem]">{post.title}</h1>
            {leadText(post) ? <p className="mt-6 text-lg leading-[1.6] text-[var(--tk-muted)]">{leadText(post)}</p> : null}
            <BodyContent post={post} compact />
          </aside>
        </div>
      </section>
      <RelatedStrip task="image" related={related} />
    </>
  )
}

function BookmarkDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const website = getField(post, ['website', 'url', 'link'])
  return (
    <>
      <article className="mx-auto max-w-3xl px-6 py-14 sm:py-20">
        <BackLink task="sbm" />
        <div className="mt-10 flex h-16 w-16 items-center justify-center rounded-[var(--editable-radius-lg)] bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]"><Bookmark className="h-7 w-7" /></div>
        <div className="mt-6"><Kicker task="sbm">Resource</Kicker></div>
        <h1 className="editable-display mt-4 text-[2.5rem] font-medium leading-[1.05] tracking-[-0.035em] sm:text-[3.25rem]">{post.title}</h1>
        {leadText(post) ? <p className="mt-6 text-lg leading-[1.6] text-[var(--tk-muted)]">{leadText(post)}</p> : null}
        {website ? (
          <Link href={website} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-3 text-sm font-medium text-[var(--tk-on-accent)] transition hover:opacity-90">
            Open resource <ExternalLink className="h-4 w-4" />
          </Link>
        ) : null}
        <BodyContent post={post} />
      </article>
      <RelatedStrip task="sbm" related={related} />
    </>
  )
}

function PdfDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const fileUrl = getField(post, ['fileUrl', 'pdfUrl', 'documentUrl', 'url'])
  return (
    <section className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-20 lg:px-12">
      <BackLink task="pdf" />
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <article className="min-w-0">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[var(--editable-radius-lg)] bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]"><FileText className="h-9 w-9" /></div>
            <div className="min-w-0">
              <Kicker task="pdf">{categoryOf(post, 'Download')}</Kicker>
              <h1 className="editable-display mt-3 text-[2rem] font-medium leading-[1.1] tracking-[-0.025em] sm:text-[2.5rem]">{post.title}</h1>
            </div>
          </div>
          <BodyContent post={post} />
          {fileUrl ? (
            <div className="mt-10 overflow-hidden rounded-[var(--editable-radius-lg)] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
              <div className="flex items-center justify-between gap-3 border-b border-[var(--tk-line)] p-4">
                <span className="text-sm font-medium">Document preview</span>
                <Link href={fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-4 py-2 text-xs font-medium text-[var(--tk-on-accent)] transition hover:opacity-90">Download <Download className="h-4 w-4" /></Link>
              </div>
              <iframe src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`} title={post.title} className="h-[78vh] w-full bg-[var(--tk-raised)]" />
            </div>
          ) : null}
        </article>
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {fileUrl ? (
            <div className="rounded-[var(--editable-radius-lg)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
              <p className="text-sm font-medium">Get this document</p>
              <p className="mt-2 text-sm leading-[1.6] text-[var(--tk-muted)]">Open or download the full file in a new tab.</p>
              <Link href={fileUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-3 text-sm font-medium text-[var(--tk-on-accent)] transition hover:opacity-90">Download <Download className="h-4 w-4" /></Link>
            </div>
          ) : null}
          <RelatedPanel task="pdf" related={related} />
        </aside>
      </div>
    </section>
  )
}

function ContactAction({ website, phone, email }: { website?: string; phone?: string; email?: string }) {
  if (!website && !phone && !email) return null
  return (
    <div className="rounded-[var(--editable-radius-lg)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
      <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--tk-muted)]">Quick actions</p>
      <div className="mt-4 flex flex-wrap gap-2.5">
        {website ? <Link href={website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-4 py-2.5 text-sm font-medium text-[var(--tk-on-accent)] transition hover:opacity-90">Website <ExternalLink className="h-4 w-4" /></Link> : null}
        {phone ? <a href={`tel:${phone}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-4 py-2.5 text-sm font-medium transition hover:border-[var(--tk-accent)]"><Phone className="h-4 w-4" /> Call</a> : null}
        {email ? <a href={`mailto:${email}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-4 py-2.5 text-sm font-medium transition hover:border-[var(--tk-accent)]"><Mail className="h-4 w-4" /> Email</a> : null}
      </div>
    </div>
  )
}

function RelatedPanel({ task, related }: { task: TaskKey; related: SitePost[] }) {
  if (!related.length) return null
  const taskConfig = getTaskConfig(task)
  return (
    <div className="rounded-[var(--editable-radius-lg)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="editable-display text-lg font-medium tracking-[-0.02em]">More like this</h2>
        <Link href={taskConfig?.route || '/'} className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--tk-accent)]">View all</Link>
      </div>
      <div className="mt-5 grid gap-3">
        {related.map((item) => (
          <Link key={item.id || item.slug} href={`${taskConfig?.route || `/${task}`}/${item.slug}`} className="group flex gap-3 rounded-[var(--editable-radius)] border border-[var(--tk-line)] p-3 transition hover:border-[var(--tk-accent)]">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[var(--editable-radius)] bg-[var(--tk-raised)]">
              <FileText className="h-5 w-5 text-[var(--tk-muted)]" />
            </div>
            <div className="min-w-0">
              <h3 className="line-clamp-2 text-sm font-medium leading-[1.3] tracking-[-0.01em]">{item.title}</h3>
             
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function RelatedStrip({ task, related }: { task: TaskKey; related: SitePost[] }) {
  // Profile is hidden — never surface a related-profiles strip.
  if (!related.length || isUiHiddenTask(task)) return null
  const taskConfig = getTaskConfig(task)
  return (
    <section className="border-t border-[var(--tk-line)]">
      <div className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-16 lg:px-12">
        <div className="flex items-center justify-between">
          <h2 className="editable-display text-2xl font-medium tracking-[-0.02em]">More {(taskConfig?.label || 'posts').toLowerCase()}</h2>
          <Link href={taskConfig?.route || '/'} className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--tk-accent)]">View all <ArrowUpRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((item, i) => (
            <EditableReveal key={item.id || item.slug} index={i}>
              <StripCard task={task} post={item} />
            </EditableReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
