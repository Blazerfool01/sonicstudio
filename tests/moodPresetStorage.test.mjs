import test from 'node:test'
import assert from 'node:assert/strict'
import { deriveMoodDna } from '../src/lib/moodDna.ts'
import { analyzeMoodRelationships } from '../src/lib/moodRelationships.ts'
import { interpretMoodRelationships } from '../src/lib/moodRelationshipInterpretation.ts'
import { productionGuidanceForMoodDna } from '../src/lib/moodProductionGuidance.ts'
import {
  MOOD_PRESET_SCHEMA_VERSION, MOOD_PRESET_STORAGE_KEY, deleteMoodPreset, makeMoodPreset,
  parseMoodPresets, readMoodPresets, selectionsOf, updateMoodPreset, writeMoodPresets,
} from '../src/lib/moodPresetStorage.ts'

const when = '2026-10-04T12:00:00.000Z'
const source = (...items) => items.map(([moodId, weight]) => ({ moodId, weight }))
const preset = (name, selections, id = name) => makeMoodPreset(name, selections, id, when)
const storage = () => {
  const data = new Map()
  return {
    getItem: key => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
    raw: key => data.get(key),
  }
}
const outputs = selections => {
  const dna = deriveMoodDna(selections)
  const relationship = analyzeMoodRelationships(selections)
  return { dna, relationship, interpretation: interpretMoodRelationships(relationship, selections), translation: productionGuidanceForMoodDna(dna) }
}

test('preset creation stores only cloned source state for one to three moods', () => {
  for (const selections of [source(['serene', 70]), source(['serene', 50], ['menacing', 50]), source(['serene', 50], ['dreamlike', 30], ['menacing', 10])]) {
    const saved = preset('  Night  ', selections, 'night-id')
    assert.equal(saved.name, 'Night')
    assert.equal(saved.id, 'night-id')
    assert.deepEqual(saved.selections, selections)
    assert.notStrictEqual(saved.selections, selections)
    assert.notStrictEqual(saved.selections[0], selections[0])
    assert.deepEqual(Object.keys(saved).sort(), ['createdAt', 'id', 'name', 'selections', 'updatedAt'])
    selections[0].weight = 1
    assert.notEqual(saved.selections[0].weight, selections[0].weight)
    assert.ok(!JSON.stringify(saved).includes('dimensions'))
    assert.ok(!JSON.stringify(saved).includes('priorities'))
    assert.ok(!JSON.stringify(saved).includes('relationship'))
  }
})

test('invalid source or name cannot become a preset', () => {
  assert.throws(() => preset('Empty', []))
  assert.throws(() => preset('   ', source(['serene', 50])))
  assert.throws(() => preset('Four', source(['serene', 1], ['dreamlike', 1], ['menacing', 1], ['haunting', 1])))
  assert.throws(() => preset('Duplicate', source(['serene', 50], ['serene', 20])))
  for (const weight of [0, 101, 5.5]) assert.throws(() => preset('Weight', source(['serene', weight])))
  assert.throws(() => preset('Unknown', source(['not-a-mood', 50])))
})

