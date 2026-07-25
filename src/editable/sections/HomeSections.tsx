import Link from 'next/link'
import {
  ArrowRight, ArrowUpRight, Check, ChevronDown, ChevronRight,
  Handshake, MapPin, PackageOpen, ShoppingBag, Sparkles, Store, Tag,
} from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { HomeTimeSection } from '@/lib/task-data'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import {
  getEditablePostImage, postHref, toPlainText,
  getPostPrice, getPostLocation, getPostCondition,
} from '@/editable/cards/PostCards'
import { EditableReveal } from '@/editable/shell/EditableReveal'

type HomeSectionProps = {
  primaryTask: TaskKey
  primaryRoute: string
  posts: SitePost[]
  timeSections: HomeTimeSection[]
}

/* ------------------ helpers ------------------ */

const container = 'mx-auto w-full max-w-[var(--editable-container)] px-4 sm:px-6 lg:px-12'

function getContent(post?: SitePost | null) {
  return post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
}
function excerpt(post?: SitePost | null, limit = 130) {
  const c = getContent(post)
  const raw =
    (typeof c.description === 'string' && c.description) ||
    (typeof c.summary === 'string' && c.summary) ||
    (typeof post?.summary === 'string' && post.summary) ||
    (typeof c.body === 'string' && c.body) ||
    (typeof c.excerpt === 'string' && c.excerpt) ||
    ''
  const clean = toPlainText(raw)
  return clean.length > limit ? `${clean.slice(0, limit).trim()}…` : clean
}
function categoryOf(post?: SitePost | null) {
  const c = getContent(post)
  return (typeof c.category === 'string' && c.category) || post?.tags?.[0] || 'The Market'
}
function dedupePosts(posts: SitePost[]) {
  const seen = new Set<string>()
  const out: SitePost[] = []
  for (const p of posts) {
    const key = p.slug || p.id || p.title
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(p)
  }
  return out
}
function latestImages(posts: SitePost[], max = 6) {
  const seen = new Set<string>()
  const out: string[] = []
  for (const p of posts) {
    const img = getEditablePostImage(p)
    if (!img || img.includes('placeholder') || seen.has(img)) continue
    seen.add(img)
    out.push(img)
    if (out.length >= max) break
  }
  return out
}

/* ============================================================
   1. HERO — reference layout: burnt-orange full-bleed section
   with right-side photo, mid-left quote, giant cropped wordmark
   ============================================================ */
