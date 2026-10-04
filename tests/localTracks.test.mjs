import test from 'node:test'
import assert from 'node:assert/strict'
import { addTracks, audioCandidate, displayName, removeTrack, selectTrack } from '../src/lib/localTracks.ts'

const first = { id: 'a', filename: 'First song.mp3', name: 'First song', type: 'audio/mpeg', size: 100 }
const second = { id: 'b', filename: 'Second.wav', name: 'Second', type: 'audio/wav', size: 200 }
const third = { id: 'c', filename: 'Third.ogg', name: 'Third', type: 'audio/ogg', size: 300 }

test('imports keep metadata and select the first track only when none is selected', () => {
  const initial = addTracks({ tracks: [], selectedId: null }, [first, second])
  assert.deepEqual(initial, { tracks: [first, second], selectedId: 'a' })
  assert.equal(addTracks(initial, [third]).selectedId, 'a')
  assert.equal(displayName('demo.mix.m4a'), 'demo.mix')
})

test('selection is stable and ignores missing ids', () => {
  const library = addTracks({ tracks: [], selectedId: null }, [first, second])
  assert.equal(selectTrack(library, 'b').selectedId, 'b')
  assert.equal(selectTrack(library, 'missing'), library)
})

test('removing tracks keeps or falls back to a valid selection', () => {
  const library = addTracks({ tracks: [], selectedId: null }, [first, second, third])
  assert.deepEqual(removeTrack(library, 'c'), { tracks: [first, second], selectedId: 'a' })
  assert.deepEqual(removeTrack(library, 'a'), { tracks: [second, third], selectedId: 'b' })
  assert.deepEqual(removeTrack(selectTrack(library, 'c'), 'c'), { tracks: [first, second], selectedId: 'b' })
  assert.deepEqual(removeTrack({ tracks: [first], selectedId: 'a' }, 'a'), { tracks: [], selectedId: null })
})

test('only non-empty audio candidates with recognized extensions enter the library', () => {
  assert.equal(audioCandidate({ name: 'a.MP3', type: 'audio/mpeg', size: 100 }), true)
  assert.equal(audioCandidate({ name: 'a.m4a', type: '', size: 100 }), true)
  assert.equal(audioCandidate({ name: 'a.txt', type: 'text/plain', size: 100 }), false)
  assert.equal(audioCandidate({ name: 'a.wav', type: 'audio/wav', size: 0 }), false)
})
