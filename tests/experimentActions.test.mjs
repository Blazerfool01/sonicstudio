import test from 'node:test'
import assert from 'node:assert/strict'
import { snapshotExperiment, duplicateExperiment, historicalDraft, createCompareSeed, validCompareSeed, shortcutAction } from '../src/lib/experimentActions.ts'
import { createProject, attachIngredient, editProjectTrack, parseProjects } from '../src/lib/studioProject.ts'
import { createComparison, addComparison } from '../src/lib/trackComparison.ts'
import { defaultVocalSelections } from '../src/lib/voiceDna.ts'
const originalTime = '2026-10-05T10:00:00.000Z'
const laterTime = '2026-10-05T11:00:00.000Z'
function project() {
  let p = createProject('Historical studies', 'project-1', originalTime)
  p = attachIngredient(p, 'genre', { label: 'Original recipe', sourceId: 'recipe-1', genres: [{ genreId: 'dark-rnb', weight: 60 }, { genreId: 'hardwave', weight: 40 }] }, originalTime)
  p = attachIngredient(p, 'vocal', { label: 'Original singer', sourceId: 'singer-1', selections: { ...defaultVocalSelections, power: 17 }, identityDescription: 'Quiet original identity' }, originalTime)
  return attachIngredient(p, 'mood', { label: 'Original mood', sourceId: 'mood-1', selections: [{ moodId: 'serene', weight: 73 }] }, originalTime)
}
const snapshot = () => snapshotExperiment(project(), 'Study one', 'v1', 'track-1', originalTime)
test('explicit snapshot uses existing ProjectTrack and copies complete current identity', () => {
  const source = project(); const before = structuredClone(source)
  const result = snapshotExperiment(source, 'Study one', 'v1', 'track-1', laterTime)
  assert.deepEqual(source, before)
  assert.equal(result.tracks.length, 1)
  assert.equal(result.tracks[0].version, 'v1')
  assert.equal(result.tracks[0].file, null)
  assert.deepEqual(result.tracks[0].creationSnapshot, { genre: source.genre, vocal: source.vocal, mood: source.mood })
  assert.equal(result.tracks[0].createdAt, laterTime)
})
test('later project edits never change captured identity and captured objects are separate', () => {
  const p = snapshot(); const historical = structuredClone(p.tracks[0].creationSnapshot)
  p.genre.genres[0].weight = 80; p.vocal.selections.power = 80; p.mood.selections[0].weight = 80
  assert.deepEqual(p.tracks[0].creationSnapshot, historical)
})
test('snapshot requires deliberate identifying metadata', () => {
  assert.throws(() => snapshotExperiment(project(), ' ', '', 'track-1', laterTime))
  assert.throws(() => snapshotExperiment(project(), 'Study', 'v'.repeat(161), 'track-1', laterTime))
})
function linkedProject() {
  let p = snapshotExperiment(snapshot(), 'Study two', '', 'track-2', laterTime)
  p = editProjectTrack(p, 'track-1', { notes: 'Saved source notes', file: { filename: 'one.wav', type: 'audio/wav', size: 1234 } }, originalTime)
  p = addComparison(p, createComparison(p, 'track-1', 'track-2', 'comparison-1', originalTime))
  return { ...p, timeline: [{ schemaVersion: 1, id: 'clip-1', trackId: 'track-1', start: 0, sourceIn: 0, sourceOut: 8, muted: false, solo: false }] }
}
test('duplicate receives new identity and timestamps, preserving exact historical values', () => {
  const p = linkedProject(); const before = structuredClone(p)
  p.genre.genres[0].weight = 80
  const result = duplicateExperiment(p, 'track-1', 'New study', 'alternate', false, 'copy-1', laterTime)
  const copy = result.tracks[2]
  assert.equal(copy.id, 'copy-1'); assert.equal(copy.title, 'New study'); assert.equal(copy.version, 'alternate')
  assert.equal(copy.createdAt, laterTime); assert.equal(copy.updatedAt, laterTime)
  assert.deepEqual(copy.creationSnapshot, before.tracks[0].creationSnapshot)
  assert.notEqual(copy.creationSnapshot.genre, p.tracks[0].creationSnapshot.genre)
  assert.notEqual(copy.creationSnapshot.vocal.selections, p.tracks[0].creationSnapshot.vocal.selections)
})
test('duplicate removes audio metadata and does not copy notes by default', () => {
  const p = linkedProject(); const result = duplicateExperiment(p, 'track-1', 'Copy', '', false, 'copy-1', laterTime)
  assert.equal(result.tracks[2].file, null); assert.equal(result.tracks[2].notes, '')
  assert.equal(p.tracks[0].file.filename, 'one.wav'); assert.equal(p.tracks[0].notes, 'Saved source notes')
})
test('duplicate notes are copied only by explicit opt-in', () => {
  const result = duplicateExperiment(linkedProject(), 'track-1', 'Copy', '', true, 'copy-1', laterTime)
  assert.equal(result.tracks[2].notes, 'Saved source notes')
})
test('duplicate never creates comparison membership or timeline clips or mutates source', () => {
  const p = linkedProject(); const before = structuredClone(p)
  const result = duplicateExperiment(p, 'track-1', 'Copy', '', false, 'copy-1', laterTime)
  assert.deepEqual(p, before); assert.deepEqual(result.comparisons, before.comparisons); assert.deepEqual(result.timeline, before.timeline)
  result.tracks[2].creationSnapshot.mood.selections[0].weight = 1
  assert.equal(p.tracks[0].creationSnapshot.mood.selections[0].weight, 73)
})
test('duplicate rejects missing source and colliding identity', () => {
  assert.throws(() => duplicateExperiment(snapshot(), 'missing', 'Copy'))
  assert.throws(() => duplicateExperiment(snapshot(), 'track-1', 'Copy', '', false, 'track-1', laterTime))
})
test('Compare handoff seeds one existing project track without saving a comparison', () => {
  const p = snapshot(); const before = structuredClone(p); const seed = createCompareSeed(p, 'track-1', 'request-1')
  assert.deepEqual(seed, { requestId: 'request-1', projectId: 'project-1', trackAId: 'track-1' })
  assert.equal(validCompareSeed(p, seed), true); assert.deepEqual(p, before)
  assert.throws(() => createComparison(p, seed.trackAId, seed.trackAId))
})
test('Compare seed remains session-only through canonical persistence parsing', () => {
  const p = snapshot(); const seed = createCompareSeed(p, 'track-1', 'request-1')
  const parsed = parseProjects(JSON.stringify({ schemaVersion: 1, projects: [{ ...p, compareSeed: seed }], activeId: p.id })).projects[0]
  assert.equal(parsed.compareSeed, undefined); assert.deepEqual(parsed.comparisons, [])
})
test('Compare seed cannot cross projects or reference removed records', () => {
  const p = snapshot(); const seed = createCompareSeed(p, 'track-1', 'request-1')
  assert.equal(validCompareSeed({ ...p, id: 'other' }, seed), false)
  assert.equal(validCompareSeed({ ...p, tracks: [] }, seed), false)
  assert.throws(() => createCompareSeed(p, 'missing'))
})
for (const kind of ['genre', 'vocal', 'mood']) {
  test(`${kind} historical reopen reads copied creationSnapshot, preserving source ID only as provenance`, () => {
    const p = snapshot(); const before = structuredClone(p)
    p[kind] = null // Today's source/project cannot replace historical values.
    const request = historicalDraft(p, 'track-1', kind, 'request-1')
    assert.deepEqual(request.captured, before.tracks[0].creationSnapshot[kind])
    assert.equal(request.kind, kind); assert.equal(request.trackId, 'track-1')
    request.captured.label = 'Edited draft'
    assert.deepEqual(p.tracks[0], before.tracks[0]); assert.equal(p[kind], null)
  })
  test(`${kind} historical reopen truthfully rejects a missing captured ingredient`, () => {
    const p = snapshotExperiment(createProject('Empty', 'empty', originalTime), 'Blank study', '', 'blank', originalTime)
    assert.throws(() => historicalDraft(p, 'blank', kind), new RegExp(`No ${kind} settings were captured`))
  })
}
const event = changes => ({ key: 'S', altKey: true, shiftKey: true, ctrlKey: false, metaKey: false, target: null, ...changes })
test('shortcuts map only the two documented modified actions', () => {
  assert.equal(shortcutAction(event()), 'snapshot'); assert.equal(shortcutAction(event({ key: 'c' })), 'compare')
  for (const changes of [{ key: 'z' }, { altKey: false }, { shiftKey: false }, { ctrlKey: true }, { metaKey: true }, { repeat: true }, { defaultPrevented: true }, { isComposing: true }, { getModifierState: () => true }]) assert.equal(shortcutAction(event(changes)), null)
})
test('shortcuts ignore editable targets including ancestors and preserve typing', () => {
  for (const tag of ['input', 'textarea', 'select', '[contenteditable]', '[role="textbox"]']) {
    let selector; const target = { closest: query => { selector = query; return { tag } } }
    assert.equal(shortcutAction(event({ target })), null); assert.match(selector, /input, textarea, select/); assert.match(selector, /contenteditable/)
  }
  assert.equal(shortcutAction(event({ target: { closest: () => null } })), 'snapshot')
})
