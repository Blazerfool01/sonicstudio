import { useId, useState } from 'react'
import type { KeyboardEvent } from 'react'
import type { StudioProject } from './lib/studioProject.ts'
import { IngredientVisual } from './StudioOverview.tsx'
import { getGenre } from './data/registry.ts'
import { getMood } from './data/moods.ts'
import { analyzeCompatibility } from './lib/compatibility.ts'
import { deriveContextRailProjection } from './lib/contextRailProjection.ts'
import { deriveMoodDna } from './lib/moodDna.ts'
import BlendProgress from './BlendProgress.tsx'

type Tool = 'genre' | 'vocal' | 'mood'
export { default as DashboardModules } from './FidelityDashboardModules.tsx'

function ReferenceWave({ compact = false }: { compact?: boolean }) {
  return <svg className={`reference-wave${compact ? ' compact' : ''}`} viewBox={compact ? '0 0 454 90' : '0 0 1123 110'} preserveAspectRatio="none" role="img" aria-label={compact ? 'Dual sine-wave studio artwork' : 'Dual-glow cyan and violet waveform studio artwork'}>
    <image href="/reference/studio-target.png" x={compact ? -227 : -215} y={compact ? -487 : -640} width="1672" height="941"/>
  </svg>
}

export function ProjectDashboardModules({ project, onOpen }: { project: StudioProject; onOpen: (tool: Tool) => void }) {
  const genreSources = project.genre?.genres
  const primary = genreSources ? getGenre(genreSources[0].genreId) : null
  const secondary = genreSources ? getGenre(genreSources[1].genreId) : null
  const compatibility = primary && secondary ? analyzeCompatibility(primary, secondary, genreSources![0].weight) : null
  return <section className="dashboard-modules" aria-label="Creative studio modules">
    <article className="dashboard-card sound-card"><header><h2>◈ Sound DNA / Genre Blend</h2><button onClick={() => onOpen('genre')}>Explore Genres →</button></header><div className="sound-dna-composition"><div className="dashboard-genres">{genreSources?.map((genre, i) => { const source = getGenre(genre.genreId); return <div className="dashboard-genre" key={genre.genreId}><div className={`reference-art genre-art-${i}`} aria-hidden="true"/><strong>{source.name}</strong><small>{source.family} · {source.tempo[0]}–{source.tempo[1]} BPM</small><div className="studio-summary-meter"><span style={{ width: `${genre.weight}%` }}/></div><small>{genre.weight}% influence</small></div>})}</div><BlendProgress primary={primary} secondary={secondary} primaryWeight={genreSources?.[0].weight ?? 0} compatibility={compatibility} compact/></div><ReferenceWave compact/></article>
    <article className="dashboard-card vocal-card"><header><h2>♩ Vocal Persona Lab</h2><button onClick={() => onOpen('vocal')}>Browse Personas</button></header><div className="dashboard-persona"><div className="reference-art persona-art" aria-hidden="true"/><div><strong>{project.vocal?.label ?? 'Vocal identity'}</strong><div className="persona-tags"><span>{project.vocal?.selections.texture}</span><span>{project.vocal?.selections.delivery}</span><span>{project.vocal?.selections.effect}</span></div><p>{project.vocal?.identityDescription}</p></div></div><IngredientVisual project={project} kind="vocal"/><small className="dashboard-footnote">Captured voice · edit in Vocal Persona</small></article>
    <article className="dashboard-card mood-card"><header><h2>✤ Mood Mapper</h2><button onClick={() => onOpen('mood')}>Custom ⌄</button></header><IngredientVisual project={project} kind="mood"/><div className="dashboard-moods">{project.mood?.selections.map(s => <button key={s.moodId} onClick={() => onOpen('mood')}>{getMood(s.moodId)?.name}<span>{s.weight}%</span></button>)}</div></article>
  </section>
}

