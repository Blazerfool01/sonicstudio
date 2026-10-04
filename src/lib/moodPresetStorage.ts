import { deriveMoodDna } from './moodDna.ts'
import type { MoodSelection } from './moodDna.ts'

export const MOOD_PRESET_STORAGE_KEY = 'sonic-studio.mood-presets'
export const MOOD_PRESET_SCHEMA_VERSION = 1

export type MoodPreset = {
  id: string
  name: string
  selections: MoodSelection[]
  createdAt: string
  updatedAt: string
}

function validSelections(value: unknown): value is MoodSelection[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > 3) return false
  if (value.some(item => !item || typeof item !== 'object' ||
    typeof item.moodId !== 'string' || !Number.isInteger(item.weight))) return false
  try { return deriveMoodDna(value as MoodSelection[]) !== null } catch { return false }
}

function cloneSelections(selections: readonly MoodSelection[]): MoodSelection[] {
  return selections.map(({ moodId, weight }) => ({ moodId, weight }))
}

function validDate(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value))
}

export function parseMoodPresets(raw: string | null): MoodPreset[] {
  if (!raw) return []
  let parsed: unknown
  try { parsed = JSON.parse(raw) } catch { return [] }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return []
  const envelope = parsed as { schemaVersion?: unknown; presets?: unknown }
  if (envelope.schemaVersion !== MOOD_PRESET_SCHEMA_VERSION || !Array.isArray(envelope.presets)) return []
  const seen = new Set<string>()
  const result: MoodPreset[] = []
  for (const value of envelope.presets) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) continue
    const preset = value as Partial<MoodPreset>
    if (typeof preset.id !== 'string' || !preset.id.trim() || seen.has(preset.id) ||
      typeof preset.name !== 'string' || !preset.name.trim() || preset.name.length > 80 ||
      !validSelections(preset.selections) || !validDate(preset.createdAt) || !validDate(preset.updatedAt)) continue
    seen.add(preset.id)
    result.push({ id: preset.id, name: preset.name.trim(), selections: cloneSelections(preset.selections),
      createdAt: preset.createdAt, updatedAt: preset.updatedAt })
  }
  return result
}

export function readMoodPresets(storage: Pick<Storage, 'getItem'>): MoodPreset[] {
  try { return parseMoodPresets(storage.getItem(MOOD_PRESET_STORAGE_KEY)) } catch { return [] }
}

export function writeMoodPresets(storage: Pick<Storage, 'setItem'>, presets: readonly MoodPreset[]): void {
  const clean = parseMoodPresets(JSON.stringify({ schemaVersion: MOOD_PRESET_SCHEMA_VERSION, presets }))
  storage.setItem(MOOD_PRESET_STORAGE_KEY, JSON.stringify({ schemaVersion: MOOD_PRESET_SCHEMA_VERSION, presets: clean }))
}

export function makeMoodPreset(name: string, selections: readonly MoodSelection[], id: string = crypto.randomUUID(), now = new Date().toISOString()): MoodPreset {
  if (typeof name !== 'string' || !name.trim() || name.trim().length > 80 || !validSelections(selections) || !id.trim() || !validDate(now)) {
    throw new Error('A mood preset needs a name and one to three valid weighted moods.')
  }
  return { id, name: name.trim(), selections: cloneSelections(selections), createdAt: now, updatedAt: now }
}

export function updateMoodPreset(preset: MoodPreset, name: string, selections: readonly MoodSelection[], now = new Date().toISOString()): MoodPreset {
  return { ...makeMoodPreset(name, selections, preset.id, now), createdAt: preset.createdAt }
}

export function deleteMoodPreset(presets: readonly MoodPreset[], id: string): MoodPreset[] {
  return presets.filter(preset => preset.id !== id)
}

export function selectionsOf(preset: MoodPreset): MoodSelection[] {
  return cloneSelections(preset.selections)
}
