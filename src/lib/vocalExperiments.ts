export type VocalExperiment = { id: string; label: string; note: string; personaId: string }

export const VOCAL_EXPERIMENT_STORAGE_KEY = 'sonic-studio.vocal-experiments'
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function createVocalExperiment(label: string, note: string, personaId: string): VocalExperiment {
  const trimmedLabel = label.trim()
  const trimmedNote = note.trim()
  if (!trimmedLabel || trimmedLabel.length > 80) throw new Error('Enter an experiment label of up to 80 characters')
  if (trimmedNote.length > 240) throw new Error('Keep the experiment note within 240 characters')
  if (!uuid.test(personaId)) throw new Error('Choose a saved persona')
  return { id: crypto.randomUUID(), label: trimmedLabel, note: trimmedNote, personaId }
}

export function parseVocalExperiments(raw: string | null): VocalExperiment[] {
  if (!raw) return []
  let value: unknown
  try { value = JSON.parse(raw) } catch { return [] }
  if (!value || typeof value !== 'object' || !('schemaVersion' in value) || value.schemaVersion !== 1 ||
      !('experiments' in value) || !Array.isArray(value.experiments)) return []
  const ids = new Set<string>()
  return value.experiments.filter((item: unknown): item is VocalExperiment => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return false
    const record = item as Record<string, unknown>
    if (typeof record.id !== 'string' || !uuid.test(record.id) || ids.has(record.id) ||
        typeof record.personaId !== 'string' || !uuid.test(record.personaId) ||
        typeof record.label !== 'string' || !record.label.trim() || record.label.length > 80 ||
        typeof record.note !== 'string' || record.note.length > 240) return false
    ids.add(record.id)
    return true
  })
}

export function readVocalExperiments(storage: Pick<Storage, 'getItem'>): VocalExperiment[] {
  try { return parseVocalExperiments(storage.getItem(VOCAL_EXPERIMENT_STORAGE_KEY)) } catch { return [] }
}

export function writeVocalExperiments(storage: Pick<Storage, 'setItem'>, experiments: VocalExperiment[]): void {
  storage.setItem(VOCAL_EXPERIMENT_STORAGE_KEY, JSON.stringify({ schemaVersion: 1, experiments }))
}
