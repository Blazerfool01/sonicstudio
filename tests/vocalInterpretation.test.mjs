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
  assert.deepEqual(result.tensions.map(tension => tension.relationshipId), [
    'intimate-force', 'breath-force', 'intimate-reverb',
  ])
  assert.deepEqual(result.supportingQualities.map(item => item.relationshipId), ['raspy-rasp', 'warm-air', 'force-grit'])
  assert.match(result.strategy, /close, personal.*brief emotional peaks, letting audible breath soften the onset and release of each peak/)
  assert.match(result.strategy, /rasp roughens those peaks without disturbing the close phrasing/i)
  assert.match(result.strategy, /warmth gives their airy edge body/)
  assert.match(result.strategy, /Reverb stays behind that close lead/)
  assert.ok(report.relationships.every(item => !result.strategy.includes(item.explanation)))
  assert.ok(result.tensions.every(item => !result.strategy.includes(item.resolution)))
  assert.deepEqual(result, createVocalInterpretation(selections))
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
