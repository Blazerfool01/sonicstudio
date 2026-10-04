import type { MoodDimension } from './moods.ts'

export const musicalDomains = ['harmony', 'rhythm', 'dynamics', 'density', 'space', 'texture', 'arrangement'] as const
export type MusicalDomain = typeof musicalDomains[number]
export type MoodRegion = 'strongLow' | 'low' | 'neutral' | 'high' | 'strongHigh'

export const moodRegionBounds = {
  strongLowMax: 14,
  lowMax: 39,
  neutralMax: 60,
  highMax: 85,
  interactionLowMax: 30,
  interactionHighMin: 70,
  priorityMinDistance: 10,
  strongPriorityMinDistance: 20,
} as const

export type DomainCue = { trait: string; guidance: string }
export type RegionCues = Record<'low' | 'neutral' | 'high', DomainCue> & Partial<Record<'strongLow' | 'strongHigh', DomainCue>>
export type DimensionGuidance = { domains: Partial<Record<MusicalDomain, RegionCues>> }

// A dimension can inform several musical decisions. Strong endpoint cues are
// explicit where the same advice would understate an extreme Mood DNA value.
export const moodTranslationGuidance: Record<MoodDimension, DimensionGuidance> = {
  valence: { domains: {
    harmony: {
      low: { trait: 'shaded harmony', guidance: 'Use darker harmonic colour and let melodic lift arrive sparingly.' },
      neutral: { trait: 'open harmonic colour', guidance: 'Keep harmonic colour flexible, without forcing a bleak or euphoric reading.' },
      high: { trait: 'lifted harmony', guidance: 'Favor consonant lift and rising melodic contours.' },
      strongLow: { trait: 'deeply shaded harmony', guidance: 'Let dark harmony and downward melodic contours define the tonal centre.' },
      strongHigh: { trait: 'radiant harmony', guidance: 'Make harmonic release and rising melody a clear source of uplift.' },
    },
    arrangement: {
      low: { trait: 'reserved release', guidance: 'Hold back bright arrivals so any lift feels earned.' },
      neutral: { trait: 'flexible emotional arc', guidance: 'Leave room for both shadow and release in the arrangement.' },
      high: { trait: 'clear lift', guidance: 'Give melodic arrivals room to open the arrangement.' },
    },
  } },
  energy: { domains: {
    dynamics: {
      low: { trait: 'restrained dynamics', guidance: 'Keep levels and attacks controlled rather than pushing every phrase.' },
      neutral: { trait: 'measured dynamics', guidance: 'Use moderate dynamic contrast without a constant peak.' },
      high: { trait: 'forceful dynamics', guidance: 'Allow stronger attacks and clear dynamic peaks.' },
      strongLow: { trait: 'near-still dynamics', guidance: 'Let small changes carry expression while attacks remain soft.' },
      strongHigh: { trait: 'explosive dynamics', guidance: 'Build decisive peaks with pronounced attacks and release.' },
    },
    rhythm: {
      low: { trait: 'sparse activity', guidance: 'Leave rhythmic gaps and avoid constant percussion.' },
      neutral: { trait: 'moderate activity', guidance: 'Keep rhythmic activity present but unforced.' },
      high: { trait: 'active rhythm', guidance: 'Increase event density and transient emphasis.' },
    },
  } },
  tension: { domains: {
    harmony: {
      low: { trait: 'settled harmony with passing unease', guidance: 'Use stable harmonic arrivals with fleeting unresolved colour that settles quickly.' },
      neutral: { trait: 'balanced stability', guidance: 'Hold a clear harmonic centre while leaving room for a little unresolved colour.' },
      high: { trait: 'unsettled harmony', guidance: 'Let suspensions or dissonance delay harmonic resolution.' },
      strongLow: { trait: 'deep calm', guidance: 'Favor consonant stability and unhurried resolution.' },
      strongHigh: { trait: 'persistent unease', guidance: 'Keep unresolved harmony audible across phrases without requiring louder dynamics.' },
    },
    texture: {
      low: { trait: 'smooth texture', guidance: 'Keep textural edges steady and avoid disruptive detail.' },
      neutral: { trait: 'controlled variation', guidance: 'Allow small textural changes without making instability the focus.' },
      high: { trait: 'unstable detail', guidance: 'Use subtle roughness or shifting detail to sustain unease.' },
    },
  } },
  intimacy: { domains: {
    space: {
      low: { trait: 'distant perspective', guidance: 'Place the focal sound farther back with audible room around it.' },
      neutral: { trait: 'balanced perspective', guidance: 'Balance close detail with a sense of surrounding space.' },
      high: { trait: 'close perspective', guidance: 'Keep the focal sound forward with dry, detailed presence.' },
      strongHigh: { trait: 'immediate presence', guidance: 'Make the focal sound feel almost within reach, with minimal masking.' },
    },
    arrangement: {
      low: { trait: 'wide focus', guidance: 'Let the ensemble carry attention rather than one close foreground element.' },
      neutral: { trait: 'shared focus', guidance: 'Move attention between the focal element and its surroundings.' },
      high: { trait: 'personal focus', guidance: 'Clear space around one expressive foreground element.' },
    },
  } },
  weight: { domains: {
    density: {
      low: { trait: 'light mass', guidance: 'Keep the low end and layer count light enough to leave air.' },
      neutral: { trait: 'moderate mass', guidance: 'Use body selectively without filling every register.' },
      high: { trait: 'heavy mass', guidance: 'Give the low end and key hits a strong physical body.' },
      strongLow: { trait: 'weightless density', guidance: 'Favor open registers and very little low-frequency mass.' },
      strongHigh: { trait: 'immense mass', guidance: 'Anchor the arrangement with pronounced low-frequency body and layered impact.' },
    },
    texture: {
      low: { trait: 'airy texture', guidance: 'Use fine, open timbres instead of dense saturation.' },
      neutral: { trait: 'balanced body', guidance: 'Mix airy and solid timbres without letting either dominate.' },
      high: { trait: 'solid texture', guidance: 'Give important layers thick timbral body.' },
    },
  } },
  motion: { domains: {
    rhythm: {
      low: { trait: 'restrained propulsion', guidance: 'Let the pulse breathe rather than driving every phrase forward.' },
      neutral: { trait: 'flexible pulse', guidance: 'Keep a readable pulse without insisting on constant forward drive.' },
      high: { trait: 'driving pulse', guidance: 'Use clear rhythmic accents and shorter gaps between events.' },
      strongLow: { trait: 'suspended pulse', guidance: 'Allow long spans without a forceful beat or obvious forward push.' },
      strongHigh: { trait: 'insistent drive', guidance: 'Make rhythmic accents and phrase momentum persistent.' },
    },
    arrangement: {
      low: { trait: 'hovering movement', guidance: 'Let phrases linger and changes arrive gradually.' },
      neutral: { trait: 'measured movement', guidance: 'Move between sections without rushing the transitions.' },
      high: { trait: 'forward movement', guidance: 'Give each phrase a clear next step.' },
    },
  } },
  atmosphere: { domains: {
    space: {
      low: { trait: 'grounded space', guidance: 'Use familiar room cues and keep effects tied to the source.' },
      neutral: { trait: 'natural ambience', guidance: 'Add ambience without obscuring the source or inventing a new world.' },
      high: { trait: 'otherworldly space', guidance: 'Use evolving ambience and less familiar spatial cues.' },
      strongHigh: { trait: 'immersive otherworldly space', guidance: 'Let evolving ambience make the environment feel beyond an ordinary room.' },
    },
    texture: {
      low: { trait: 'familiar timbre', guidance: 'Keep the main timbres recognizable and physically grounded.' },
      neutral: { trait: 'light transformation', guidance: 'Use timbral effects selectively while retaining familiar anchors.' },
      high: { trait: 'unusual timbre', guidance: 'Introduce transformed or slowly shifting timbres around the core sound.' },
    },
  } },
}

