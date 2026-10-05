import test from 'node:test'
import assert from 'node:assert/strict'
import { createMoodProjectSnapshot } from '../src/lib/moodProjectSnapshot.ts'
import { attachIngredient, createProject } from '../src/lib/studioProject.ts'

const selections = [{ moodId: 'serene', weight: 70 }, { moodId: 'dreamlike', weight: 30 }]

test('explicitly attaching a reopened mood preset preserves its source ID and source selections', () => {
  const snapshot = createMoodProjectSnapshot(selections, { id: 'preset-night', name: 'Night air' })
  assert.deepEqual(snapshot, { label: 'Night air', sourceId: 'preset-night', selections })
  const project = attachIngredient(createProject('Night drive', 'night'), 'mood', snapshot)
  assert.deepEqual(project.mood, snapshot)
  assert.equal(project.genre, null)
  assert.equal(project.vocal, null)
})

test('explicitly attaching live mood selections has no saved-preset source ID', () => {
  const snapshot = createMoodProjectSnapshot(selections, null)
  assert.equal(snapshot.label, 'Serene 70 / Dreamlike 30')
  assert.equal(snapshot.sourceId, null)
  assert.deepEqual(snapshot.selections, selections)
  assert.notStrictEqual(snapshot.selections, selections)
  assert.notStrictEqual(snapshot.selections[0], selections[0])
})
