import test from 'node:test'
import assert from 'node:assert/strict'
import { createVocalPersona } from '../src/lib/vocalPersona.ts'
import { createVoiceDna, defaultVocalSelections } from '../src/lib/voiceDna.ts'

test('a named persona snapshots the current Voice DNA and keeps a stable unique ID', () => {
  const selections = { ...defaultVocalSelections, texture: 'airy', delivery: 'intimate', warmth: 90 }
  const expectedDna = createVoiceDna(selections)
  const persona = createVocalPersona('  Ember  ', '  A close, warm singer.  ', selections)
  assert.match(persona.id, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
  assert.equal(persona.name, 'Ember')
  assert.equal(persona.identityDescription, 'A close, warm singer.')
  assert.deepEqual(persona.selections, selections)
  assert.deepEqual(persona.voiceDna, expectedDna)

  selections.warmth = 10
  selections.texture = 'raspy'
  assert.equal(persona.selections.warmth, 90)
  assert.equal(persona.selections.texture, 'airy')
  assert.deepEqual(persona.voiceDna, expectedDna)
  const originalId = persona.id
  assert.equal(persona.id, originalId)
  assert.notEqual(createVocalPersona('Ember', 'A close, warm singer.', persona.selections).id, originalId)
})

test('persona creation requires short identity metadata', () => {
  assert.throws(() => createVocalPersona(' ', 'Described', defaultVocalSelections))
  assert.throws(() => createVocalPersona('Named', ' ', defaultVocalSelections))
  assert.throws(() => createVocalPersona('x'.repeat(81), 'Described', defaultVocalSelections))
  assert.throws(() => createVocalPersona('Named', 'x'.repeat(241), defaultVocalSelections))
})
