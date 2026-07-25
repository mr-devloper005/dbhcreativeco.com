'use client'

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

/*
  IntersectionObserver-driven fade + slide-up. The hidden state is only
  applied AFTER mount so users with JS disabled or reduced motion see
  content immediately (no permanently-hidden blocks). Pass `index` to
  create a staggered reveal in a list of sibling reveals.
*/

type Props = {
  children: ReactNode
  as?: keyof React.JSX.IntrinsicElements
  className?: string
  index?: number
  /** Extra offset to the built-in stagger, in ms. */
  delay?: number
  /** How far below its resting position the element starts (px). */
  offset?: number
  /** Root margin for the IntersectionObserver. */
  rootMargin?: string
  style?: CSSProperties
}

export function EditableReveal({
  children,
  as = 'div',
  className = '',
  index = 0,
  delay = 0,
  offset,
  rootMargin = '0px 0px -8% 0px',
  style,
}: Props) {
  const ref = useRef<HTMLElement | null>(null)
  const [ready, setReady] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setReady(true)
    const node = ref.current
    if (!node) return
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true)
      return
    }
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.disconnect()
            break
          }
        }
      },
      { rootMargin, threshold: 0.05 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [rootMargin])

  const stagger = Math.min(Math.max(index, 0), 20) * 90
  const revealStyle: CSSProperties = {
    ...(style || {}),
    ...(offset ? ({ ['--editable-reveal-distance']: `${offset}px` } as CSSProperties) : {}),
    ['--editable-reveal-delay' as string]: `${stagger + delay}ms`,
  }
  const cls = `${ready ? 'editable-reveal' : ''} ${visible ? 'is-visible' : ''} ${className}`.trim()

  const Tag = as as unknown as React.ElementType
  return (
    <Tag ref={ref as unknown as React.Ref<HTMLElement>} className={cls} style={revealStyle}>
      {children}
    </Tag>
  )
}
