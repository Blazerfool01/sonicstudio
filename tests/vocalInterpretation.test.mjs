import test from 'node:test'
import assert from 'node:assert/strict'
import { createVocalInterpretation } from '../src/lib/vocalInterpretation.ts'
import { analyzeVocalRelationships } from '../src/lib/vocalRelationships.ts'
import { createVoiceDna, defaultVocalSelections } from '../src/lib/voiceDna.ts'

test('high breath and high power become one contextual performance quality', () => {
  const selections = { ...defaultVocalSelections, breathiness: 92, power: 94 }
  const result = createVocalInterpretation(selections)
  assert.equal(result.dominantQuality, 'forceful dynamics softened by audible breath')
  assert.match(result.strategy, /force.*letting audible breath soften the onset and release of each forceful note/)
  assert.deepEqual(result.tensions.map(tension => tension.relationshipId), ['breath-force'])
  assert.equal(result.tensions[0].resolution, analyzeVocalRelationships(selections).relationships.find(item => item.id === 'breath-force').resolution)
  assert.deepEqual(result, createVocalInterpretation(selections))
})

test('a multi-tension voice yields one linked strategy instead of copied rule texts', () => {
  const selections = {
    register: 'mid', texture: 'raspy', delivery: 'intimate', effect: 'reverb',
    breathiness: 95, power: 94, warmth: 72, rasp: 91,
  }
  const result = createVocalInterpretation(selections)
  const report = analyzeVocalRelationships(selections)
  const source = structuredClone(selections)
  const dna = createVoiceDna(selections)
  assert.deepEqual(result.tensions.map(tension => tension.relationshipId), [
    'intimate-force', 'breath-force', 'intimate-reverb',
  ])
  assert.deepEqual(result.supportingQualities.map(item => item.relationshipId), ['raspy-rasp', 'warm-air', 'force-grit'])
  assert.match(result.strategy, /close, personal.*brief emotional peaks, letting audible breath soften the onset and release of each peak/)
  assert.match(result.strategy, /rasp roughens those peaks without disturbing the close phrasing/i)
  assert.match(result.strategy, /warmth gives the breath-softened peaks body/)
  assert.match(result.strategy, /Reverb stays behind that close lead/)
  assert.ok(report.relationships.every(item => !result.strategy.includes(item.explanation)))
  assert.ok(result.tensions.every(item => !result.strategy.includes(item.resolution)))
  assert.deepEqual(result, createVocalInterpretation(selections))
  assert.deepEqual(selections, source)
  assert.deepEqual(createVoiceDna(selections), dna)
})

test('awkward multi-tension voices stay coherent, deterministic, and preserve source DNA', () => {
  const cases = [
    {
      selections: { register: 'low', texture: 'airy', delivery: 'assertive', effect: 'none', breathiness: 4, power: 8, warmth: 18, rasp: 12 },
      dominant: 'restrained volume with decisive articulation',
      tensions: ['airy-dry', 'assertive-restraint'],
      strategy: [/decisive timing/, /dry and focused/, /airy release only at phrase endings/],
    },
    {
      selections: { register: 'high', texture: 'raspy', delivery: 'intimate', effect: 'reverb', breathiness: 12, power: 96, warmth: 50, rasp: 3 },
      dominant: 'close phrasing with power reserved for emotional peaks',
      tensions: ['raspy-smooth', 'intimate-force', 'intimate-reverb'],
      strategy: [/brief emotional peaks/, /Sustained vowels stay smooth/, /rasp reserved for brief attacks/, /Reverb stays behind that close lead/],
    },
  ]
  for (const { selections, dominant, tensions, strategy } of cases) {
    const source = structuredClone(selections)
    const dna = createVoiceDna(selections)
    const result = createVocalInterpretation(selections)
    assert.equal(result.dominantQuality, dominant)
    assert.deepEqual(result.tensions.map(item => item.relationshipId), tensions)
    assert.ok(result.tensions.every(item => item.resolution.length > 30 && /^(Keep|Let)/.test(item.resolution)))
    for (const phrase of strategy) assert.match(result.strategy, phrase)
    assert.equal(result.strategy.split('. ').length, selections.effect === 'reverb' ? 3 : 2)
    assert.deepEqual(createVocalInterpretation(selections), result)
    assert.deepEqual(selections, source)
    assert.deepEqual(createVoiceDna(selections), dna)
  }
})

test('interpretation is pure and gives a coherent fallback when no curated rule matches', () => {
  const selections = structuredClone(defaultVocalSelections)
  const before = structuredClone(selections)
  const dna = createVoiceDna(selections)
  const result = createVocalInterpretation(selections)
  assert.deepEqual(result.supportingQualities, [])
  assert.deepEqual(result.tensions, [])
  assert.match(result.strategy, /natural, speech-like mid-register lead.*measured dynamics.*clear and defined/)
  assert.deepEqual(selections, before)
  assert.deepEqual(createVoiceDna(selections), dna)
  assert.throws(() => createVocalInterpretation({ ...selections, rasp: -1 }))
})
