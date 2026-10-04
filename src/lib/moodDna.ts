import { getMood, moodDimensions } from '../data/moods.ts'
import type { MoodProfile } from '../data/moods.ts'

export type MoodSelection = { moodId: string; weight: number }
export type MoodDna = { dimensions: MoodProfile; dominantMood: { id: string; name: string } }

export function deriveMoodDna(selections: readonly MoodSelection[]): MoodDna | null {
  if (selections.length === 0) return null
  if (selections.length > 3 || new Set(selections.map(item => item.moodId)).size !== selections.length ||
      selections.some(item => !getMood(item.moodId) || !Number.isInteger(item.weight) || item.weight < 1 || item.weight > 100)) {
    throw new Error('Select one to three distinct known moods with integer weights from 1 to 100.')
  }
  const total = selections.reduce((sum, item) => sum + item.weight, 0)
  const dominant = selections.reduce((best, item) => item.weight > best.weight ? item : best)
  const dimensions = Object.fromEntries(moodDimensions.map(({ id }) => [id,
    Math.round(selections.reduce((sum, item) => sum + getMood(item.moodId)!.profile[id] * item.weight, 0) / total),
  ])) as MoodProfile
  return { dimensions, dominantMood: { id: dominant.moodId, name: getMood(dominant.moodId)!.name } }
}
