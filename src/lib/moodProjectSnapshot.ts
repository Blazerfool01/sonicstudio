import { moods } from '../data/moods.ts'
import type { MoodSelection } from './moodDna.ts'
import type { MoodProjectSnapshot } from './studioProject.ts'

export type MoodPresetOrigin = { id: string; name: string }

export function createMoodProjectSnapshot(selections: readonly MoodSelection[], preset: MoodPresetOrigin | null): MoodProjectSnapshot {
  const label = preset?.name ?? selections.map(selection => {
    const mood = moods.find(item => item.id === selection.moodId)
    if (!mood) throw new Error(`Unknown mood: ${selection.moodId}`)
    return `${mood.name} ${selection.weight}`
  }).join(' / ')
  return {
    label,
    sourceId: preset?.id ?? null,
    selections: selections.map(({ moodId, weight }) => ({ moodId, weight })),
  }
}
