import { useEffect, useRef, useState } from 'react'
import type { StudioProject } from './lib/studioProject.ts'
import { snapshotExperiment } from './lib/experimentActions.ts'
import StatusNotice from './StatusNotice.tsx'
import './powerActions.css'

export default function PowerActions({ project, update, onSelectTrack, snapshotRequest }: { project: StudioProject; update: (project: StudioProject) => void; onSelectTrack: (id: string, nextProject?: StudioProject) => void; snapshotRequest?: string | null }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [version, setVersion] = useState('')
  const [message, setMessage] = useState('')
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => { if (snapshotRequest) setOpen(true) }, [snapshotRequest])
  useEffect(() => { if (open) input.current?.focus() }, [open, snapshotRequest])
  return <section className="power-actions" aria-label="Experiment actions">
    <button type="button" title="Snapshot current experiment (Alt+Shift+S outside text fields)" aria-keyshortcuts="Alt+Shift+S" aria-expanded={open} onClick={() => setOpen(value => !value)}>Snapshot current experiment <small>Alt+Shift+S</small></button>
    {open && <form className="power-action-form" onSubmit={event => { event.preventDefault(); try { const next = snapshotExperiment(project, title, version); const track = next.tracks[next.tracks.length - 1]; update(next); onSelectTrack(track.id, next); setTitle(''); setVersion(''); setOpen(false); setMessage('Experiment captured as a new project track. Audio can be attached later.') } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not capture experiment.') } }}>
      <p>Capture current Genre, Vocal and Mood settings as historical track identity. This creates no audio.</p>
      <label>Snapshot title<input ref={input} aria-label="Snapshot title" value={title} maxLength={160} onChange={e => setTitle(e.target.value)}/></label>
      <label>Version / label<input aria-label="Snapshot version" value={version} maxLength={160} onChange={e => setVersion(e.target.value)}/></label>
      <button disabled={!title.trim()}>Capture snapshot</button><button type="button" onClick={() => setOpen(false)}>Cancel snapshot</button>
      {!title.trim() && <small>Enter a title before capturing this experiment.</small>}
    </form>}
    <StatusNotice>{message}</StatusNotice>
  </section>
}
