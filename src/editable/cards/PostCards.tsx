import Link from 'next/link'
import { ArrowUpRight, MapPin, Tag } from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { TaskKey } from '@/lib/site-config'
import { editableDesignContract as dc, editablePalette as pal } from '@/editable/layouts/design-contract'

/*
  Reference-style cards for The Market. Warm neutral surfaces, hairline
  borders, DM Sans, subtle hover lift. Every card leads with price when
  present and always shows a direct route to the listing.
*/

export function getEditablePostImage(post?: SitePost | null) {
  const media = Array.isArray(post?.media) ? post?.media : []
  const mediaUrl = media.find((item) => typeof item?.url === 'string' && item.url)?.url
  const content = post?.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
  const images = Array.isArray(content.images) ? content.images : []
  const contentImage = images.find((url): url is string => typeof url === 'string' && Boolean(url))
  const logo = typeof content.logo === 'string' ? content.logo : ''
  const featured = typeof content.featuredImage === 'string' ? content.featuredImage : ''
  const thumb = typeof content.thumbnail === 'string' ? content.thumbnail : ''
  return mediaUrl || contentImage || featured || thumb || logo || '/placeholder.svg?height=900&width=1400'
}

export function toPlainText(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value
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
}

export function getEditableExcerpt(post?: SitePost | null, limit = 150) {
  const content = post?.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
  const raw =
    (typeof content.description === 'string' && content.description) ||
    (typeof content.summary === 'string' && content.summary) ||
    (typeof post?.summary === 'string' && post.summary) ||
    (typeof content.body === 'string' && content.body) ||
    (typeof content.excerpt === 'string' && content.excerpt) ||
    ''
  const clean = toPlainText(raw)
  return clean.length > limit ? `${clean.slice(0, limit).trim()}…` : clean
}

export function getEditableCategory(post?: SitePost | null) {
  const content = post?.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
  return (typeof content.category === 'string' && content.category) || post?.tags?.[0] || 'Fresh'
}

function getField(post: SitePost, keys: string[]) {
  const content = post?.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
  for (const k of keys) {
    const v = content[k]
    if (typeof v === 'string' && v.trim()) return v.trim()
  }
  return ''
}
export function getPostPrice(post: SitePost) {
  return getField(post, ['price', 'amount', 'budget'])
}
export function getPostLocation(post: SitePost) {
  return getField(post, ['location', 'address', 'city'])
}
export function getPostCondition(post: SitePost) {
  return getField(post, ['condition', 'availability', 'type'])
}

export function postHref(task: TaskKey, post: SitePost, route = `/${task}`) {
  return `${route}/${post.slug}`
}

/* ---------- Big marquee card (hero side / featured) ---------- */
export function EditorialFeatureCard({
  post,
  href,
  label = 'Featured on The Market',
}: {
  post: SitePost
  href: string
  label?: string
}) {
  const price = getPostPrice(post)
  const category = getEditableCategory(post)
  return (
    <Link
      href={href}
      className={`group relative block min-w-0 overflow-hidden rounded-[var(--editable-radius-xl)] ${pal.darkBg} ${pal.darkText} transition duration-500 hover:-translate-y-1`}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[5/6] lg:aspect-[4/5]">
        <img
          src={getEditablePostImage(post)}
          alt={post.title}
          className="absolute inset-0 h-full w-full object-cover opacity-90 transition duration-700 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.05)_25%,rgba(0,0,0,0.72))]" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-3 p-6">
          <span className="rounded-full bg-white/95 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--slot4-page-text)]">
            {label}
          </span>
          {price ? (
            <span className="rounded-full bg-[var(--slot4-accent)] px-3 py-1 text-[13px] font-medium text-[var(--slot4-on-accent)]">
              {price}
            </span>
          ) : null}
        </div>
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-white/70">{category}</p>
          <h3 className="editable-display mt-3 line-clamp-3 max-w-2xl text-[2rem] font-medium leading-[1.08] tracking-[-0.02em] sm:text-[2.5rem]">
            {post.title}
          </h3>
          <p className="mt-3 max-w-xl text-sm leading-[1.6] text-white/80 sm:text-base">
            {getEditableExcerpt(post, 160)}
          </p>
          <span className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-[var(--slot4-page-text)]">
            View listing <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}

/* ---------- Rail card (horizontal snap rails) ---------- */
export function RailPostCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const price = getPostPrice(post)
  const category = getEditableCategory(post)
  return (
    <Link
      href={href}
      className={`group ${dc.layout.minRailCard} block overflow-hidden rounded-[var(--editable-radius-lg)] border ${pal.border} ${pal.surfaceBg} transition duration-500 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(16,16,16,0.10)]`}
    >
      <div className={`${dc.media.frame} aspect-[4/5]`}>
        <img
          src={getEditablePostImage(post)}
          alt={post.title}
          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
        />
        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--slot4-page-text)]">
          No. {String(index + 1).padStart(2, '0')}
        </span>
        {price ? (
          <span className="absolute right-4 top-4 rounded-full bg-[var(--slot4-accent)] px-3 py-1 text-[13px] font-medium text-[var(--slot4-on-accent)]">
            {price}
          </span>
        ) : null}
      </div>
      <div className="p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--slot4-accent)]">{category}</p>
        <h3 className="editable-display mt-3 line-clamp-2 text-[1.35rem] font-medium leading-[1.15] tracking-[-0.02em] text-[var(--slot4-page-text)]">
          {post.title}
        </h3>
        <p className="mt-3 line-clamp-2 text-sm leading-[1.6] text-[var(--slot4-muted-text)]">
          {getEditableExcerpt(post, 120)}
        </p>
      </div>
    </Link>
  )
}

