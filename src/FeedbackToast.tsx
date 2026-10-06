import { useEffect, useRef, useState } from 'react'
import type { NoticeTone } from './StatusNotice.tsx'

// Visibility is presentation state; the caller remains the message/operation owner.
export default function FeedbackToast({ message, tone = 'info', eventKey, active = true, announce = true }: {
  message: string
  tone?: NoticeTone
  eventKey?: unknown
  active?: boolean
  announce?: boolean
}) {
  const [visible, setVisible] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const lastEvent = useRef<{ message: string; eventKey: unknown }>({ message: '', eventKey: undefined })
  useEffect(() => {
    const changed = message !== lastEvent.current.message || eventKey !== lastEvent.current.eventKey
    lastEvent.current = { message, eventKey }
    if (!active || changed) {
      setVisible(active && changed && Boolean(message))
      setHovered(false)
      setFocused(false)
    }
  }, [message, eventKey, active])
  useEffect(() => {
    if (!visible || hovered || focused || tone === 'error' || tone === 'warning') return
    const timeout = window.setTimeout(() => setVisible(false), 6000)
    return () => window.clearTimeout(timeout)
  }, [visible, message, tone, eventKey, hovered, focused])
  if (!visible) return null
  return <div className={`studio-feedback-toast toast-${tone}`} role={announce ? tone === 'error' ? 'alert' : 'status' : 'region'} aria-label={announce ? undefined : 'Notification'} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false) }}>
    <span className="toast-icon" aria-hidden="true">{tone === 'success' ? '✓' : tone === 'error' || tone === 'warning' ? '!' : 'i'}</span>
    <div><strong>{message}</strong><small>Local studio</small></div>
    <button type="button" aria-label="Dismiss notification" onClick={() => setVisible(false)}>×</button>
  </div>
}
