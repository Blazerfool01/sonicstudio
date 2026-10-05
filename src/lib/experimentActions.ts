import { addProjectTrack, cleanProjectTrack, createProjectTrack, identitySnapshot } from './studioProject.ts'
import type { StudioProject, ProjectTrack, ProjectIdentitySnapshot } from './studioProject.ts'

export type IngredientKind = 'genre' | 'vocal' | 'mood'
export type HistoricalDraftRequest<K extends IngredientKind = IngredientKind> = {
  requestId: string; projectId: string; trackId: string; trackTitle: string; kind: K
  captured: NonNullable<ProjectIdentitySnapshot[K]>
}
export type CompareSeed = { requestId: string; projectId: string; trackAId: string }
function projectTrack(project: StudioProject, trackId: string): ProjectTrack {
  const track = project.tracks.find(t => t.id === trackId)
  if (!track) throw new Error('This track is no longer available in the current project.')
  return track
}
export function snapshotExperiment(project: StudioProject, title: string, version = '', id = crypto.randomUUID(), now = new Date().toISOString()): StudioProject {
  return addProjectTrack(project, cleanProjectTrack({ ...createProjectTrack(project, title, id, now), version }))
}
export function duplicateExperiment(project: StudioProject, trackId: string, title: string, version = '', copyNotes = false, id = crypto.randomUUID(), now = new Date().toISOString()): StudioProject {
  const source = projectTrack(project, trackId)
  const duplicate = cleanProjectTrack({ ...source, id, title, version, notes: copyNotes ? source.notes : '', file: null, creationSnapshot: identitySnapshot(source.creationSnapshot), createdAt: now, updatedAt: now })
  return addProjectTrack(project, duplicate)
}
export function createCompareSeed(project: StudioProject, trackId: string, requestId = crypto.randomUUID()): CompareSeed {
  projectTrack(project, trackId)
  return { requestId, projectId: project.id, trackAId: trackId }
}
export function validCompareSeed(project: StudioProject, seed: CompareSeed): boolean {
  return seed.projectId === project.id && project.tracks.some(t => t.id === seed.trackAId)
}
export function historicalDraft<K extends IngredientKind>(project: StudioProject, trackId: string, kind: K, requestId = crypto.randomUUID()): HistoricalDraftRequest<K> {
  const track = projectTrack(project, trackId)
  const captured = identitySnapshot(track.creationSnapshot)[kind]
  if (!captured) throw new Error(`No ${kind} settings were captured for this track.`)
  return { requestId, projectId: project.id, trackId, trackTitle: track.title, kind, captured: captured as NonNullable<ProjectIdentitySnapshot[K]> }
}
type ShortcutEvent = { key: string; altKey: boolean; shiftKey: boolean; ctrlKey: boolean; metaKey: boolean; repeat?: boolean; defaultPrevented?: boolean; isComposing?: boolean; getModifierState?: (key: string) => boolean; target: unknown }
export function shortcutAction(event: ShortcutEvent): 'snapshot' | 'compare' | null {
  if (event.defaultPrevented || event.repeat || event.isComposing || event.getModifierState?.('AltGraph') || !event.altKey || !event.shiftKey || event.ctrlKey || event.metaKey) return null
  const target = event.target as { closest?: (selector: string) => unknown } | null
  if (target?.closest?.('input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"]')) return null
  return event.key.toLowerCase() === 's' ? 'snapshot' : event.key.toLowerCase() === 'c' ? 'compare' : null
}
