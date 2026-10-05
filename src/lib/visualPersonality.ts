import { getGenre } from '../data/registry.ts'

/** Renderer configuration: no mood IDs, source selections, or canvas operations. */
export interface VisualPersonality {
  signal: string
  fill: string
  background: string
  gain: number
  stroke: number
  glow: number
  detail: number
  responseMs: number
  bassPulse: number
}

export interface MusicalCharacteristics {
  energy?: number
  tension?: number
  atmosphere?: number
  motion?: number
  weight?: number
  valence?: number
}

export interface GenreVisualSource {
  genres: readonly { genreId: string; weight: number }[]
}

export const DEFAULT_PERSONALITY: Readonly<VisualPersonality> = Object.freeze({
  signal: '#c8da90', fill: 'rgba(200, 218, 144, 0.2)', background: '#10130f',
  gain: 1, stroke: 1, glow: 8, detail: 1, responseMs: 0, bassPulse: 0,
})

function unit(value: number | undefined): number {
  return Number.isFinite(value) ? Math.max(0, Math.min(100, value!)) / 100 : 0.5
}

export function deriveVisualPersonality(source?: MusicalCharacteristics | null): Readonly<VisualPersonality> {
  if (!source) return DEFAULT_PERSONALITY
  const energy = unit(source.energy)
  const tension = unit(source.tension)
  const atmosphere = unit(source.atmosphere)
  const motion = unit(source.motion)
  const weight = unit(source.weight)
  const hue = Math.round(15 + unit(source.valence) * 155)
  return {
    signal: `hsl(${hue} 65% 72%)`, fill: `hsl(${hue} 65% 72% / 0.2)`, background: '#10130f',
    gain: 0.55 + energy * 1.15,
    stroke: 0.65 + tension * 1.1,
    glow: 2 + atmosphere * 16,
    detail: 0.45 + tension * 0.55,
    responseMs: 220 * (1 - motion),
    bassPulse: weight * 0.7,
  }
}

/**
 * Project the saved Genre Mixer source into the renderer-neutral axes used by
 * VisualPersonality. This adapter is the single translation boundary for genre.
 */
export function genreVisualCharacteristics(source?: GenreVisualSource | null): MusicalCharacteristics | null {
  if (!source?.genres.length) return null
  const selected: { weight: number; values: MusicalCharacteristics }[] = []
  for (const { genreId, weight } of source.genres) {
    let genre
    try { genre = getGenre(genreId) } catch { continue }
    if (!Number.isFinite(weight) || weight <= 0) continue
    const tempo = (genre.tempo[0] + genre.tempo[1]) / 2
    selected.push({
      weight,
      values: {
        energy: genre.energy,
        tension: genre.characteristics.intensity.strength,
        atmosphere: genre.characteristics.production.strength,
        motion: Math.max(0, Math.min(100, (tempo - 50) / 130 * 100)),
        weight: genre.characteristics.bass.strength,
        valence: 100 - genre.darkness,
      },
    })
  }
  const total = selected.reduce((sum, item) => sum + item.weight, 0)
  if (!total) return null
  const keys: (keyof MusicalCharacteristics)[] = ['energy', 'tension', 'atmosphere', 'motion', 'weight', 'valence']
  return Object.fromEntries(keys.map(key => [key, Math.round(selected.reduce((sum, item) => sum + item.values[key]! * item.weight, 0) / total)])) as MusicalCharacteristics
}

/** Combine independent Genre and Mood sources into one declarative input. */
export function combineVisualCharacteristics(
  genre: MusicalCharacteristics | null | undefined,
  mood: MusicalCharacteristics | null | undefined,
): MusicalCharacteristics | null {
  if (!genre) return mood ?? null
  if (!mood) return genre
  const keys: (keyof MusicalCharacteristics)[] = ['energy', 'tension', 'atmosphere', 'motion', 'weight', 'valence']
  return Object.fromEntries(keys.map(key => [key, Math.round(((genre[key] ?? 50) + (mood[key] ?? 50)) / 2)])) as MusicalCharacteristics
}

/** Time-based response owned by the renderer host, independent of frame rate. */
export function responseStep(current: number, target: number, elapsedMs: number, responseMs: number): number {
  const safeTarget = Number.isFinite(target) ? Math.max(0, Math.min(1, target)) : 0
  if (safeTarget === 0 || responseMs <= 0) return safeTarget
  const safeCurrent = Number.isFinite(current) ? Math.max(0, Math.min(1, current)) : 0
  return safeCurrent + (safeTarget - safeCurrent) * (1 - Math.exp(-Math.max(0, elapsedMs) / responseMs))
}
