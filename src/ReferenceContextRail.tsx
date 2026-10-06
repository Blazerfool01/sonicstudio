import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import type { StudioProject } from './lib/studioProject.ts'
import { deriveContextRailProjection } from './lib/contextRailProjection.ts'
import { getGenre } from './data/registry.ts'
import { getMood } from './data/moods.ts'
import { deriveMoodDna } from './lib/moodDna.ts'

type Tool = 'genre' | 'vocal' | 'mood'
export type RailTab = 'project' | 'track' | 'guidance' | 'presets'
const RAIL_TABS: { id: RailTab; label: string }[] = [
  { id: 'project', label: 'Project' }, { id: 'track', label: 'Track' },
  { id: 'guidance', label: 'Guidance' }, { id: 'presets', label: 'Presets' },
]

function updatedLabel(value: string) {
  const timestamp = Date.parse(value)
  if (!Number.isFinite(timestamp)) return 'Local project'
  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60_000))
  if (minutes < 1) return 'Updated just now'
  if (minutes < 60) return `Updated ${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Updated ${hours}h ago`
  const days = Math.floor(hours / 24)
  return days < 7 ? `Updated ${days}d ago` : `Updated ${new Date(timestamp).toLocaleDateString()}`
}

function ProjectArtwork() {
  return <svg className="dashboard-project-art" viewBox="0 0 112 82" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient id="project-sky" x2="0" y2="1"><stop stopColor="#172f96"/><stop offset="1" stopColor="#071329"/></linearGradient>
      <linearGradient id="project-ridge" x2="1" y2="1"><stop stopColor="#31b9ff"/><stop offset=".5" stopColor="#673fff"/><stop offset="1" stopColor="#e647dd"/></linearGradient>
      <filter id="project-glow"><feGaussianBlur stdDeviation="3"/></filter>
    </defs>
    <rect width="112" height="82" fill="url(#project-sky)"/>
    <circle cx="78" cy="28" r="19" fill="#4367ff" opacity=".78" filter="url(#project-glow)"/>
    <circle cx="78" cy="28" r="16" fill="#2546cc" stroke="#68c9ff" strokeWidth="1.2"/>
    <path d="M0 54 20 35 33 48 52 27 70 48 85 38 112 59v23H0Z" fill="#101c54"/>
    <path d="M0 56 20 37 33 50 52 29 70 50 85 40 112 61" fill="none" stroke="url(#project-ridge)" strokeWidth="2"/>
    <path d="M0 69 25 54 43 65 67 49 84 61 112 51v31H0Z" fill="#111a47"/>
    <path d="M0 70 25 56 43 67 67 51 84 63 112 53" fill="none" stroke="#58bfff" strokeWidth="1" opacity=".8"/>
  </svg>
}

function ModuleIcon({ kind }: { kind: Tool | 'visualiser' }) {
  if (kind === 'genre') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 11v2m3-5v8m3-12v16m3-12v8m3-14v20m3-12v8m3-11v14m2-10v6"/></svg>
  if (kind === 'vocal') return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 11v1a7 7 0 0 0 14 0v-1m-7 8v3m-4 0h8"/></svg>
  if (kind === 'mood') return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="12" r="7"/><circle cx="15" cy="12" r="7"/></svg>
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 14V10m3 8V6m3 14V4m3 16V8m3 12V3m3 17V6m3 14V9m2 9v-7"/></svg>
}

