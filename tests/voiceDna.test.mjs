import test from 'node:test'
import assert from 'node:assert/strict'
import { createVoiceDna, defaultVocalSelections } from '../src/lib/voiceDna.ts'
import { registers, textures, deliveries, vocalEffects } from '../src/data/vocalTraits.ts'

test('curated vocal traits have unique identifiers and descriptions', () => {
  for (const group of [registers, textures, deliveries, vocalEffects]) {
    assert.equal(new Set(group.map(trait => trait.id)).size, group.length)
    assert.ok(group.every(trait => trait.label && trait.description))
  }
})

test('opposite voices yield deterministic, structurally and descriptively distinct DNA', () => {
  const airy = { register: 'high', texture: 'airy', delivery: 'intimate', effect: 'reverb', breathiness: 90, power: 15, warmth: 90, rasp: 5 }
  const forceful = { register: 'low', texture: 'raspy', delivery: 'assertive', effect: 'doubled', breathiness: 10, power: 95, warmth: 20, rasp: 90 }
  const a = createVoiceDna(airy)
  const b = createVoiceDna(forceful)
  assert.deepEqual(a, createVoiceDna(airy))
  assert.deepEqual(b, createVoiceDna(forceful))
  assert.notDeepEqual(a, b)
  assert.deepEqual([a.register.id, a.texture.id, a.delivery.id, a.effect.id], ['high', 'airy', 'intimate', 'reverb'])
  assert.deepEqual([b.register.id, b.texture.id, b.delivery.id, b.effect.id], ['low', 'raspy', 'assertive', 'doubled'])
  assert.match(a.description, /warm tonal colour/)
  assert.match(a.description, /restrained dynamic presence/)
  assert.match(b.description, /forceful dynamic presence/)
  assert.match(b.description, /rough, gritty surface/)
  assert.notEqual(a.description, b.description)
})

test('every dimension changes its own description and invalid input is rejected', () => {
  const baseline = createVoiceDna(defaultVocalSelections)
  for (const dimension of ['breathiness', 'power', 'warmth', 'rasp']) {
    const changed = createVoiceDna({ ...defaultVocalSelections, [dimension]: 100 })
    assert.notEqual(changed.dimensions[dimension].description, baseline.dimensions[dimension].description)
    assert.throws(() => createVoiceDna({ ...defaultVocalSelections, [dimension]: 101 }))
  }
  assert.throws(() => createVoiceDna({ ...defaultVocalSelections, texture: 'unknown' }))
})