/* ---------- Compact side-listed card ---------- */
export function CompactIndexCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const price = getPostPrice(post)
  const location = getPostLocation(post)
  return (
    <Link
      href={href}
      className={`group block min-w-0 rounded-[var(--editable-radius)] border ${pal.border} ${pal.surfaceBg} p-5 transition duration-500 hover:border-[var(--slot4-page-text)] hover:-translate-y-1`}
    >
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--slot4-accent-soft)] text-sm font-medium text-[var(--slot4-accent)]">
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--slot4-accent)]">
            <Tag className="h-3.5 w-3.5" /> {getEditableCategory(post)}
          </p>
          <h3 className="editable-display mt-2 line-clamp-2 text-[1.15rem] font-medium leading-[1.2] tracking-[-0.015em] text-[var(--slot4-page-text)]">
            {post.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-[1.55] text-[var(--slot4-muted-text)]">
            {getEditableExcerpt(post, 110)}
          </p>
          {price || location ? (
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-medium text-[var(--slot4-muted-text)]">
              {price ? <span className="text-[var(--slot4-accent)]">{price}</span> : null}
              {location ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {location}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </Link>
  )
}

/* ---------- Horizontal list card ---------- */
export function ArticleListCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const price = getPostPrice(post)
  return (
    <Link
      href={href}
      className={`group grid min-w-0 gap-6 overflow-hidden rounded-[var(--editable-radius-lg)] border ${pal.border} ${pal.surfaceBg} p-4 transition duration-500 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(16,16,16,0.10)] sm:grid-cols-[240px_minmax(0,1fr)]`}
    >
      <div className={`${dc.media.frame} aspect-[4/3] sm:aspect-auto sm:min-h-[200px]`}>
        <img
          src={getEditablePostImage(post)}
          alt={post.title}
          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
        />
      </div>
      <div className="min-w-0 p-2 sm:py-5 sm:pr-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--slot4-accent)]">
          On the shelves · {String(index + 1).padStart(2, '0')}
        </p>
        <h2 className="editable-display mt-3 line-clamp-3 text-[1.75rem] font-medium leading-[1.15] tracking-[-0.02em] text-[var(--slot4-page-text)] sm:text-[2rem]">
          {post.title}
        </h2>
        <p className="mt-3 line-clamp-3 text-sm leading-[1.6] text-[var(--slot4-muted-text)] sm:text-[15px]">
          {getEditableExcerpt(post, 180)}
        </p>
        <div className="mt-5 flex items-center justify-between gap-3">
          {price ? (
            <span className="rounded-full bg-[var(--slot4-accent-soft)] px-4 py-1.5 text-sm font-medium text-[var(--slot4-accent)]">
              {price}
            </span>
          ) : (
            <span className="rounded-full bg-[var(--slot4-panel-bg)] px-4 py-1.5 text-sm font-medium text-[var(--slot4-muted-text)]">
              Open offer
            </span>
          )}
          <span className="inline-flex items-center gap-2 text-sm font-medium text-[var(--slot4-page-text)]">
            View listing <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}