export function WaveArtwork() {
  const gradient = useId()
  return <svg className="dashboard-wave" viewBox="0 0 1000 120" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id={gradient} gradientUnits="userSpaceOnUse" x2="1000"><stop stopColor="#286eff"/><stop offset=".35" stopColor="#19d9ff"/><stop offset=".65" stopColor="#9051ff"/><stop offset="1" stopColor="#ea39ed"/></linearGradient></defs>{Array.from({ length: 18 }, (_, i) => <path key={i} d={`M0 ${60+i} Q70 ${-10+i*3} 145 60 T290 60 T435 60 T580 60 T725 60 T870 60 T1015 60`} fill="none" stroke={`url(#${gradient})`} opacity={.8-i*.025}/>)}{Array.from({length: 150}, (_,i) => {const height = 8 + Math.abs(Math.sin(i*.14)*Math.cos(i*.071))*85;return <line key={`bar-${i}`} x1={i*7} x2={i*7} y1={60-height/2} y2={60+height/2} stroke={`url(#${gradient})`} strokeWidth="2" opacity=".8"/>})}</svg>
}

export function DashboardVisualiser({ onOpen }: { onOpen: () => void }) {
  const [mode, setMode] = useState('Waveform')
  return <section className="dashboard-card dashboard-visualiser" aria-label="Audio Visualiser"><header><h2>▥ Audio Visualiser <span className="reference-info" title="Studio artwork previews. Live Preview opens the existing audio analyzer.">ⓘ</span></h2><div className="dashboard-mode-tabs" role="tablist" aria-label="Visualiser style">{['Waveform', 'Spectrum', '3D View', 'Particles'].map(label => <button key={label} role="tab" aria-selected={mode === label} aria-controls="dashboard-visual-preview" id={`preview-tab-${label.replaceAll(' ', '-')}`} onClick={() => setMode(label)} className={mode === label ? 'selected' : ''}>{label}</button>)}</div><button onClick={onOpen}>Live Preview ⌄</button></header><div id="dashboard-visual-preview" role="tabpanel" aria-labelledby={`preview-tab-${mode.replaceAll(' ', '-')}`} className={`visual-preview preview-${mode.replaceAll(' ', '-').toLowerCase()}`}><ReferenceWave/>{mode === 'Particles' && <div className="preview-particles" aria-hidden="true">{Array.from({length:90},(_,i)=><i key={i} style={{left:`${(i*37)%100}%`,top:`${(i*29)%100}%`,opacity:.3+(i%5)*.14}}/>)}</div>}{mode === 'Spectrum' && <WaveArtwork/>}</div></section>
}

