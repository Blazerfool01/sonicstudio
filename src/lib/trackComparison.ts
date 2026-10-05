import type { StudioProject, ProjectTrack } from './studioProject.ts'

export const OBSERVATION_FIELDS = ['vocalIdentity', 'atmosphere', 'arrangement', 'mix', 'improved', 'regressed'] as const
export type ObservationField = typeof OBSERVATION_FIELDS[number]
export type ComparisonObservations = Record<ObservationField, string>
export type TrackComparison = {
  schemaVersion: 1
  id: string
  trackAId: string
  trackBId: string
  observations: ComparisonObservations
  preferredTrackId: string | null
  conclusion: string
  createdAt: string
  updatedAt: string
}
export function emptyObservations(): ComparisonObservations {
  return { vocalIdentity: '', atmosphere: '', arrangement: '', mix: '', improved: '', regressed: '' }
}
function text(value: unknown, max: number, required = false): string {
  if (typeof value !== 'string' || value.length > max || (required && !value.trim())) throw new Error('Invalid comparison text')
  return value
}
export function cleanComparison(value: TrackComparison, tracks: readonly Pick<ProjectTrack, 'id'>[]): TrackComparison {
  if (!value || value.schemaVersion !== 1) throw new Error('Unsupported comparison')
  const id = text(value.id, 160, true)
  const trackAId = text(value.trackAId, 160, true)
  const trackBId = text(value.trackBId, 160, true)
  if (trackAId === trackBId || !tracks.some(t => t.id === trackAId) || !tracks.some(t => t.id === trackBId)) throw new Error('Choose two distinct existing project tracks')
  if (value.preferredTrackId !== null && value.preferredTrackId !== trackAId && value.preferredTrackId !== trackBId) throw new Error('Preference must be A, B or undecided')
  if (![value.createdAt, value.updatedAt].every(d => typeof d === 'string' && Number.isFinite(Date.parse(d)))) throw new Error('Invalid comparison timestamp')
  const observations = emptyObservations()
  for (const field of OBSERVATION_FIELDS) observations[field] = text(value.observations?.[field], 2000)
  return { schemaVersion: 1, id, trackAId, trackBId, observations, preferredTrackId: value.preferredTrackId, conclusion: text(value.conclusion, 4000), createdAt: value.createdAt, updatedAt: value.updatedAt }
}
export function parseComparisons(value: unknown, tracks: readonly Pick<ProjectTrack, 'id'>[]): TrackComparison[] {
  if (!Array.isArray(value)) return []
  const seen = new Set<string>()
  const comparisons: TrackComparison[] = []
  for (const record of value) {
    try {
      const clean = cleanComparison(record, tracks)
      if (!seen.has(clean.id)) { comparisons.push(clean); seen.add(clean.id) }
    } catch { /* Invalid or dangling comparisons never hide valid siblings. */ }
  }
  return comparisons
}
export function createComparison(project: StudioProject, trackAId: string, trackBId: string, id = crypto.randomUUID(), now = new Date().toISOString()): TrackComparison {
  return cleanComparison({ schemaVersion: 1, id, trackAId, trackBId, observations: emptyObservations(), preferredTrackId: null, conclusion: '', createdAt: now, updatedAt: now }, project.tracks)
}
export function addComparison(project: StudioProject, comparison: TrackComparison): StudioProject {
  if (project.comparisons.some(c => c.id === comparison.id)) throw new Error('Comparison already exists')
  const clean = cleanComparison(comparison, project.tracks)
  return { ...project, comparisons: [...project.comparisons, clean], updatedAt: clean.updatedAt }
}
export function editComparison(project: StudioProject, id: string, changes: Pick<TrackComparison, 'observations' | 'preferredTrackId' | 'conclusion'>, now = new Date().toISOString()): StudioProject {
  const original = project.comparisons.find(c => c.id === id)
  if (!original) throw new Error('Comparison no longer exists')
  const clean = cleanComparison({ ...original, observations: changes.observations, preferredTrackId: changes.preferredTrackId, conclusion: changes.conclusion, updatedAt: now }, project.tracks)
  return { ...project, comparisons: project.comparisons.map(c => c.id === id ? clean : c), updatedAt: now }
}
export function deleteComparison(project: StudioProject, id: string, now = new Date().toISOString()): StudioProject {
  return { ...project, comparisons: project.comparisons.filter(c => c.id !== id), updatedAt: now }
}
export function comparisonsUsingTrack(project: StudioProject, trackId: string): TrackComparison[] {
  return project.comparisons.filter(c => c.trackAId === trackId || c.trackBId === trackId)
}
