import { moodDimensions } from '../data/moods.ts'
import type { MoodDna } from './moodDna.ts'

export function describeMoodDna(dna: MoodDna | null): string {
  if (!dna) return 'Select a mood to reveal its emotional character.'
  const strongest = [...moodDimensions].map(dimension => ({
    label: dna.dimensions[dimension.id] < 50 ? dimension.low.toLowerCase() : dimension.high.toLowerCase(),
    strength: Math.abs(dna.dimensions[dimension.id] - 50),
  })).sort((a, b) => b.strength - a.strength)
  return `Led by ${dna.dominantMood.name.toLowerCase()}, this emotional space feels ${strongest[0].label} and ${strongest[1].label}.`
}
