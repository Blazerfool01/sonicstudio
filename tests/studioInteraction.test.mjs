import test from 'node:test'
import assert from 'node:assert/strict'
import { addProjectTrack, createProject, createProjectTrack } from '../src/lib/studioProject.ts'
import { draftStateLabel, isEditableKeyboardTarget, isStudioOperationUndoable, reconcileProjectTrackSelection, selectProjectTrack, selectedProjectTrack, STUDIO_UNDOABLE_OPERATIONS } from '../src/lib/studioInteraction.ts'

function projectWithTracks(name, titles) {
  let project = createProject(name)
  for (const title of titles) project = addProjectTrack(project, createProjectTrack(project, title))
  return project
}

test('project-track selection is explicit session state and resolves only in its owning active project', () => {
  const project = projectWithTracks('Alpha', ['A', 'B'])
  const selected = selectProjectTrack(project, project.tracks[0].id)
  assert.deepEqual(selected, { projectId: project.id, trackId: project.tracks[0].id })
  assert.equal(selectedProjectTrack(project, selected), project.tracks[0])
  assert.equal(selectedProjectTrack(project, null), null)
  assert.equal(selectProjectTrack(project, 'missing'), null)

  // Even an accidental reused ID in another project cannot carry selection across a project switch.
  const other = { ...projectWithTracks('Beta', []), tracks: [project.tracks[0]] }
  assert.equal(reconcileProjectTrackSelection(other, selected), null)
  assert.equal(selectedProjectTrack(other, selected), null)
})

test('deleting or invalidating a selected project track clears selection safely', () => {
  const project = projectWithTracks('Release', ['Keep', 'Remove'])
  const selection = selectProjectTrack(project, project.tracks[1].id)
  const afterDelete = { ...project, tracks: [project.tracks[0]] }
  assert.equal(reconcileProjectTrackSelection(afterDelete, selection), null)
  assert.equal(reconcileProjectTrackSelection(project, { projectId: project.id, trackId: 'missing' }), null)
})

test('draft labels distinguish local edits from their saved source without a global dirty flag', () => {
  assert.equal(draftStateLabel(true), 'Unsaved changes')
  assert.equal(draftStateLabel(false, 'Saved comparison'), 'Saved comparison')
})

test('keyboard typing contexts are excluded while ordinary controls remain eligible', () => {
  for (const tagName of ['input', 'TEXTAREA', 'Select']) assert.equal(isEditableKeyboardTarget({ tagName }), true)
  assert.equal(isEditableKeyboardTarget({ tagName: 'div', isContentEditable: true }), true)
  assert.equal(isEditableKeyboardTarget({ tagName: 'span', closest: selector => selector === '[contenteditable="true"]' }), true)
  assert.equal(isEditableKeyboardTarget({ tagName: 'button' }), false)
  assert.equal(isEditableKeyboardTarget(null), false)
})

test('Phase A has no global Studio undoable operations', () => {
  assert.deepEqual(STUDIO_UNDOABLE_OPERATIONS, [])
  assert.equal(isStudioOperationUndoable('project-track-selection'), false)
  assert.equal(isStudioOperationUndoable('project-ingredient-edit'), false)
})
