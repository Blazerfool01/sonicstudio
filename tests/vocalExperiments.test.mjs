import test from 'node:test'
import assert from 'node:assert/strict'
import { createVocalPersona } from '../src/lib/vocalPersona.ts'
import { defaultVocalSelections } from '../src/lib/voiceDna.ts'
import { PERSONA_STORAGE_KEY, writeSavedPersonas } from '../src/lib/savedPersonas.ts'
import { STORAGE_KEY as MIX_STORAGE_KEY } from '../src/lib/savedMixes.ts'
import { VOCAL_EXPERIMENT_STORAGE_KEY, createVocalExperiment, parseVocalExperiments, readVocalExperiments, writeVocalExperiments } from '../src/lib/vocalExperiments.ts'

test('experiment reference persists only its Persona ID and leaves both source stores intact', () => {
  const persona = createVocalPersona('Air', 'Close singer.', defaultVocalSelections)
  const items = new Map([[MIX_STORAGE_KEY, 'genre data']])
  const storage = { getItem: key => items.get(key) ?? null, setItem: (key, value) => items.set(key, value) }
  writeSavedPersonas(storage, [persona])
  const personaRaw = items.get(PERSONA_STORAGE_KEY)
  const record = createVocalExperiment('First chorus', 'Testing a softer take.', persona.id)
  writeVocalExperiments(storage, [record])
  assert.deepEqual(readVocalExperiments(storage), [record])
  assert.deepEqual(Object.keys(record), ['id', 'label', 'note', 'personaId'])
  assert.equal(record.personaId, persona.id)
  assert.equal(items.get(PERSONA_STORAGE_KEY), personaRaw)
  assert.equal(items.get(MIX_STORAGE_KEY), 'genre data')
  assert.ok(items.has(VOCAL_EXPERIMENT_STORAGE_KEY))
})

test('malformed or unsupported experiment references are skipped', () => {
  assert.deepEqual(parseVocalExperiments('{bad'), [])
  assert.deepEqual(parseVocalExperiments(JSON.stringify({ schemaVersion: 2, experiments: [] })), [])
  assert.deepEqual(readVocalExperiments({ getItem: () => { throw Error('blocked') } }), [])
  const persona = createVocalPersona('Air', 'Close singer.', defaultVocalSelections)
  const valid = createVocalExperiment('Reference', '', persona.id)
  assert.deepEqual(parseVocalExperiments(JSON.stringify({ schemaVersion: 1, experiments: [{ ...valid, personaId: 'bad' }, valid, valid] })), [valid])
  assert.throws(() => createVocalExperiment('', '', persona.id))
  assert.throws(() => createVocalExperiment('Reference', '', 'bad'))
})
