import test from 'node:test'
import assert from 'node:assert/strict'
import { makeMix, parseSavedMixes, readSavedMixes, sourceOf, updateMix } from '../src/lib/savedMixes.ts'

const ids = ['dark-rnb', 'hardwave', 'ambient', 'drum-bass']
const a = { firstId: 'dark-rnb', secondId: 'hardwave', weight: 80 }
const b = { firstId: 'ambient', secondId: 'drum-bass', weight: 35 }

test('two mixes survive serialization with ordered IDs and exact weights', () => {
  const first = makeMix('Night', a, 'one', '2026-10-04T00:00:00.000Z')
  const second = makeMix('Motion', b, 'two', '2026-10-04T00:00:00.000Z')
  const loaded = parseSavedMixes(JSON.stringify([first, second]), ids)
  assert.deepEqual(loaded.map(sourceOf), [a, b])
  assert.equal(loaded[0].schemaVersion, 1)
  assert.deepEqual(loaded[0].genres.map(item => item.weight), [80, 20])
})

test('updating one mix leaves the other intact; duplication and deletion preserve independence', () => {
  const first = makeMix('Night', a, 'one', '2026-10-04T00:00:00.000Z')
  const second = makeMix('Motion', b, 'two', '2026-10-04T00:00:00.000Z')
  const changed = updateMix(first, 'Night revised', { ...a, weight: 55 }, '2026-10-04T01:00:00.000Z')
  const copy = makeMix(`${second.name} copy`, sourceOf(second), 'three')
  const remaining = parseSavedMixes(JSON.stringify([changed, second, copy].filter(mix => mix.id !== second.id)), ids)
  assert.deepEqual(sourceOf(remaining[0]), { ...a, weight: 55 })
  assert.equal(changed.createdAt, first.createdAt)
  assert.deepEqual(sourceOf(remaining[1]), b)
  assert.notEqual(copy.id, second.id)
  assert.deepEqual(sourceOf(second), b)
})

test('malformed, old, and invalid records are skipped safely', () => {
  const valid = makeMix('Valid', a, 'valid')
  assert.deepEqual(parseSavedMixes('{broken', ids), [])
  assert.deepEqual(parseSavedMixes('{}', ids), [])
  const mixed = [null, { ...valid, schemaVersion: 0 }, { ...valid, id: 'unknown', genres: [{ genreId: 'missing', weight: 80 }, valid.genres[1]] }, { ...valid, id: 'bad-weight', genres: [{ genreId: 'dark-rnb', weight: 81 }, { genreId: 'hardwave', weight: 19 }] }, valid, valid]
  assert.deepEqual(parseSavedMixes(JSON.stringify(mixed), ids), [valid])
  assert.deepEqual(readSavedMixes({ getItem: () => '{broken' }, ids), [])
  assert.deepEqual(readSavedMixes({ getItem: () => { throw new Error('blocked') } }, ids), [])
})