export function EditableHomeHero({ posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((s) => s.posts)])
  const images = latestImages(pool)
  const c = pagesContent.home
  const heroImage = images[0] || '/placeholder.svg?height=1200&width=900'
  const quote = c.hero.description
  const wordmark = SITE_CONFIG.name

  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden bg-[var(--slot4-accent)] text-white">
      {/* Right-side photo. Full-height on desktop, top-fade on mobile. */}
      <div className="pointer-events-none absolute inset-y-0 right-0 z-0 w-full sm:w-[62%] lg:w-[54%] xl:w-[52%]">
        <img
          src={heroImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
          loading="eager"
          fetchPriority="high"
        />
        {/* Warm burnt-orange wash so the photo blends into the section. */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--slot4-accent)_0%,rgba(204,78,0,0.45)_38%,rgba(204,78,0,0)_65%)] sm:bg-[linear-gradient(90deg,var(--slot4-accent)_0%,rgba(204,78,0,0.35)_28%,rgba(204,78,0,0)_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(120%_60%_at_100%_50%,rgba(0,0,0,0.15),transparent_60%)]" />
      </div>

      {/* Foreground content */}
      <div className={`relative z-10 flex min-h-[100svh] flex-col ${container}`}>
        {/* Spacer for the fixed/absolute nav (~112px) */}
        <div className="h-[112px] shrink-0" aria-hidden="true" />

        {/* Mid-left quote block */}
        <div className="flex flex-1 items-center">
          <EditableReveal index={0} className="max-w-2xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-white/70">
              {c.hero.badge}
            </p>
            <p className="editable-display mt-6 text-[1.75rem] font-medium leading-[1.15] tracking-[-0.02em] text-white sm:text-[2rem] lg:text-[2.5rem]">
              {quote}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href={c.hero.primaryCta.href}
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-[var(--slot4-accent)] transition duration-300 hover:bg-white/90"
              >
                {c.hero.primaryCta.label} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={c.hero.secondaryCta.href}
                className="inline-flex items-center gap-2 text-sm font-medium text-white/90 underline-offset-4 transition hover:text-white hover:underline"
              >
                {c.hero.secondaryCta.label} <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </EditableReveal>
        </div>

        {/* Giant cropped wordmark at the bottom — uses SITE_CONFIG.name */}
        <div className="pointer-events-none relative -mb-[10vw] mt-8 select-none overflow-hidden">
          <p
            className="editable-display block whitespace-nowrap font-medium leading-[0.82] tracking-[-0.05em] text-white"
            style={{ fontSize: 'clamp(6rem, 22vw, 22rem)' }}
          >
            {wordmark}
          </p>
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   2. CATEGORIES MARQUEE — infinite strip
   ============================================================ */
export function EditableCategoriesMarquee({ posts }: HomeSectionProps) {
  const pool = dedupePosts(posts)
  const chips = new Set<string>()
  for (const p of pool) {
    const c = categoryOf(p)
    if (c && c.length < 30) chips.add(String(c))
    if (chips.size >= 18) break
  }
  const list = chips.size >= 6 ? Array.from(chips) : ['Furniture', 'Vintage', 'Tools', 'Lighting', 'Home & decor', 'Bikes', 'Books', 'Kitchen', 'Electronics', 'Art', 'Plants', 'Clothing']
  const track = [...list, ...list]
  return (
    <section className="relative overflow-hidden border-y border-[var(--editable-border)] bg-[var(--slot4-warm)] py-6">
      <div className="relative overflow-hidden">
        <div className="editable-marquee-track flex w-max items-center gap-6 whitespace-nowrap">
          {track.map((chip, i) => (
            <span key={`${chip}-${i}`} className="inline-flex items-center gap-3 text-[13px] font-medium uppercase tracking-[0.2em] text-[var(--slot4-page-text)]/80">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--slot4-accent)]" />
              {chip}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   3. ALTERNATING CHECKMARK FEATURES
   ============================================================ */
export function EditableFeatureRows({ posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((s) => s.posts)])
  const images = latestImages(pool, 4)
  const c = pagesContent.home
  const rows = c.features.map((f, i) => ({
    ...f,
    image: images[i] || images[i % Math.max(images.length, 1)] || '/placeholder.svg?height=800&width=1000',
    flip: i % 2 === 1,
  }))
  if (!rows.length) return null

  return (
    <section className="bg-[var(--slot4-page-bg)]">
      <div className={`${container} py-20 sm:py-24 lg:py-28`}>
        <EditableReveal index={0} className="max-w-3xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-accent)]">Why The Market</p>
          <h2 className="editable-display mt-4 text-[2rem] font-medium leading-[1.1] tracking-[-0.03em] sm:text-[2.5rem] lg:text-[3rem]">
            Built the way a marketplace should feel.
          </h2>
        </EditableReveal>

        <div className="mt-14 space-y-16 sm:space-y-24">
          {rows.map((row, i) => (
            <EditableReveal key={row.title} index={i} className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
              <div className={`${row.flip ? 'lg:order-2' : ''} relative aspect-[5/4] w-full overflow-hidden rounded-[var(--editable-radius-xl)] bg-[var(--slot4-media-bg)]`}>
                <img src={row.image} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
              </div>
              <div className={`${row.flip ? 'lg:order-1' : ''} min-w-0`}>
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--slot4-accent)]">Feature 0{i + 1}</p>
                <h3 className="editable-display mt-3 text-[1.75rem] font-medium leading-[1.15] tracking-[-0.025em] sm:text-[2rem] lg:text-[2.25rem]">
                  {row.title}
                </h3>
                <p className="mt-4 max-w-lg text-[17px] leading-[1.6] text-[var(--slot4-muted-text)]">{row.body}</p>
                <ul className="mt-6 space-y-3">
                  {[
                    'No promoted or algorithmic ranking',
                    'Direct contact with every seller',
                    'Prices, condition and location up front',
                  ].map((line) => (
                    <li key={line} className="flex items-start gap-3 text-[15px] text-[var(--slot4-page-text)]">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]">
                        <Check className="h-3 w-3" />
                      </span>
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </EditableReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   4. CATEGORY GRID — icon tiles
   ============================================================ */
const CATEGORY_TILES: Array<{ slug: string; label: string; icon: typeof Store; note: string }> = [
  { slug: 'furniture', label: 'Furniture', icon: Store, note: 'Chairs, tables, storage' },
  { slug: 'home', label: 'Home & decor', icon: PackageOpen, note: 'Lighting, textiles, art' },
  { slug: 'vintage', label: 'Vintage', icon: Sparkles, note: 'One-of-a-kind finds' },
  { slug: 'tools', label: 'Tools & tech', icon: Handshake, note: 'Workshop and studio kit' },
  { slug: 'garden', label: 'Garden', icon: Tag, note: 'Outdoor, plants, tools' },
  { slug: 'other', label: 'Everything else', icon: ShoppingBag, note: 'Kitchen, books, bikes…' },
]

export function EditableCategoryGrid() {
  return (
    <section className="bg-[var(--slot4-warm)]">
      <div className={`${container} py-20 sm:py-24 lg:py-28`}>
        <EditableReveal index={0} className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-accent)]">
              {pagesContent.home.categoriesHeading}
            </p>
            <h2 className="editable-display mt-4 text-[2rem] font-medium leading-[1.1] tracking-[-0.03em] sm:text-[2.5rem]">
              {pagesContent.home.categoriesSubheading}
            </h2>
          </div>
          <Link
            href="/classified"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--slot4-page-text)] hover:text-[var(--slot4-accent)]"
          >
            See every category <ArrowRight className="h-4 w-4" />
          </Link>
        </EditableReveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORY_TILES.map((tile, i) => {
            const Icon = tile.icon
            return (
              <EditableReveal key={tile.slug} index={i}>
                <Link
                  href={`/classified?category=${tile.slug}`}
                  className="group flex h-full flex-col justify-between gap-6 rounded-[var(--editable-radius-lg)] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-7 transition duration-500 hover:-translate-y-1 hover:border-[var(--slot4-page-text)] hover:shadow-[0_22px_50px_rgba(16,16,16,0.08)]"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="editable-display text-[1.35rem] font-medium tracking-[-0.02em]">{tile.label}</h3>
                    <p className="mt-2 text-sm text-[var(--slot4-muted-text)]">{tile.note}</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--slot4-accent)]">
                    Browse {tile.label.toLowerCase()} <ArrowUpRight className="h-4 w-4" />
                  </span>
                </Link>
              </EditableReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   5. FEATURED + STATS BAND
   ============================================================ */
export function EditableFeaturedAndStats({ posts, timeSections, primaryTask, primaryRoute }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((s) => s.posts)])
  const featured = pool.slice(0, 4)
  if (!featured.length) return null
  const [primary, ...rest] = featured
  return (
    <section className="bg-[var(--slot4-page-bg)]">
      <div className={`${container} py-20 sm:py-24 lg:py-28`}>
        <div className="grid gap-14 lg:grid-cols-[1.2fr_0.8fr] lg:items-start lg:gap-16">
          <div>
            <EditableReveal index={0} className="flex items-end justify-between gap-4">
              <div className="max-w-xl">
                <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-accent)]">
                  {pagesContent.home.featuredHeading}
                </p>
                <h2 className="editable-display mt-3 text-[2rem] font-medium leading-[1.1] tracking-[-0.03em] sm:text-[2.5rem]">
                  {pagesContent.home.featuredSubheading}
                </h2>
              </div>
              <Link href={primaryRoute} className="hidden items-center gap-1.5 text-sm font-medium text-[var(--slot4-page-text)] hover:text-[var(--slot4-accent)] sm:inline-flex">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </EditableReveal>

            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              <EditableReveal index={1} className="sm:col-span-2">
                <FeatureBigCard post={primary} href={postHref(primaryTask, primary, primaryRoute)} />
              </EditableReveal>
              {rest.slice(0, 2).map((p, i) => (
                <EditableReveal key={p.id || p.slug} index={i + 2}>
                  <FeatureSmallCard post={p} href={postHref(primaryTask, p, primaryRoute)} />
                </EditableReveal>
              ))}
            </div>
          </div>

          <EditableReveal index={2}>
            <div className="rounded-[var(--editable-radius-xl)] bg-[var(--slot4-page-text)] p-8 text-white sm:p-10">
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-white/70">The Market, in numbers</p>
              <h3 className="editable-display mt-3 text-[1.75rem] font-medium leading-[1.15] tracking-[-0.025em]">
                A marketplace that stays small, on purpose.
              </h3>
              <div className="mt-8 grid grid-cols-2 gap-6">
                {pagesContent.home.stats.map((s) => (
                  <div key={s.label}>
                    <p className="editable-display text-[2.25rem] font-medium leading-none tracking-[-0.03em] text-white">{s.value}</p>
                    <p className="mt-2 text-sm text-white/70">{s.label}</p>
                  </div>
                ))}
              </div>
              <Link
                href="/about"
                className="mt-10 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-[var(--slot4-page-text)] transition hover:bg-[var(--slot4-accent-soft)]"
              >
                About The Market <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </EditableReveal>
        </div>
      </div>
    </section>
  )
}

function FeatureBigCard({ post, href }: { post: SitePost; href: string }) {
  const price = getPostPrice(post)
  const location = getPostLocation(post)
  return (
    <Link href={href} className="group grid gap-6 overflow-hidden rounded-[var(--editable-radius-xl)] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-5 transition duration-500 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(16,16,16,0.10)] sm:grid-cols-[1.15fr_1fr] sm:p-6">
      <div className="relative aspect-[5/4] overflow-hidden rounded-[var(--editable-radius-lg)] bg-[var(--slot4-media-bg)]">
        <img src={getEditablePostImage(post)} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
      </div>
      <div className="flex flex-col justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--slot4-accent)]">{categoryOf(post)}</p>
          <h3 className="editable-display mt-3 text-[1.6rem] font-medium leading-[1.15] tracking-[-0.02em] sm:text-[2rem]">
            {post.title}
          </h3>
          <p className="mt-3 line-clamp-3 text-[15px] leading-[1.55] text-[var(--slot4-muted-text)]">{excerpt(post, 190)}</p>
        </div>
        <div className="mt-6 flex items-center justify-between gap-3">
          {price ? (
            <span className="editable-display text-2xl font-medium text-[var(--slot4-accent)]">{price}</span>
          ) : (
            <span className="text-sm text-[var(--slot4-muted-text)]">Open offer</span>
          )}
          {location ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--slot4-muted-text)]">
              <MapPin className="h-3.5 w-3.5" /> {location}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  )
}

function FeatureSmallCard({ post, href }: { post: SitePost; href: string }) {
  const price = getPostPrice(post)
  return (
    <Link href={href} className="group block overflow-hidden rounded-[var(--editable-radius-lg)] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(16,16,16,0.10)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--slot4-media-bg)]">
        <img src={getEditablePostImage(post)} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
        {price ? (
          <span className="absolute right-3 top-3 rounded-full bg-[var(--slot4-accent)] px-3 py-1 text-[13px] font-medium text-[var(--slot4-on-accent)]">{price}</span>
        ) : null}
      </div>
      <div className="p-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--slot4-accent)]">{categoryOf(post)}</p>
        <h3 className="editable-display mt-2 line-clamp-2 text-[1.15rem] font-medium leading-[1.2] tracking-[-0.015em]">{post.title}</h3>
      </div>
    </Link>
  )
}

/* ============================================================
   6. LISTING GRIDS — dynamic time collections
   ============================================================ */
const sectionCopy: Record<string, { eyebrow: string; title: string }> = {
  spotlight: { eyebrow: 'Fresh this week', title: 'Just added to The Market' },
  browse: { eyebrow: 'Trending', title: 'Moving fast this month' },
  index: { eyebrow: 'From the back shelf', title: 'Still available from the archive' },
}

export function EditableTimeCollections({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const sections =
    timeSections.length > 0
      ? timeSections
      : ([
          { key: 'spotlight', posts: posts.slice(0, 8), href: primaryRoute },
          { key: 'browse', posts: posts.slice(8, 16), href: primaryRoute },
          { key: 'index', posts: posts.slice(16, 24), href: primaryRoute },
        ] as Pick<HomeTimeSection, 'key' | 'posts' | 'href'>[])
  const visible = sections.filter((s) => s.posts.length)
  if (!visible.length) return null

  return (
    <>
      {visible.map((section, index) => {
        const copy = sectionCopy[section.key] || { eyebrow: 'The Market', title: 'More to browse' }
        return (
          <section key={section.key} className={index % 2 === 0 ? 'bg-[var(--slot4-page-bg)]' : 'bg-[var(--slot4-warm)]'}>
            <div className={`${container} py-20 sm:py-24 lg:py-28`}>
              <EditableReveal index={0} className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-accent)]">{copy.eyebrow}</p>
                  <h2 className="editable-display mt-3 text-[2rem] font-medium leading-[1.1] tracking-[-0.03em] sm:text-[2.5rem]">
                    {copy.title}
                  </h2>
                </div>
                <Link
                  href={section.href || primaryRoute}
                  className="hidden items-center gap-1.5 text-sm font-medium text-[var(--slot4-page-text)] hover:text-[var(--slot4-accent)] sm:inline-flex"
                >
                  See all <ArrowRight className="h-4 w-4" />
                </Link>
              </EditableReveal>

              <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {section.posts.slice(0, 8).map((post, i) => (
                  <EditableReveal key={post.id || post.slug} index={i}>
                    <ListingGridCard post={post} href={postHref(primaryTask, post, primaryRoute)} />
                  </EditableReveal>
                ))}
              </div>
            </div>
          </section>
        )
      })}
    </>
  )
}

function ListingGridCard({ post, href }: { post: SitePost; href: string }) {
  const price = getPostPrice(post)
  const location = getPostLocation(post)
  const condition = getPostCondition(post)
  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-[var(--editable-radius-lg)] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(16,16,16,0.10)]"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-[var(--slot4-media-bg)]">
        <img
          src={getEditablePostImage(post)}
          alt={post.title}
          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
          loading="lazy"
        />
        {condition ? (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--slot4-page-text)]">
            {condition}
          </span>
        ) : null}
        {price ? (
          <span className="absolute right-3 top-3 rounded-full bg-[var(--slot4-accent)] px-3 py-1 text-[13px] font-medium text-[var(--slot4-on-accent)]">
            {price}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--slot4-accent)]">{categoryOf(post)}</p>
        <h3 className="editable-display mt-2 line-clamp-2 text-[1.15rem] font-medium leading-[1.2] tracking-[-0.015em] text-[var(--slot4-page-text)]">
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-[1.5] text-[var(--slot4-muted-text)]">{excerpt(post, 110)}</p>
        <div className="mt-4 flex items-center justify-between border-t border-[var(--editable-border)] pt-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--slot4-muted-text)]">
            {location ? (<><MapPin className="h-3.5 w-3.5" /> {location}</>) : 'Independent seller'}
          </span>
          <ArrowUpRight className="h-4 w-4 text-[var(--slot4-accent)] transition group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  )
}

