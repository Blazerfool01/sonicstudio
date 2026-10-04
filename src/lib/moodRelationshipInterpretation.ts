import { getMood, moodDimensions } from '../data/moods.ts'
import type { MoodDimension } from '../data/moods.ts'
import { moodInterpretationGuidance } from '../data/moodInterpretationGuidance.ts'
import { deriveMoodDna } from './moodDna.ts'
import type { MoodSelection } from './moodDna.ts'
import type { DimensionRelationship, MoodPairRelationship, MoodRelationshipAnalysis } from './moodRelationships.ts'

export type MoodRole = { moodId: string; name: string; weight: number; role: 'dominant' | 'supporting' | 'accent' }
export type MoodSupport = { pair: [string, string]; dimension: MoodDimension; endpoint: string; strength: number; explanation: string }
export type MoodTension = {
  pair: [string, string]
  dimension: MoodDimension
  firstDirection: string
  secondDirection: string
  strength: number
  explanation: string
  resolution: string
}
export type MoodRelationshipInterpretation = {
  headline: string
  summary: string
  roles: MoodRole[]
  supports: MoodSupport[]
  tensions: MoodTension[]
  strategy: string
}

const MAX_SUPPORTS = 3
const MAX_TENSIONS = 3
const MIN_SHARED_STRENGTH = 0.2
const ACCENT_RATIO = 0.4
const BALANCED_PAIR_RATIO = 0.75
const round = (value: number) => Math.round(value * 1000) / 1000

function validateAnalysis(analysis: MoodRelationshipAnalysis, selections: readonly MoodSelection[]) {
  const expectedPairs: [string, string, number, number][] = []
  for (let a = 0; a < selections.length; a++) for (let b = a + 1; b < selections.length; b++) {
    expectedPairs.push([selections[a].moodId, selections[b].moodId, selections[a].weight, selections[b].weight])
  }
  if (analysis.pairs.length !== expectedPairs.length || analysis.pairs.some((pair, index) => {
    const expected = expectedPairs[index]
    return pair.moodIds[0] !== expected[0] || pair.moodIds[1] !== expected[1] ||
      pair.weights[0] !== expected[2] || pair.weights[1] !== expected[3]
  })) throw new Error('Relationship analysis does not match the selected moods and weights.')
}

function assignRoles(selections: readonly MoodSelection[]): MoodRole[] {
  const ordered = selections.map((item, index) => ({ ...item, index }))
    .sort((a, b) => b.weight - a.weight || a.index - b.index)
  const highest = ordered[0]?.weight ?? 1
  return ordered.map((item, index) => ({
    moodId: item.moodId, name: getMood(item.moodId)!.name, weight: item.weight,
    role: index === 0 ? 'dominant' : item.weight / highest < ACCENT_RATIO ? 'accent' : 'supporting',
  }))
}

function pairImpact(pair: MoodPairRelationship, totalWeight: number): number {
  return 2 * Math.min(...pair.weights) / totalWeight
}

function collectSupports(analysis: MoodRelationshipAnalysis, totalWeight: number): MoodSupport[] {
  return analysis.pairs.flatMap(pair => pair.sharedDimensions
    .filter(dimension => dimension.sharedStrength >= MIN_SHARED_STRENGTH)
    .map(dimension => ({ pair, dimension, priority: dimension.sharedStrength * pairImpact(pair, totalWeight) })))
    .sort((a, b) => b.priority - a.priority)
    .slice(0, MAX_SUPPORTS)
    .map(({ pair, dimension }) => {
      const definition = moodDimensions.find(item => item.id === dimension.dimension)!
      const low = getMood(pair.moodIds[0])!.profile[dimension.dimension] < 50
      return {
        pair: pair.moodIds, dimension: dimension.dimension,
        endpoint: low ? definition.low : definition.high,
        strength: dimension.sharedStrength,
        explanation: low ? moodInterpretationGuidance[dimension.dimension].sharedLow : moodInterpretationGuidance[dimension.dimension].sharedHigh,
      }
    })
}

function resolutionFor(pair: MoodPairRelationship, dimension: DimensionRelationship): string {
  const guidance = moodInterpretationGuidance[dimension.dimension]
  const ratio = Math.min(...pair.weights) / Math.max(...pair.weights)
  if (ratio >= BALANCED_PAIR_RATIO) return guidance.balancedResolution
  const leadFirst = pair.weights[0] > pair.weights[1]
  const leadDirection = leadFirst ? dimension.firstFavours : dimension.secondFavours
  const definition = moodDimensions.find(item => item.id === dimension.dimension)!
  return leadDirection === definition.low ? guidance.lowLeadResolution : guidance.highLeadResolution
}

function collectTensions(analysis: MoodRelationshipAnalysis, totalWeight: number): MoodTension[] {
  return analysis.pairs.filter(pair => pair.rawType === 'contrasting' || pair.rawType === 'conflicting')
    .flatMap(pair => pair.opposingDimensions.map(dimension => ({
      pair, dimension, priority: dimension.normalizedDistance * pairImpact(pair, totalWeight),
    })))
    .sort((a, b) => b.priority - a.priority)
    .slice(0, MAX_TENSIONS)
    .map(({ pair, dimension }) => {
      const first = getMood(pair.moodIds[0])!.name
      const second = getMood(pair.moodIds[1])!.name
      const definition = moodDimensions.find(item => item.id === dimension.dimension)!
      const guidance = moodInterpretationGuidance[dimension.dimension]
      const firstPole = dimension.firstFavours === definition.low ? guidance.lowPole : guidance.highPole
      const secondPole = dimension.secondFavours === definition.low ? guidance.lowPole : guidance.highPole
      return {
        pair: pair.moodIds, dimension: dimension.dimension,
        firstDirection: dimension.firstFavours, secondDirection: dimension.secondFavours,
        strength: round(dimension.normalizedDistance * pair.influenceBalance),
        explanation: `${first} pulls toward ${firstPole} while ${second} pulls toward ${secondPole}. ${guidance.emotionalEffect}`,
        resolution: resolutionFor(pair, dimension),
      }
    })
}

