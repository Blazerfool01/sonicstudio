import type { Genre, MusicalDimension, MusicalLayer } from '../data/registry.ts'
import { mergeGenres } from './merge.ts'
import type { SoundDna } from './merge.ts'
import oppositionData from '../data/oppositions.json' with { type: 'json' }

export type CompatibilityKind = 'reinforcing' | 'complementary' | 'contrasting' | 'conflicting'
export type DimensionCompatibility = {
  dimension: MusicalDimension
  kind: CompatibilityKind
  leadGenre: string
  supportGenre: string
  explanation: string
  resolution: string | null
}
export type CompatibilityReport = {
  dimensions: DimensionCompatibility[]
  counts: Record<CompatibilityKind, number>
}

const dimensions: MusicalDimension[] = [
  'rhythm', 'bass', 'harmony', 'instrumentation', 'texture', 'production', 'intensity',
]

export const dimensionLabels: Record<MusicalDimension, string> = {
  rhythm: 'rhythmic feel', bass: 'bass behaviour', harmony: 'harmonic character',
  instrumentation: 'instrumentation role', texture: 'texture',
  production: 'production space', intensity: 'intensity',
}

const layerLabels: Record<MusicalLayer, string> = {
  front: 'foreground', mid: 'middle layer', bed: 'background bed', whole: 'overall sound',
}

function classify(a: Genre, b: Genre, weight: number, dimension: MusicalDimension): CompatibilityKind {
  const first = a.compatibility[dimension]
  const second = b.compatibility[dimension]
  if (first.approach === second.approach) return 'reinforcing'
  const forceGap = Math.abs(first.force - second.force)
  if (first.layer !== second.layer) {
    // Arrangement and spatial layers can coexist even when their force differs greatly.
    if (['instrumentation', 'texture', 'production'].includes(dimension)) return 'complementary'
    return forceGap >= 55 ? 'contrasting' : 'complementary'
  }
  const opposed = (oppositionData[dimension] as string[][]).some(([one, two]) =>
    (first.approach === one && second.approach === two) ||
    (first.approach === two && second.approach === one),
  )
  if (opposed) return Math.min(weight, 100 - weight) >= 35 ? 'conflicting' : 'contrasting'
  if (forceGap >= 55) return 'contrasting'
  return 'complementary'
}

function explain(a: Genre, b: Genre, weight: number, dimension: MusicalDimension, dna: SoundDna): DimensionCompatibility {
  const kind = classify(a, b, weight, dimension)
  const lead = dna[dimension].anchorGenre === a.name ? a : b
  const support = lead.id === a.id ? b : a
  const first = a.compatibility[dimension]
  const second = b.compatibility[dimension]
  const label = dimensionLabels[dimension]
  const supportAccent = support.characteristics[dimension].accent
  const leadAnchor = lead.characteristics[dimension].anchor
  const weighting = `${weight}/${100 - weight}`
  let explanation: string
  let resolution: string | null = null

  if (kind === 'reinforcing') {
    explanation = `${a.name} and ${b.name} reinforce ${label}: both favour ${first.approach}. ${lead.name} leads this role at ${weighting}, while ${support.name} adds ${supportAccent}.`
  } else if (kind === 'complementary') {
    const layerReason = first.layer !== second.layer
      ? `${a.name} works in the ${layerLabels[first.layer]} and ${b.name} in the ${layerLabels[second.layer]}.`
      : 'Their distinct approaches can share the role without either needing to displace the other.'
    explanation = `${a.name} favours ${first.approach}; ${b.name} favours ${second.approach}. Their ${label} is complementary: ${layerReason} ${lead.name} leads, with ${support.name}'s ${supportAccent} in support.`
  } else {
    const competition = kind === 'conflicting'
      ? `Both demand control of ${label} in the ${layerLabels[first.layer]}`
      : `${a.name} favours ${first.approach}, while ${b.name} favours ${second.approach}`
    explanation = kind === 'conflicting'
      ? `${competition}: ${a.name} favours ${first.approach}, while ${b.name} favours ${second.approach}. ${lead.name} controls this disputed role at ${weighting}, based on the weighted role strengths.`
      : `${competition}; these approaches contrast in ${label}. ${lead.name} controls the role at ${weighting} because its weighted role strength is greater; ${support.name} remains an accent.`
    resolution = `Keep ${leadAnchor} from ${lead.name} as the main role; use ${supportAccent} from ${support.name} in the supporting layer.`
  }

  return { dimension, kind, leadGenre: lead.name, supportGenre: support.name, explanation, resolution }
}

export function analyzeCompatibility(primary: Genre, secondary: Genre, primaryWeight: number): CompatibilityReport {
  // mergeGenres validates the pair and weighting. It also owns the final lead per dimension.
  const dna = mergeGenres(primary, secondary, primaryWeight)
  const results = dimensions.map((dimension) => explain(primary, secondary, primaryWeight, dimension, dna))
  const counts: CompatibilityReport['counts'] = {
    reinforcing: 0, complementary: 0, contrasting: 0, conflicting: 0,
  }
  for (const result of results) counts[result.kind]++
  return { dimensions: results, counts }
}
