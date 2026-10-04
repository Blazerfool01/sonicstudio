import test from 'node:test'
import assert from 'node:assert/strict'
import { getMood, moodDimensions } from '../src/data/moods.ts'
import { moodRegionBounds, moodTranslationGuidance, moodTranslationInteractions, musicalDomains } from '../src/data/moodTranslationGuidance.ts'
import { deriveMoodDna } from '../src/lib/moodDna.ts'
import { analyzeMoodRelationships } from '../src/lib/moodRelationships.ts'
import { interpretMoodRelationships } from '../src/lib/moodRelationshipInterpretation.ts'
import { moodRegion, translateMoodDna } from '../src/lib/moodTranslation.ts'

const profile = (overrides = {}) => ({ dimensions: Object.fromEntries(moodDimensions.map(({ id }) => [id, overrides[id] ?? 50])) })
const from = (...items) => deriveMoodDna(items.map(([moodId, weight = 50]) => ({ moodId, weight })))
const allSignals = result => Object.values(result.domains).flatMap(domain => domain.signals)

test('centralized regions cover boundaries and keep 49 and 51 neutral', () => {
  assert.deepEqual([0, 14, 15, 39, 40, 49, 50, 51, 60, 61, 85, 86, 100].map(moodRegion),
    ['strongLow', 'strongLow', 'low', 'low', 'neutral', 'neutral', 'neutral', 'neutral', 'neutral', 'high', 'high', 'strongHigh', 'strongHigh'])
  assert.equal(moodRegionBounds.interactionLowMax, 30)
  assert.equal(moodRegionBounds.interactionHighMin, 70)
  assert.throws(() => moodRegion(101))
})

test('each dimension maps to a musical domain with low, neutral and high guidance', () => {
  assert.deepEqual(Object.keys(moodTranslationGuidance), moodDimensions.map(item => item.id))
  for (const { id } of moodDimensions) {
    const mapped = musicalDomains.filter(domain => moodTranslationGuidance[id].domains[domain])
    assert.ok(mapped.length > 0, `${id} must inform a domain`)
    for (const domain of mapped) for (const region of ['low', 'neutral', 'high']) {
      const cue = moodTranslationGuidance[id].domains[domain][region]
      assert.ok(cue.trait && cue.guidance)
    }
    const translation = translateMoodDna(profile({ [id]: 0 }))
    assert.ok(allSignals(translation).some(signal => signal.sources.some(source => source.dimension === id && source.value === 0)))
  }
})

test('low and high values produce distinct guidance while neutral does not overstate', () => {
  const low = translateMoodDna(profile({ energy: 10 }))
  const high = translateMoodDna(profile({ energy: 90 }))
  const neutral = translateMoodDna(profile())
  assert.notDeepEqual(low.domains.dynamics.signals, high.domains.dynamics.signals)
  assert.match(low.domains.dynamics.signals[0].guidance, /soft|controlled/i)
  assert.match(high.domains.dynamics.signals[0].guidance, /peak|attack/i)
  assert.deepEqual(neutral.priorities, [])
  assert.match(neutral.overallDirection, /balanced and adaptable/i)
  assert.deepEqual(neutral.overallSources, [])
  const nearLow = translateMoodDna(profile({ valence: 49 }))
  const nearHigh = translateMoodDna(profile({ valence: 51 }))
  assert.equal(nearLow.domains.harmony.signals[0].guidance, nearHigh.domains.harmony.signals[0].guidance)
  assert.equal(nearLow.overallDirection, nearHigh.overallDirection)
  assert.notEqual(nearLow.domains.harmony.signals[0].sources[0].value, nearHigh.domains.harmony.signals[0].sources[0].value)
})

test('every domain signal and priority identifies the dimensions and values that caused it', () => {
  const dna = from(['dreamlike'])
  const result = translateMoodDna(dna)
  assert.deepEqual(Object.keys(result.domains), musicalDomains)
  for (const domain of Object.values(result.domains)) {
    assert.ok(domain.signals.length)
    for (const signal of domain.signals) for (const source of signal.sources) {
      assert.equal(source.value, dna.dimensions[source.dimension])
      assert.equal(source.region, moodRegion(source.value))
      assert.ok(domain.sources.some(item => item.dimension === source.dimension))
    }
  }
  for (const priority of result.priorities) {
    assert.ok(priority.sources.length)
    assert.ok(priority.strength >= .2 && priority.strength <= 1)
  }
  assert.ok(result.overallSources.length)
})

test('priority ranking uses distance from neutral with stable tie order', () => {
  const result = translateMoodDna(profile({ atmosphere: 100, tension: 0, motion: 25, energy: 95 }))
  assert.deepEqual(result.priorities.map(item => item.sources[0].dimension), ['tension', 'atmosphere', 'energy'])
  assert.ok(result.priorities.every((item, index, items) => index === 0 || item.strength <= items[index - 1].strength))
  assert.deepEqual(result, translateMoodDna(profile({ atmosphere: 100, tension: 0, motion: 25, energy: 95 })))
})

