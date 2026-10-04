import genreData from './genres.json'
import characteristicData from './characteristics.json'
import compatibilityData from './compatibility.json'

export type MusicalDimension = 'rhythm' | 'bass' | 'harmony' | 'instrumentation' | 'texture' | 'production' | 'intensity'
export type MusicalRole = { anchor: string; accent: string; strength: number }
export type Characteristics = Record<MusicalDimension, MusicalRole>
export type MusicalLayer = 'front' | 'mid' | 'bed' | 'whole'
export type CompatibilityFacet = { approach: string; layer: MusicalLayer; force: number }
export type CompatibilityProfile = Record<MusicalDimension, CompatibilityFacet>

export type Genre = {
  id: string
  name: string
  family: string
  color: string
  description: string
  tempo: [number, number]
  energy: number
  darkness: number
  characteristics: Characteristics
  compatibility: CompatibilityProfile
}

const roles = characteristicData as Record<string, Characteristics>
const compatibility = compatibilityData as Record<string, CompatibilityProfile>
export const genres: Genre[] = genreData.map((entry) => ({
  ...entry,
  tempo: entry.tempo as [number, number],
  characteristics: roles[entry.id],
  compatibility: compatibility[entry.id],
}))

export function getGenre(id: string): Genre {
  const genre = genres.find((entry) => entry.id === id)
  if (!genre) throw new Error(`Unknown genre: ${id}`)
  return genre
}
