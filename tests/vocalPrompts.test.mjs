import test from 'node:test'
import assert from 'node:assert/strict'
import { createVocalPersona } from '../src/lib/vocalPersona.ts'
import { createVocalPrompts } from '../src/lib/vocalPrompts.ts'
import { compareVocalPersonas } from '../src/lib/vocalComparison.ts'
import { readSavedPersonas, writeSavedPersonas } from '../src/lib/savedPersonas.ts'

const airy = { register: 'high', texture: 'airy', delivery: 'intimate', effect: 'reverb', breathiness: 92, power: 16, warmth: 90, rasp: 4 }
const forceful = { register: 'low', texture: 'raspy', delivery: 'assertive', effect: 'doubled', breathiness: 8, power: 96, warmth: 18, rasp: 93 }

test('opposite saved voices generate distinct, contextual, genre-independent prompts', () => {
  const first = createVocalPersona('Air', 'An airy close singer.', airy)
  const second = createVocalPersona('Stone', 'A forceful raspy singer.', forceful)
  const before = structuredClone([first, second])
  const a = createVocalPrompts(first.selections, first.voiceDna)
  const b = createVocalPrompts(second.selections, second.voiceDna)
  assert.notEqual(a.concise, b.concise)
  assert.notEqual(a.detailed, b.detailed)
  assert.match(a.concise, /high register, airy texture, intimate delivery; reverb effect/)
  assert.match(a.concise, /close, personal.*Audible breath.*warmth.*Reverb/)
  assert.match(b.concise, /low register, raspy texture, assertive delivery; doubled effect/)
  assert.match(b.concise, /force.*gritty edge.*Doubling reinforces/)
  assert.match(a.detailed, /VOICE COLOUR[\s\S]*breathiness: an audible, breath-forward profile/)
  assert.match(b.detailed, /VOICE COLOUR[\s\S]*rasp: a rough, gritty surface/)
  for (const prompt of [a.concise, a.detailed, b.concise, b.detailed]) assert.doesNotMatch(prompt, /Dark R&B|Hardwave|genre|Suno/i)
  assert.deepEqual([first, second], before)
})

test('saved persona reopen reproduces both prompts and comparison identifies important differences', () => {
  const first = createVocalPersona('Air', 'An airy close singer.', airy)
  const second = createVocalPersona('Stone', 'A forceful raspy singer.', forceful)
  const items = new Map()
  const storage = { getItem: key => items.get(key) ?? null, setItem: (key, value) => items.set(key, value) }
  writeSavedPersonas(storage, [first, second])
  const reopened = readSavedPersonas(storage)
  assert.deepEqual(reopened, [first, second])
  assert.deepEqual(createVocalPrompts(reopened[0].selections, reopened[0].voiceDna), createVocalPrompts(first.selections, first.voiceDna))
  assert.deepEqual(createVocalPrompts(reopened[1].selections, reopened[1].voiceDna), createVocalPrompts(second.selections, second.voiceDna))
  const differences = compareVocalPersonas(reopened[0], reopened[1])
  assert.equal(differences.length, 8)
  assert.ok(differences.every(item => item.differs))
  assert.deepEqual(differences.slice(0, 4).map(item => [item.first, item.second]), [['High', 'Low'], ['Airy', 'Raspy'], ['Intimate', 'Assertive'], ['Reverb', 'Doubled']])
  assert.throws(() => compareVocalPersonas(first, first))
})

test('live prompt updates with selections without mutating a saved identity', () => {
  const saved = createVocalPersona('Air', 'An airy close singer.', airy)
  const before = structuredClone(saved)
  const live = { ...saved.selections, texture: 'raspy', delivery: 'assertive', power: 96, rasp: 92 }
  const livePrompts = createVocalPrompts(live)
  assert.notDeepEqual(livePrompts, createVocalPrompts(saved.selections, saved.voiceDna))
  assert.match(livePrompts.concise, /raspy texture, assertive delivery/)
  assert.deepEqual(saved, before)
})
