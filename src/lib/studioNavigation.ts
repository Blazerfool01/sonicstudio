import type { ProjectTrack } from './studioProject.ts'
export type StudioView = 'create' | 'tracks' | 'compare' | 'visualise'
export type CreateTool = 'overview' | 'genre' | 'vocal' | 'mood' | 'export'
export const STUDIO_VIEWS: readonly { id: StudioView; label: string }[] = [{ id: 'create', label: 'Create' }, { id: 'tracks', label: 'Tracks' }, { id: 'compare', label: 'Compare' }, { id: 'visualise', label: 'Visualise' }]
export const CREATE_TOOLS: readonly { id: CreateTool; label: string }[] = [{ id: 'overview', label: 'Identity & Brief' }, { id: 'genre', label: 'Genre Mixer' }, { id: 'vocal', label: 'Vocal Persona' }, { id: 'mood', label: 'Mood Mapper' }]

// Navigation is session state; historical personality requires an explicit handoff.
export function historicalTrack(tracks: readonly ProjectTrack[], openedId: string | null, attachments: Readonly<Record<string, string>>, selectedLocalId: string | null): ProjectTrack | undefined {
  if (!openedId || !selectedLocalId || attachments[openedId] !== selectedLocalId) return undefined
  return tracks.find(track => track.id === openedId)
}
export function playbackViewActive(view: StudioView): boolean { return view === 'compare' || view === 'visualise' }
