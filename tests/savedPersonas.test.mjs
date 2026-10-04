import test from 'node:test'
import assert from 'node:assert/strict'
import { createVocalPersona } from '../src/lib/vocalPersona.ts'
import { createVoiceDna, defaultVocalSelections } from '../src/lib/voiceDna.ts'
import { PERSONA_STORAGE_KEY, parseSavedPersonas, readSavedPersonas, writeSavedPersonas } from '../src/lib/savedPersonas.ts'
import { STORAGE_KEY as MIX_STORAGE_KEY } from '../src/lib/savedMixes.ts'

const emberSelections = { ...defaultVocalSelections, register: 'high', texture: 'airy', delivery: 'intimate', effect: 'reverb', breathiness: 90, power: 15, warmth: 90, rasp: 5 }

test('Ember round-trips exactly and reopening cannot mutate the saved record', () => {
  const items = new Map([[MIX_STORAGE_KEY, 'existing genre data']])
  const storage = { getItem: key => items.get(key) ?? null, setItem: (key, value) => items.set(key, value) }
  const ember = createVocalPersona('Ember', 'An airy, warm, intimate singer.', emberSelections)
  const original = structuredClone(ember)
  writeSavedPersonas(storage, [ember])
  assert.equal(items.get(MIX_STORAGE_KEY), 'existing genre data')
  assert.ok(items.has(PERSONA_STORAGE_KEY))
  const [loaded] = readSavedPersonas(storage)
  assert.deepEqual(loaded, original)
  assert.deepEqual(loaded.voiceDna, createVoiceDna(emberSelections))

  const builder = { ...loaded.selections }
  builder.texture = 'raspy'
  builder.warmth = 10
  assert.deepEqual(readSavedPersonas(storage)[0], original)
  assert.equal(loaded.id, ember.id)
})

test('empty, malformed, unsupported, and invalid persona data is handled safely', () => {
  assert.deepEqual(parseSavedPersonas(null), [])
  assert.deepEqual(parseSavedPersonas('{broken'), [])
  assert.deepEqual(parseSavedPersonas(JSON.stringify({ schemaVersion: 2, personas: [] })), [])
  assert.deepEqual(readSavedPersonas({ getItem: () => { throw Error('blocked') } }), [])
  const valid = createVocalPersona('Ember', 'Warm and intimate.', emberSelections)
  const invalidValue = { ...valid, selections: { ...valid.selections, warmth: 101 } }
  const invalidDna = { ...valid, voiceDna: { ...valid.voiceDna, dimensions: { ...valid.voiceDna.dimensions, warmth: { value: 10, description: 'cool' } } } }
  const raw = JSON.stringify({ schemaVersion: 1, personas: [invalidValue, invalidDna, valid, valid, { ...valid, id: 'bad-id' }] })
  assert.deepEqual(parseSavedPersonas(raw), [valid])
})
