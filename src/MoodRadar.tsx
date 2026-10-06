import { useId } from 'react'
import type { CSSProperties } from 'react'
import { moodDimensions } from './data/moods.ts'
import type { MoodDna } from './lib/moodDna.ts'

const cx = 140
const cy = 115
const radius = 68

function axisPoint(index: number, value: number) {
  const angle = index * Math.PI * 2 / moodDimensions.length - Math.PI / 2
  const distance = radius * value / 100
  return { x: cx + Math.cos(angle) * distance, y: cy + Math.sin(angle) * distance }
}

function closedCurve(points: { x: number; y: number }[]) {
  if (points.length < 3) return ''
  const segment = points.map((point, index) => {
    const next = points[(index + 1) % points.length]
    const previous = points[(index - 1 + points.length) % points.length]
    const afterNext = points[(index + 2) % points.length]
    const c1 = { x: point.x + (next.x - previous.x) / 6, y: point.y + (next.y - previous.y) / 6 }
    const c2 = { x: next.x - (afterNext.x - point.x) / 6, y: next.y - (afterNext.y - point.y) / 6 }
    return `C ${c1.x.toFixed(2)} ${c1.y.toFixed(2)} ${c2.x.toFixed(2)} ${c2.y.toFixed(2)} ${next.x.toFixed(2)} ${next.y.toFixed(2)}`
  })
  return `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)} ${segment.join(' ')} Z`
}

export default function MoodRadar({ dna }: { dna: MoodDna | null }) {
  const gradientId = `mood-radar-fill-${useId().replace(/:/g, '')}`
  const points = dna ? moodDimensions.map((dimension, index) => axisPoint(index, dna.dimensions[dimension.id])) : []
  const curve = closedCurve(points)
  const labels = dna
    ? moodDimensions.map(dimension => `${dimension.name} ${dna.dimensions[dimension.id]}`).join(', ')
    : 'no values yet'

  return <svg className="mood-radar" viewBox="0 0 280 230" role="img" aria-label={dna
    ? `Mood DNA radar for ${dna.dominantMood.name}: ${labels}.`
    : 'Mood DNA radar awaiting mood selections.'}>
    <defs>
      <radialGradient id={gradientId} cx="44%" cy="35%" r="72%">
        <stop className="mood-radar-fill-start" offset="0"/>
        <stop className="mood-radar-fill-middle" offset=".62"/>
        <stop className="mood-radar-fill-end" offset="1"/>
      </radialGradient>
    </defs>
    {[22, 45, 68].map(distance => <circle key={distance} className="mood-radar-grid" cx={cx} cy={cy} r={distance}/>)}
    {moodDimensions.map((dimension, index) => {
      const end = axisPoint(index, 100)
      const label = axisPoint(index, 132)
      const anchor = Math.abs(label.x - cx) < 13 ? 'middle' : label.x > cx ? 'start' : 'end'
      return <g key={dimension.id}>
        <line className="mood-radar-axis" x1={cx} y1={cy} x2={end.x} y2={end.y}/>
        <circle className="mood-radar-axis-point" cx={end.x} cy={end.y} r="2.3"/>
        <text className="mood-radar-label" x={label.x} y={label.y + 3} textAnchor={anchor}>{dimension.name}</text>
      </g>
    })}
    {dna && <>
      <g className="mood-radar-surface" style={{ '--mood-radar-path': `path("${curve}")` } as CSSProperties}>
        <path className="mood-radar-glow" d={curve}/>
        <path className="mood-radar-shape" d={curve} style={{ '--mood-radar-fill': `url(#${gradientId})` } as CSSProperties}/>
      </g>
      {points.map((point, index) => <circle className="mood-radar-value-point" key={moodDimensions[index].id} cx={point.x} cy={point.y} r="3.2"/>)}
    </>}
    <circle className="mood-radar-core" cx={cx} cy={cy} r="2.5"/>
    {!dna && <text className="mood-radar-empty-label" x={cx} y={cy + 4} textAnchor="middle">AWAITING MOODS</text>}
  </svg>
}
