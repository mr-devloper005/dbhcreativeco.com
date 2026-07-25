import type { TaskKey } from '@/lib/site-config'

export type TaskPageVoice = {
  eyebrow: string
  headline: string
  description: string
  filterLabel: string
  secondaryNote: string
  chips: string[]
}

/*
  Voice per task page. Only `classified` (The Market) and `profile` (seller
  detail, direct-URL only) are user-facing — the rest are here to keep
  every taskable route functional if it ever gets flipped back on.
*/

export const taskPageVoices = {
  classified: {
    eyebrow: 'The Market',
    headline: 'Fresh listings from independent sellers.',
    description: 'The whole shelf, sorted newest first. Pick a category to narrow it down.',
    filterLabel: 'Filter by category',
    secondaryNote: 'Sorted by freshness, never by who paid to be here.',
    chips: ['Independent sellers', 'Prices up front', 'Contact the seller directly'],
  },
  profile: {
    eyebrow: 'Seller',
    headline: 'Independent sellers on The Market.',
    description: 'Every seller runs their own shopfront — see their listings, their story and how to reach them.',
    filterLabel: 'Filter sellers',
    secondaryNote: 'Real people behind every listing.',
    chips: ['Independent', 'Direct contact', 'Verified'],
  },
  article: {
    eyebrow: 'Guides',
    headline: 'Guides and reference reads.',
    description: 'Long-form pieces to help you buy well, sell well, and know what you are looking at.',
    filterLabel: 'Choose topic',
    secondaryNote: 'Reading space, generous margins, quiet layout.',
    chips: ['Guides', 'Buying', 'Selling'],
  },
  listing: {
    eyebrow: 'Storefronts',
    headline: 'Verified storefronts, ready for orders.',
    description: 'Shops and workshops with a permanent presence on The Market.',
    filterLabel: 'Filter storefront category',
    secondaryNote: 'Compare, contact, buy.',
    chips: ['Storefronts', 'Compare', 'Direct'],
  },
  sbm: {
    eyebrow: 'Resources',
    headline: 'Handy links worth saving.',
    description: 'Reference sites, price guides, care instructions — things that make buying and selling easier.',
    filterLabel: 'Filter collection',
    secondaryNote: 'Curated, no clutter.',
    chips: ['Reference', 'Guides', 'Care'],
  },
  pdf: {
    eyebrow: 'Downloads',
    headline: 'Catalogues, guides and printables.',
    description: 'PDFs, reports and take-away references from sellers and the site.',
    filterLabel: 'Filter document type',
    secondaryNote: 'One-click download, no wrapping.',
    chips: ['Catalogues', 'Guides', 'Reports'],
  },
  image: {
    eyebrow: 'Showcase',
    headline: 'Visual drops from The Market.',
    description: 'Look-books and image sets from independent sellers.',
    filterLabel: 'Filter visual category',
    secondaryNote: 'Image-first browsing.',
    chips: ['Look-books', 'Drops', 'Portfolio'],
  },
} satisfies Record<TaskKey, TaskPageVoice>
