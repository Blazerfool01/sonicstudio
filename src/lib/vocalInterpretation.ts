import { analyzeVocalRelationships } from './vocalRelationships.ts'
import type { VocalRelationship, VocalRelationshipReport } from './vocalRelationships.ts'
import type { VocalSelections } from './voiceDna.ts'

export type VocalInterpretation = {
  dominantQuality: string
  supportingQualities: { relationshipId: string; kind: 'reinforcing' | 'complementary'; explanation: string }[]
  tensions: { relationshipId: string; kind: 'contrasting' | 'conflicting'; explanation: string; resolution: string }[]
  strategy: string
}

const deliveryCentre: Record<VocalSelections['delivery'], string> = {
  intimate: 'close, personal',
  conversational: 'natural, speech-like',
  assertive: 'direct, emphatic',
  soaring: 'expansive, sustained',
}

function has(report: VocalRelationshipReport, id: string): boolean {
  return report.relationships.some(relationship => relationship.id === id)
}

function dominantQuality(selections: VocalSelections, report: VocalRelationshipReport): string {
  if (has(report, 'intimate-force')) return 'close phrasing with power reserved for emotional peaks'
  if (has(report, 'assertive-restraint')) return 'restrained volume with decisive articulation'
  if (has(report, 'breath-force')) return 'forceful dynamics softened by audible breath'
  if (has(report, 'airy-dry')) return 'a dry tonal core with selective airy releases'
  if (has(report, 'raspy-smooth')) return 'smooth sustained tone with selective raspy attacks'
  return `${deliveryCentre[selections.delivery]} delivery`
}

function performanceStrategy(selections: VocalSelections, report: VocalRelationshipReport): string {
  const present = (id: string) => has(report, id)
  const closeForce = present('intimate-force')
  const breathForce = present('breath-force')
  const lead = `A ${deliveryCentre[selections.delivery]} ${selections.register}-register lead`

  let main: string
  if (present('assertive-restraint')) {
    main = `${lead} keeps its volume restrained while crisp attacks and decisive timing carry the assertion`
  } else if (closeForce) {
    main = `${lead} holds its power for brief emotional peaks`
  } else if (selections.power >= 67) {
    main = `${lead} drives sustained notes with force`
  } else if (selections.power < 34) {
    main = `${lead} stays dynamically restrained`
  } else {
    main = `${lead} moves with measured dynamics`
  }

  if (breathForce) {
    main += closeForce
      ? ', letting audible breath soften the onset and release of each peak'
      : ', letting audible breath soften the onset and release of each forceful note'
  }

  let tone: string
  if (present('airy-dry')) {
    tone = 'The sustained tone stays dry and focused, allowing an airy release only at phrase endings'
  } else if (present('airy-breath') && !breathForce) {
    tone = 'Audible breath keeps the airy texture present around the lead'
  } else {
    tone = {
      airy: 'A light airy edge colors the tone',
      clear: 'The tone stays clear and defined',
      husky: 'A soft grain colors the tone',
      raspy: 'A coarse edge colors the tone',
    }[selections.texture]
  }

  if (present('raspy-smooth')) {
    tone = 'Sustained vowels stay smooth, with rasp reserved for brief attacks or selected word endings'
  } else if (present('force-grit')) {
    const grit = closeForce
      ? 'Rasp roughens those peaks without disturbing the close phrasing'
      : 'Rasp gives the forceful center a gritty edge'
    tone = selections.texture === 'raspy' ? grit : `${tone}, while ${grit[0].toLowerCase()}${grit.slice(1)}`
  } else if (present('raspy-rasp')) {
    tone = 'A pronounced raspy edge defines the tone'
  } else if (present('husky-rasp')) {
    tone = 'Moderate rasp gives the husky tone controlled grain'
  }

  if (present('warm-air')) {
    if (present('force-grit')) tone += closeForce
      ? ', while warmth gives their airy edge body'
      : ', while warmth gives the breath-softened notes body'
    else tone += ', with warmth giving the airy edge body'
  }
  const sentences = [`${main}.`, `${tone}.`]
  if (present('intimate-reverb')) sentences.push('Reverb stays behind that close lead and blooms after each phrase.')
  else if (present('assertive-doubled')) sentences.push('Doubling reinforces those firm attacks.')
  else if (selections.effect === 'delay') sentences.push('Delay trails selected phrases without taking over the lead.')

  return sentences.join(' ')
}

function isTension(relationship: VocalRelationship): relationship is VocalRelationship & {
  kind: 'contrasting' | 'conflicting'; resolution: string
} {
  return relationship.kind === 'contrasting' || relationship.kind === 'conflicting'
}

function isSupport(relationship: VocalRelationship): relationship is VocalRelationship & {
  kind: 'reinforcing' | 'complementary'
} {
  return relationship.kind === 'reinforcing' || relationship.kind === 'complementary'
}

export function createVocalInterpretation(selections: VocalSelections): VocalInterpretation {
  const report = analyzeVocalRelationships(selections)
  return {
    dominantQuality: dominantQuality(selections, report),
    supportingQualities: report.relationships.filter(isSupport)
      .map(relationship => ({ relationshipId: relationship.id, kind: relationship.kind, explanation: relationship.explanation })),
    tensions: report.relationships.filter(isTension)
      .map(relationship => ({ relationshipId: relationship.id, kind: relationship.kind, explanation: relationship.explanation, resolution: relationship.resolution })),
    strategy: performanceStrategy(selections, report),
  }
}
