import test from 'node:test'
import assert from 'node:assert/strict'
import { createProject, attachIngredient, createProjectTrack, addProjectTrack, editProjectTrack } from '../src/lib/studioProject.ts'
import { createTimelineClip } from '../src/lib/studioTimeline.ts'
import { createComparison } from '../src/lib/trackComparison.ts'
import { defaultVocalSelections } from '../src/lib/voiceDna.ts'
import { createCreationBrief } from '../src/lib/creationBrief.ts'
import { validateProjectExport, createProjectExport, projectExportPackage, exportFilename, copyExport, downloadExport } from '../src/lib/projectExport.ts'

const now = '2026-10-05T12:00:00Z'
const empty = () => createProject('Export study', 'project-export', now)
const partial = () => attachIngredient(empty(), 'genre', { label: 'Foundation', sourceId: 'mix-source', genres: [{ genreId: 'dark-rnb', weight: 60 }, { genreId: 'hardwave', weight: 40 }] }, now)
const full = () => {
  let p = partial()
  p = attachIngredient(p, 'vocal', { label: 'Singer', sourceId: 'persona', identityDescription: 'Captured voice', selections: { ...defaultVocalSelections } }, now)
  return attachIngredient(p, 'mood', { label: 'Serene', sourceId: null, selections: [{ moodId: 'serene', weight: 100 }] }, now)
}
const savedWork = () => {
  let p = full()
  p = addProjectTrack(p, createProjectTrack(p, 'First result', 'track-a', now))
  p = editProjectTrack(p, 'track-a', { file: { filename: 'original.wav', type: 'audio/wav', size: 1200 }, notes: 'Track notes', version: 'v1' }, now)
  p = attachIngredient(p, 'mood', { label: 'Dark', sourceId: 'new-mood', selections: [{ moodId: 'brooding', weight: 100 }] }, now)
  p = addProjectTrack(p, createProjectTrack(p, 'Second result', 'track-b', now))
  const comparison = createComparison(p, 'track-a', 'track-b', 'comparison-a', now)
  comparison.observations.mix = 'Clearer low end'
  comparison.observations.regressed = 'Less intimate'
  comparison.conclusion = 'Prefer A for vocal character'
  comparison.preferredTrackId = 'track-a'
  return { ...p, notes: 'Project notes\nKeep this separate.', timeline: [createTimelineClip(['track-a', 'track-b'], 'track-a', { start: 8, sourceIn: 2, sourceOut: 12, solo: true }, 'clip-a')], comparisons: [comparison] }
}

