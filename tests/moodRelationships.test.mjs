import test from 'node:test'
import assert from 'node:assert/strict'
import { getMood, moodDimensions } from '../src/data/moods.ts'
import { deriveMoodDna } from '../src/lib/moodDna.ts'
import { analyzeMoodPair, analyzeMoodRelationships } from '../src/lib/moodRelationships.ts'

const pair = (a, b, firstWeight = 50, secondWeight = 50) => analyzeMoodPair(getMood(a), getMood(b), firstWeight, secondWeight)

test('similar profiles reinforce and complementary profiles differ', () => {
  assert.equal(pair('melancholic', 'vulnerable').rawType, 'reinforcing')
  assert.equal(pair('dreamlike', 'hypnotic').rawType, 'reinforcing')
  assert.equal(pair('romantic', 'dreamlike').rawType, 'complementary')
  const similar = pair('melancholic', 'vulnerable')
  assert.equal(similar.dimensions.length, moodDimensions.length)
  assert.ok(similar.sharedDimensions.length > 0)
  assert.equal(similar.opposingDimensions.length, 0)
  assert.equal(similar.similarity, Math.round((1 - similar.distance) * 1000) / 1000)
})

test('dimensional opposition produces contrast or conflict without invalidating a blend', () => {
  const contrast = pair('dreamlike', 'restless')
  const conflict = pair('serene', 'menacing')
  assert.equal(contrast.rawType, 'contrasting')
  assert.equal(conflict.rawType, 'conflicting')
  assert.ok(conflict.oppositionCount > 0)
  assert.equal(conflict.strongestOpposition.dimension, 'tension')
  assert.equal(conflict.strongestOpposition.firstFavours, 'Peaceful')
  assert.equal(conflict.strongestOpposition.secondFavours, 'Uneasy')
  assert.ok(conflict.opposingDimensions.every(item => item.oppositeEnds && item.distance >= 20))
})

test('influence changes tension and interpretation but never raw profiles or Mood DNA', () => {
  const selections = [{ moodId: 'serene', weight: 50 }, { moodId: 'menacing', weight: 50 }]
  const beforeDna = deriveMoodDna(selections)
  const beforeSource = structuredClone(selections)
  const rawProfiles = [structuredClone(getMood('serene').profile), structuredClone(getMood('menacing').profile)]
  const equal = analyzeMoodRelationships(selections)
  const uneven = analyzeMoodRelationships([{ moodId: 'serene', weight: 90 }, { moodId: 'menacing', weight: 10 }])
  assert.equal(equal.pairs[0].rawType, uneven.pairs[0].rawType)
  assert.equal(equal.pairs[0].distance, uneven.pairs[0].distance)
  assert.equal(equal.overall.type, 'conflicting')
  assert.equal(uneven.overall.type, 'complementary')
  assert.ok(uneven.overall.effectiveTension < equal.overall.effectiveTension)
  assert.deepEqual(selections, beforeSource)
  assert.deepEqual(deriveMoodDna(selections), beforeDna)
  assert.deepEqual([getMood('serene').profile, getMood('menacing').profile], rawProfiles)
})

test('three moods preserve every pair, nuance, and stable aggregate', () => {
  const source = [{ moodId: 'serene', weight: 50 }, { moodId: 'menacing', weight: 50 }, { moodId: 'dreamlike', weight: 50 }]
  const result = analyzeMoodRelationships(source)
  assert.deepEqual(result.pairs.map(item => item.moodIds), [['serene', 'menacing'], ['serene', 'dreamlike'], ['menacing', 'dreamlike']])
  assert.equal(result.pairs.length, 3)
  assert.equal(Object.values(result.overall.counts).reduce((a, b) => a + b, 0), 3)
  assert.deepEqual(result, analyzeMoodRelationships(source))
  assert.ok(result.pairs.some(item => item.rawType === 'conflicting'))
})

test('two quiet opposing moods do not dominate a stronger third mood', () => {
  const result = analyzeMoodRelationships([{ moodId: 'serene', weight: 100 }, { moodId: 'romantic', weight: 5 }, { moodId: 'aggressive', weight: 5 }])
  assert.ok(result.pairs.some(item => item.rawType === 'conflicting'))
  assert.notEqual(result.overall.type, 'conflicting')
})

test('nearly identical and maximally opposed synthetic profiles follow the same rules', () => {
  const profile = Object.fromEntries(moodDimensions.map(({ id }) => [id, 20]))
  const near = { id: 'near', name: 'Near', profile: Object.fromEntries(moodDimensions.map(({ id }) => [id, 21])) }
  const far = { id: 'far', name: 'Far', profile: Object.fromEntries(moodDimensions.map(({ id }) => [id, 100])) }
  const base = { id: 'base', name: 'Base', profile }
  assert.equal(analyzeMoodPair(base, near).type, 'reinforcing')
  const extreme = analyzeMoodPair(base, far)
  assert.equal(extreme.type, 'conflicting')
  assert.equal(extreme.oppositionCount, 7)
  assert.ok(extreme.distance >= 0 && extreme.distance <= 1)
  assert.ok(extreme.similarity >= 0 && extreme.similarity <= 1)
})

test('one or no mood has no invented relationship; invalid selections are rejected', () => {
  for (const source of [[], [{ moodId: 'serene', weight: 50 }]]) {
    assert.deepEqual(analyzeMoodRelationships(source), {
      pairs: [], overall: { type: 'none', effectiveTension: 0, counts: { reinforcing: 0, complementary: 0, contrasting: 0, conflicting: 0 } },
    })
  }
  assert.throws(() => analyzeMoodRelationships([{ moodId: 'unknown', weight: 50 }]))
  assert.throws(() => analyzeMoodRelationships([{ moodId: 'serene', weight: 0 }]))
  assert.throws(() => analyzeMoodRelationships([{ moodId: 'serene', weight: 50 }, { moodId: 'serene', weight: 50 }]))
  assert.throws(() => analyzeMoodRelationships(['serene', 'menacing', 'dreamlike', 'romantic'].map(moodId => ({ moodId, weight: 50 }))))
})
