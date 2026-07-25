import type { CSSProperties } from 'react'

/*
  Luminara reference tokens — warm neutral editorial marketplace.
  Burnt orange primary on near-white, hairline gray borders, DM Sans throughout.
*/

export const editableRootStyle = {
  '--slot4-page-bg': '#ffffff',
  '--slot4-page-text': '#101010',
  '--slot4-panel-bg': '#f6f4f1',
  '--slot4-surface-bg': '#ffffff',
  '--slot4-muted-text': '#767676',
  '--slot4-soft-muted-text': '#9a9a9a',
  '--slot4-accent': '#cc4e00',
  '--slot4-accent-fill': '#cc4e00',
  '--slot4-accent-hover': '#d76118',
  '--slot4-accent-soft': '#fbe9dd',
  '--slot4-on-accent': '#ffffff',
  '--slot4-dark-bg': '#232323',
  '--slot4-dark-text': '#ffffff',
  '--slot4-media-bg': '#efe9e2',
  '--slot4-cream': '#faf7f2',
  '--slot4-warm': '#f6f4f1',
  '--slot4-lavender': '#ffffff',
  '--slot4-gray': '#f0ede8',
  '--slot4-body-gradient': 'none',
  '--editable-page-bg': '#ffffff',
  '--editable-page-text': '#101010',
  '--editable-container': '1440px',
  '--editable-container-narrow': '1024px',
  '--editable-border': '#e2ddd6',
  '--editable-border-strong': '#cdcdcd',
  '--editable-nav-bg': '#ffffff',
  '--editable-nav-text': '#101010',
  '--editable-nav-active': '#cc4e00',
  '--editable-nav-active-text': '#ffffff',
  '--editable-cta-bg': '#cc4e00',
  '--editable-cta-text': '#ffffff',
  '--editable-search-bg': '#ffffff',
  '--editable-footer-bg': '#101010',
  '--editable-footer-text': '#ffffff',
  '--editable-radius-sm': '8px',
  '--editable-radius': '14px',
  '--editable-radius-lg': '20px',
  '--editable-radius-xl': '28px',
  '--editable-section-y': '80px',
  '--editable-section-y-lg': '120px',
} as CSSProperties

export const editablePalette = {
  pageBg: 'bg-[var(--slot4-page-bg)]',
  pageText: 'text-[var(--slot4-page-text)]',
  panelBg: 'bg-[var(--slot4-panel-bg)]',
  panelText: 'text-[var(--slot4-page-text)]',
  surfaceBg: 'bg-[var(--slot4-surface-bg)]',
  surfaceText: 'text-[var(--slot4-page-text)]',
  mutedText: 'text-[var(--slot4-muted-text)]',
  softMutedText: 'text-[var(--slot4-soft-muted-text)]',
  accentText: 'text-[var(--slot4-accent)]',
  accentBg: 'bg-[var(--slot4-accent-fill)]',
  accentSoftBg: 'bg-[var(--slot4-accent-soft)]',
  accentSoftText: 'text-[var(--slot4-accent-soft)]',
  onAccentText: 'text-[var(--slot4-on-accent)]',
  darkBg: 'bg-[var(--slot4-dark-bg)]',
  darkText: 'text-[var(--slot4-dark-text)]',
  mediaBg: 'bg-[var(--slot4-media-bg)]',
  creamBg: 'bg-[var(--slot4-cream)]',
  warmBg: 'bg-[var(--slot4-warm)]',
  lavenderBg: 'bg-[var(--slot4-lavender)]',
  grayBg: 'bg-[var(--slot4-gray)]',
  border: 'border-[var(--editable-border)]',
  borderStrong: 'border-[var(--editable-border-strong)]',
  darkBorder: 'border-white/10',
  shadow: 'shadow-[0_1px_2px_rgba(16,16,16,0.04)]',
  shadowStrong: 'shadow-[0_18px_44px_rgba(16,16,16,0.10)]',
  overlay: 'bg-[linear-gradient(180deg,rgba(0,0,0,0.02),rgba(0,0,0,0.72))]',
} as const

