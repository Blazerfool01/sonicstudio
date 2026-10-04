import { genres } from '../data/registry.ts'
import { parseSavedMixes } from './savedMixes.ts'
import type { SavedMix } from './savedMixes.ts'
import { makeMoodPreset } from './moodPresetStorage.ts'
import type { MoodSelection } from './moodDna.ts'
import { createVoiceDna } from './voiceDna.ts'
import type { VocalSelections } from './voiceDna.ts'

export const PROJECT_STORAGE_KEY = 'sonic-studio.projects.v1'
export type Origin = { label: string; sourceId: string | null }
export type GenreProjectSnapshot = Origin & { genres: SavedMix['genres'] }
export type VocalProjectSnapshot = Origin & { selections: VocalSelections; identityDescription: string }
export type MoodProjectSnapshot = Origin & { selections: MoodSelection[] }
export type StudioProject = {
  schemaVersion: 1; id: string; name: string; notes: string
  genre: GenreProjectSnapshot | null; vocal: VocalProjectSnapshot | null; mood: MoodProjectSnapshot | null
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
  return { schemaVersion: 1, id, name: name.trim(), notes: '', genre: null, vocal: null, mood: null, createdAt: now, updatedAt: now }
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
        projects.push({ ...clean, notes: p.notes, updatedAt: p.updatedAt, genre: p.genre === null ? null : genreSnapshot(p.genre), vocal: p.vocal === null ? null : vocalSnapshot(p.vocal), mood: p.mood === null ? null : moodSnapshot(p.mood) })
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
