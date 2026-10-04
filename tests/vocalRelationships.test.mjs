import test from 'node:test'
import assert from 'node:assert/strict'
import { analyzeVocalRelationships } from '../src/lib/vocalRelationships.ts'
import { vocalRelationshipRules } from '../src/data/vocalRelationships.ts'
import { createVoiceDna } from '../src/lib/voiceDna.ts'

const airy = { register: 'high', texture: 'airy', delivery: 'intimate', effect: 'reverb', breathiness: 90, power: 15, warmth: 90, rasp: 5 }
const forceful = { register: 'low', texture: 'raspy', delivery: 'assertive', effect: 'doubled', breathiness: 10, power: 95, warmth: 20, rasp: 90 }
const contradictory = { register: 'mid', texture: 'airy', delivery: 'assertive', effect: 'none', breathiness: 5, power: 10, warmth: 50, rasp: 50 }

test('curated relationship rules have unique IDs, two distinct fields and explanations', () => {
  assert.equal(new Set(vocalRelationshipRules.map(rule => rule.id)).size, vocalRelationshipRules.length)
  for (const rule of vocalRelationshipRules) {
    assert.notEqual(rule.conditions[0].field, rule.conditions[1].field)
    assert.ok(rule.explanation.length > 20)
  }
})

test('three different voices yield distinct structured relationship reports', () => {
  const a = analyzeVocalRelationships(airy)
  const b = analyzeVocalRelationships(forceful)
  const c = analyzeVocalRelationships(contradictory)
  assert.deepEqual(a, analyzeVocalRelationships(airy))
  assert.deepEqual(a.relationships.map(item => [item.id, item.kind]), [
    ['airy-breath', 'reinforcing'], ['intimate-restraint', 'reinforcing'],
    ['warm-air', 'complementary'], ['intimate-reverb', 'contrasting'],
  ])
  assert.deepEqual(b.relationships.map(item => [item.id, item.kind]), [
    ['raspy-rasp', 'reinforcing'], ['assertive-force', 'reinforcing'],
    ['force-grit', 'complementary'], ['assertive-doubled', 'complementary'],
  ])
  assert.deepEqual(c.relationships.map(item => [item.id, item.kind]), [
    ['airy-dry', 'conflicting'], ['assertive-restraint', 'conflicting'],
  ])
  assert.match(c.relationships[0].explanation, /audible air.*dry, focused/)
  assert.match(a.relationships[1].explanation, /close, personal/)
  assert.match(b.relationships[0].explanation, /rough edge/)
  assert.deepEqual(c.counts, { reinforcing: 0, complementary: 0, contrasting: 0, conflicting: 2 })
})

test('analysis does not mutate selections or alter existing Voice DNA', () => {
  const input = structuredClone(airy)
  const dna = createVoiceDna(input)
  analyzeVocalRelationships(input)
  assert.deepEqual(input, airy)
  assert.deepEqual(createVoiceDna(input), dna)
  assert.throws(() => analyzeVocalRelationships({ ...airy, power: 101 }))
})
