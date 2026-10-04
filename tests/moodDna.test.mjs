import test from 'node:test'
import assert from 'node:assert/strict'
import { moods, moodDimensions, getMood } from '../src/data/moods.ts'
import { deriveMoodDna } from '../src/lib/moodDna.ts'
import { describeMoodDna } from '../src/lib/moodDescription.ts'

test('catalogue has stable unique IDs and complete profiles on one scale', () => {
  assert.equal(moods.length, 14)
  assert.equal(new Set(moods.map(mood => mood.id)).size, moods.length)
  for (const mood of moods) {
    assert.ok(mood.name)
    assert.deepEqual(Object.keys(mood.profile), moodDimensions.map(dimension => dimension.id))
    assert.ok(Object.values(mood.profile).every(value => Number.isInteger(value) && value >= 0 && value <= 100))
  }
})

test('one mood reproduces its profile exactly', () => {
  const dna = deriveMoodDna([{ moodId: 'melancholic', weight: 37 }])
  assert.deepEqual(dna.dimensions, getMood('melancholic').profile)
  assert.deepEqual(dna.dominantMood, { id: 'melancholic', name: 'Melancholic' })
})

test('weighted moods use a normalized weighted mean and respond to weight changes', () => {
  const a = deriveMoodDna([{ moodId: 'serene', weight: 75 }, { moodId: 'aggressive', weight: 25 }])
  assert.equal(a.dimensions.energy, Math.round((16 * 75 + 97 * 25) / 100))
  assert.equal(a.dimensions.tension, Math.round((7 * 75 + 86 * 25) / 100))
  const b = deriveMoodDna([{ moodId: 'serene', weight: 25 }, { moodId: 'aggressive', weight: 75 }])
  assert.notDeepEqual(a.dimensions, b.dimensions)
  assert.equal(a.dominantMood.id, 'serene')
  assert.equal(b.dominantMood.id, 'aggressive')
})

test('identical input yields identical DNA and deterministic description', () => {
  const source = [{ moodId: 'haunting', weight: 60 }, { moodId: 'dreamlike', weight: 40 }]
  assert.deepEqual(deriveMoodDna(source), deriveMoodDna(source))
  assert.equal(describeMoodDna(deriveMoodDna(source)), describeMoodDna(deriveMoodDna(source)))
})

test('opposing extremes and three moods remain valid; ties use first selection', () => {
  const dna = deriveMoodDna([{ moodId: 'serene', weight: 100 }, { moodId: 'aggressive', weight: 100 }, { moodId: 'euphoric', weight: 1 }])
  assert.equal(dna.dominantMood.id, 'serene')
  assert.ok(Object.values(dna.dimensions).every(value => value >= 0 && value <= 100))
  assert.equal(deriveMoodDna([]), null)
})

test('invalid source state is rejected', () => {
  assert.throws(() => deriveMoodDna([{ moodId: 'unknown', weight: 50 }]))
  assert.throws(() => deriveMoodDna([{ moodId: 'serene', weight: 0 }]))
  assert.throws(() => deriveMoodDna([{ moodId: 'serene', weight: 50 }, { moodId: 'serene', weight: 50 }]))
})