function contributionSentence(pair: MoodPairRelationship): string {
  const contributions: { moodId: string; phrase: string }[] = []
  for (const dimension of [...pair.dimensions].sort((a, b) => b.distance - a.distance)) {
    const firstValue = getMood(pair.moodIds[0])!.profile[dimension.dimension]
    const secondValue = getMood(pair.moodIds[1])!.profile[dimension.dimension]
    if (firstValue === secondValue) continue
    const strongerId = firstValue > secondValue ? pair.moodIds[0] : pair.moodIds[1]
    if (contributions.some(item => item.moodId === strongerId)) continue
    contributions.push({ moodId: strongerId, phrase: moodInterpretationGuidance[dimension.dimension].highContribution })
    if (contributions.length === 2) break
  }
  if (contributions.length === 1) {
    const otherId = pair.moodIds.find(id => id !== contributions[0].moodId)!
    const dimension = [...pair.dimensions].sort((a, b) => b.distance - a.distance)[0]
    contributions.push({ moodId: otherId, phrase: moodInterpretationGuidance[dimension.dimension].lowContribution })
  }
  return contributions.map(item => `${getMood(item.moodId)!.name} adds ${item.phrase}`).join(', while ') + '.'
}

function roleSentence(roles: MoodRole[]): string {
  if (roles.length === 1) return `${roles[0].name} defines the emotional space.`
  if (roles.length === 2) {
    if (roles[1].weight / roles[0].weight >= BALANCED_PAIR_RATIO) return `${roles[0].name} and ${roles[1].name} share the emotional foreground.`
    return `${roles[0].name} defines the emotional surface, while ${roles[1].name} adds ${roles[1].role === 'accent' ? 'a subtle accent' : 'a supporting layer'}.`
  }
  const supporting = roles.filter(role => role.role === 'supporting').map(role => role.name)
  const accents = roles.filter(role => role.role === 'accent').map(role => role.name)
  const parts = [`${roles[0].name} defines the emotional base`]
  if (supporting.length) parts.push(`${supporting.join(' and ')} ${supporting.length === 1 ? 'supports' : 'support'} it`)
  if (accents.length) parts.push(`${accents.join(' and ')} ${accents.length === 1 ? 'adds' : 'add'} a quieter accent`)
  return parts.join('; ') + '.'
}

export function interpretMoodRelationships(
  analysis: MoodRelationshipAnalysis,
  selections: readonly MoodSelection[],
): MoodRelationshipInterpretation {
  const dna = deriveMoodDna(selections)
  validateAnalysis(analysis, selections)
  if (!dna) return { headline: 'No mood selected', summary: 'Select a mood to establish an emotional character.', roles: [], supports: [], tensions: [], strategy: 'Choose a mood to begin.' }
  const roles = assignRoles(selections)
  const totalWeight = selections.reduce((sum, item) => sum + item.weight, 0)
  const supports = collectSupports(analysis, totalWeight)
  const tensions = collectTensions(analysis, totalWeight)
  const character = [...moodDimensions].map(item => ({ label: dna.dimensions[item.id] < 50 ? item.low.toLowerCase() : item.high.toLowerCase(), strength: Math.abs(dna.dimensions[item.id] - 50) }))
    .sort((a, b) => b.strength - a.strength).slice(0, 2)
  const sentences = [roleSentence(roles)]
  if (supports.length) {
    const support = supports[0]
    sentences.push(support.explanation.replace(/^Both /, `${getMood(support.pair[0])!.name} and ${getMood(support.pair[1])!.name} `))
  }
  if (tensions.length) sentences.push(tensions[0].explanation)
  else if (analysis.pairs.length && analysis.overall.type === 'complementary') sentences.push(contributionSentence(analysis.pairs[0]))
  const softened = analysis.pairs.find(pair => pair.rawType === 'conflicting' && pair.type !== 'conflicting')
  if (softened) {
    const quieterId = softened.weights[0] <= softened.weights[1] ? softened.moodIds[0] : softened.moodIds[1]
    sentences.push(`${getMood(softened.moodIds[0])!.name} and ${getMood(softened.moodIds[1])!.name} still oppose strongly in their profiles, but ${getMood(quieterId)!.name}'s smaller influence keeps that tension underneath the main character.`)
  }
  sentences.push(`The combined profile feels ${character[0].label} and ${character[1].label}${analysis.overall.type === 'conflicting' ? ', with the opposing pulls still audible' : ''}.`)
  const headline = analysis.overall.type === 'none' ? `${roles[0].name} alone`
    : `${roles[0].name} with ${analysis.overall.type === 'reinforcing' ? 'shared focus' : analysis.overall.type === 'complementary' ? 'distinct colour' : analysis.overall.type === 'contrasting' ? 'creative contrast' : 'strong tension'}`
  const strategy = tensions.length ? tensions[0].resolution
    : supports.length ? `Keep the shared ${supports[0].endpoint.toLowerCase()} quality as a stable centre while the other qualities develop.`
    : analysis.pairs.length ? 'Give each mood a distinct layer so their different qualities remain audible.'
    : `Use ${roles[0].name.toLowerCase()} as the consistent emotional anchor.`
  return { headline, summary: sentences.join(' '), roles, supports, tensions, strategy }
}
