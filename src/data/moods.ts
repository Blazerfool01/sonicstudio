export const moodDimensions = [
  { id: 'valence', name: 'Valence', low: 'Bleak', high: 'Euphoric' },
  { id: 'energy', name: 'Energy', low: 'Still', high: 'Explosive' },
  { id: 'tension', name: 'Tension', low: 'Peaceful', high: 'Uneasy' },
  { id: 'intimacy', name: 'Intimacy', low: 'Distant', high: 'Intimate' },
  { id: 'weight', name: 'Weight', low: 'Light', high: 'Heavy' },
  { id: 'motion', name: 'Motion', low: 'Suspended', high: 'Driving' },
  { id: 'atmosphere', name: 'Atmosphere', low: 'Grounded', high: 'Otherworldly' },
] as const

export type MoodDimension = typeof moodDimensions[number]['id']
export type MoodProfile = Record<MoodDimension, number>
export type Mood = { id: string; name: string; profile: MoodProfile }

// All values use the same 0–100 scale, ordered by the seven dimensions above.
const entries: [string, string, number[]][] = [
  ['melancholic', 'Melancholic', [18, 28, 42, 70, 56, 25, 53]],
  ['euphoric', 'Euphoric', [95, 85, 18, 62, 33, 82, 61]],
  ['brooding', 'Brooding', [20, 42, 76, 38, 78, 35, 48]],
  ['serene', 'Serene', [70, 16, 7, 58, 15, 13, 47]],
  ['menacing', 'Menacing', [8, 68, 94, 17, 90, 62, 42]],
  ['romantic', 'Romantic', [77, 40, 22, 96, 34, 36, 54]],
  ['nostalgic', 'Nostalgic', [43, 29, 25, 74, 34, 24, 48]],
  ['haunting', 'Haunting', [14, 27, 78, 33, 52, 15, 92]],
  ['triumphant', 'Triumphant', [88, 91, 29, 46, 77, 94, 35]],
  ['vulnerable', 'Vulnerable', [29, 20, 62, 95, 31, 18, 43]],
  ['hypnotic', 'Hypnotic', [50, 43, 32, 48, 40, 53, 80]],
  ['restless', 'Restless', [39, 77, 80, 48, 52, 91, 49]],
  ['dreamlike', 'Dreamlike', [66, 26, 20, 61, 18, 16, 96]],
  ['aggressive', 'Aggressive', [19, 97, 86, 22, 94, 96, 20]],
]

export const moods: Mood[] = entries.map(([id, name, values]) => ({
  id, name,
  profile: Object.fromEntries(moodDimensions.map((dimension, index) => [dimension.id, values[index]])) as MoodProfile,
}))

export function getMood(id: string): Mood | undefined { return moods.find(mood => mood.id === id) }
