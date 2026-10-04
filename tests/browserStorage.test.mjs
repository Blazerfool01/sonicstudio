import test from 'node:test'
import assert from 'node:assert/strict'
import { readBrowserStorage } from '../src/lib/browserStorage.ts'
import { readSavedPersonas } from '../src/lib/savedPersonas.ts'
import { readVocalExperiments } from '../src/lib/vocalExperiments.ts'
import { readMoodPresets } from '../src/lib/moodPresetStorage.ts'
import { readSavedMixes } from '../src/lib/savedMixes.ts'

const readers = [readSavedPersonas, readVocalExperiments, readMoodPresets, storage => readSavedMixes(storage, [])]

function withStorage(descriptor, check) {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, ...descriptor })
  try { check() } finally {
    if (original) Object.defineProperty(globalThis, 'localStorage', original)
    else delete globalThis.localStorage
  }
}

test('all tool initializers recover when acquiring the browser storage property throws', () => {
  withStorage({ get() { throw new DOMException('Storage blocked', 'SecurityError') } }, () => {
    for (const read of readers) assert.deepEqual(readBrowserStorage(read, []), [])
  })
})

test('guarded acquisition preserves reader recovery for malformed data and blocked getItem', () => {
  for (const getItem of [() => '{broken', () => { throw new Error('blocked') }]) {
    withStorage({ value: { getItem } }, () => {
      for (const read of readers) assert.deepEqual(readBrowserStorage(read, []), [])
    })
  }
})
