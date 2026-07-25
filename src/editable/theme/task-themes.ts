import type { CSSProperties } from 'react'
import type { TaskKey } from '@/lib/site-config'

/*
  Luminara-style task surfaces. One warm palette across every task —
  burnt-orange accent, near-white surfaces, hairline gray borders,
  DM Sans throughout. Per-task copy still varies (kicker/note) but
  the visual language is unified.
*/

export type TaskTheme = {
  kicker: string
  note: string
  dark: boolean
  fontDisplay: string
  fontBody: string
  bg: string
  surface: string
  raised: string
  text: string
  muted: string
  line: string
  accent: string
  accentSoft: string
  onAccent: string
  glow: string
  radius: string
}

const LUMINARA_FONT = "'DM Sans', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif"

const base = {
  dark: false,
  fontDisplay: LUMINARA_FONT,
  fontBody: LUMINARA_FONT,
  bg: '#ffffff',
  surface: '#ffffff',
  raised: '#f6f4f1',
  text: '#101010',
  muted: '#767676',
  line: '#e2ddd6',
  accent: '#cc4e00',
  accentSoft: '#fbe9dd',
  onAccent: '#ffffff',
  glow: 'rgba(204,78,0,0.08)',
  radius: '14px',
} satisfies Omit<TaskTheme, 'kicker' | 'note'>

export const taskThemes: Record<TaskKey, TaskTheme> = {
  article: { ...base, kicker: 'Guides', note: 'Long reads and reference pieces from The Market.' },
  listing: { ...base, kicker: 'Storefronts', note: 'Verified shops and workshops open for orders.' },
  classified: { ...base, kicker: 'The Market', note: 'Fresh finds and offers from independent sellers.' },
  image: { ...base, kicker: 'Showcase', note: 'A visual feed of standout items and drops.' },
  sbm: { ...base, kicker: 'Resources', note: 'Handy links and references worth saving.' },
  pdf: { ...base, kicker: 'Downloads', note: 'Guides, catalogues and reports to take with you.' },
  profile: { ...base, kicker: 'Seller', note: 'Independent sellers, makers and shops.' },
}

export function getTaskTheme(task: TaskKey): TaskTheme {
  return taskThemes[task] || taskThemes.classified
}

export function taskThemeStyle(task: TaskKey): CSSProperties {
  const t = getTaskTheme(task)
  return {
    '--tk-bg': t.bg,
    '--tk-surface': t.surface,
    '--tk-raised': t.raised,
    '--tk-text': t.text,
    '--tk-muted': t.muted,
    '--tk-line': t.line,
    '--tk-accent': t.accent,
    '--tk-accent-soft': t.accentSoft,
    '--tk-on-accent': t.onAccent,
    '--tk-glow': t.glow,
    '--tk-radius': t.radius,
    '--slot4-accent': t.accent,
    '--slot4-accent-fill': t.accent,
    '--editable-font-display': t.fontDisplay,
    '--editable-font-body': t.fontBody,
    fontFamily: t.fontBody,
  } as CSSProperties
}
