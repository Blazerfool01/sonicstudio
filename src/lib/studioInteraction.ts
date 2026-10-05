import type { ProjectTrack, StudioProject } from './studioProject.ts'

/** Generic Studio selection is session UI state, scoped to one active project. */
export type ProjectTrackSelection = { projectId: string; trackId: string }

export function selectProjectTrack(project: StudioProject | null, trackId: string): ProjectTrackSelection | null {
  if (!project?.tracks.some(track => track.id === trackId)) return null
  return { projectId: project.id, trackId }
}

export function reconcileProjectTrackSelection(project: StudioProject | null, selection: ProjectTrackSelection | null): ProjectTrackSelection | null {
  if (!project || !selection || selection.projectId !== project.id || !project.tracks.some(track => track.id === selection.trackId)) return null
  return selection
}

export function selectedProjectTrack(project: StudioProject | null, selection: ProjectTrackSelection | null): ProjectTrack | null {
  const valid = reconcileProjectTrackSelection(project, selection)
  return project?.tracks.find(track => track.id === valid?.trackId) ?? null
}

/** Existing editors use explicit local drafts; these labels never imply that an immediately persisted project is dirty. */
export function draftStateLabel(isDirty: boolean, savedLabel = 'Saved'): string {
  return isDirty ? 'Unsaved changes' : savedLabel
}

export type EditableTarget = { tagName?: string; isContentEditable?: boolean; closest?: (selector: string) => unknown }

/** Reserve keyboard interaction while focus is in a text-editing context. */
export function isEditableKeyboardTarget(target: EditableTarget | null | undefined): boolean {
  if (!target) return false
  const tag = target.tagName?.toUpperCase()
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable === true || Boolean(target.closest?.('[contenteditable="true"]'))
}

/** Phase A declares no global Studio mutations undoable. Native field undo remains browser-owned. */
export const STUDIO_UNDOABLE_OPERATIONS: readonly string[] = []
export function isStudioOperationUndoable(operation: string): boolean {
  return STUDIO_UNDOABLE_OPERATIONS.includes(operation)
}
