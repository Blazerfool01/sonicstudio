import { useState } from 'react'
import type { ReactNode } from 'react'
import { createProject } from './lib/studioProject.ts'
import type { StudioProject } from './lib/studioProject.ts'
import { createCreationBrief } from './lib/creationBrief.ts'
import './studio.css'
import useStudioProjects from './useStudioProjects.ts'
import type { ProjectAudioActions } from './ProjectTracks.tsx'
import { ingredientDescription } from './lib/projectIdentity.ts'
import { IngredientVisual } from './StudioOverview.tsx'

function ProjectName({ project, onRename }: { project: StudioProject; onRename: (name: string) => void }) {
  const [draft, setDraft] = useState(project.name)
  return <form className="studio-controls" onSubmit={e => { e.preventDefault(); if (draft.trim()) onRename(draft.trim()) }}><label>PROJECT NAME<input aria-label="Project name" value={draft} maxLength={80} onChange={e => setDraft(e.target.value)}/></label><button disabled={!draft.trim() || draft.trim() === project.name}>Rename project</button></form>
}

export default function StudioComposer({ studio, onNavigate, audio, showIdentity, listeningEntry }: { listeningEntry: ReactNode; showIdentity: boolean; audio: ProjectAudioActions; studio: ReturnType<typeof useStudioProjects>; onNavigate: (view: 'genre' | 'vocal' | 'mood') => void }) {
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
    <details className="project-management" open={!active}><summary>{active ? 'Project controls · create, open, rename or delete' : 'Project controls'}</summary>
    <div className="studio-heading"><div><span className="eyebrow">PROJECT WORKSPACE</span><h2 id="studio-title">{active ? 'Project controls.' : 'Start a project'}</h2><p>{active ? 'Capture ingredients explicitly. Your tools stay independent.' : 'Name a project to capture your sound. Each ingredient is optional.'}</p></div><span>{state.projects.length} LOCAL PROJECTS</span></div>
    <form className="studio-controls" onSubmit={e => { e.preventDefault(); const p = createProject(name); save([p, ...state.projects], p.id, 'Empty project created.'); setName('') }}>
      <label>NEW PROJECT NAME<input aria-label="New project name" maxLength={80} value={name} onChange={e => setName(e.target.value)} placeholder="Name your project"/></label><button disabled={!name.trim()}>Create project</button>
    </form>
    {active && <>
      <ProjectName key={active.id + active.name} project={active} onRename={name => update({ ...active, name, updatedAt: new Date().toISOString() })}/><button onClick={() => setDeleteId(active.id)}>Delete project</button>
      {deleteId === active.id && <div className="destructive-confirmation" role="group" aria-label="Confirm project deletion"><p>Delete “{active.name}” from this device? Tool presets and personas will remain.</p><button className="action-destructive" onClick={() => { active.tracks.forEach(t => audio.release(t.id)); save(state.projects.filter(p => p.id !== active.id), null, 'Project deleted.'); setDeleteId(null) }}>Confirm delete project</button><button onClick={() => setDeleteId(null)}>Cancel deletion</button></div>}
    </>}</details>
    {active && <><div hidden={!showIdentity} className="studio-identity-overview"><h2>Current project identity</h2><div className="studio-ingredients studio-module-grid">{(['genre', 'vocal', 'mood'] as const).map(kind => <article key={kind} className={`studio-module studio-module-${kind}`} data-source-state={active[kind] ? "captured" : "missing"}><header><h3>{kind === 'genre' ? 'Genre Mixer' : kind === 'vocal' ? 'Vocal Persona' : 'Mood Mapper'}</h3><button onClick={() => onNavigate(kind)}>Open {kind} tool</button></header><strong>{active[kind]?.label ?? 'Not attached'}</strong><IngredientVisual project={active} kind={kind}/>{active[kind] && <p>{ingredientDescription(active, kind)}</p>}<details className="studio-module-provenance"><summary>{active[kind] ? 'Captured source' : 'Attach an ingredient'}</summary><p>{active[kind] ? `Captured from ${active[kind]!.sourceId ? 'saved source' : 'live tool'}. Future tool edits stay separate.` : `Open ${kind === 'vocal' ? 'Vocal Persona' : kind === 'genre' ? 'Genre Mixer' : 'Mood Mapper'} and use its project action.`}</p>{active[kind]?.sourceId && <small>Source ID: {active[kind]!.sourceId}</small>}{active[kind] && <button onClick={() => update({ ...active, [kind]: null, updatedAt: new Date().toISOString() })}>Remove {kind}</button>}</details></article>)}</div>
      {listeningEntry}
      <details className="studio-overview-notes"><summary>Project notes</summary><label className="studio-notes">PROJECT NOTES · SEPARATE FROM GENERATED GUIDANCE<textarea aria-label="Project notes" rows={3} maxLength={4000} value={active.notes} onChange={e => update({ ...active, notes: e.target.value, updatedAt: new Date().toISOString() })}/></label></details>
      <p data-testid="identity-summary">{brief!.identitySummary}</p><details className="studio-brief"><summary>Creation Brief</summary><div className="studio-ingredients">{[['Genre foundation', brief!.genreFoundation], ['Vocal identity', brief!.vocalIdentity], ['Mood / production direction', brief!.moodDirection]].map(([title, text]) => <article key={title}><h3>{title}</h3><pre>{text}</pre></article>)}</div><h3>Combined generator prompt</h3><button onClick={copy}>Copy combined prompt</button><pre data-testid="combined-prompt">{brief!.prompt}</pre><p role="status">{copyMessage}</p></details>
    </div></>}
    {!active && <p>Open a saved project using the project selector above.</p>}
    <p role="status">{message}</p>
  </section>
}
