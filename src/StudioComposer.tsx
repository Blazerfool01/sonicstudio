import { useState } from 'react'
import { readBrowserStorage } from './lib/browserStorage.ts'
import { attachIngredient, createProject, parseProjects, PROJECT_STORAGE_KEY, writeProjects } from './lib/studioProject.ts'
import type { StudioProject } from './lib/studioProject.ts'
import { createCreationBrief } from './lib/creationBrief.ts'
import './studio.css'
import ProjectCompare from './ProjectCompare.tsx'
import ProjectTracks from './ProjectTracks.tsx'
import type { ProjectAudioActions } from './ProjectTracks.tsx'
import { ingredientDescription } from './lib/projectIdentity.ts'

function ProjectName({ project, onRename }: { project: StudioProject; onRename: (name: string) => void }) {
  const [draft, setDraft] = useState(project.name)
  return <form className="studio-controls" onSubmit={e => { e.preventDefault(); if (draft.trim()) onRename(draft.trim()) }}><label>PROJECT NAME<input aria-label="Project name" value={draft} maxLength={80} onChange={e => setDraft(e.target.value)}/></label><button disabled={!draft.trim() || draft.trim() === project.name}>Rename project</button></form>
}

export function useStudioProjects() {
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
export default function StudioComposer({ studio, onNavigate, audio }: { audio: ProjectAudioActions; studio: ReturnType<typeof useStudioProjects>; onNavigate: (view: 'genre' | 'vocal' | 'mood') => void }) {
  const [name, setName] = useState('')
  const [copyMessage, setCopyMessage] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { state, active, message, save, update } = studio
  const brief = active ? createCreationBrief(active) : null
  async function copy() {
    try { await navigator.clipboard.writeText(brief!.prompt); setCopyMessage('Combined prompt copied.') }
    catch { setCopyMessage('Clipboard unavailable. Select the prompt below to copy manually.') }
  }
  return <section className="studio-composer" aria-labelledby="studio-title">
    <div className="studio-heading"><div><span className="eyebrow">V2.0 / STAGE 3 · A/B COMPARE</span><h2 id="studio-title">Your musical identity.</h2><p>Capture ingredients explicitly. Your tools stay independent.</p></div><span>{state.projects.length} LOCAL PROJECTS</span></div>
    <form className="studio-controls" onSubmit={e => { e.preventDefault(); const p = createProject(name); save([p, ...state.projects], p.id, 'Empty project created.'); setName('') }}>
      <label>NEW PROJECT NAME<input aria-label="New project name" maxLength={80} value={name} onChange={e => setName(e.target.value)} placeholder="Name your project"/></label><button disabled={!name.trim()}>Create project</button>
      <label>OPEN PROJECT<select aria-label="Open project" value={state.activeId ?? ''} onChange={e => save(state.projects, e.target.value || null, 'Project opened.')}><option value="">No active project</option>{state.projects.map(p => <option value={p.id} key={p.id}>{p.name}</option>)}</select></label>
    </form>
    {active && <>
      <ProjectName key={active.id + active.name} project={active} onRename={name => update({ ...active, name, updatedAt: new Date().toISOString() })}/><button onClick={() => setDeleteId(active.id)}>Delete project</button>
      {deleteId === active.id && <div role="group" aria-label="Confirm project deletion"><p>Delete “{active.name}” from this device? Tool presets and personas will remain.</p><button onClick={() => { active.tracks.forEach(t => audio.release(t.id)); save(state.projects.filter(p => p.id !== active.id), null, 'Project deleted.'); setDeleteId(null) }}>Confirm delete project</button><button onClick={() => setDeleteId(null)}>Cancel deletion</button></div>}
      <h3>Current project identity</h3><div className="studio-ingredients">{(['genre', 'vocal', 'mood'] as const).map(kind => <article key={kind}><h3>{kind}</h3><strong>{active[kind]?.label ?? 'Not attached'}</strong>{active[kind] && <p>{ingredientDescription(active, kind)}</p>}<p>{active[kind] ? `Captured from ${active[kind]!.sourceId ? 'saved source' : 'live tool'}. Future tool edits stay separate.` : `Open ${kind === 'vocal' ? 'Vocal Persona' : kind === 'genre' ? 'Genre Mixer' : 'Mood Mapper'} and use its project action.`}</p>{active[kind]?.sourceId && <small>Source ID: {active[kind]!.sourceId}</small>}<button onClick={() => onNavigate(kind)}>Open {kind} tool</button>{active[kind] && <button onClick={() => update({ ...active, [kind]: null, updatedAt: new Date().toISOString() })}>Remove {kind}</button>}</article>)}</div>
      <label className="studio-notes">PROJECT NOTES · SEPARATE FROM GENERATED GUIDANCE<textarea aria-label="Project notes" rows={3} maxLength={4000} value={active.notes} onChange={e => update({ ...active, notes: e.target.value, updatedAt: new Date().toISOString() })}/></label>
      <ProjectTracks key={`tracks-${active.id}`} project={active} update={update} audio={audio}/>
      <ProjectCompare key={`compare-${active.id}`} project={active} update={update} audio={audio}/>
      <p data-testid="identity-summary">{brief!.identitySummary}</p><details className="studio-brief"><summary>Creation Brief</summary><div className="studio-ingredients">{[['Genre foundation', brief!.genreFoundation], ['Vocal identity', brief!.vocalIdentity], ['Mood / production direction', brief!.moodDirection]].map(([title, text]) => <article key={title}><h3>{title}</h3><pre>{text}</pre></article>)}</div><h3>Combined generator prompt</h3><button onClick={copy}>Copy combined prompt</button><pre data-testid="combined-prompt">{brief!.prompt}</pre><p role="status">{copyMessage}</p></details>
    </>}
    {!active && <p>Create an empty project or open a saved one. Each ingredient is optional.</p>}
    <p role="status">{message}</p>
  </section>
}
