import { useId } from 'react'
import type { CSSProperties } from 'react'
import type { Genre } from './data/registry.ts'
import type { CompatibilityReport } from './lib/compatibility.ts'

const relationshipKinds = [
  { id: 'reinforcing', label: 'Reinforcing' },
  { id: 'complementary', label: 'Complementary' },
  { id: 'contrasting', label: 'Contrasting' },
  { id: 'conflicting', label: 'Conflicting' },
] as const

export default function BlendProgress({
  primary,
  secondary,
  primaryWeight,
  compatibility,
  compact = false,
}: {
  primary: Genre | null
  secondary: Genre | null
  primaryWeight: number
  compatibility: CompatibilityReport | null
  compact?: boolean
}) {
  const gradientId = `blend-progress-gradient-${useId().replace(/:/g, '')}`
  if (!primary || !secondary || !compatibility) {
    return <div className={`blend-progress blend-progress-empty${compact ? ' compact' : ''}`}>
      <span className="eyebrow">BLEND PROGRESS</span>
      <p>Attach a two-source Genre blend to see its live relationship breakdown.</p>
    </div>
  }

  const relationships = relationshipKinds.map(kind => ({ ...kind, count: compatibility.counts[kind.id] }))
  const label = `${primary.name} leads at ${primaryWeight} percent; ${secondary.name} supports at ${100 - primaryWeight} percent. ` +
    relationships.map(item => `${item.count} ${item.label.toLowerCase()}`).join(', ')

  return <section className={`blend-progress${compact ? ' compact' : ''}`} aria-label="Blend progress">
    <div className="blend-progress-visual">
      <span key={primaryWeight} className="blend-progress-count" aria-hidden="true" style={{ '--blend-count': primaryWeight, '--blend-target': primaryWeight } as CSSProperties}>{primaryWeight}%</span>
      <svg className="blend-progress-ring" viewBox="0 0 120 120" role="img" aria-label={label}>
        <defs><linearGradient id={gradientId} x1="0" y1="1" x2="1" y2="0"><stop className="blend-progress-stop-start" offset="0"/><stop className="blend-progress-stop-middle" offset=".56"/><stop className="blend-progress-stop-end" offset="1"/></linearGradient></defs>
        <circle className="blend-progress-track" cx="60" cy="60" r="47" pathLength="100"/>
        <circle key={primaryWeight} className="blend-progress-value" cx="60" cy="60" r="47" pathLength="100" strokeDasharray={`${primaryWeight} ${100 - primaryWeight}`} style={{ '--blend-progress-stroke': `url(#${gradientId})`, '--blend-arc': `${primaryWeight} ${100 - primaryWeight}` } as CSSProperties}/>
        <text className="blend-progress-number" x="60" y="57" textAnchor="middle">{primaryWeight}%</text>
        <text className="blend-progress-caption" x="60" y="73" textAnchor="middle">LEAD SHARE</text>
      </svg>
    </div>
    <div className="blend-progress-breakdown">
      <span className="eyebrow">BLEND PROGRESS</span>
      <ul>{relationships.map(item => <li key={item.id} data-kind={item.id}>
        <span>{item.label}</span><strong>{item.count}</strong>
      </li>)}</ul>
    </div>
    <p className="blend-progress-sources"><strong>{primary.name}</strong> {primaryWeight}% <span>·</span> {secondary.name} {100 - primaryWeight}%</p>
  </section>
}