test('a small, fixed interaction set adds controlled unease, propulsion and suspended space', () => {
  assert.equal(moodTranslationInteractions.length, 7)
  const unease = translateMoodDna(profile({ tension: 90, energy: 10 }))
  assert.ok(unease.domains.harmony.signals.some(item => item.interactionId === 'controlled-unease' && /restrained|sparse/i.test(item.guidance)))
  assert.doesNotMatch(unease.overallDirection, /explosive dynamics|aggressive/i)
  const propulsion = translateMoodDna(profile({ energy: 90, motion: 90 }))
  assert.ok(propulsion.domains.rhythm.signals.some(item => item.interactionId === 'forward-propulsion'))
  assert.ok(propulsion.domains.rhythm.intensity > translateMoodDna(profile({ energy: 50, motion: 50 })).domains.rhythm.intensity)
  const suspension = translateMoodDna(profile({ atmosphere: 90, motion: 10 }))
  assert.ok(suspension.domains.space.signals.some(item => item.interactionId === 'suspended-space'))
})

test('contradictory high energy/low motion and high weight/low energy remain distinct and valid', () => {
  const first = translateMoodDna(profile({ energy: 90, motion: 10 }))
  assert.ok(first.domains.dynamics.signals.some(item => item.interactionId === 'intense-without-drive'))
  assert.ok(first.domains.rhythm.signals.some(item => item.trait.includes('suspended')))
  const second = translateMoodDna(profile({ weight: 90, energy: 10 }))
  assert.ok(second.domains.density.signals.some(item => item.interactionId === 'heavy-but-restrained'))
  assert.ok(second.domains.dynamics.signals.some(item => item.trait.includes('still')))
})

test('representative moods and weighted blends retain distinct musical directions', () => {
  const serene = translateMoodDna(from(['serene']))
  const aggressive = translateMoodDna(from(['aggressive']))
  const dreamlike = translateMoodDna(from(['dreamlike']))
  const broodingHaunting = translateMoodDna(from(['brooding'], ['haunting']))
  const equal = translateMoodDna(from(['serene', 50], ['menacing', 50]))
  const uneven = translateMoodDna(from(['serene', 90], ['menacing', 10]))
  const dreamRestless = translateMoodDna(from(['dreamlike'], ['restless']))
  assert.match(serene.domains.harmony.signals.find(item => item.sources[0].dimension === 'tension').trait, /calm/)
  assert.match(aggressive.domains.dynamics.signals[0].trait, /explosive/)
  assert.ok(dreamlike.domains.space.signals.some(item => item.interactionId === 'suspended-space'))
  assert.ok(broodingHaunting.domains.harmony.signals.some(item => item.trait.includes('shaded')))
  assert.match(equal.domains.harmony.signals.find(item => item.sources[0].dimension === 'tension').guidance, /unresolved colour/)
  assert.match(equal.overallDirection, /unresolved colour/)
  assert.notEqual(equal.overallDirection, uneven.overallDirection)
  assert.match(uneven.domains.harmony.signals.find(item => item.sources[0].dimension === 'tension').guidance, /fleeting unresolved colour/)
  assert.ok(dreamRestless.domains.space.signals.some(item => item.trait.includes('otherworldly')))
  assert.ok(dreamRestless.domains.rhythm.signals.some(item => item.sources[0].dimension === 'motion'))
  assert.ok(dreamRestless.domains.rhythm.signals.some(item => item.interactionId === 'pulse-under-atmosphere'))
  assert.match(dreamRestless.overallDirection, /measured pulse/i)
})

test('translation is pure and leaves earlier source and derived models unchanged', () => {
  const selections = [{ moodId: 'serene', weight: 90 }, { moodId: 'menacing', weight: 10 }]
  const sourceBefore = structuredClone(selections)
  const profilesBefore = selections.map(item => structuredClone(getMood(item.moodId).profile))
  const dna = deriveMoodDna(selections)
  const dnaBefore = structuredClone(dna)
  const analysis = analyzeMoodRelationships(selections)
  const analysisBefore = structuredClone(analysis)
  const interpretation = interpretMoodRelationships(analysis, selections)
  const translation = translateMoodDna(dna)
  assert.deepEqual(translation, translateMoodDna(dna))
  assert.deepEqual(selections, sourceBefore)
  assert.deepEqual(selections.map(item => getMood(item.moodId).profile), profilesBefore)
  assert.deepEqual(dna, dnaBefore)
  assert.deepEqual(deriveMoodDna(selections), dnaBefore)
  assert.deepEqual(analysis, analysisBefore)
  assert.deepEqual(interpretMoodRelationships(analysis, selections), interpretation)
  assert.throws(() => translateMoodDna(profile({ energy: 101 })))
})
