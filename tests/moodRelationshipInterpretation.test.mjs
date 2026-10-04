import test from 'node:test'
import assert from 'node:assert/strict'
import { getMood, moodDimensions } from '../src/data/moods.ts'
import { moodInterpretationGuidance } from '../src/data/moodInterpretationGuidance.ts'
import { deriveMoodDna } from '../src/lib/moodDna.ts'
import { analyzeMoodRelationships } from '../src/lib/moodRelationships.ts'
import { interpretMoodRelationships } from '../src/lib/moodRelationshipInterpretation.ts'

const source = (...items) => items.map(([moodId, weight = 50]) => ({ moodId, weight }))
const interpret = selections => interpretMoodRelationships(analyzeMoodRelationships(selections), selections)

test('reinforcing pair explains its strongest shared dimension', () => {
  const selections = source(['melancholic'], ['vulnerable'])
  const analysis = analyzeMoodRelationships(selections)
  const result = interpretMoodRelationships(analysis, selections)
  assert.equal(analysis.overall.type, 'reinforcing')
  assert.equal(result.supports[0].dimension, analysis.pairs[0].strongestShared.dimension)
  assert.match(result.summary, /Melancholic and Vulnerable/)
  assert.match(result.summary, /hover|subdued|close|intimate/i)
  assert.equal(result.tensions.length, 0)
})

test('complementary pair describes distinct contributions without inventing conflict', () => {
  const result = interpret(source(['romantic'], ['dreamlike']))
  assert.match(result.summary, /Romantic adds|Dreamlike adds/)
  assert.match(result.summary, /otherworldly/)
  assert.match(result.summary, /personal focus/)
  assert.equal(result.tensions.length, 0)
})

test('contrast and conflict expose strongest opposition and usable dimension resolution', () => {
  for (const [a, b, kind] of [['dreamlike', 'restless', 'contrasting'], ['serene', 'menacing', 'conflicting']]) {
    const selections = source([a], [b])
    const analysis = analyzeMoodRelationships(selections)
    const result = interpretMoodRelationships(analysis, selections)
    assert.equal(analysis.overall.type, kind)
    assert.equal(result.tensions[0].dimension, analysis.pairs[0].strongestOpposition.dimension)
    assert.ok(result.tensions[0].resolution.length > 35)
    assert.equal(result.strategy, result.tensions[0].resolution)
    assert.doesNotMatch(result.summary, /invalid|error|warning/i)
  }
})

test('balanced conflict differs from a subtle accent and retains raw opposition', () => {
  const equal = interpret(source(['serene', 50], ['menacing', 50]))
  const uneven = interpret(source(['serene', 90], ['menacing', 10]))
  assert.notDeepEqual(equal, uneven)
  assert.match(equal.summary, /share the emotional foreground/)
  assert.match(uneven.summary, /defines the emotional surface/)
  assert.match(uneven.summary, /still oppose strongly in their profiles/)
  assert.match(uneven.strategy, /peaceful surface/)
  assert.equal(uneven.roles[1].role, 'accent')
})

test('three moods form one narrative with dominant, support, accent, shared qualities, and tension', () => {
  const selections = source(['serene', 50], ['dreamlike', 30], ['menacing', 10])
  const result = interpret(selections)
  assert.deepEqual(result.roles.map(item => item.role), ['dominant', 'supporting', 'accent'])
  assert.ok(result.supports.some(item => item.pair.includes('dreamlike')))
  assert.ok(result.tensions.some(item => item.pair.includes('menacing')))
  assert.match(result.summary, /Serene defines the emotional base/)
  assert.match(result.summary, /Dreamlike supports it/)
  assert.match(result.summary, /Menacing adds a quieter accent/)
  assert.deepEqual(result, interpret(selections))
})

test('single and empty moods are handled without inventing a pair', () => {
  const only = interpret(source(['serene', 50]))
  assert.equal(only.roles[0].role, 'dominant')
  assert.deepEqual(only.supports, [])
  assert.deepEqual(only.tensions, [])
  assert.match(only.summary, /Serene defines/)
  const empty = interpret([])
  assert.deepEqual(empty.roles, [])
  assert.match(empty.summary, /Select a mood/)
})

test('every dimension has complete reusable guidance', () => {
  assert.deepEqual(Object.keys(moodInterpretationGuidance), moodDimensions.map(item => item.id))
  for (const { id } of moodDimensions) {
    assert.ok(Object.values(moodInterpretationGuidance[id]).every(text => typeof text === 'string' && text.trim().length > 0))
  }
})

test('interpretation leaves selections, profiles, Mood DNA, and relationship analysis unchanged', () => {
  const selections = source(['serene', 90], ['menacing', 10])
  const originalSelections = structuredClone(selections)
  const originalProfiles = selections.map(item => structuredClone(getMood(item.moodId).profile))
  const originalDna = deriveMoodDna(selections)
  const analysis = analyzeMoodRelationships(selections)
  const originalAnalysis = structuredClone(analysis)
  assert.deepEqual(interpretMoodRelationships(analysis, selections), interpretMoodRelationships(analysis, selections))
  assert.deepEqual(selections, originalSelections)
  assert.deepEqual(selections.map(item => getMood(item.moodId).profile), originalProfiles)
  assert.deepEqual(deriveMoodDna(selections), originalDna)
  assert.deepEqual(analysis, originalAnalysis)
  assert.throws(() => interpretMoodRelationships(analysis, source(['serene', 50], ['menacing', 50])), /does not match/)
})
