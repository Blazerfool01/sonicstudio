import test from 'node:test'
import assert from 'node:assert/strict'
import {
  addProjectTrack, attachIngredient, createProject, createProjectTrack,
} from '../src/lib/studioProject.ts'
import { defaultVocalSelections } from '../src/lib/voiceDna.ts'
import { deriveContextRailProjection } from '../src/lib/contextRailProjection.ts'

const now = '2026-10-05T10:00:00.000Z'

function addCompleteIdentity(project, { genreSourceId = 'mix-1', moodSourceId = null, moodId = 'serene', vocalSourceId = 'persona-1' } = {}) {
  let result = attachIngredient(project, 'genre', {
    label: 'Night blend', sourceId: genreSourceId,
    genres: [{ genreId: 'dark-rnb', weight: 60 }, { genreId: 'hardwave', weight: 40 }],
  }, now)
  result = attachIngredient(result, 'vocal', {
    label: 'Warm lead', sourceId: vocalSourceId, identityDescription: 'A close warm lead',
    selections: { ...defaultVocalSelections, texture: 'husky', warmth: 76 },
  }, now)
  result = attachIngredient(result, 'mood', {
    label: moodId === 'serene' ? 'Night air' : 'High voltage', sourceId: moodSourceId,
    selections: [{ moodId, weight: 80 }],
  }, now)
  return result
}

function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value)
    for (const child of Object.values(value)) deepFreeze(child)
  }
  return value
}

test('empty context has no project, selection, or identity', () => {
  assert.deepEqual(deriveContextRailProjection(null, null), {
    mode: 'empty', project: null, selectedTrack: null, identity: null,
  })
})

test('current project reports concise metadata and its current identity', () => {
  const project = addCompleteIdentity(createProject('Current project', 'current-project', now))
  const result = deriveContextRailProjection(project, null)

  assert.equal(result.mode, 'current')
  assert.equal(result.project.name, 'Current project')
  assert.equal(result.project.trackCount, 0)
  assert.equal(result.project.comparisonCount, 0)
  assert.equal(result.project.ingredientCount, 3)
  assert.equal(result.identity.label, 'Current project identity')
  assert.deepEqual(result.identity.ingredients.map(item => item.present), [true, true, true])
})

test('missing Genre, Vocal, and Mood remain absent instead of receiving defaults', () => {
  const project = createProject('Open identity', 'partial-project', now)
  const result = deriveContextRailProjection(project, null)

  assert.equal(result.project.ingredientCount, 0)
  assert.deepEqual(result.identity.ingredients.map(item => item.present), [false, false, false])
  assert.deepEqual(result.identity.guidance, {
    genre: { present: false, lines: [] },
    vocal: { present: false, lines: [] },
    mood: { present: false, lines: [] },
  })
})

test('source IDs distinguish captured saved sources from live or source-less snapshots', () => {
  const project = addCompleteIdentity(createProject('Sources', 'source-project', now), { moodSourceId: null })
  const result = deriveContextRailProjection(project, null)

  assert.deepEqual(result.project.ingredients.map(({ origin, sourceId }) => [origin, sourceId]), [
    ['saved', 'mix-1'], ['saved', 'persona-1'], ['live', null],
  ])
  assert.match(result.project.ingredients[2].originLabel, /no saved source ID/i)
})

test('selected historical track uses its captured identity while project overview stays current', () => {
  const original = addCompleteIdentity(createProject('Evolving project', 'evolving-project', now), { moodId: 'serene' })
  const historical = {
    ...createProjectTrack(original, 'First take', 'track-1', now),
    notes: 'Track-only observation', source: 'generated', sourceDetail: 'Existing source label',
  }
  const withTrack = addProjectTrack(original, historical)
  const current = addCompleteIdentity(withTrack, { moodId: 'aggressive', moodSourceId: 'mood-2' })
  current.notes = 'Project-only note'

  const result = deriveContextRailProjection(current, { projectId: current.id, trackId: historical.id })

  assert.equal(result.mode, 'historical')
  assert.equal(result.project.name, 'Evolving project')
  assert.equal(result.project.ingredients[2].label, 'High voltage')
  assert.equal(result.identity.label, 'Historical creation identity')
  assert.equal(result.identity.ingredients[2].label, 'Night air')
  assert.equal(result.selectedTrack.title, 'First take')
  assert.equal(result.selectedTrack.source, 'generated')
  assert.equal(result.selectedTrack.sourceDetail, 'Existing source label')
  assert.equal(result.project.notes, 'Project-only note')
  assert.equal(result.selectedTrack.notes, 'Track-only observation')
})

