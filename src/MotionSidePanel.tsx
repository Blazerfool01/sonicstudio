import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

/** Collapse affects presentation only. Children keep their state and owners. */
export default function MotionSidePanel({ side, fullFocus, children, onFocusPanel, onResize, onRegisterToggle }: {
  side: 'navigation' | 'rail'; fullFocus: boolean; children: ReactNode; onFocusPanel: () => void; onResize: () => void
  onRegisterToggle?: (toggle: (() => void) | null) => void
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [desktop, setDesktop] = useState(() => matchMedia('(min-width: 1280px)').matches)
  useEffect(() => {
    const media = matchMedia('(min-width: 1280px)')
    const update = () => setDesktop(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  const compact = desktop && (collapsed || fullFocus) && !expanded
  const label = side === 'navigation' ? 'navigation' : 'context panel'
  const toggle = useCallback(() => {
    onResize()
    if (compact) { setCollapsed(false); setExpanded(true) }
    else { setCollapsed(true); setExpanded(false) }
  }, [compact, onResize])
  useEffect(() => {
    onRegisterToggle?.(toggle)
    return () => onRegisterToggle?.(null)
  }, [onRegisterToggle, toggle])
  return <div className={`motion-side motion-${side}`} data-collapsed={compact}
    onClick={() => { if (compact) { onResize(); setExpanded(true) } }}
    onPointerEnter={event => { if (event.pointerType === 'mouse' && compact) { onResize(); setExpanded(true) } }}
    onPointerLeave={event => { if (expanded && !event.currentTarget.contains(document.activeElement)) { onResize(); setExpanded(false) } }}
    onFocusCapture={onFocusPanel}
    onBlur={event => { if (expanded && !event.currentTarget.contains(event.relatedTarget)) { onResize(); setExpanded(false) } }}>
    <button type="button" className="motion-panel-toggle" aria-label={`${compact ? 'Expand' : 'Collapse'} ${label}`}
      aria-expanded={!compact} aria-controls={`motion-${side}-content`}
      onClick={toggle}>
      <span aria-hidden="true">{side === 'navigation' ? (compact ? '»' : '«') : (compact ? '«' : '»')}</span>
    </button>
    <div className="motion-ambient-strip" aria-hidden="true"><span>◈</span><span>♫</span><span>♡</span><span>▥</span></div>
    <div className="motion-panel-viewport"><div id={`motion-${side}-content`} className={`motion-${side}-content`} inert={compact}>{children}</div></div>
    <i className="motion-divider" aria-hidden="true"/>
  </div>
}