export function DashboardTimeline({ project, onOpen, onUpdate }: { project: StudioProject; onOpen: (id?: string) => void; onUpdate: (project: StudioProject) => void }) {
  const duration = Math.max(208, ...project.timeline.map(c => c.start + (c.sourceOut ?? 30) - c.sourceIn))
  function toggleTrack(trackId: string, kind: 'muted' | 'solo') {
    const clips = project.timeline.filter(clip => clip.trackId === trackId)
    const nextValue = !clips.every(clip => clip[kind])
    onUpdate({ ...project, timeline: project.timeline.map(clip => clip.trackId === trackId ? { ...clip, [kind]: nextValue } : clip), updatedAt: new Date().toISOString() })
  }
  return <section className="dashboard-card dashboard-timeline" aria-label="Track View timeline"><header><h2>♬ Track View</h2><button onClick={() => onOpen()}>＋ Add Track</button><small>Arrangement · attach audio in Tracks</small></header><div className="dashboard-time-ruler"><span>TRACKS</span><div>{Array.from({length:8}, (_,i)=><span key={i}>{Math.floor(i*30/60)}:{String(i*30%60).padStart(2,'0')}</span>)}</div></div>{project.tracks.map((track,i)=>{
    const clips = project.timeline.filter(c=>c.trackId===track.id)
    const muted = clips.length > 0 && clips.every(c=>c.muted)
    const solo = clips.length > 0 && clips.every(c=>c.solo)
    return <div className={`dashboard-track lane-${i%4}${muted ? ' track-muted' : ''}`} key={track.id}><div className="dashboard-track-controls"><button className="dashboard-track-label" onClick={()=>onOpen(track.id)}><span>▣</span>{track.title}</button><button className="track-state-button" disabled={!clips.length} aria-label={`Mute ${track.title}`} aria-pressed={muted} onClick={()=>toggleTrack(track.id,'muted')}>M</button><button className="track-state-button" disabled={!clips.length} aria-label={`Solo ${track.title}`} aria-pressed={solo} onClick={()=>toggleTrack(track.id,'solo')}>S</button><button className="track-attachment-button" aria-label={`Attach audio to ${track.title}`} onClick={()=>onOpen(track.id)}>◷</button><span className="track-clip-presence" title={`${clips.length} arrangement clips`} aria-hidden="true"><i/></span></div><div className="dashboard-track-clips">{clips.map(c=><button key={c.id} aria-label={`Open ${track.title} clip at ${c.start} seconds`} onClick={()=>onOpen(track.id)} style={{left:`${c.start/duration*100}%`,width:`${((c.sourceOut ?? 30)-c.sourceIn)/duration*100}%`}}><svg viewBox="0 0 240 22" preserveAspectRatio="none" aria-hidden="true"><path d={i===0 ? 'M0 11 H240 M12 6 V16 M24 8 V14 M38 4 V18 M55 7 V15 M70 5 V17 M86 8 V14 M101 3 V19 M116 7 V15 M131 5 V17 M148 8 V14 M166 4 V18 M184 7 V15 M201 6 V16 M220 5 V17' : 'M0 11 L8 9 L12 13 L18 10 L25 12 L30 7 L35 15 L41 9 L48 13 L55 11 L62 6 L66 17 L71 8 L76 13 L82 10 L90 12 L99 8 L107 14 L113 10 L120 11 L128 6 L134 16 L140 9 L146 13 L153 10 L160 12 L168 8 L174 15 L180 9 L186 12 L193 10 L203 13 L211 9 L220 11 L240 11'}/></svg></button>)}</div></div>
  })}</section>
}

export type RailTab = 'project' | 'guidance' | 'presets'
const RAIL_TABS: { id: RailTab; label: string }[] = [{ id: 'project', label: 'Project' }, { id: 'guidance', label: 'Guidance' }, { id: 'presets', label: 'Presets' }]