export function DashboardRail({ project, onExport, onSave, onOpen, onOpenVisualiser, onOpenTrack, selectedTrackId, tab, onTab, statusMessage, settingsExpanded, onSettingsExpandedChange }: {
  tab: RailTab
  onTab: (tab: RailTab) => void
  project: StudioProject
  onExport: () => void
  onSave: () => void
  onOpen: (tool: Tool) => void
  onOpenVisualiser: () => void
  onOpenTrack: (id: string) => void
  selectedTrackId: string | null
  statusMessage: string
  settingsExpanded: boolean
  onSettingsExpandedChange: (expanded: boolean) => void
}) {
  const [sampleRate, setSampleRate] = useState('48 kHz')
  const [stems, setStems] = useState(true)
  const [normalize, setNormalize] = useState(true)
  const [feedback, setFeedback] = useState('')
  const projection = deriveContextRailProjection(project, null)
  const guidance = projection.identity?.guidance
  const genreSources = project.genre?.genres ?? []
  const genreNames = genreSources.map(source => getGenre(source.genreId).name)
  const moodNames = project.mood?.selections.map(selection => getMood(selection.moodId)?.name).filter((name): name is string => Boolean(name)) ?? []
  const moodDna = project.mood ? deriveMoodDna(project.mood.selections) : null
  const tempos = genreSources.flatMap(source => getGenre(source.genreId).tempo)
  const tempoRange = tempos.length ? `${Math.min(...tempos)}–${Math.max(...tempos)}` : '—'

  function moveTab(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    if (!step) return
    event.preventDefault()
    const next = RAIL_TABS[(index + step + RAIL_TABS.length) % RAIL_TABS.length]
    onTab(next.id)
    document.getElementById(`rail-tab-${next.id}`)?.focus()
  }

  function requestRender() {
    setFeedback(`WAV · ${sampleRate} · ${stems ? 'individual stems' : 'full mix'} · ${normalize ? 'normalize enabled' : 'original level'}. Attach source audio in Tracks before rendering. Rendering is not connected.`)
  }

  return <aside className="dashboard-rail reference-context-rail" aria-label="Project context panel">
    <div className="dashboard-tabs" role="tablist" aria-label="Project panel sections">{RAIL_TABS.map((item, index) => <button key={item.id} type="button" role="tab" id={`rail-tab-${item.id}`} aria-selected={tab === item.id} aria-controls="rail-panel" tabIndex={tab === item.id ? 0 : -1} onClick={() => onTab(item.id)} onKeyDown={event => moveTab(event, index)}>{item.label}</button>)}</div>
    <div id="rail-panel" className="dashboard-tabpanel" role="tabpanel" aria-labelledby={`rail-tab-${tab}`}>
      {tab === 'project' && <>
        <section className="dashboard-card dashboard-project-card" aria-label="Active project details">
          <div className="dashboard-project-heading"><ProjectArtwork/><div><strong>{project.name}</strong><small>{updatedLabel(project.updatedAt)}</small></div></div>
          <dl className="dashboard-project-metadata">
            <div><dt>BPM</dt><dd>{tempoRange}</dd></div>
            <div><dt>Key</dt><dd aria-label="Key not set">—</dd></div>
          </dl>
          <div className="dashboard-project-moods"><span>Mood</span>{(moodNames.length ? moodNames : ['Not set']).map((mood, index) => <span key={mood} className={`mood-chip mood-chip-${index % 3}`}>{mood}</span>)}</div>
        </section>
        <section className="dashboard-card dashboard-active-modules" aria-labelledby="active-modules-heading">
          <h2 id="active-modules-heading">Active Modules</h2>
          <button type="button" className="dashboard-active-module" onClick={() => onOpen('genre')}><span className="dashboard-active-icon genre"><ModuleIcon kind="genre"/></span><span><strong>Genre Mixer</strong><small>{genreNames.length ? genreNames.join(' × ') : 'No blend captured'}</small></span><i aria-hidden="true">›</i></button>
          <button type="button" className="dashboard-active-module" onClick={() => onOpen('vocal')}><span className="dashboard-active-icon vocal"><ModuleIcon kind="vocal"/></span><span><strong>Vocal Persona</strong><small>{project.vocal ? `${project.vocal.selections.texture} · ${project.vocal.selections.delivery} · ${project.vocal.selections.effect}` : 'No persona captured'}</small></span><i aria-hidden="true">›</i></button>
          <button type="button" className="dashboard-active-module" onClick={() => onOpen('mood')}><span className="dashboard-active-icon mood"><ModuleIcon kind="mood"/></span><span><strong>Mood Mapper</strong><small>{moodNames.length ? moodNames.join(' · ') : 'No mood captured'}</small></span><i aria-hidden="true">›</i></button>
          <button type="button" className="dashboard-active-module" onClick={onOpenVisualiser}><span className="dashboard-active-icon visualiser"><ModuleIcon kind="visualiser"/></span><span><strong>Visualiser</strong><small>Wave · Spectrum</small></span><i aria-hidden="true">›</i></button>
        </section>
        <details id="rail-export" className="dashboard-settings-disclosure" open={settingsExpanded} onToggle={event => onSettingsExpandedChange(event.currentTarget.open)}>
          <summary>Export Settings</summary>
          <div className="dashboard-card dashboard-export">
            <label>Format<select aria-label="Audio export format" value="wav" onChange={() => setFeedback('WAV is the configured audio format.')}><option value="wav">WAV (High Quality)</option></select></label>
            <label>Sample Rate<select aria-label="Sample Rate" value={sampleRate} onChange={event => setSampleRate(event.target.value)}><option>48 kHz</option><option>44.1 kHz</option><option>96 kHz</option></select></label>
            <div className="export-toggle-row"><span>Stems</span><button type="button" role="switch" aria-label="Export individual stems" aria-checked={stems} onClick={() => setStems(!stems)} className="neon-switch"><i/></button><small>Export individual stems</small></div>
            <div className="export-toggle-row"><span>Normalize</span><button type="button" role="switch" aria-label="Normalize audio" aria-checked={normalize} onClick={() => setNormalize(!normalize)} className="neon-switch"><i/></button><small>Loudness optimised</small></div>
            <div className="dashboard-export-actions"><button className="dashboard-primary" type="button" onClick={requestRender}>Generate / Render →</button><button type="button" onClick={onSave}>Save Project</button><button className="metadata-export-link" type="button" onClick={onExport}>Project metadata export ↗</button></div>
            <small role="status">{feedback || statusMessage}</small>
          </div>
        </details>
      </>}

      {tab === 'track' && <section className="dashboard-card dashboard-track-list" aria-label="Project tracks">
        <header><h2>Tracks</h2><small>{project.tracks.length} in this project</small></header>
        {project.tracks.length ? project.tracks.map(track => <button type="button" className="dashboard-track-entry" key={track.id} aria-current={track.id === selectedTrackId ? 'true' : undefined} onClick={() => onOpenTrack(track.id)}><span className="dashboard-track-art" aria-hidden="true">♫</span><span><strong>{track.title}</strong><small>{track.version || track.sourceDetail || track.source}</small></span><i aria-hidden="true">›</i></button>) : <p>No tracks in this project yet.</p>}
      </section>}

      {tab === 'guidance' && <section className="dashboard-card dashboard-guidance-card"><header><h2>Guidance</h2><small>Derived from this project's captured identity</small></header>{guidance ? <>{(['genre', 'vocal', 'mood'] as const).map(kind => <section className="dashboard-guidance-module" key={kind}><h3>{kind === 'genre' ? 'Genre Mixer' : kind === 'vocal' ? 'Vocal Persona' : 'Mood Mapper'}</h3>{guidance[kind].lines.map((line, index) => <p key={`${kind}-${index}`}>{line}</p>)}</section>)}</> : <p>Capture project ingredients to derive guidance.</p>}</section>}

      {tab === 'presets' && <section className="dashboard-card dashboard-preset-list"><header><h2>Presets</h2><small>Captured project sources</small></header>{([['genre', 'Genre Blend', project.genre?.label], ['vocal', 'Vocal persona', project.vocal?.label], ['mood', 'Mood direction', moodDna?.dominantMood.name]] as const).map(([kind, label, value]) => <button type="button" className="dashboard-preset" key={kind} onClick={() => onOpen(kind)}><small>{label}</small><strong>{value ?? 'Not set yet'}</strong><span>{value ? 'Edit' : 'Create'}</span></button>)}</section>}
    </div>
  </aside>
}