test('historical guidance is derived from the selected snapshot, not today’s project', () => {
  const original = addCompleteIdentity(createProject('Guidance history', 'guidance-project', now), { moodId: 'serene' })
  const track = createProjectTrack(original, 'Captured take', 'guidance-track', now)
  const current = addCompleteIdentity(addProjectTrack(original, track), { moodId: 'aggressive' })
  const expectedHistorical = deriveContextRailProjection({
    ...current,
    genre: track.creationSnapshot.genre,
    vocal: track.creationSnapshot.vocal,
    mood: track.creationSnapshot.mood,
  }, null)
  const currentGuidance = deriveContextRailProjection(current, null).identity.guidance
  const selectedGuidance = deriveContextRailProjection(current, {
    projectId: current.id, trackId: track.id,
  }).identity.guidance

  assert.deepEqual(selectedGuidance, expectedHistorical.identity.guidance)
  assert.notDeepEqual(selectedGuidance.mood, currentGuidance.mood)
  assert.match(selectedGuidance.vocal.lines[1], /lead/i)
  assert.ok(selectedGuidance.genre.lines.length > 0)
})

test('one incomplete historical snapshot reports missing ingredients without borrowing current ones', () => {
  const base = createProject('Partial history', 'partial-history', now)
  const partial = attachIngredient(base, 'genre', {
    label: 'Early blend', sourceId: null,
    genres: [{ genreId: 'dark-rnb', weight: 60 }, { genreId: 'hardwave', weight: 40 }],
  }, now)
  const track = createProjectTrack(partial, 'Early sketch', 'early-sketch', now)
  const current = addCompleteIdentity(addProjectTrack(partial, track), { moodId: 'aggressive' })
  const result = deriveContextRailProjection(current, { projectId: current.id, trackId: track.id })

  assert.deepEqual(result.identity.ingredients.map(item => item.present), [true, false, false])
  assert.equal(result.identity.guidance.vocal.present, false)
  assert.equal(result.identity.guidance.mood.present, false)
  assert.equal(result.identity.ingredients[1].label, 'Not attached')
  assert.equal(result.project.ingredients[2].label, 'High voltage')
})

test('invalid or cross-project selection falls back to current project context', () => {
  const project = addCompleteIdentity(createProject('Selection fallback', 'selection-project', now))
  const missing = deriveContextRailProjection(project, { projectId: project.id, trackId: 'deleted-track' })
  const otherProject = deriveContextRailProjection(project, { projectId: 'other-project', trackId: 'any-track' })

  for (const result of [missing, otherProject]) {
    assert.equal(result.mode, 'current')
    assert.equal(result.selectedTrack, null)
    assert.equal(result.identity.label, 'Current project identity')
  }
})

test('projection keeps project notes and selected-track notes separate from derived guidance', () => {
  const project = addCompleteIdentity(createProject('Separate notes', 'notes-project', now))
  project.notes = 'Planning note: project level'
  const track = { ...createProjectTrack(project, 'Notes take', 'notes-track', now), notes: 'Observation: track level' }
  const added = addProjectTrack(project, track)
  const result = deriveContextRailProjection(added, { projectId: added.id, trackId: track.id })

  assert.equal(result.project.notes, 'Planning note: project level')
  assert.equal(result.selectedTrack.notes, 'Observation: track level')
  assert.equal(JSON.stringify(result.identity.guidance).includes('Planning note'), false)
  assert.equal(JSON.stringify(result.identity.guidance).includes('Observation'), false)
})

test('projection derives without mutating any project or track source record', () => {
  let project = addCompleteIdentity(createProject('Immutable projection', 'immutable-project', now))
  project = addProjectTrack(project, createProjectTrack(project, 'Frozen take', 'frozen-track', now))
  const before = JSON.stringify(project)
  deepFreeze(project)
  const selection = deepFreeze({ projectId: project.id, trackId: 'frozen-track' })

  const result = deriveContextRailProjection(project, selection)

  assert.equal(result.mode, 'historical')
  assert.equal(JSON.stringify(project), before)
})
