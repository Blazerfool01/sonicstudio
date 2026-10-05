import type { ReactNode } from 'react'

export type NoticeTone = 'info' | 'success' | 'warning' | 'error' | 'empty'

export default function StatusNotice({ tone = 'info', children, className = '' }: { tone?: NoticeTone; children: ReactNode; className?: string }) {
  if (children === '' || children === null || children === undefined) return null
  const urgent = tone === 'error'
  return <p className={`status-notice status-notice-${tone}${className ? ` ${className}` : ''}`} role={urgent ? 'alert' : 'status'} aria-live={urgent ? 'assertive' : 'polite'}>{children}</p>
}