export function DashboardRail({ project, onExport, onSave, onOpen, tab, onTab, statusMessage }: { tab: RailTab; onTab: (tab: RailTab) => void; project: StudioProject; onExport: () => void; onSave: () => void; onOpen: (tool: Tool) => void; statusMessage: string }) {
  const [sampleRate,setSampleRate]=useState('48 kHz')
  const [stems,setStems]=useState(true)
  const [normalize,setNormalize]=useState(true)
  const [feedback,setFeedback]=useState('')
  const guidance=deriveContextRailProjection(project,null).identity?.guidance
  const genreName = project.genre?.label.replace(/ \(current mix\)$/, '')
  const moodName = project.mood ? deriveMoodDna(project.mood.selections)?.dominantMood.name : undefined
  function requestRender(){setFeedback(`WAV · ${sampleRate} · ${stems ? 'individual stems' : 'full mix'} · ${normalize ? 'normalize enabled' : 'original level'}. Attach source audio in Tracks before rendering. Rendering is not connected in this visual preset.`)}
  function moveTab(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    if (!step) return
    event.preventDefault()
    const next = RAIL_TABS[(index + step + RAIL_TABS.length) % RAIL_TABS.length]
    onTab(next.id)
    document.getElementById(`rail-tab-${next.id}`)?.focus()
  }
  const seconds = Math.max(0,...project.timeline.map(c=>c.start+(c.sourceOut ?? c.sourceIn)-c.sourceIn))
  return <aside className="dashboard-rail" aria-label="Project context panel">
    <div className="dashboard-tabs" role="tablist" aria-label="Project panel sections">{RAIL_TABS.map((item, index) => <button key={item.id} type="button" role="tab" id={`rail-tab-${item.id}`} aria-selected={tab === item.id} aria-controls="rail-panel" tabIndex={tab === item.id ? 0 : -1} onClick={() => onTab(item.id)} onKeyDown={event => moveTab(event, index)}>{item.label}</button>)}</div>
    <div id="rail-panel" className="dashboard-tabpanel" role="tabpanel" aria-labelledby={`rail-tab-${tab}`}>
      {tab === 'project' && <>
        <div className="dashboard-context-stack"><section className="dashboard-card"><header><h2>Project Overview</h2><small>Local studio</small></header><strong>{project.name}</strong><dl><div><dt>Length</dt><dd>{Math.floor(seconds/60)}:{String(Math.floor(seconds%60)).padStart(2,'0')}</dd></div><div><dt>Tracks</dt><dd>{project.tracks.length}</dd></div><div><dt>Identity</dt><dd>{['genre','vocal','mood'].filter(k=>project[k as Tool]).length}/3</dd></div></dl><small>Genre Blend</small><p>{genreName ?? 'Not set yet'}</p></section><section className="dashboard-card"><header><h2>Mix Notes</h2><button onClick={onSave}>＋</button></header>{project.notes.split('\n').filter(Boolean).map((note,i)=><p className="dashboard-note" key={i}><span aria-hidden="true">○</span>{note}</p>)}</section></div>
        <section id="rail-export" tabIndex={-1} className="dashboard-card dashboard-export"><header><h2>Export Settings</h2></header><label>Format<select aria-label="Audio export format" value="wav" onChange={()=>setFeedback('WAV is the configured audio format.')}><option value="wav">WAV (High Quality)</option></select></label><label>Sample Rate<select value={sampleRate} onChange={e=>setSampleRate(e.target.value)}><option>48 kHz</option><option>44.1 kHz</option><option>96 kHz</option></select></label><div className="export-toggle-row"><span>Stems</span><button type="button" role="switch" aria-label="Export individual stems" aria-checked={stems} onClick={()=>setStems(!stems)} className="neon-switch"><i/></button><small>Export individual stems</small></div><div className="export-toggle-row"><span>Normalize</span><button type="button" role="switch" aria-label="Normalize audio" aria-checked={normalize} onClick={()=>setNormalize(!normalize)} className="neon-switch"><i/></button><small>Loudness optimised</small></div><div className="dashboard-export-actions"><button className="dashboard-primary" onClick={requestRender}>🎵 Generate / Render →</button><button onClick={onSave}>💾 Save Project</button><button className="metadata-export-link" onClick={onExport}>Project metadata export ↗</button></div><small role="status">{feedback || statusMessage}</small></section>
      </>}
      {tab === 'guidance' && <section className="dashboard-card"><header><h2>✧ AI Guidance</h2><small>Derived</small></header>{guidance ? <><small>Vocal</small>{guidance.vocal.lines.map((line, i) => <p key={`v${i}`}>{line}</p>)}<small>Mood</small>{guidance.mood.lines.map((line, i) => <p key={`m${i}`}>{line}</p>)}</> : <p>Capture your voice and mood to derive guidance.</p>}</section>}
      {tab === 'presets' && <section className="dashboard-card"><header><h2>Presets</h2><small>Captured identity</small></header>{([['genre', 'Genre Blend', genreName], ['vocal', 'Vocal persona', project.vocal?.label], ['mood', 'Mood', moodName]] as const).map(([kind, label, value]) => <button type="button" className="dashboard-preset" key={kind} onClick={() => onOpen(kind)}><small>{label}</small><strong>{value ?? 'Not set yet'}</strong><span>{value ? 'Edit' : 'Create'}</span></button>)}</section>}
    </div>
  </aside>
}