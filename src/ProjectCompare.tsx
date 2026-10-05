import { useMemo, useState } from 'react'
import type { StudioProject, ProjectTrack } from './lib/studioProject.ts'
import type { TrackComparison, ObservationField } from './lib/trackComparison.ts'
import { addComparison, createComparison, deleteComparison, editComparison, OBSERVATION_FIELDS } from './lib/trackComparison.ts'
import { provenanceDifferences } from './lib/provenanceDifference.ts'
import { ingredientDescription } from './lib/projectIdentity.ts'
import type { ProjectAudioActions } from './ProjectTracks.tsx'

const observationLabels: Record<ObservationField, string> = {
  vocalIdentity: 'Vocal identity', atmosphere: 'Atmosphere', arrangement: 'Arrangement',
  mix: 'Mix', improved: 'Improved', regressed: 'Regressed',
}
function trackLabel(track: ProjectTrack): string { return `${track.title}${track.version ? ` · ${track.version}` : ''}` }
function Side({ side, track, audio }: { side: 'A' | 'B'; track: ProjectTrack; audio: ProjectAudioActions }) {
  const attached = audio.attached(track.id)
  const active = audio.currentTrackId === track.id
  function attachControls() {
    document.getElementById(`project-track-${track.id}`)?.scrollIntoView({ block: 'start', behavior: 'auto' })
    document.querySelector<HTMLInputElement>(`[id="project-track-${CSS.escape(track.id)}"] input[type="file"]`)?.focus({ preventScroll: true })
  }
  return <article className={`comparison-side${active ? ' active' : ''}`} aria-label={`Comparison side ${side}`}>
    <h3>{side} · {trackLabel(track)}</h3>
    <p>Source: {track.source}{track.sourceDetail ? ` / ${track.sourceDetail}` : ''}</p>
    <p>{attached ? 'Audio attached this session' : 'Track record exists · audio unavailable this session'}</p>
    <button type="button" disabled={!attached} aria-pressed={active} onClick={() => audio.play(track.id)}>Play {side}</button>
    <button type="button" onClick={attachControls}>Attach / reattach {side}</button>
    <details><summary>{side} captured provenance</summary>{(['genre', 'vocal', 'mood'] as const).map(kind => <div key={kind}><h4>{kind} used</h4><strong>{track.creationSnapshot[kind]?.label ?? 'Not captured'}</strong><p>{ingredientDescription(track.creationSnapshot, kind)}</p></div>)}</details>
  </article>
}
function ComparisonEditor({ comparison, project, update, audio, onDeleted }: { comparison: TrackComparison; project: StudioProject; update: (p: StudioProject) => void; audio: ProjectAudioActions; onDeleted: () => void }) {
  const [observations, setObservations] = useState(comparison.observations)
  const [preferred, setPreferred] = useState(comparison.preferredTrackId)
  const [conclusion, setConclusion] = useState(comparison.conclusion)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [message, setMessage] = useState('')
  const a = project.tracks.find(t => t.id === comparison.trackAId)!
  const b = project.tracks.find(t => t.id === comparison.trackBId)!
  const differences = useMemo(() => provenanceDifferences(a.creationSnapshot, b.creationSnapshot), [a.creationSnapshot, b.creationSnapshot])
  const activeSide = audio.currentTrackId === a.id ? 'A' : audio.currentTrackId === b.id ? 'B' : null
  const target = activeSide === 'A' ? b : a
  const dirty = JSON.stringify(observations) !== JSON.stringify(comparison.observations) || preferred !== comparison.preferredTrackId || conclusion !== comparison.conclusion
  return <div className="comparison-editor">
    <p className="comparison-state" role="status">{activeSide ? `Active side: ${activeSide} · ${audio.playing ? 'Playing' : 'Paused / selected'}` : 'No comparison side active'}</p>
    <div className="comparison-sides"><Side side="A" track={a} audio={audio}/><Side side="B" track={b} audio={audio}/></div>
    <div className="comparison-actions"><button type="button" disabled={!audio.attached(target.id)} onClick={() => audio.play(target.id)}>Switch A ↔ B</button><button type="button" disabled={!activeSide || !audio.playing} onClick={audio.pause}>Pause comparison</button></div>
    <p>One player switches between versions near the current position, clamped to the next track’s duration. Opening another tool pauses playback.</p>
    <div className="comparison-differences" aria-label="Provenance differences"><h3>What changed in the captured identity?</h3>{differences.map(d => <article key={d.dimension}><h4>{d.dimension} · {d.unchanged ? 'Unchanged' : d.changes.join(', ') + ' changed'}</h4>{d.unchanged ? <p>{d.before}</p> : <><p><strong>A:</strong> {d.before}</p><p><strong>B:</strong> {d.after}</p></>}</article>)}</div>
    <form onSubmit={e => { e.preventDefault(); try { update(editComparison(project, comparison.id, { observations, preferredTrackId: preferred, conclusion })); setMessage('Comparison saved. If device storage is unavailable, it remains in this session only.') } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not save comparison.') } }}>
      <h3>Your listening observations</h3><p>These are your judgments. Identity differences above make no quality claims.</p>
      <div className="comparison-observations">{OBSERVATION_FIELDS.map(field => <label className="studio-notes" key={field}>{observationLabels[field]}<textarea aria-label={`${observationLabels[field]} observations`} rows={2} maxLength={2000} value={observations[field]} onChange={e => setObservations({ ...observations, [field]: e.target.value })}/></label>)}</div>
      <label className="studio-notes comparison-preference">Preferred version<select aria-label="Preferred track" value={preferred ?? ''} onChange={e => setPreferred(e.target.value || null)}><option value="">No preference / undecided</option><option value={a.id}>A · {trackLabel(a)}</option><option value={b.id}>B · {trackLabel(b)}</option></select></label>
      <label className="studio-notes">Conclusion / free notes<textarea aria-label="Comparison conclusion" rows={3} maxLength={4000} value={conclusion} onChange={e => setConclusion(e.target.value)}/></label>
      <p>{dirty ? 'Unsaved observations' : 'Saved comparison'} · Created {comparison.createdAt}</p>
      <button type="submit">Save comparison</button>
    </form>
    <button type="button" onClick={() => setConfirmDelete(true)}>Delete comparison</button>
    {confirmDelete && <div role="group" aria-label="Confirm comparison deletion"><p>Delete this comparison and its observations? Both tracks will remain.</p><button type="button" onClick={() => { update(deleteComparison(project, comparison.id)); onDeleted() }}>Confirm delete comparison</button><button type="button" onClick={() => setConfirmDelete(false)}>Keep comparison</button></div>}
    <p role="status">{message}</p>
  </div>
}
export default function ProjectCompare({ project, update, audio }: { project: StudioProject; update: (p: StudioProject) => void; audio: ProjectAudioActions }) {
  const [trackAId, setTrackAId] = useState('')
  const [trackBId, setTrackBId] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [message, setMessage] = useState('')
  const selected = project.comparisons.find(c => c.id === selectedId)
  const validPair = trackAId !== trackBId && project.tracks.some(t => t.id === trackAId) && project.tracks.some(t => t.id === trackBId)
  function create() {
    try { const comparison = createComparison(project, trackAId, trackBId); update(addComparison(project, comparison)); setSelectedId(comparison.id); setMessage('Comparison created between these two track records. Audio can be attached later.') }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Choose two distinct tracks.') }
  }
  return <section className="project-compare" aria-labelledby="project-compare-heading">
    <span className="eyebrow">V2.0 / STAGE 3 · A/B COMPARE</span><h2 id="project-compare-heading">Compare your results.</h2><p>Select a deliberate experiment. Record what improved, what regressed, and why you prefer a version.</p>
    {project.tracks.length < 2 && <p>Add at least two project tracks to create a comparison. Audio is optional for note-taking.</p>}
    <form className="studio-controls" onSubmit={e => { e.preventDefault(); create() }}><label>Track A<select aria-label="Comparison Track A" value={trackAId} onChange={e => { setTrackAId(e.target.value); if (e.target.value === trackBId) setTrackBId('') }}><option value="">Choose A</option>{project.tracks.map(t => <option key={t.id} value={t.id} disabled={t.id === trackBId}>{trackLabel(t)}</option>)}</select></label><label>Track B<select aria-label="Comparison Track B" value={trackBId} onChange={e => setTrackBId(e.target.value)}><option value="">Choose B</option>{project.tracks.map(t => <option key={t.id} value={t.id} disabled={t.id === trackAId}>{trackLabel(t)}</option>)}</select></label><button disabled={!validPair}>Create comparison</button></form>
    <label className="studio-notes">Open saved comparison<select aria-label="Open comparison" value={selected?.id ?? ''} onChange={e => setSelectedId(e.target.value)}><option value="">Choose a saved comparison</option>{project.comparisons.map((c, index) => <option key={c.id} value={c.id}>{index + 1}. {trackLabel(project.tracks.find(t => t.id === c.trackAId)!)} vs {trackLabel(project.tracks.find(t => t.id === c.trackBId)!)}</option>)}</select></label>
    <p role="status">{message}</p>{selected && <ComparisonEditor key={selected.id} comparison={selected} project={project} update={update} audio={audio} onDeleted={() => setSelectedId('')}/>}
    {!project.comparisons.length && <p>No saved comparisons yet.</p>}
  </section>
}