test('source-only storage round trip regenerates all derived outputs for review presets', () => {
  const cases = [
    ['single', source(['serene', 70])],
    ['reinforcing', source(['melancholic', 50], ['vulnerable', 50])],
    ['conflicting', source(['serene', 50], ['menacing', 50])],
    ['weighted', source(['serene', 90], ['menacing', 10])],
    ['three', source(['serene', 50], ['dreamlike', 30], ['menacing', 10])],
  ]
  const store = storage()
  const presets = cases.map(([name, selections]) => preset(name, selections))
  const original = cases.map(([, selections]) => outputs(selections))
  writeMoodPresets(store, presets)
  const raw = JSON.parse(store.raw(MOOD_PRESET_STORAGE_KEY))
  assert.equal(raw.schemaVersion, MOOD_PRESET_SCHEMA_VERSION)
  assert.deepEqual(Object.keys(raw), ['schemaVersion', 'presets'])
  assert.ok(!store.raw(MOOD_PRESET_STORAGE_KEY).includes('dimensions'))
  const reopened = readMoodPresets(store)
  assert.deepEqual(reopened, presets)
  reopened.forEach((item, index) => {
    assert.deepEqual(selectionsOf(item), cases[index][1])
    assert.deepEqual(outputs(selectionsOf(item)), original[index])
  })
  assert.equal(original[1].relationship.overall.type, 'reinforcing')
  assert.equal(original[2].relationship.overall.type, 'conflicting')
  assert.ok(original[2].interpretation.tensions.length)
  assert.equal(original[3].interpretation.roles[0].role, 'dominant')
  assert.equal(original[3].interpretation.roles[1].role, 'accent')
  assert.notEqual(original[3].translation.overallDirection, original[2].translation.overallDirection)
  assert.deepEqual(original[4].interpretation.roles.map(item => item.role), ['dominant', 'supporting', 'accent'])
})

test('editing live state is separate; update retains identity and save-as creates a new identity', () => {
  const initial = preset('Original', source(['serene', 50]), 'stable-id')
  const live = selectionsOf(initial)
  live[0].weight = 90
  assert.equal(initial.selections[0].weight, 50)
  const changed = updateMoodPreset(initial, 'Revised', live, '2026-10-04T13:00:00.000Z')
  assert.equal(changed.id, initial.id)
  assert.equal(changed.createdAt, initial.createdAt)
  assert.notEqual(changed.updatedAt, initial.updatedAt)
  assert.equal(changed.selections[0].weight, 90)
  assert.equal(initial.selections[0].weight, 50)
  const copy = preset('Separate', live, 'new-id')
  assert.notEqual(copy.id, initial.id)
  assert.deepEqual(copy.selections, changed.selections)
  const remaining = deleteMoodPreset([initial, changed, copy], changed.id)
  assert.deepEqual(remaining, [copy])
})

test('malformed envelopes and records are skipped without hiding valid presets', () => {
  const good = preset('Good', source(['serene', 50]), 'good')
  const envelope = presets => JSON.stringify({ schemaVersion: 1, presets })
  assert.deepEqual(parseMoodPresets('{bad'), [])
  assert.deepEqual(parseMoodPresets('{}'), [])
  assert.deepEqual(parseMoodPresets(JSON.stringify({ schemaVersion: 2, presets: [good] })), [])
  const invalid = [
    { ...good, id: 'unknown', selections: source(['missing', 50]) },
    { ...good, id: 'duplicate', selections: source(['serene', 50], ['serene', 30]) },
    { ...good, id: 'zero', selections: source(['serene', 0]) },
    { ...good, id: 'above', selections: source(['serene', 101]) },
    { ...good, id: 'many', selections: source(['serene', 1], ['dreamlike', 1], ['menacing', 1], ['haunting', 1]) },
    { ...good, id: 'unnamed', name: '' },
    { ...good, id: 'bad-date', createdAt: 'not a date' },
  ]
  assert.deepEqual(parseMoodPresets(envelope([null, ...invalid, good, good])), [good])
  assert.deepEqual(parseMoodPresets(envelope([good, ...invalid])), [good])
  assert.deepEqual(parseMoodPresets(envelope([good, ...invalid])), parseMoodPresets(envelope([good, ...invalid])))
  assert.deepEqual(readMoodPresets({ getItem: () => { throw new Error('blocked') } }), [])
})

test('writer strips unknown derived fields from otherwise valid records', () => {
  const store = storage()
  const good = { ...preset('Good', source(['serene', 50])), moodDna: { stale: true }, production: 'stale' }
  writeMoodPresets(store, [good])
  const raw = store.raw(MOOD_PRESET_STORAGE_KEY)
  assert.ok(!raw.includes('moodDna'))
  assert.ok(!raw.includes('production'))
  assert.deepEqual(readMoodPresets(store)[0], preset('Good', source(['serene', 50])))
})
