import { slot4BrandConfig } from '@/editable/theme/brand.config'

const SITE = slot4BrandConfig.siteName

export const pagesContent = {
  home: {
    metadata: {
      title: `${SITE} · The Market for independent finds`,
      description: `Browse ${SITE} — a curated marketplace of listings, tools and one-of-a-kind items from independent sellers.`,
      openGraphTitle: `${SITE} · The Market for independent finds`,
      openGraphDescription: `Curated listings from independent sellers on ${SITE}.`,
      keywords: ['marketplace', 'independent sellers', 'listings', 'buy and sell', 'the market'],
    },
    hero: {
      badge: 'The Market · Fresh listings',
      title: ['Find something worth buying.', 'From independent sellers.'],
      description:
        'A slower, curated marketplace of listings, tools and finds you would never scroll past on the big platforms.',
      primaryCta: { label: 'Browse The Market', href: '/classified' },
      secondaryCta: { label: 'Post a listing', href: '/create' },
      searchPlaceholder: 'Search The Market — furniture, tools, vintage…',
      focusLabel: 'On the shelves',
      featureCardBadge: 'featured this week',
      featureCardTitle: 'Fresh drops shape the shelf front.',
      featureCardDescription: 'The newest listings from independent sellers show up here first.',
    },
    intro: {
      badge: `About ${SITE}`,
      title: 'A marketplace that feels like a good, slow shopfront.',
      paragraphs: [
        `${SITE} is a curated marketplace of listings from independent sellers — makers, workshops, dealers and hobbyists.`,
        'Everything is browsable in one calm, editorial space instead of an endless scroll.',
        'You will not see ads, dark patterns, or feed manipulation — just listings, prices and the sellers behind them.',
      ],
      sideBadge: 'What you get',
      sidePoints: [
        'Fresh listings from real, independent sellers',
        'Clean, editorial browsing — no ads, no promoted junk',
        'Direct contact with the seller of every item',
        'Categories that actually reflect what people list',
      ],
      primaryLink: { label: 'Browse The Market', href: '/classified' },
      secondaryLink: { label: 'Meet the sellers', href: '/about' },
    },
    cta: {
      badge: 'Sell on The Market',
      title: 'Have something worth listing? Post it in minutes.',
      description: 'Set your price, add a photo, describe the item and reach buyers who came looking on purpose.',
      primaryCta: { label: 'Post a listing', href: '/create' },
      secondaryCta: { label: 'Ask a question', href: '/contact' },
    },
    features: [
      {
        title: 'Fresh listings, hand-picked feel',
        body: 'Every new listing shows up on the front shelf — sorted by freshness, not by who paid the most.',
      },
      {
        title: 'Prices you can actually see',
        body: 'No “Contact for price”, no bait. Every listing shows its asking price up top.',
      },
      {
        title: 'Direct line to the seller',
        body: 'Every listing has a real seller. Call, email or message — no middleman, no queue.',
      },
      {
        title: 'Independent, always',
        body: 'Independent sellers only — no chain stores, no drop-shipped resellers, no algorithmic feed.',
      },
    ],
    categoriesHeading: 'Browse The Market by category',
    categoriesSubheading: 'Jump straight to the shelf you were looking for.',
    stats: [
      { value: 'Daily', label: 'Fresh listings added' },
      { value: '100%', label: 'Independent sellers' },
      { value: '0', label: 'Ads, ever' },
      { value: 'Direct', label: 'Contact with sellers' },
    ],
    featuredHeading: 'Featured this week',
    featuredSubheading: 'Editor picks from the freshest independent listings.',
    listingsHeading: 'On the shelves right now',
    listingsSubheading: 'The newest additions to The Market.',
    testimonials: {
      badge: 'From the shopfront',
      title: 'Buyers and sellers, in their own words.',
      items: [
        {
          quote: 'Feels like a proper marketplace again. Prices are up front, the seller is a real person, done in a few messages.',
          name: 'Priya R.',
          role: 'Buyer · Vintage lighting',
        },
        {
          quote: 'I list once a week and it moves. No promoted-listing games, no “boost your post” nonsense.',
          name: 'Jordan T.',
          role: 'Seller · Workshop tools',
        },
        {
          quote: 'Clean, calm, and I actually found the exact tea trolley I had been searching for.',
          name: 'Marcus L.',
          role: 'Buyer · Furniture',
        },
      ],
    },
    faq: {
      badge: 'Common questions',
      title: 'Everything you might want to know before browsing or listing.',
      items: [
        {
          q: 'How is The Market different from the big listing sites?',
          a: 'No ads, no algorithm ranking, no promoted spots. Only independent sellers, sorted by freshness and category.',
        },
        {
          q: 'Do I need an account to browse?',
          a: 'No. Browse, search and contact any seller without signing up. Accounts are only needed to post a listing of your own.',
        },
        {
          q: 'Is there a fee to list an item?',
          a: 'Listing on The Market is free — no visibility fees, no “boost” pricing.',
        },
        {
          q: 'How do I contact a seller?',
          a: 'Every listing has direct contact details — phone, email or website — right on the page. No inbox in the middle.',
        },
        {
          q: 'Does The Market handle payments or shipping?',
          a: 'No. Buyers and sellers arrange payment and delivery directly, the way it should be.',
        },
      ],
    },
    taskSection: {
      heading: 'Fresh on the shelves',
      descriptionSuffix: 'The newest independent listings, added in the last window.',
    },
  },
  about: {
    badge: `About ${SITE}`,
    title: 'A calmer marketplace, built for the people using it.',
    description: `${SITE} started as a simple question — what would a marketplace look like if it stopped fighting for your attention and just showed you the listings?`,
    paragraphs: [
      'Independent sellers get a clean shopfront. Buyers get a real search and real prices. Nobody gets pop-ups, promoted feed items, or a “buy now / expires in 3 minutes” banner.',
      'We keep the surface simple on purpose. Listings, categories, sellers, contact — that is the whole thing. Every design decision goes through one filter: does this help someone find or list a real item?',
      'The Market grows one listing at a time, and that is fine with us.',
    ],
    values: [
      { title: 'Independent by default', description: 'Every seller runs their own shopfront. No chains, no resellers, no algorithmic promotion.' },
      { title: 'Prices, up front', description: 'You see the price, condition and location before you click. Nothing hidden behind a login wall.' },
      { title: 'Contact, not queue', description: 'Buyers reach sellers directly — no intermediary, no ticket system, no upsells.' },
    ],
  },
  contact: {
    eyebrow: `Contact ${SITE}`,
    title: 'A real person reads every message.',
    description: 'Question about a listing, a seller enquiry, or a broken link? Send it in and we will route it through the right lane — no ticket robot, no auto-reply.',
    formTitle: 'Send us a message',
  },
  search: {
    metadata: {
      title: 'Search The Market',
      description: 'Search listings across The Market — filter by category and keyword.',
    },
    hero: {
      badge: 'Search The Market',
      title: 'Find the listing you had in mind.',
      description: 'Search across every listing on The Market — by keyword, category or seller.',
      placeholder: 'Search The Market — try “oak desk”, “drill”, “lamp”…',
    },
    resultsTitle: 'Latest listings',
  },
  create: {
    metadata: {
      title: 'Post a listing',
      description: 'Post a new listing on The Market — free, fast, and direct to buyers.',
    },
    locked: {
      badge: 'Sellers only',
      title: 'Sign in to post a listing.',
      description: 'You need a seller account to list items on The Market. It is free, takes a minute, and gives buyers a way to contact you directly.',
    },
    hero: {
      badge: 'Post a listing',
      title: 'List something worth finding.',
      description: 'Add a title, a photo, your price and a few details. Your listing goes live on the front shelf as soon as you post it.',
    },
    formTitle: 'Listing details',
    submitLabel: 'Post to The Market',
    successTitle: 'Listing posted — it is live on The Market.',
  },
  auth: {
    login: {
      metadataDescription: 'Seller sign in for The Market.',
      badge: 'Seller access',
      title: 'Welcome back to The Market.',
      description: 'Sign in to manage your listings, edit prices, and answer buyer questions.',
      formTitle: 'Sign in',
      submitLabel: 'Continue',
      noAccount: 'No account matched those details. Create a seller account first.',
      success: 'Signed in. Redirecting…',
      createCta: 'Create a seller account',
    },
    signup: {
      metadataDescription: 'Sign up as a seller on The Market.',
      badge: 'Become a seller',
      title: 'Set up your shopfront in a minute.',
      description: 'Create a free seller account to start posting listings on The Market.',
      formTitle: 'Create a seller account',
      submitLabel: 'Create account',
      passwordShort: 'Use at least 4 characters for the password.',
      success: 'Account created. Redirecting…',
      loginCta: 'Sign in',
    },
  },
  detailPages: {
    article: { relatedTitle: 'More guides', fallbackTitle: 'Guide' },
    listing: { relatedTitle: 'More storefronts', fallbackTitle: 'Storefront' },
    image: { relatedTitle: 'More showcase', fallbackTitle: 'Showcase' },
    profile: {
      relatedTitle: 'More by this seller',
      fallbackDescription: 'Seller details will appear here once available.',
      visitButton: 'Visit shopfront',
    },
  },
} as const
