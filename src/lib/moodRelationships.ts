import { getMood, moodDimensions } from '../data/moods.ts'
import type { Mood, MoodDimension } from '../data/moods.ts'
import type { MoodSelection } from './moodDna.ts'

export type MoodRelationshipType = 'reinforcing' | 'complementary' | 'contrasting' | 'conflicting'

// All distances and tension scores are normalized to 0–1. Centralizing the
// cutoffs makes later catalogue reviews possible without changing the model.
export const moodRelationshipThresholds = {
  regionMargin: 10,                 // 0–40 and 60–100 are clear endpoint regions
  reinforcingDistance: 0.19,        // mean distance no greater than 19/100
  contrastingTension: 0.16,        // weighted opposing distance across seven axes
  conflictingTension: 0.42,
  conflictingDistance: 0.50,
} as const

export type DimensionRelationship = {
  dimension: MoodDimension
  label: string
  distance: number
  normalizedDistance: number
  sameRegion: boolean
  oppositeEnds: boolean
  sharedStrength: number
  firstFavours: string
  secondFavours: string
}

export type MoodPairRelationship = {
  moodIds: [string, string]
  weights: [number, number]
  dimensions: DimensionRelationship[]
  distance: number
  similarity: number
  sharedDimensions: DimensionRelationship[]
  opposingDimensions: DimensionRelationship[]
  strongestShared: DimensionRelationship | null
  strongestOpposition: DimensionRelationship | null
  oppositionCount: number
  oppositionStrength: number
  influenceBalance: number
  effectiveTension: number
  rawType: MoodRelationshipType
  type: MoodRelationshipType
}

export type MoodRelationshipAnalysis = {
  pairs: MoodPairRelationship[]
  overall: {
    type: MoodRelationshipType | 'none'
    effectiveTension: number
    counts: Record<MoodRelationshipType, number>
  }
}

const round = (value: number) => Math.round(value * 1000) / 1000

function classify(distance: number, tension: number, oppositionCount: number): MoodRelationshipType {
  if (tension >= moodRelationshipThresholds.conflictingTension && distance >= moodRelationshipThresholds.conflictingDistance) return 'conflicting'
  if (tension >= moodRelationshipThresholds.contrastingTension) return 'contrasting'
  if (oppositionCount === 0 && distance <= moodRelationshipThresholds.reinforcingDistance) return 'reinforcing'
  return 'complementary'
}

export function analyzeMoodPair(first: Mood, second: Mood, firstWeight = 50, secondWeight = 50): MoodPairRelationship {
  if (first.id === second.id || [firstWeight, secondWeight].some(weight => !Number.isInteger(weight) || weight < 1 || weight > 100)) {
    throw new Error('Pair analysis requires distinct moods and integer weights from 1 to 100.')
  }
  for (const mood of [first, second]) {
    if (moodDimensions.some(({ id }) => !Number.isInteger(mood.profile[id]) || mood.profile[id] < 0 || mood.profile[id] > 100)) {
      throw new Error('Mood profiles must contain seven integer values from 0 to 100.')
    }
  }
  const low = 50 - moodRelationshipThresholds.regionMargin
  const high = 50 + moodRelationshipThresholds.regionMargin
  const dimensions: DimensionRelationship[] = moodDimensions.map(({ id, name, low: lowLabel, high: highLabel }) => {
    const a = first.profile[id]
    const b = second.profile[id]
    const sameLow = a <= low && b <= low
    const sameHigh = a >= high && b >= high
    const oppositeEnds = (a <= low && b >= high) || (b <= low && a >= high)
    return {
      dimension: id, label: name, distance: Math.abs(a - b), normalizedDistance: round(Math.abs(a - b) / 100),
      sameRegion: sameLow || sameHigh, oppositeEnds,
      sharedStrength: sameLow || sameHigh ? round(Math.min(Math.abs(a - 50), Math.abs(b - 50)) / 50) : 0,
      firstFavours: a < 50 ? lowLabel : a > 50 ? highLabel : 'centre',
      secondFavours: b < 50 ? lowLabel : b > 50 ? highLabel : 'centre',
    }
  })
  const sharedDimensions = dimensions.filter(item => item.sameRegion).sort((a, b) => b.sharedStrength - a.sharedStrength)
  const opposingDimensions = dimensions.filter(item => item.oppositeEnds).sort((a, b) => b.distance - a.distance)
  const distance = dimensions.reduce((sum, item) => sum + item.distance, 0) / (moodDimensions.length * 100)
  const oppositionStrength = opposingDimensions.reduce((sum, item) => sum + item.distance, 0) / (moodDimensions.length * 100)
  const influenceBalance = 2 * Math.min(firstWeight, secondWeight) / (firstWeight + secondWeight)
  const effectiveTension = oppositionStrength * influenceBalance
  return {
    moodIds: [first.id, second.id], weights: [firstWeight, secondWeight], dimensions,
    distance: round(distance), similarity: round(1 - distance), sharedDimensions, opposingDimensions,
    strongestShared: sharedDimensions[0] ?? null, strongestOpposition: opposingDimensions[0] ?? null,
    oppositionCount: opposingDimensions.length, oppositionStrength: round(oppositionStrength),
    influenceBalance: round(influenceBalance), effectiveTension: round(effectiveTension),
    rawType: classify(distance, oppositionStrength, opposingDimensions.length),
    type: classify(distance, effectiveTension, opposingDimensions.length),
  }
}

export function analyzeMoodRelationships(selections: readonly MoodSelection[]): MoodRelationshipAnalysis {
  if (selections.length > 3 || new Set(selections.map(item => item.moodId)).size !== selections.length ||
      selections.some(item => !getMood(item.moodId) || !Number.isInteger(item.weight) || item.weight < 1 || item.weight > 100)) {
    throw new Error('Select at most three distinct known moods with integer weights from 1 to 100.')
  }
  const pairs: MoodPairRelationship[] = []
  for (let first = 0; first < selections.length; first++) {
    for (let second = first + 1; second < selections.length; second++) {
      const a = selections[first]
      const b = selections[second]
      pairs.push(analyzeMoodPair(getMood(a.moodId)!, getMood(b.moodId)!, a.weight, b.weight))
    }
  }
  const counts: Record<MoodRelationshipType, number> = { reinforcing: 0, complementary: 0, contrasting: 0, conflicting: 0 }
  for (const pair of pairs) counts[pair.type]++
  const totalWeight = selections.reduce((sum, item) => sum + item.weight, 0)
  // A pair of quiet secondary moods cannot dominate a three-mood blend.
  const pairImpacts = pairs.map(pair => ({
    pair,
    tension: pair.oppositionStrength * 2 * Math.min(...pair.weights) / totalWeight,
  }))
  const strongestImpact = pairImpacts.reduce((best, item) => item.tension > best.tension ? item : best, pairImpacts[0])
  const effectiveTension = strongestImpact?.tension ?? 0
  const type: MoodRelationshipType | 'none' = pairs.length === 0 ? 'none'
    : effectiveTension >= moodRelationshipThresholds.conflictingTension && strongestImpact.pair.distance >= moodRelationshipThresholds.conflictingDistance ? 'conflicting'
    : effectiveTension >= moodRelationshipThresholds.contrastingTension ? 'contrasting'
    : pairs.every(pair => pair.rawType === 'reinforcing') ? 'reinforcing' : 'complementary'
  return { pairs, overall: { type, effectiveTension: round(effectiveTension), counts } }
}
