import { useState } from 'react'
import { readBrowserStorage } from './lib/browserStorage.ts'
import { attachIngredient, parseProjects, PROJECT_STORAGE_KEY, writeProjects } from './lib/studioProject.ts'
import type { StudioProject } from './lib/studioProject.ts'

export default function useStudioProjects() {
  const [state, setState] = useState(() => readBrowserStorage(s => parseProjects(s.getItem(PROJECT_STORAGE_KEY)), { projects: [] as StudioProject[], activeId: null as string | null }))
  const [message, setMessage] = useState('')
  const active = state.projects.find(p => p.id === state.activeId) ?? null
  function save(projects: StudioProject[], activeId: string | null, success: string) {
    setState({ projects, activeId })
    try { writeProjects(localStorage, projects, activeId); setMessage(success) }
    catch { setMessage('Local storage is unavailable. Changes remain in this session only; they will be lost on reload.') }
  }
  function update(project: StudioProject) { save(state.projects.map(p => p.id === project.id ? project : p), project.id, 'Project saved locally.') }
  function attach<K extends 'genre' | 'vocal' | 'mood'>(kind: K, value: NonNullable<StudioProject[K]>) {
    if (!active) { setMessage('Create or open a project first.'); return }
    update(attachIngredient(active, kind, value))
  }
  return { state, active, message, save, update, attach }
}
