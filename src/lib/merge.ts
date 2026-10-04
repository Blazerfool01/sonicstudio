import type { Genre, MusicalDimension } from '../data/registry.ts'

export type Relationship = {
  anchorGenre: string
  supportGenre: string
  text: string
}

export type SoundDna = {
  tempo: [number, number]
  tempoSource: string
  rhythm: Relationship
  bass: Relationship
  harmony: Relationship
  instrumentation: Relationship
  texture: Relationship
  production: Relationship
  intensity: Relationship
  energy: number
  darkness: number
}

const dimensions: MusicalDimension[] = [
  'rhythm', 'bass', 'harmony', 'instrumentation', 'texture', 'production', 'intensity',
]

const verbs: Record<MusicalDimension, string> = {
  rhythm: 'drives the groove',
  bass: 'grounds the low end',
  harmony: 'sets the harmonic centre',
  instrumentation: 'leads the arrangement',
  texture: 'shapes the overall texture',
  production: 'defines the space',
  intensity: 'sets the dynamic arc',
}

const weighted = (a: number, b: number, primaryWeight: number) =>
  Math.round((a * primaryWeight + b * (100 - primaryWeight)) / 100)

function selectAnchor(a: Genre, b: Genre, weight: number, dimension: MusicalDimension): [Genre, Genre] {
  const firstScore = a.characteristics[dimension].strength * weight
  const secondScore = b.characteristics[dimension].strength * (100 - weight)
  if (firstScore === secondScore) return a.id < b.id ? [a, b] : [b, a]
  return firstScore > secondScore ? [a, b] : [b, a]
}

function relationship(a: Genre, b: Genre, weight: number, dimension: MusicalDimension): Relationship {
  const [anchor, support] = selectAnchor(a, b, weight, dimension)
  const leadVerb = verbs[dimension]
  const lead = anchor.characteristics[dimension].anchor
  const accent = support.characteristics[dimension].accent
  return {
    anchorGenre: anchor.name,
    supportGenre: support.name,
    text: `${anchor.name} ${leadVerb} through ${lead}; ${support.name} contributes ${accent}.`,
  }
}

function mergeTempo(anchor: Genre, support: Genre, supportWeight: number): [number, number] {
  // Keep the rhythmic engine recognisable when the other genre has a very different tempo.
  const nudge = (index: 0 | 1) => Math.max(-12, Math.min(12,
    Math.round((support.tempo[index] - anchor.tempo[index]) * supportWeight / 100),
  ))
  return [anchor.tempo[0] + nudge(0), anchor.tempo[1] + nudge(1)]
}

export function mergeGenres(primary: Genre, secondary: Genre, primaryWeight: number): SoundDna {
  if (primary.id === secondary.id) throw new Error('Select two different genres')
  if (!Number.isInteger(primaryWeight) || primaryWeight < 1 || primaryWeight > 99) {
    throw new Error('Primary weight must be an integer between 1 and 99')
  }
  const [rhythmAnchor, rhythmSupport] = selectAnchor(primary, secondary, primaryWeight, 'rhythm')
  const supportWeight = rhythmSupport.id === primary.id ? primaryWeight : 100 - primaryWeight
  const related = Object.fromEntries(dimensions.map((dimension) => [
    dimension, relationship(primary, secondary, primaryWeight, dimension),
  ])) as Record<MusicalDimension, Relationship>

  return {
    tempo: mergeTempo(rhythmAnchor, rhythmSupport, supportWeight),
    tempoSource: rhythmAnchor.name,
    ...related,
    energy: weighted(primary.energy, secondary.energy, primaryWeight),
    darkness: weighted(primary.darkness, secondary.darkness, primaryWeight),
  }
}
