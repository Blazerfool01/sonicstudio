import { useEffect, useRef, useState } from 'react'
import packageInfo from '../package.json'
import GenreMixer from './GenreMixer.tsx'
import VocalPersonaBuilder from './VocalPersonaBuilder.tsx'
import MoodMapper from './MoodMapper.tsx'
import Visualiser from './Visualiser.tsx'
import type { VisualiserAudio } from './Visualiser.tsx'
import ProjectTracks from './ProjectTracks.tsx'
import type { ProjectAudioActions } from './ProjectTracks.tsx'
import ProjectCompare from './ProjectCompare.tsx'
import StudioComposer from './StudioComposer.tsx'
import useStudioProjects from './useStudioProjects.ts'
import type { TrackLibrary } from './lib/localTracks.ts'
import { deriveMoodDna } from './lib/moodDna.ts'
import type { MoodDna } from './lib/moodDna.ts'
import { getMood } from './data/moods.ts'
import { STUDIO_VIEWS, CREATE_TOOLS, historicalTrack, playbackViewActive } from './lib/studioNavigation.ts'
import type { StudioView, CreateTool } from './lib/studioNavigation.ts'
const visualPreviews = ['dreamlike', 'aggressive'].map(id => { const mood = getMood(id)!; return { id, label: mood.name, characteristics: mood.profile } })
export default function StudioShell() {
  const studio = useStudioProjects()
  const [visualMood, setVisualMood] = useState<MoodDna | null>(null)
  const [view, setView] = useState<StudioView>('create')
  const [tool, setTool] = useState<CreateTool>('overview')
  const [returnView, setReturnView] = useState<'tracks' | 'compare'>('tracks')
  const [audioPlaying, setAudioPlaying] = useState(false)
  const [openedTrackId, setOpenedTrackId] = useState<string | null>(null)
  const audioBridge = useRef<VisualiserAudio>(null)
  const [sessionLibrary, setSessionLibrary] = useState<TrackLibrary>({ tracks: [], selectedId: null })
  const [attachments, setAttachments] = useState<Record<string, string>>({})
  const attachmentsRef = useRef(attachments)
  useEffect(() => { audioBridge.current?.pause(); setOpenedTrackId(null); setReturnView('tracks') }, [studio.state.activeId])
  function setAttachment(id: string, localId: string | null) {
    const next = { ...attachmentsRef.current }
    if (localId) next[id] = localId; else delete next[id]
    attachmentsRef.current = next; setAttachments(next)
  }
  function release(id: string) {
    const localId = attachmentsRef.current[id]
    setAttachment(id, null)
    if (localId && !Object.values(attachmentsRef.current).includes(localId)) audioBridge.current?.remove(localId)
  }
  const historical = historicalTrack(studio.state.projects.flatMap(p => p.tracks), openedTrackId, attachments, sessionLibrary.selectedId)
  const historicalMood = historical?.creationSnapshot.mood ? deriveMoodDna(historical.creationSnapshot.mood.selections) : null
  const audio: ProjectAudioActions = {
    currentTrackId: historical?.id ?? null, playing: audioPlaying,
    play: id => {
      const localId = attachments[id]
      if (!localId || !sessionLibrary.tracks.some(t => t.id === localId)) return
      setOpenedTrackId(id); setSessionLibrary(current => ({ ...current, selectedId: localId })); audioBridge.current?.play(localId, true)
    },
    pause: () => audioBridge.current?.pause(),
    localTracks: sessionLibrary.tracks,
    attached: id => sessionLibrary.tracks.some(t => t.id === attachments[id]),
    attach: (id, file) => {
      if (!audioBridge.current) throw new Error('Audio player is unavailable.')
      const local = audioBridge.current.importFile(file)
      release(id); setAttachment(id, local.id); return local
    },
    useLocal: (id, local) => { if (attachmentsRef.current[id] !== local.id) release(id); setAttachment(id, local.id) }, release,
    open: id => { const localId = attachments[id]; if (!localId) return; setOpenedTrackId(id); setSessionLibrary(current => ({ ...current, selectedId: localId })); audioBridge.current?.choose(localId); setReturnView(view === 'compare' ? 'compare' : 'tracks'); setView('visualise') },
  }
  function openTool(next: 'genre' | 'vocal' | 'mood') { setView('create'); setTool(next) }
  function navigate(next: StudioView) { setView(next) }
  function focusTrack(id: string) {
    setView('tracks')
    requestAnimationFrame(() => {
      document.getElementById(`project-track-${id}`)?.scrollIntoView({ block: 'start' })
      document.querySelector<HTMLInputElement>(`[id="project-track-${CSS.escape(id)}"] input[type="file"]`)?.focus({ preventScroll: true })
    })
  }
  const active = studio.active
  return <div className="studio-shell">
    <header className="studio-topbar"><div className="wordmark">SONIC <span>STUDIO</span></div><span>LOCAL STUDIO · V {packageInfo.version}</span></header>
    <nav className="workflow-nav" aria-label="Studio workflow">{STUDIO_VIEWS.map((item, index) => <button type="button" key={item.id} aria-current={view === item.id ? 'page' : undefined} className={view === item.id ? 'active' : ''} onClick={() => navigate(item.id)}><small>0{index + 1}</small> {item.label}</button>)}</nav>
    <main className="workflow-content">
      <h1>{STUDIO_VIEWS.find(item => item.id === view)!.label}</h1>
      <p className="project-context"><strong>{active?.name ?? 'No active project'}</strong>{active && <span> · {active.tracks.length} tracks · {active.comparisons.length} comparisons · {['genre', 'vocal', 'mood'].filter(k => active[k as 'genre' | 'vocal' | 'mood']).length}/3 ingredients</span>}</p>
      <div hidden={view !== 'create'}><nav className="create-nav" aria-label="Create workspace">{CREATE_TOOLS.map(item => <button type="button" key={item.id} aria-current={tool === item.id ? 'page' : undefined} className={tool === item.id ? 'active' : ''} onClick={() => setTool(item.id)}>{item.label}</button>)}</nav></div>
      <StudioComposer audio={audio} studio={studio} onNavigate={openTool} showIdentity={view === 'create' && tool === 'overview'}/>
      <div hidden={view !== 'create'}>
        <div hidden={tool !== 'overview'} className="workflow-next"><p>Attach each ingredient explicitly, then use your Creation Brief to make music in your own workflow.</p><button type="button" onClick={() => navigate('tracks')}>Go to Tracks</button></div>
        <div id="studio-tool-genre" hidden={tool !== 'genre'}><GenreMixer projectEnabled={!!active} onUse={snapshot => studio.attach('genre', snapshot)}/></div>
        <div id="studio-tool-vocal" hidden={tool !== 'vocal'}><VocalPersonaBuilder projectEnabled={!!active} onUse={snapshot => studio.attach('vocal', snapshot)}/></div>
        <div id="studio-tool-mood" hidden={tool !== 'mood'}><MoodMapper onCharacteristics={setVisualMood} projectEnabled={!!active} onUse={snapshot => studio.attach('mood', snapshot)}/></div>
      </div>
      <div hidden={view !== 'tracks'} className="studio-composer destination-panel">{active ? <><ProjectTracks key={`tracks-${active.id}`} project={active} update={studio.update} audio={audio}/><button type="button" onClick={() => navigate('compare')}>Compare versions</button></> : <p>Create or open a project to add your first result.</p>}</div>
      <div hidden={view !== 'compare'} className="studio-composer destination-panel">{active ? <ProjectCompare key={`compare-${active.id}`} project={active} update={studio.update} audio={audio} onAttach={focusTrack}/> : <p>Create or open a project, then add at least two tracks before comparing versions.</p>}<button type="button" onClick={() => navigate('tracks')}>Return to Tracks</button></div>
      <div id="studio-visualiser" className={view === 'compare' ? 'comparison-player' : ''} hidden={view !== 'visualise' && view !== 'compare'}>
        <div hidden={view !== 'visualise'} className="listening-context"><p>{historical ? `Project track · ${historical.title}${historical.version ? ' · ' + historical.version : ''} · Track creation identity` : 'Standalone session audio · files stay in this browser session'}</p>{historical && <button type="button" onClick={() => navigate(returnView)}>Return to {returnView === 'compare' ? 'Compare' : 'Tracks'}</button>}</div>
        <Visualiser onPlaying={setAudioPlaying} audioBridge={audioBridge} onLibrary={setSessionLibrary} onStandaloneSelect={() => setOpenedTrackId(null)} historicalLabel={historical?.title} previews={visualPreviews} characteristics={historical ? historicalMood?.dimensions ?? null : visualMood?.dimensions ?? null} characterName={historical ? historicalMood?.dominantMood.name ?? null : visualMood?.dominantMood.name ?? null} active={playbackViewActive(view)}/>
      </div>
    </main>
  </div>
}