export type InteractionRule = {
  id: string
  conditions: readonly { dimension: MoodDimension; region: 'low' | 'neutral' | 'high' }[]
  domain: MusicalDomain
  trait: string
  guidance: string
}

// Interactions add a concrete coexistence strategy; they never erase either axis.
export const moodTranslationInteractions: readonly InteractionRule[] = [
  { id: 'controlled-unease', conditions: [{ dimension: 'tension', region: 'high' }, { dimension: 'energy', region: 'low' }], domain: 'harmony', trait: 'controlled unease', guidance: 'Keep percussion restrained while sparse, unstable harmony carries the unease.' },
  { id: 'forward-propulsion', conditions: [{ dimension: 'energy', region: 'high' }, { dimension: 'motion', region: 'high' }], domain: 'rhythm', trait: 'strong forward propulsion', guidance: 'Use active patterns, firm attacks, and short recovery between musical events.' },
  { id: 'suspended-space', conditions: [{ dimension: 'atmosphere', region: 'high' }, { dimension: 'motion', region: 'low' }], domain: 'space', trait: 'suspended spatial environment', guidance: 'Let evolving ambience and sustained layers hover over slow harmonic change.' },
  { id: 'pulse-under-atmosphere', conditions: [{ dimension: 'atmosphere', region: 'high' }, { dimension: 'motion', region: 'neutral' }], domain: 'rhythm', trait: 'measured pulse beneath ambience', guidance: 'Keep a measured pulse audible beneath the evolving ambience without pushing it into a hard drive.' },
  { id: 'close-in-vast-space', conditions: [{ dimension: 'intimacy', region: 'high' }, { dimension: 'atmosphere', region: 'high' }], domain: 'space', trait: 'close focus in a vast space', guidance: 'Keep one detailed foreground element close while unusual ambience expands behind it.' },
  { id: 'intense-without-drive', conditions: [{ dimension: 'energy', region: 'high' }, { dimension: 'motion', region: 'low' }], domain: 'dynamics', trait: 'intensity without propulsion', guidance: 'Use strong attacks or swells without forcing a continuous driving beat.' },
  { id: 'heavy-but-restrained', conditions: [{ dimension: 'weight', region: 'high' }, { dimension: 'energy', region: 'low' }], domain: 'density', trait: 'restrained heaviness', guidance: 'Keep substantial low-frequency body while leaving dynamics and percussion controlled.' },
]