/* ============================================================
   7. TESTIMONIALS — social proof band
   ============================================================ */
export function EditableSocialProof() {
  const t = pagesContent.home.testimonials
  return (
    <section className="bg-[var(--slot4-warm)]">
      <div className={`${container} py-20 sm:py-24 lg:py-28`}>
        <EditableReveal index={0} className="max-w-2xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-accent)]">{t.badge}</p>
          <h2 className="editable-display mt-3 text-[2rem] font-medium leading-[1.1] tracking-[-0.03em] sm:text-[2.5rem]">{t.title}</h2>
        </EditableReveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {t.items.map((item, i) => (
            <EditableReveal key={item.name} index={i}>
              <figure className="flex h-full flex-col rounded-[var(--editable-radius-lg)] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-7">
                <blockquote className="editable-display text-[1.15rem] font-medium leading-[1.4] tracking-[-0.01em] text-[var(--slot4-page-text)]">
                  “{item.quote}”
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--slot4-accent-soft)] text-sm font-medium text-[var(--slot4-accent)]">
                    {item.name.charAt(0)}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-[var(--slot4-page-text)]">{item.name}</p>
                    <p className="text-xs text-[var(--slot4-muted-text)]">{item.role}</p>
                  </div>
                </figcaption>
              </figure>
            </EditableReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   8. FAQ ACCORDION
   ============================================================ */
export function EditableFaq() {
  const f = pagesContent.home.faq
  return (
    <section className="bg-[var(--slot4-page-bg)]">
      <div className={`${container} py-20 sm:py-24 lg:py-28`}>
        <div className="grid gap-10 lg:grid-cols-[0.45fr_0.55fr] lg:gap-16">
          <EditableReveal index={0}>
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-accent)]">{f.badge}</p>
            <h2 className="editable-display mt-4 text-[2rem] font-medium leading-[1.1] tracking-[-0.03em] sm:text-[2.5rem] lg:text-[3rem]">
              {f.title}
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-[1.6] text-[var(--slot4-muted-text)]">
              Something we did not cover?{' '}
              <Link href="/contact" className="text-[var(--slot4-accent)] underline-offset-4 hover:underline">
                Ask us directly →
              </Link>
            </p>
          </EditableReveal>

          <EditableReveal index={1}>
            <div className="divide-y divide-[var(--editable-border)] rounded-[var(--editable-radius-lg)] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)]">
              {f.items.map((item, i) => (
                <details key={item.q} className="group px-6 py-5 open:bg-[var(--slot4-cream)]" open={i === 0}>
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-left">
                    <span className="text-[1.05rem] font-medium leading-[1.35] text-[var(--slot4-page-text)]">{item.q}</span>
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--editable-border-strong)] text-[var(--slot4-page-text)] transition group-open:rotate-180">
                      <ChevronDown className="h-3.5 w-3.5" />
                    </span>
                  </summary>
                  <p className="mt-3 text-[15px] leading-[1.6] text-[var(--slot4-muted-text)]">{item.a}</p>
                </details>
              ))}
            </div>
          </EditableReveal>
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   9. CLOSING CTA BAND
   ============================================================ */
export function EditableHomeCta() {
  const c = pagesContent.home.cta
  return (
    <section id="post-a-listing" className="scroll-mt-24 bg-[var(--slot4-accent)]">
      <div className={`${container} flex flex-col items-start gap-8 py-20 sm:py-24 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:py-28`}>
        <EditableReveal index={0} className="max-w-2xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-white/80">{c.badge}</p>
          <h2 className="editable-display mt-4 text-[2rem] font-medium leading-[1.1] tracking-[-0.03em] text-white sm:text-[2.75rem] lg:text-[3.25rem]">
            {c.title}
          </h2>
          <p className="mt-5 max-w-xl text-[17px] leading-[1.6] text-white/90">{c.description}</p>
        </EditableReveal>
        <EditableReveal index={1} className="flex flex-wrap items-center gap-4">
          <Link
            href={c.primaryCta.href}
            className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-medium text-[var(--slot4-accent)] transition hover:bg-[var(--slot4-accent-soft)]"
          >
            {c.primaryCta.label} <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={c.secondaryCta.href}
            className="inline-flex items-center gap-2 rounded-full border border-white/60 px-7 py-3.5 text-sm font-medium text-white transition hover:bg-white/10"
          >
            {c.secondaryCta.label} <ChevronRight className="h-4 w-4" />
          </Link>
        </EditableReveal>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------
   Back-compat wrappers so HomePage's existing imports keep working.
   ------------------------------------------------------------ */
export function EditableStoryRail(_props: HomeSectionProps) {
  return <EditableCategoryGrid />
}
export function EditableMagazineSplit(props: HomeSectionProps) {
  return <EditableFeaturedAndStats {...props} />
}
