import test from 'node:test'
import assert from 'node:assert/strict'
import { createProject, attachIngredient, parseProjects, writeProjects, PROJECT_STORAGE_KEY } from '../src/lib/studioProject.ts'
import { createCreationBrief } from '../src/lib/creationBrief.ts'
import { defaultVocalSelections } from '../src/lib/voiceDna.ts'
const now = '2026-10-04T12:00:00.000Z'
const project = () => createProject('Night drive', 'night', now)
const sources = () => ({
  genre: { label: 'Dark blend', sourceId: 'mix-1', genres: [{ genreId: 'dark-rnb', weight: 60 }, { genreId: 'hardwave', weight: 40 }] },
  vocal: { label: 'Singer', sourceId: 'persona-1', identityDescription: 'Warm singer', selections: { ...defaultVocalSelections } },
  mood: { label: 'Serene', sourceId: null, selections: [{ moodId: 'serene', weight: 70 }] },
})
const full = () => Object.entries(sources()).reduce((p, [kind, source]) => attachIngredient(p, kind, source, now), project())
const envelope = projects => JSON.stringify({ schemaVersion: 1, activeId: 'night', projects })
test('project schema supports a valid empty identity', () => {
  const p = project()
  assert.equal(p.schemaVersion, 1); assert.equal(p.id, 'night'); assert.equal(p.createdAt, now)
  for (const kind of ['genre', 'vocal', 'mood']) assert.equal(p[kind], null)
  assert.deepEqual(parseProjects(envelope([p])).projects, [p])
  assert.match(createCreationBrief(p).prompt, /no musical ingredients/)
  assert.throws(() => createProject(' '))
})
for (const kind of ['genre', 'vocal', 'mood']) {
  test(`${kind} attachment clones source identity and isolates later source edits`, () => {
    const source = sources()[kind]
    const original = structuredClone(source)
    const before = project()
    const attached = attachIngredient(before, kind, source, now)
    assert.equal(before[kind], null)
    assert.deepEqual(attached[kind], original)
    source.label = 'changed'
    if (kind === 'genre') source.genres[0].weight = 90
    else if (kind === 'vocal') source.selections.power = 99
    else source.selections[0].weight = 1
    assert.deepEqual(attached[kind], original)
    assert.ok(!JSON.stringify(attached[kind]).includes('guidance'))
  })
  test(`${kind}-only brief provides useful partial output`, () => {
    const p = attachIngredient(project(), kind, sources()[kind], now)
    const brief = createCreationBrief(p)
    assert.ok(brief.prompt.length > 200)
    assert.match(brief.prompt, /GENRE FOUNDATION/)
    assert.match(brief.prompt, /VOCAL IDENTITY/)
    assert.match(brief.prompt, /MOOD \/ PRODUCTION DIRECTION/)
    if (kind === 'genre') assert.match(brief.genreFoundation, /BPM/)
    if (kind === 'vocal') assert.match(brief.vocalIdentity, /PERFORMANCE/)
    if (kind === 'mood') { assert.match(brief.moodDirection, /emotional/); assert.doesNotMatch(brief.moodDirection, /\d+.*BPM/) }
  })
}
test('malformed envelopes and unsupported schemas fail safely', () => {
  for (const raw of [null, '{', '[]', '{"schemaVersion":2,"projects":[]}', '{"schemaVersion":1,"projects":{}}']) assert.deepEqual(parseProjects(raw), { projects: [], activeId: null })
})
test('damaged records preserve valid neighbours and duplicate IDs are skipped', () => {
  const valid = full()
  for (const broken of [{ ...valid, schemaVersion: 2 }, { ...valid, mood: {} }, { ...valid, vocal: { ...valid.vocal, selections: {} } }, { ...valid, genre: { ...valid.genre, genres: [] } }, { ...valid, notes: null }]) {
    assert.deepEqual(parseProjects(envelope([broken, valid, valid])).projects, [valid])
  }
})
test('brief is deterministic and full composition has all responsibilities', () => {
  const p = full(); const brief = createCreationBrief(p)
  assert.deepEqual(createCreationBrief(structuredClone(p)), brief)
  assert.match(brief.genreFoundation, /instrumentation:/)
  assert.match(brief.vocalIdentity, /VOICE COLOUR/)
  assert.match(brief.moodDirection, /Keep the.*foundation/)
  assert.match(brief.moodDirection, /retaining the captured register/)
})
test('mood changes treatment while retaining genre foundation and tempo range', () => {
  const p = full(); const before = createCreationBrief(p)
  const changed = attachIngredient(p, 'mood', { label: 'Aggressive', sourceId: null, selections: [{ moodId: 'aggressive', weight: 100 }] }, now)
  const after = createCreationBrief(changed)
  assert.equal(before.genreFoundation, after.genreFoundation)
  assert.equal(before.vocalIdentity, after.vocalIdentity)
  assert.notEqual(before.moodDirection, after.moodDirection)
  const range = before.genreFoundation.match(/(\d+–\d+) BPM/)[1]
  assert.ok(after.moodDirection.includes(`${range} BPM`))
  assert.deepEqual(changed.vocal, p.vocal)
})
test('saved reopen regenerates identical brief and preserves active project', () => {
  const p = full(); let raw
  writeProjects({ setItem(key, value) { assert.equal(key, PROJECT_STORAGE_KEY); raw = value } }, [p], p.id)
  const reopened = parseProjects(raw)
  assert.equal(reopened.activeId, p.id)
  assert.deepEqual(createCreationBrief(reopened.projects[0]), createCreationBrief(p))
})
test('notes remain separate from the generated prompt', () => {
  const p = { ...full(), notes: 'PRIVATE NOTE SENTINEL' }; const brief = createCreationBrief(p)
  assert.equal(brief.notes, p.notes); assert.ok(!brief.prompt.includes(p.notes))
})
test('serialization strips unknown fields and write failure reaches caller', () => {
  const p = { ...full(), disposable: 'view output' }
  assert.ok(!JSON.stringify(parseProjects(envelope([p]))).includes('disposable'))
  assert.throws(() => writeProjects({ setItem() { throw new Error('denied') } }, [p], p.id), /denied/)
})
test('explicit replacement leaves earlier project and unrelated ingredients unchanged', () => {
  const p = full(); const earlier = structuredClone(p)
  const next = attachIngredient(p, 'genre', { ...sources().genre, genres: [{ genreId: 'ambient', weight: 50 }, { genreId: 'hardwave', weight: 50 }] }, '2026-10-04T13:00:00.000Z')
  assert.deepEqual(p, earlier)
  assert.deepEqual(next.vocal, p.vocal); assert.deepEqual(next.mood, p.mood)
  assert.equal(next.id, p.id); assert.equal(next.createdAt, p.createdAt)
  assert.notEqual(next.updatedAt, p.updatedAt)
  assert.notEqual(createCreationBrief(next).genreFoundation, createCreationBrief(p).genreFoundation)
})
test('unknown active project falls back safely without discarding valid projects', () => {
  const p = project()
  const parsed = parseProjects(JSON.stringify({ schemaVersion: 1, projects: [p], activeId: 'missing' }))
  assert.equal(parsed.activeId, null); assert.deepEqual(parsed.projects, [p])
})
