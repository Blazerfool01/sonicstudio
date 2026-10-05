import { useMemo, useState } from 'react'
import type { StudioProject, ProjectTrack } from './lib/studioProject.ts'
import { addProjectTrack, createProjectTrack, editProjectTrack, removeProjectTrack, sameIdentity, TRACK_SOURCES } from './lib/studioProject.ts'
import type { LocalTrack } from './lib/localTracks.ts'
import { createTrackBrief } from './lib/creationBrief.ts'
import { ingredientDescription } from './lib/projectIdentity.ts'
export type ProjectAudioActions = {
  localTracks: LocalTrack[]; attached: (id: string) => boolean
  attach: (id: string, file: File) => LocalTrack
  useLocal: (id: string, local: LocalTrack) => void
  release: (id: string) => void; open: (id: string) => void
}
function TrackCard({ track, project, update, audio }: { track: ProjectTrack; project: StudioProject; update: (p: StudioProject) => void; audio: ProjectAudioActions }) {
  const [draft, setDraft] = useState(track)
  const [message, setMessage] = useState('')
  const [confirmRemove, setConfirmRemove] = useState(false)
  const [copyMessage, setCopyMessage] = useState('')
  const brief = useMemo(() => createTrackBrief(track.creationSnapshot), [track.creationSnapshot])
  function attach(file: File | undefined, replace: boolean) {
    if (!file) return
    const metadata = { filename: file.name, type: file.type, size: file.size }
    if (!replace && track.file && (metadata.filename !== track.file.filename || metadata.type !== track.file.type || metadata.size !== track.file.size)) {
      setMessage('File metadata differs. Use Replace Audio to deliberately attach a different file.'); return
    }
    try { audio.attach(track.id, file); update(editProjectTrack(project, track.id, { file: metadata })); setMessage('Audio attached for this session. Creation identity is unchanged.') }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Could not attach audio. Try again.') }
  }
  return <article className="project-track" aria-label={`Project track ${track.title}`}>
    <h3>{track.title}{track.version ? ` · ${track.version}` : ''}</h3>
    <p>{audio.attached(track.id) ? 'Audio attached this session' : 'Audio not attached this session'}{track.file ? ` · ${track.file.filename} · ${track.file.type || 'Unknown audio type'} · ${track.file.size.toLocaleString()} bytes` : ' · No file metadata yet'}</p>
    <form onSubmit={e => { e.preventDefault(); try { update(editProjectTrack(project, track.id, { title: draft.title, version: draft.version, source: draft.source, sourceDetail: draft.sourceDetail, notes: draft.notes })); setMessage('Track details saved.') } catch { setMessage('Enter a valid track title and details.') } }}>
      <div className="studio-controls"><label>Track title<input aria-label="Track title" maxLength={160} value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })}/></label><label>Version / label<input aria-label="Track version" maxLength={160} value={draft.version} onChange={e => setDraft({ ...draft, version: e.target.value })}/></label><label>Source<select aria-label="Track source" value={draft.source} onChange={e => setDraft({ ...draft, source: e.target.value as ProjectTrack['source'] })}>{TRACK_SOURCES.map(s => <option key={s}>{s}</option>)}</select></label><label>Source detail<input aria-label="Track source detail" placeholder="e.g. Suno, Udio or recorder" maxLength={240} value={draft.sourceDetail} onChange={e => setDraft({ ...draft, sourceDetail: e.target.value })}/></label></div>
      <label className="studio-notes">Track notes<textarea aria-label="Track notes" rows={2} maxLength={4000} value={draft.notes} onChange={e => setDraft({ ...draft, notes: e.target.value })}/></label><button disabled={!draft.title.trim()}>Save track details</button>
    </form>
    <div className="studio-controls"><label>{track.file ? 'Reattach local file' : 'Attach local file'}<input aria-label="Reattach local file" type="file" accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.mp4" onChange={e => { attach(e.target.files?.[0], false); e.target.value = '' }}/></label>{track.file && <label>Replace Audio · metadata may differ<input aria-label="Replace Audio" type="file" accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.mp4" onChange={e => { attach(e.target.files?.[0], true); e.target.value = '' }}/></label>}</div>
    <button disabled={!audio.attached(track.id)} onClick={() => audio.open(track.id)}>Open in Visualiser</button>
    {audio.attached(track.id) && <button onClick={() => audio.release(track.id)}>Detach session audio</button>}
    <button onClick={() => setConfirmRemove(true)}>Remove track</button>
    {confirmRemove && <div><p>Remove this track record and its session attachment?</p><button onClick={() => { audio.release(track.id); update(removeProjectTrack(project, track.id)) }}>Confirm remove track</button><button onClick={() => setConfirmRemove(false)}>Keep track</button></div>}
    <details className="studio-brief"><summary>Track creation identity</summary><p>{sameIdentity(track.creationSnapshot, project) ? 'Matches current project identity.' : 'Created from an earlier project identity. This historical provenance is retained.'}</p><div className="studio-ingredients">{(['genre', 'vocal', 'mood'] as const).map(kind => <article key={kind}><h4>{kind} used</h4><strong>{track.creationSnapshot[kind]?.label ?? 'Not captured'}</strong><p>{ingredientDescription(track.creationSnapshot, kind)}</p>{kind === 'vocal' && track.creationSnapshot.vocal && <><p>{track.creationSnapshot.vocal.identityDescription}</p><p>Breathiness {track.creationSnapshot.vocal.selections.breathiness} · Power {track.creationSnapshot.vocal.selections.power} · Warmth {track.creationSnapshot.vocal.selections.warmth} · Rasp {track.creationSnapshot.vocal.selections.rasp}</p></>}</article>)}</div><h4>Historical Creation Brief</h4><pre>{brief.prompt}</pre><button onClick={async () => { try { await navigator.clipboard.writeText(brief.prompt); setCopyMessage('Historical prompt copied.') } catch { setCopyMessage('Clipboard unavailable. Select the brief to copy manually.') } }}>Copy historical prompt</button><p role="status">{copyMessage}</p><small>Created {track.createdAt} · Updated {track.updatedAt}</small></details><p role="status">{message}</p>
  </article>
}
export default function ProjectTracks({ project, update, audio }: { project: StudioProject; update: (p: StudioProject) => void; audio: ProjectAudioActions }) {
  const [title, setTitle] = useState(''); const [localId, setLocalId] = useState(''); const [message, setMessage] = useState('')
  function add() {
    try { let track = createProjectTrack(project, title); const local = audio.localTracks.find(t => t.id === localId)
      if (local) { track = { ...track, file: { filename: local.filename, type: local.type, size: local.size } }; audio.useLocal(track.id, local) }
      update(addProjectTrack(project, track)); setTitle(''); setMessage('Track created from the current project identity.')
    } catch { setMessage('Could not add track. Enter a title.') }
  }
  return <section aria-labelledby="project-tracks-heading"><h2 id="project-tracks-heading">Project tracks</h2><p>Each result keeps the identity used at creation. Records persist locally; audio needs reattachment after reload.</p><form className="studio-controls" onSubmit={e => { e.preventDefault(); add() }}><label>New track title<input aria-label="New track title" maxLength={160} value={title} onChange={e => setTitle(e.target.value)}/></label><label>Existing session audio (optional)<select aria-label="Existing session audio" value={localId} onChange={e => setLocalId(e.target.value)}><option value="">Metadata record / attach later</option>{audio.localTracks.map(t => <option value={t.id} key={t.id}>{t.filename}</option>)}</select></label><button disabled={!title.trim()}>Add track record</button></form><p role="status">{message}</p>{project.tracks.map(track => <TrackCard key={track.id} track={track} project={project} update={update} audio={audio}/>)}{!project.tracks.length && <p>No track results yet.</p>}</section>
}
