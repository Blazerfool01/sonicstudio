import { createVoiceDna } from './voiceDna.ts'
import type { VocalSelections, VoiceDna } from './voiceDna.ts'
import type { VocalPersona } from './vocalPersona.ts'

export const PERSONA_STORAGE_KEY = 'sonic-studio.saved-personas'
export const PERSONA_SCHEMA_VERSION = 1

const selectionKeys = ['register', 'texture', 'delivery', 'effect', 'breathiness', 'power', 'warmth', 'rasp'] as const
const dimensionKeys = ['breathiness', 'power', 'warmth', 'rasp'] as const
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function isSelections(value: unknown): value is VocalSelections {
  if (!isObject(value) || Object.keys(value).length !== selectionKeys.length) return false
  try {
    createVoiceDna(value as VocalSelections)
    return true
  } catch { return false }
}

function isVoiceDna(value: unknown, selections: VocalSelections): value is VoiceDna {
  if (!isObject(value) || typeof value.description !== 'string' || !value.description.trim()) return false
  for (const key of ['register', 'texture', 'delivery', 'effect'] as const) {
    const trait = value[key]
    if (!isObject(trait) || trait.id !== selections[key] || typeof trait.label !== 'string' || !trait.label.trim() ||
        typeof trait.description !== 'string' || !trait.description.trim()) return false
  }
  if (!isObject(value.dimensions)) return false
  for (const key of dimensionKeys) {
    const dimension = value.dimensions[key]
    if (!isObject(dimension) || dimension.value !== selections[key] ||
        typeof dimension.description !== 'string' || !dimension.description.trim()) return false
  }
  return true
}

function isPersona(value: unknown): value is VocalPersona {
  if (!isObject(value) || typeof value.id !== 'string' || !uuidPattern.test(value.id)) return false
  if (typeof value.name !== 'string' || !value.name.trim() || value.name.length > 80) return false
  if (typeof value.identityDescription !== 'string' || !value.identityDescription.trim() || value.identityDescription.length > 240) return false
  return isSelections(value.selections) && isVoiceDna(value.voiceDna, value.selections)
}

export function parseSavedPersonas(raw: string | null): VocalPersona[] {
  if (!raw) return []
  let parsed: unknown
  try { parsed = JSON.parse(raw) } catch { return [] }
  if (!isObject(parsed) || parsed.schemaVersion !== PERSONA_SCHEMA_VERSION || !Array.isArray(parsed.personas)) return []
  const ids = new Set<string>()
  return parsed.personas.filter((value: unknown): value is VocalPersona => {
    if (!isPersona(value) || ids.has(value.id)) return false
    ids.add(value.id)
    return true
  })
}

export function readSavedPersonas(storage: Pick<Storage, 'getItem'>): VocalPersona[] {
  try { return parseSavedPersonas(storage.getItem(PERSONA_STORAGE_KEY)) } catch { return [] }
}

export function writeSavedPersonas(storage: Pick<Storage, 'setItem'>, personas: VocalPersona[]): void {
  storage.setItem(PERSONA_STORAGE_KEY, JSON.stringify({ schemaVersion: PERSONA_SCHEMA_VERSION, personas }))
}
