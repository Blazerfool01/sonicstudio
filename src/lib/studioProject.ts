import { parseComparisons, comparisonsUsingTrack } from './trackComparison.ts'
import type { TrackComparison } from './trackComparison.ts'
import { genres } from '../data/registry.ts'
import { parseSavedMixes } from './savedMixes.ts'
import type { SavedMix } from './savedMixes.ts'
import { makeMoodPreset } from './moodPresetStorage.ts'
import type { MoodSelection } from './moodDna.ts'
import { createVoiceDna } from './voiceDna.ts'
import type { VocalSelections } from './voiceDna.ts'
import { parseTimeline } from './studioTimeline.ts'
import type { TimelineClip } from './studioTimeline.ts'

export const PROJECT_STORAGE_KEY = 'sonic-studio.projects.v1'
export type Origin = { label: string; sourceId: string | null }
export type GenreProjectSnapshot = Origin & { genres: SavedMix['genres'] }
export type VocalProjectSnapshot = Origin & { selections: VocalSelections; identityDescription: string }
export type MoodProjectSnapshot = Origin & { selections: MoodSelection[] }
export type StudioProject = {
  schemaVersion: 1; id: string; name: string; notes: string
  genre: GenreProjectSnapshot | null; vocal: VocalProjectSnapshot | null; mood: MoodProjectSnapshot | null
  tracks: ProjectTrack[]
  timeline: TimelineClip[]
  comparisons: TrackComparison[]
  createdAt: string; updatedAt: string
}
const date = (value: unknown): value is string => typeof value === 'string' && Number.isFinite(Date.parse(value))
function origin(value: Origin): Origin {
  if (!value || typeof value.label !== 'string' || !value.label.trim() || value.label.length > 160 ||
    !(value.sourceId === null || (typeof value.sourceId === 'string' && value.sourceId.trim()))) throw new Error('Invalid ingredient origin')
  return { label: value.label.trim(), sourceId: value.sourceId }
}
export function genreSnapshot(value: GenreProjectSnapshot): GenreProjectSnapshot {
  const valid = parseSavedMixes(JSON.stringify([{ ...value, schemaVersion: 1, id: 'validation', name: 'validation', createdAt: '2026-10-04', updatedAt: '2026-10-04' }]), genres.map(g => g.id))[0]
  if (!valid) throw new Error('Invalid genre sources')
  return { ...origin(value), genres: valid.genres.map(g => ({ genreId: g.genreId, weight: g.weight })) as SavedMix['genres'] }
}
export function vocalSnapshot(value: VocalProjectSnapshot): VocalProjectSnapshot {
  createVoiceDna(value.selections)
  if (typeof value.identityDescription !== 'string' || value.identityDescription.length > 240) throw new Error('Invalid vocal identity')
  const s = value.selections
  return { ...origin(value), identityDescription: value.identityDescription, selections: { register: s.register, texture: s.texture, delivery: s.delivery, effect: s.effect, breathiness: s.breathiness, power: s.power, warmth: s.warmth, rasp: s.rasp } }
}
export function moodSnapshot(value: MoodProjectSnapshot): MoodProjectSnapshot {
  const preset = makeMoodPreset('validation', value.selections, 'validation', '2026-10-04')
  return { ...origin(value), selections: preset.selections }
}
export function createProject(name: string, id = crypto.randomUUID(), now = new Date().toISOString()): StudioProject {
  if (!name.trim() || name.trim().length > 80 || !id.trim() || !date(now)) throw new Error('Enter a project name')
  return { schemaVersion: 1, id, name: name.trim(), notes: '', genre: null, vocal: null, mood: null, tracks: [], timeline: [], comparisons: [], createdAt: now, updatedAt: now }
}
export function attachIngredient<K extends 'genre' | 'vocal' | 'mood'>(project: StudioProject, kind: K, value: NonNullable<StudioProject[K]>, now = new Date().toISOString()): StudioProject {
  const snapshot = kind === 'genre' ? genreSnapshot(value as GenreProjectSnapshot) : kind === 'vocal' ? vocalSnapshot(value as VocalProjectSnapshot) : moodSnapshot(value as MoodProjectSnapshot)
  return { ...project, [kind]: snapshot, updatedAt: now }
}
export function parseProjects(raw: string | null): { projects: StudioProject[]; activeId: string | null } {
  const empty = { projects: [], activeId: null }
  try {
    const envelope = JSON.parse(raw ?? 'null')
    if (!envelope || envelope.schemaVersion !== 1 || !Array.isArray(envelope.projects)) return empty
    const projects: StudioProject[] = []
    const seen = new Set<string>()
    for (const p of envelope.projects) {
      try {
        if (!p || p.schemaVersion !== 1 || typeof p.id !== 'string' || seen.has(p.id) || typeof p.name !== 'string' || typeof p.notes !== 'string' || p.notes.length > 4000 || !date(p.createdAt) || !date(p.updatedAt)) continue
        const clean = createProject(p.name, p.id, p.createdAt)
        const tracks = parseProjectTracks(p.tracks)
        projects.push({ ...clean, notes: p.notes, updatedAt: p.updatedAt, genre: p.genre === null ? null : genreSnapshot(p.genre), vocal: p.vocal === null ? null : vocalSnapshot(p.vocal), mood: p.mood === null ? null : moodSnapshot(p.mood), tracks, timeline: parseTimeline(p.timeline, tracks.map(track => track.id)), comparisons: parseComparisons(p.comparisons, tracks) })
        seen.add(p.id)
      } catch { /* A damaged record cannot hide its valid neighbours. */ }
    }
    return { projects, activeId: projects.some(p => p.id === envelope.activeId) ? envelope.activeId : null }
  } catch { return empty }
}
export function writeProjects(storage: Pick<Storage, 'setItem'>, projects: StudioProject[], activeId: string | null) {
  const clean = parseProjects(JSON.stringify({ schemaVersion: 1, projects, activeId }))
  storage.setItem(PROJECT_STORAGE_KEY, JSON.stringify({ schemaVersion: 1, ...clean }))
}


