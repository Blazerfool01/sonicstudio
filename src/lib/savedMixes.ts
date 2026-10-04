export const STORAGE_KEY = 'sonic-studio.saved-mixes'
export const SCHEMA_VERSION = 1

export type SavedMix = {
  id: string
  name: string
  schemaVersion: 1
  genres: [{ genreId: string; weight: number }, { genreId: string; weight: number }]
  createdAt: string
  updatedAt: string
}

export type MixSource = { firstId: string; secondId: string; weight: number }

export function readSavedMixes(storage: Pick<Storage, 'getItem'>, validIds: readonly string[]): SavedMix[] {
  try { return parseSavedMixes(storage.getItem(STORAGE_KEY), validIds) } catch { return [] }
}

export function parseSavedMixes(raw: string | null, validIds: readonly string[]): SavedMix[] {
  if (!raw) return []
  let parsed: unknown
  try { parsed = JSON.parse(raw) } catch { return [] }
  if (!Array.isArray(parsed)) return []
  const ids = new Set<string>()
  const allowed = new Set(validIds)
  return parsed.filter((value): value is SavedMix => {
    if (!value || typeof value !== 'object') return false
    const mix = value as Partial<SavedMix>
    if (mix.schemaVersion !== SCHEMA_VERSION || typeof mix.id !== 'string' || !mix.id || ids.has(mix.id)) return false
    if (typeof mix.name !== 'string' || !mix.name.trim() || mix.name.length > 80) return false
    if (typeof mix.createdAt !== 'string' || !Number.isFinite(Date.parse(mix.createdAt))) return false
    if (typeof mix.updatedAt !== 'string' || !Number.isFinite(Date.parse(mix.updatedAt))) return false
    if (!Array.isArray(mix.genres) || mix.genres.length !== 2) return false
    const [a, b] = mix.genres
    if (!a || !b || !allowed.has(a.genreId) || !allowed.has(b.genreId) || a.genreId === b.genreId) return false
    if (!Number.isInteger(a.weight) || a.weight < 10 || a.weight > 90 || a.weight % 5 !== 0 ||
        !Number.isInteger(b.weight) || a.weight + b.weight !== 100) return false
    ids.add(mix.id)
    return true
  })
}

export function sourceOf(mix: SavedMix): MixSource {
  return { firstId: mix.genres[0].genreId, secondId: mix.genres[1].genreId, weight: mix.genres[0].weight }
}

export function makeMix(name: string, source: MixSource, id: string = crypto.randomUUID(), now = new Date().toISOString()): SavedMix {
  return {
    id, name: name.trim(), schemaVersion: 1,
    genres: [{ genreId: source.firstId, weight: source.weight }, { genreId: source.secondId, weight: 100 - source.weight }],
    createdAt: now, updatedAt: now,
  }
}

export function updateMix(mix: SavedMix, name: string, source: MixSource, now = new Date().toISOString()): SavedMix {
  return { ...makeMix(name, source, mix.id, now), createdAt: mix.createdAt }
}
