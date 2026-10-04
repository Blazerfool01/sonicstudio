import type { MoodDimension } from './moods.ts'

export type DimensionGuidance = {
  sharedLow: string
  sharedHigh: string
  emotionalEffect: string
  balancedResolution: string
  lowLeadResolution: string
  highLeadResolution: string
  lowContribution: string
  highContribution: string
  lowPole: string
  highPole: string
}

// Reusable guidance follows the catalogue's low and high endpoints. It does
// not encode named mood pairs or override the relationship classification.
export const moodInterpretationGuidance: Record<MoodDimension, DimensionGuidance> = {
  valence: {
    sharedLow: 'Both keep the emotional tone bleak, giving the blend a subdued centre.',
    sharedHigh: 'Both favour euphoria, keeping the emotional tone lifted.',
    emotionalEffect: 'The emotional tone can move between bleakness and release.',
    balancedResolution: 'Let darker harmony coexist with brief melodic lift or release.',
    lowLeadResolution: 'Keep the darker tone at the surface; use brief harmonic lift as contrast.',
    highLeadResolution: 'Let the lifted tone lead; place the darker colour in brief harmonic details.',
    lowContribution: 'a darker emotional colour', highContribution: 'a more euphoric lift',
    lowPole: 'bleakness', highPole: 'euphoria',
  },
  energy: {
    sharedLow: 'Both favour stillness, keeping the dynamics restrained.',
    sharedHigh: 'Both favour explosive energy, giving the blend clear dynamic force.',
    emotionalEffect: 'The dynamic range can move from restraint to impact.',
    balancedResolution: 'Leave room for restrained passages, then give the energetic peaks real impact.',
    lowLeadResolution: 'Keep the main passages restrained and reserve a few peaks for release.',
    highLeadResolution: 'Let the high energy lead, then use brief still moments to make its return count.',
    lowContribution: 'more restrained energy', highContribution: 'stronger dynamic force',
    lowPole: 'stillness', highPole: 'explosive energy',
  },
  tension: {
    sharedLow: 'Both lean peaceful, leaving the emotional space calm and open.',
    sharedHigh: 'Both carry unease, sustaining a sense of unresolved pressure.',
    emotionalEffect: 'Calm and unease can occupy different layers of the same moment.',
    balancedResolution: 'Keep the arrangement calm while harmony or small textural details carry unease.',
    lowLeadResolution: 'Keep a peaceful surface; let subtle harmony or texture suggest unease underneath.',
    highLeadResolution: 'Let unease lead, with brief calm passages offering space before it returns.',
    lowContribution: 'a calmer emotional surface', highContribution: 'more persistent unease',
    lowPole: 'calm', highPole: 'unease',
  },
  intimacy: {
    sharedLow: 'Both keep some emotional distance, creating a wider viewpoint.',
    sharedHigh: 'Both lean intimate, keeping the emotional focus close and personal.',
    emotionalEffect: 'The music can feel personally close within a wider space.',
    balancedResolution: 'Place a close focal element inside a wider spatial environment.',
    lowLeadResolution: 'Keep the wide space, then bring one focal element close to the listener.',
    highLeadResolution: 'Keep the close focal element central while the surrounding space stays wide.',
    lowContribution: 'a more distant viewpoint', highContribution: 'a closer personal focus',
    lowPole: 'distance', highPole: 'closeness',
  },
  weight: {
    sharedLow: 'Both stay light, leaving room and air around the music.',
    sharedHigh: 'Both favour heaviness, giving the music physical impact.',
    emotionalEffect: 'Air and physical impact can give the arrangement contrasting depth.',
    balancedResolution: 'Keep the arrangement spacious while giving selected elements physical impact.',
    lowLeadResolution: 'Preserve the open arrangement; let only a few elements carry physical weight.',
    highLeadResolution: 'Let the heavy elements anchor the piece and leave space around them.',
    lowContribution: 'a lighter arrangement', highContribution: 'greater physical weight',
    lowPole: 'lightness', highPole: 'heaviness',
  },
  motion: {
    sharedLow: 'Both favour suspension, letting the music hover rather than push forward.',
    sharedHigh: 'Both favour driving motion, giving the music a clear forward pull.',
    emotionalEffect: 'A hovering atmosphere can coexist with forward pressure.',
    balancedResolution: 'Let rhythm supply movement while harmony or texture remains suspended.',
    lowLeadResolution: 'Keep harmony and texture suspended; use restrained rhythm for forward pressure.',
    highLeadResolution: 'Let the rhythm drive, with suspended layers widening the space around it.',
    lowContribution: 'a more suspended feel', highContribution: 'stronger forward motion',
    lowPole: 'suspension', highPole: 'forward motion',
  },
  atmosphere: {
    sharedLow: 'Both remain grounded, anchoring the atmosphere in recognisable detail.',
    sharedHigh: 'Both favour an otherworldly atmosphere, widening the sense of place.',
    emotionalEffect: 'Familiar anchors can make unusual textures feel purposeful.',
    balancedResolution: 'Anchor unusual textures with recognisable instrumentation or structure.',
    lowLeadResolution: 'Keep familiar sounds in front and let unusual textures colour the edges.',
    highLeadResolution: 'Let unusual textures lead while a familiar motif anchors the piece.',
    lowContribution: 'a more grounded setting', highContribution: 'a more otherworldly space',
    lowPole: 'a grounded setting', highPole: 'an otherworldly space',
  },
}