export type ProjectIdentitySnapshot = Pick<StudioProject, 'genre' | 'vocal' | 'mood'>
export const TRACK_SOURCES = ['local', 'generated', 'downloaded', 'recorded', 'external'] as const
export type TrackSource = typeof TRACK_SOURCES[number]
export type TrackFileMetadata = { filename: string; type: string; size: number }
export type ProjectTrack = {
  schemaVersion: 1; id: string; title: string; version: string; source: TrackSource
  sourceDetail: string; notes: string; file: TrackFileMetadata | null
  creationSnapshot: ProjectIdentitySnapshot; createdAt: string; updatedAt: string
}
export function identitySnapshot(identity: ProjectIdentitySnapshot): ProjectIdentitySnapshot {
  return { genre: identity.genre === null ? null : genreSnapshot(identity.genre), vocal: identity.vocal === null ? null : vocalSnapshot(identity.vocal), mood: identity.mood === null ? null : moodSnapshot(identity.mood) }
}
function text(value: unknown, max: number, required = false): string {
  if (typeof value !== 'string' || value.length > max || (required && !value.trim())) throw new Error('Invalid track text')
  return value
}
export function cleanProjectTrack(t: ProjectTrack): ProjectTrack {
  if (!t || t.schemaVersion !== 1 || !TRACK_SOURCES.includes(t.source) || !date(t.createdAt) || !date(t.updatedAt)) throw new Error('Invalid track record')
  let file = null
  if (t.file !== null) {
    const f = t.file
    if (!f || !Number.isSafeInteger(f.size) || f.size <= 0) throw new Error('Invalid file metadata')
    file = { filename: text(f.filename, 1024, true), type: text(f.type, 160), size: f.size }
    if (file.type && !file.type.startsWith('audio/')) throw new Error('Invalid audio type')
  }
  return { schemaVersion: 1, id: text(t.id, 160, true), title: text(t.title, 160, true).trim(), version: text(t.version, 160), source: t.source, sourceDetail: text(t.sourceDetail, 240), notes: text(t.notes, 4000), file, creationSnapshot: identitySnapshot(t.creationSnapshot), createdAt: t.createdAt, updatedAt: t.updatedAt }
}
export function parseProjectTracks(value: unknown): ProjectTrack[] {
  if (!Array.isArray(value)) return []
  const seen = new Set<string>(); const tracks: ProjectTrack[] = []
  for (const item of value) {
    try { const t = cleanProjectTrack(item); if (!seen.has(t.id)) { tracks.push(t); seen.add(t.id) } } catch { /* Isolate damaged tracks within their project. */ }
  }
  return tracks
}
export function createProjectTrack(project: StudioProject, title: string, id = crypto.randomUUID(), now = new Date().toISOString()): ProjectTrack {
  return cleanProjectTrack({ schemaVersion: 1, id, title, version: '', source: 'local', sourceDetail: '', notes: '', file: null, creationSnapshot: identitySnapshot(project), createdAt: now, updatedAt: now })
}
export function addProjectTrack(project: StudioProject, track: ProjectTrack): StudioProject {
  if (project.tracks.some(t => t.id === track.id)) throw new Error('Track already exists')
  return { ...project, tracks: [...project.tracks, cleanProjectTrack(track)], updatedAt: track.updatedAt }
}
export function editProjectTrack(project: StudioProject, id: string, changes: Partial<Pick<ProjectTrack, 'title' | 'version' | 'source' | 'sourceDetail' | 'notes' | 'file'>>, now = new Date().toISOString()): StudioProject {
  return { ...project, tracks: project.tracks.map(t => t.id === id ? cleanProjectTrack({ ...t, ...changes, updatedAt: now }) : t), updatedAt: now }
}
export function removeProjectTrack(project: StudioProject, id: string, now = new Date().toISOString(), confirmComparisonDeletion = false): StudioProject {
  if (comparisonsUsingTrack(project, id).length && !confirmComparisonDeletion) throw new Error('Confirm deletion of dependent comparisons before removing this track')
  return { ...project, tracks: project.tracks.filter(t => t.id !== id), timeline: project.timeline.filter(clip => clip.trackId !== id), comparisons: project.comparisons.filter(c => c.trackAId !== id && c.trackBId !== id), updatedAt: now }
}
export function sameIdentity(a: ProjectIdentitySnapshot, b: ProjectIdentitySnapshot): boolean {
  return JSON.stringify(identitySnapshot(a)) === JSON.stringify(identitySnapshot(b))
}
