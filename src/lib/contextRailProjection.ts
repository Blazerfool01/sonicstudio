import { getGenre } from '../data/registry.ts'
import { analyzeCompatibility } from './compatibility.ts'
import { mergeGenres } from './merge.ts'
import { deriveMoodDna } from './moodDna.ts'
import { analyzeMoodRelationships } from './moodRelationships.ts'
import { interpretMoodRelationships } from './moodRelationshipInterpretation.ts'
import { productionGuidanceForMoodDna } from './moodProductionGuidance.ts'
import { createVoiceDna } from './voiceDna.ts'
import { createVocalInterpretation } from './vocalInterpretation.ts'
import { selectedProjectTrack } from './studioInteraction.ts'
import type { ProjectTrackSelection } from './studioInteraction.ts'
import type { ProjectIdentitySnapshot, ProjectTrack, StudioProject } from './studioProject.ts'
import { ingredientDescription } from './projectIdentity.ts'

export type ContextRailIngredient = {
  kind: 'genre' | 'vocal' | 'mood'
  label: string
  present: boolean
  detail: string
  origin: 'unattached' | 'live' | 'saved'
  sourceId: string | null
  originLabel: string
}

export type ContextRailGuidance = {
  genre: { present: boolean; lines: string[] }
  vocal: { present: boolean; lines: string[] }
  mood: { present: boolean; lines: string[] }
}

export type ContextRailProjection = {
  mode: 'empty' | 'current' | 'historical'
  project: null | {
    id: string
    name: string
    trackCount: number
    comparisonCount: number
    ingredientCount: number
    notes: string
    ingredients: ContextRailIngredient[]
  }
  selectedTrack: null | {
    id: string
    title: string
    version: string
    source: string
    sourceDetail: string
    notes: string
  }
  identity: {
    label: 'Current project identity' | 'Historical creation identity'
    ingredients: ContextRailIngredient[]
    guidance: ContextRailGuidance
  } | null
}

function projectIngredients(identity: ProjectIdentitySnapshot): ContextRailIngredient[] {
  return (['genre', 'vocal', 'mood'] as const).map(kind => {
    const snapshot = identity[kind]
    const sourceId = snapshot?.sourceId ?? null
    return {
      kind,
      label: snapshot?.label ?? 'Not attached',
      present: snapshot !== null,
      detail: snapshot ? ingredientDescription(identity, kind) ?? '' : 'No source is attached.',
      origin: snapshot ? sourceId ? 'saved' : 'live' : 'unattached',
      sourceId,
      originLabel: !snapshot ? 'No source attached' : sourceId ? `Saved source · ID ${sourceId}` : 'Current tool snapshot · no saved source ID',
    }
  })
}

function guidanceFor(identity: ProjectIdentitySnapshot): ContextRailGuidance {
  const genre = identity.genre
  const genreLines: string[] = []
  if (genre) {
    const first = getGenre(genre.genres[0].genreId)
    const second = getGenre(genre.genres[1].genreId)
    const dna = mergeGenres(first, second, genre.genres[0].weight)
    const compatibility = analyzeCompatibility(first, second, genre.genres[0].weight)
    const tension = compatibility.dimensions.filter(item => item.kind === 'contrasting' || item.kind === 'conflicting')
    genreLines.push(`${dna.tempo[0]}–${dna.tempo[1]} BPM, with ${dna.tempoSource} anchoring the rhythm.`)
    genreLines.push(tension.length
      ? `${tension.length} of 7 roles need deliberate coexistence; ${tension[0].resolution ?? tension[0].explanation}`
      : 'The compatibility engine finds no contrasting or conflicting roles.')
  }

  const vocalLines: string[] = []
  if (identity.vocal) {
    const dna = createVoiceDna(identity.vocal.selections)
    const interpretation = createVocalInterpretation(identity.vocal.selections)
    vocalLines.push(`${dna.register.label} register · ${dna.texture.label} texture · ${dna.delivery.label} delivery.`)
    vocalLines.push(interpretation.strategy)
    if (interpretation.tensions[0]) vocalLines.push(interpretation.tensions[0].resolution)
  }

  const moodLines: string[] = []
  if (identity.mood) {
    const dna = deriveMoodDna(identity.mood.selections)
    if (dna) {
      const relationships = analyzeMoodRelationships(identity.mood.selections)
      const interpretation = interpretMoodRelationships(relationships, identity.mood.selections)
      const production = productionGuidanceForMoodDna(dna)
      moodLines.push(interpretation.summary)
      moodLines.push(interpretation.strategy)
      if (production) moodLines.push(production.overallDirection)
    }
  }

  return {
    genre: { present: genre !== null, lines: genreLines },
    vocal: { present: identity.vocal !== null, lines: vocalLines },
    mood: { present: identity.mood !== null, lines: moodLines },
  }
}

/**
 * Build a read-only rail view from the active project and Phase A's scoped
 * selection. Historical identity always comes from the matching track record.
 */
export function deriveContextRailProjection(
  project: StudioProject | null,
  selection: ProjectTrackSelection | null,
): ContextRailProjection {
  if (!project) return { mode: 'empty', project: null, selectedTrack: null, identity: null }

  const selected: ProjectTrack | null = selectedProjectTrack(project, selection)
  const currentIdentity: ProjectIdentitySnapshot = {
    genre: project.genre,
    vocal: project.vocal,
    mood: project.mood,
  }
  const historical = selected !== null
  const identity = historical ? selected.creationSnapshot : currentIdentity

  return {
    mode: historical ? 'historical' : 'current',
    project: {
      id: project.id,
      name: project.name,
      trackCount: project.tracks.length,
      comparisonCount: project.comparisons.length,
      ingredientCount: [project.genre, project.vocal, project.mood].filter(Boolean).length,
      notes: project.notes,
      ingredients: projectIngredients(currentIdentity),
    },
    selectedTrack: selected ? {
      id: selected.id,
      title: selected.title,
      version: selected.version,
      source: selected.source,
      sourceDetail: selected.sourceDetail,
      notes: selected.notes,
    } : null,
    identity: {
      label: historical ? 'Historical creation identity' : 'Current project identity',
      ingredients: projectIngredients(identity),
      guidance: guidanceFor(identity),
    },
  }
}
