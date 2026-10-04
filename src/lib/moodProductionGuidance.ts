import type { MoodDna } from './moodDna.ts'
import { translateMoodDna } from './moodTranslation.ts'

// The view has no production section until there is a source Mood DNA.
export function productionGuidanceForMoodDna(dna: MoodDna | null) {
  return dna ? translateMoodDna(dna) : null
}