test('G no project blocks both supported exports and exposes an actionable reason', () => {
  for (const format of ['brief', 'json']) {
    assert.equal(validateProjectExport(null, format).allowed, false)
    assert.throws(() => createProjectExport(null, format), /Create or open/)
  }
})
test('G empty project blocks brief but permits metadata with truthful warnings', () => {
  assert.equal(validateProjectExport(empty(), 'brief').allowed, false)
  const result = validateProjectExport(empty(), 'json')
  assert.equal(result.allowed, true)
  assert.ok(result.notices.some(n => n.code === 'no-ingredients' && n.level === 'warning'))
  assert.ok(result.notices.some(n => n.code === 'no-results'))
  assert.ok(result.notices.some(n => n.code === 'no-audio' && n.level === 'info'))
})
test('G partial creative identity is valid with brief warning and explicit open choices', () => {
  assert.equal(validateProjectExport(partial(), 'brief').allowed, true)
  assert.ok(validateProjectExport(partial(), 'brief').notices.some(n => n.code === 'partial-identity'))
  assert.ok(!validateProjectExport(partial(), 'json').notices.some(n => n.code === 'partial-identity'))
  assert.match(createProjectExport(partial(), 'brief').content, /No vocal identity attached/)
})
test('G complete project has no partial warning; missing session audio never blocks', () => {
  assert.equal(validateProjectExport(savedWork(), 'brief').allowed, true)
  assert.equal(validateProjectExport(savedWork(), 'json').allowed, true)
  assert.ok(!validateProjectExport(savedWork(), 'brief').notices.some(n => n.level !== 'info'))
})
test('G text preserves existing deterministic musical prompt and labels notes separately', () => {
  const p = savedWork(), artifact = createProjectExport(p, 'brief')
  assert.ok(artifact.content.includes(createCreationBrief(p).prompt))
  assert.ok(artifact.content.endsWith(`PROJECT NOTES — SEPARATE FROM MUSICAL GUIDANCE\n${p.notes}\n`))
  assert.equal(artifact.content, createProjectExport(structuredClone(p), 'brief').content)
  assert.ok(!createCreationBrief(p).prompt.includes(p.notes))
})
test('G JSON has a separate versioned format, current identity and authoritative timestamps', () => {
  const p = savedWork(), result = JSON.parse(createProjectExport(p, 'json').content)
  assert.equal(result.format, 'sonic-studio.project-export')
  assert.equal(result.schemaVersion, 1)
  assert.equal(result.audioIncluded, false)
  assert.deepEqual(result.project.currentIdentity, { genre: p.genre, vocal: p.vocal, mood: p.mood })
  assert.equal(result.project.createdAt, p.createdAt)
  assert.equal(result.project.updatedAt, p.updatedAt)
  assert.equal(result.generatedAt, undefined)
  assert.equal(result.activeId, undefined)
})
test('G historical provenance remains captured rather than regenerated from current identity', () => {
  const p = savedWork(), result = projectExportPackage(p)
  assert.equal(result.project.currentIdentity.mood.label, 'Dark')
  assert.equal(result.project.tracks[0].creationSnapshot.mood.label, 'Serene')
  assert.deepEqual(result.project.tracks, p.tracks)
})
test('G saved Timeline, comparison observations and notes are exported without reconstruction', () => {
  const p = savedWork(), result = projectExportPackage(p).project
  assert.deepEqual(result.timeline, p.timeline)
  assert.deepEqual(result.comparisons, p.comparisons)
  assert.equal(result.notes, p.notes)
  assert.equal(result.tracks[0].notes, 'Track notes')
})
test('G field projection excludes runtime/audio/draft fields at every nested boundary', () => {
  const p = savedWork()
  const runtime = { objectUrl: 'blob:forbidden', sessionAudioId: 'audio-runtime', playhead: 14, playbackState: 'playing', analyser: [12], selectedTrackId: 'track-a', editorDraft: 'UNSAVED', fileObject: new Blob(['BYTES']) }
  Object.assign(p, runtime)
  for (const identity of [p, ...p.tracks.map(t => t.creationSnapshot)]) {
    for (const kind of ['genre', 'vocal', 'mood']) Object.assign(identity[kind], runtime)
    Object.assign(identity.genre.genres[0], runtime)
    Object.assign(identity.vocal.selections, runtime)
    Object.assign(identity.mood.selections[0], runtime)
  }
  Object.assign(p.tracks[0], runtime)
  Object.assign(p.tracks[0].file, runtime)
  Object.assign(p.timeline[0], runtime)
  Object.assign(p.comparisons[0], runtime)
  Object.assign(p.comparisons[0].observations, runtime)
  const json = createProjectExport(p, 'json').content
  for (const field of Object.keys(runtime)) assert.ok(!json.includes(`"${field}"`), field)
  assert.ok(!json.includes('blob:forbidden'))
  assert.ok(!json.includes('UNSAVED'))
  assert.deepEqual(JSON.parse(json).project.tracks[0].file, { filename: 'original.wav', type: 'audio/wav', size: 1200 })
})
test('G content is deterministic even if incoming object key insertion order differs', () => {
  const p = savedWork(), reordered = Object.fromEntries(Object.entries(p).reverse())
  assert.equal(createProjectExport(p, 'json').content, createProjectExport(reordered, 'json').content)
  assert.equal(createProjectExport(p, 'json').content, createProjectExport(structuredClone(p), 'json').content)
})
test('G neither validation nor artifact creation mutates deeply frozen project data', () => {
  const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value) } return value }
  const p = freeze(savedWork()), before = JSON.stringify(p)
  for (const format of ['brief', 'json']) { validateProjectExport(p, format); createProjectExport(p, format) }
  assert.equal(JSON.stringify(p), before)
})
test('G malformed or unsupported options fail cleanly without fallback', () => {
  for (const format of [undefined, null, {}, [], 'wav', { format: 'json' }]) {
    assert.ok(validateProjectExport(full(), format).notices.some(n => n.code === 'unsupported-format' && n.level === 'blocker'))
    assert.throws(() => createProjectExport(full(), format), /Choose Creation Brief/)
  }
})
test('G invalid saved track data is visibly blocked instead of silently discarded', () => {
  const p = savedWork(); p.tracks[0].source = 'unsupported'
  assert.equal(validateProjectExport(p, 'json').allowed, false)
  assert.throws(() => createProjectExport(p, 'json'), /could not be exported/)
})
test('G filenames remove paths/control characters and handle reserved or empty names', () => {
  assert.equal(exportFilename(' ../Bad:\\name?\u0000 ', 'brief'), '..-Bad--name---creation-brief.txt')
  assert.equal(exportFilename('CON', 'json'), 'SonicStudio-CON-project.json')
  assert.equal(exportFilename('...', 'json'), 'SonicStudio-project-project.json')
  assert.ok(exportFilename('a'.repeat(200), 'json').length < 100)
})
test('G clipboard errors propagate for a recoverable preview fallback and retry succeeds', async () => {
  const artifact = createProjectExport(full(), 'brief')
  await assert.rejects(copyExport(artifact, undefined), /Clipboard unavailable/)
  await assert.rejects(copyExport(artifact, { writeText: async () => { throw new Error('denied') } }), /denied/)
  let copied; await copyExport(artifact, { writeText: async content => { copied = content } })
  assert.equal(copied, artifact.content)
})
test('G denied download cleans temporary anchor and URL, preserving artifact for retry', async () => {
  const originalDocument = globalThis.document, create = URL.createObjectURL, revoke = URL.revokeObjectURL
  let removed = 0, revoked = 0
  try {
    globalThis.document = { createElement: () => ({ remove() { removed++ }, click() { throw new Error('denied') } }), body: { append() {} } }
    URL.createObjectURL = () => 'blob:test-export'; URL.revokeObjectURL = () => { revoked++ }
    assert.throws(() => downloadExport(createProjectExport(full(), 'json')), /denied/)
    assert.equal(removed, 1)
    await new Promise(resolve => setTimeout(resolve, 1100))
    assert.equal(revoked, 1)
  } finally { globalThis.document = originalDocument; URL.createObjectURL = create; URL.revokeObjectURL = revoke }
})
