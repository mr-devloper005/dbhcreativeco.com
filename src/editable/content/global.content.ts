import { slot4BrandConfig } from '@/editable/theme/brand.config'

/*
  Tasks that stay functional (direct URL, data, hooks) but are hidden from
  every user-visible surface: navbar, footer, home sections, search filter/
  results, create picker, stats/counts. Apply with `!isUiHiddenTask(task.key)`.
*/
export const uiHiddenTaskKeys = ['profile'] as const
export const isUiHiddenTask = (key: string) => (uiHiddenTaskKeys as readonly string[]).includes(key)

export const globalContent = {
  site: {
    name: slot4BrandConfig.siteName,
    tagline: slot4BrandConfig.tagline || 'Independent marketplace for makers and finders',
    domain: slot4BrandConfig.domain,
    baseUrl: slot4BrandConfig.baseUrl,
  },
  marketplace: {
    label: slot4BrandConfig.marketplaceLabel.section,
    singular: slot4BrandConfig.marketplaceLabel.singular,
    plural: slot4BrandConfig.marketplaceLabel.plural,
    seller: slot4BrandConfig.marketplaceLabel.seller,
    sellers: slot4BrandConfig.marketplaceLabel.sellers,
  },
  nav: {
    tagline: 'The Market · Independent sellers',
    primaryLinks: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
    actions: {
      primary: { label: 'Browse The Market', href: '/classified' },
      secondary: { label: 'Post a listing', href: '/create' },
    },
  },
  footer: {
    tagline: 'The Market — independent listings, worth finding.',
    description: `${slot4BrandConfig.siteName} is a curated marketplace of finds, tools and one-of-a-kind items from independent sellers.`,
    columns: [
      {
        title: 'The Market',
        // Categories are stitched to /classified?category=<slug> in the footer itself.
        links: [
          { label: 'Everything', href: '/classified' },
          { label: 'Furniture', href: '/classified?category=furniture' },
          { label: 'Home & decor', href: '/classified?category=home' },
          { label: 'Vintage', href: '/classified?category=vintage' },
          { label: 'Tools & tech', href: '/classified?category=tools' },
          { label: 'Everything else', href: '/classified?category=other' },
        ],
      },
      {
        title: 'Site',
        links: [
          { label: 'About The Market', href: '/about' },
          { label: 'Contact', href: '/contact' },
          { label: 'Search listings', href: '/search' },
        ],
      },
      {
        title: 'Sell',
        links: [
          { label: 'Post a listing', href: '/create' },
          { label: 'Seller sign up', href: '/signup' },
          { label: 'Seller login', href: '/login' },
        ],
      },
    ],
    bottomNote: 'Made for finders. Built for independent sellers.',
  },
  commonLabels: {
    readMore: 'View listing',
    viewAll: 'See all',
    explore: 'Browse',
    latest: 'Fresh',
    related: 'More from The Market',
    published: 'Listed',
  },
} as const
