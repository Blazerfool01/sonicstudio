import test from 'node:test'
import assert from 'node:assert/strict'
import { createStudioStarter } from '../src/lib/studioStarter.ts'
import { parseProjects } from '../src/lib/studioProject.ts'
import { createCreationBrief } from '../src/lib/creationBrief.ts'

test('Midnight Echoes starter survives canonical storage with identity and referenced clips', () => {
  const project = createStudioStarter()
  const restored = parseProjects(JSON.stringify({ schemaVersion: 1, projects: [project], activeId: project.id }))
  assert.deepEqual(restored, { projects: [project], activeId: project.id })
  assert.equal(project.tracks.length, 4)
  assert.equal(project.timeline.length, 8)
  assert.ok(project.timeline.every(clip => project.tracks.some(track => track.id === clip.trackId)))
  assert.ok(project.tracks.every(track => track.file === null))
  assert.match(createCreationBrief(project).prompt, /Synthwave/)
})

test('starter records and captured histories are independently editable', () => {
  const first = createStudioStarter()
  const second = createStudioStarter()
  first.vocal.selections.warmth = 0
  first.mood.selections[0].weight = 1
  assert.equal(second.vocal.selections.warmth, 78)
  assert.equal(first.tracks[0].creationSnapshot.vocal.selections.warmth, 78)
  assert.equal(first.tracks[0].creationSnapshot.mood.selections[0].weight, 40)
})
