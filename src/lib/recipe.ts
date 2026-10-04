import type { Genre, MusicalDimension } from '../data/registry.ts'
import { mergeGenres } from './merge.ts'
import { analyzeCompatibility, dimensionLabels } from './compatibility.ts'

export type MusicalRecipe = { short: string; detailed: string }

const dimensions: MusicalDimension[] = [
  'rhythm', 'bass', 'harmony', 'instrumentation', 'texture', 'production', 'intensity',
]

export function createRecipe(primary: Genre, secondary: Genre, primaryWeight: number): MusicalRecipe {
  const dna = mergeGenres(primary, secondary, primaryWeight)
  const compatibility = analyzeCompatibility(primary, secondary, primaryWeight)
  const relationship = compatibility.dimensions.filter(item => item.resolution)
  const identity = `${primary.name} ${primaryWeight}% / ${secondary.name} ${100 - primaryWeight}%`
  const role = (dimension: MusicalDimension) => {
    const lead = dna[dimension].anchorGenre === primary.name ? primary : secondary
    const support = lead.id === primary.id ? secondary : primary
    return `${lead.characteristics[dimension].anchor}, accented by ${support.characteristics[dimension].accent}`
  }
  const guidance = relationship.length ? `Keep ${relationship[0].leadGenre} in control of ${dimensionLabels[relationship[0].dimension]}; use ${relationship[0].supportGenre} as an accent.` : ''

  const short = [
    `Create a musical blend of ${identity} at ${dna.tempo[0]}–${dna.tempo[1]} BPM.`,
    `Rhythm: ${role('rhythm')}. Bass: ${role('bass')}. Harmony: ${role('harmony')}.`,
    `Arrangement: ${role('instrumentation')}. Texture: ${role('texture')}. Space: ${role('production')}.`,
    `Dynamics: ${role('intensity')}. Energy ${dna.energy}/100; darkness ${dna.darkness}/100.`,
    guidance,
  ].filter(Boolean).join(' ')

  const detailed = [
    'MUSICAL RECIPE',
    `Source blend: ${identity}`,
    `Tempo: ${dna.tempo[0]}–${dna.tempo[1]} BPM; rhythmic engine: ${dna.tempoSource}.`,
    `Energy: ${dna.energy}/100. Darkness: ${dna.darkness}/100.`,
    '',
    'ARRANGEMENT',
    ...dimensions.map(dimension => `${dimensionLabels[dimension]}: ${dna[dimension].text}`),
    '',
    'GENRE INTERACTION',
    ...compatibility.dimensions.map(item => [
      `${dimensionLabels[item.dimension]} — ${item.kind}: ${item.explanation}`,
      item.resolution ? `Resolution: ${item.resolution}` : '',
    ].filter(Boolean).join('\n')),
  ].join('\n')

  return { short, detailed }
}