export const editableDesignContract = {
  shell: {
    page: `min-h-screen ${editablePalette.pageBg} ${editablePalette.pageText}`,
    section: 'mx-auto w-full max-w-[var(--editable-container)] px-4 sm:px-6 lg:px-12',
    sectionNarrow: 'mx-auto w-full max-w-[var(--editable-container-narrow)] px-4 sm:px-6 lg:px-8',
    sectionY: 'py-[60px] sm:py-20 lg:py-[100px] xl:py-[120px]',
    sectionYSm: 'py-14 sm:py-16 lg:py-20',
  },
  layout: {
    safeGrid: 'grid gap-6 md:grid-cols-2 xl:grid-cols-3',
    featureGrid: 'grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center',
    rail: 'flex snap-x gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
    minRailCard: 'w-[280px] shrink-0 snap-start sm:w-[320px]',
  },
  type: {
    eyebrow: 'text-xs font-medium uppercase tracking-[0.24em] text-[var(--slot4-accent)]',
    megaTitle:
      'editable-display text-[2.5rem] sm:text-[3.5rem] lg:text-[4.5rem] xl:text-[5rem] font-medium leading-[1.05] tracking-[-0.04em]',
    heroTitle:
      'editable-display text-[2.25rem] sm:text-[3rem] lg:text-[3.75rem] font-medium leading-[1.06] tracking-[-0.035em]',
    sectionTitle:
      'editable-display text-[2rem] sm:text-[2.5rem] lg:text-[3.25rem] font-medium leading-[1.1] tracking-[-0.03em]',
    subTitle:
      'editable-display text-[1.5rem] sm:text-[1.75rem] lg:text-[2rem] font-medium leading-[1.2] tracking-[-0.015em]',
    body: 'text-base leading-[1.6] text-[var(--slot4-muted-text)]',
    bodyLarge: 'text-lg leading-[1.6] text-[var(--slot4-muted-text)] sm:text-xl',
  },
  surface: {
    card: `rounded-[var(--editable-radius)] border ${editablePalette.border} ${editablePalette.surfaceBg} ${editablePalette.shadow}`,
    soft: `rounded-[var(--editable-radius)] border ${editablePalette.border} ${editablePalette.panelBg}`,
    dark: `rounded-[var(--editable-radius-lg)] ${editablePalette.darkBg} ${editablePalette.darkText}`,
    warm: `rounded-[var(--editable-radius-lg)] ${editablePalette.warmBg} border ${editablePalette.border}`,
  },
  button: {
    primary:
      'inline-flex items-center justify-center gap-2 rounded-full bg-[var(--slot4-accent-fill)] px-6 py-3 text-sm font-medium tracking-[0.005em] text-[var(--slot4-on-accent)] transition duration-300 hover:bg-[var(--slot4-accent-hover)] active:scale-[0.98]',
    secondary:
      'inline-flex items-center justify-center gap-2 rounded-full border border-[var(--editable-border-strong)] bg-[var(--slot4-surface-bg)] px-6 py-3 text-sm font-medium text-[var(--slot4-page-text)] transition duration-300 hover:border-[var(--slot4-page-text)] active:scale-[0.98]',
    ghost:
      'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-[var(--slot4-page-text)] transition duration-300 hover:text-[var(--slot4-accent)]',
    onDark:
      'inline-flex items-center justify-center gap-2 rounded-full bg-[var(--slot4-on-accent)] px-6 py-3 text-sm font-medium text-[var(--slot4-dark-bg)] transition duration-300 hover:bg-[var(--slot4-accent-soft)] active:scale-[0.98]',
    accent:
      'inline-flex items-center justify-center gap-2 rounded-full bg-[var(--slot4-accent-fill)] px-6 py-3 text-sm font-medium text-[var(--slot4-on-accent)] transition duration-300 hover:bg-[var(--slot4-accent-hover)] active:scale-[0.98]',
  },
  media: {
    frame: `relative overflow-hidden rounded-[var(--editable-radius)] ${editablePalette.mediaBg}`,
    ratio: 'aspect-[4/5]',
  },
  motion: {
    lift: 'transition duration-500 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(16,16,16,0.10)]',
    fade: 'transition duration-500 hover:opacity-90',
  },
} as const

export const aiLayoutRules = [
  'Every color/font must consume the tokens in editableRootStyle + editable-global.css; never hardcode reference colors.',
  'Wrap major sections in <EditableReveal index={i}> so they fade + slide in on scroll with a staggered rhythm.',
  'Use rounded-full for CTAs and rounded-[var(--editable-radius-lg)] for feature cards, matching the reference silhouette.',
  'Home structure is defined in HomeSections.tsx and composed inside HomePage.tsx — redesign there.',
  'Keep all data-fetch calls, prop names, and exports byte-identical; only change JSX/copy/classNames.',
  'All CTAs speak the marketplace voice — never generic SaaS.',
] as const
