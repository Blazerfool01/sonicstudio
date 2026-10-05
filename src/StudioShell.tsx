import { useEffect, useRef, useState } from 'react'
import GenreMixer from './GenreMixer.tsx'
import VocalPersonaBuilder from './VocalPersonaBuilder.tsx'
import MoodMapper from './MoodMapper.tsx'
import Visualiser from './Visualiser.tsx'
import type { VisualiserAudio, VisualiserPlaybackState } from './Visualiser.tsx'
import Timeline from './Timeline.tsx'
import type { TimelineTransport } from './Timeline.tsx'
import ContextRail from './ContextRail.tsx'
import ProjectTracks from './ProjectTracks.tsx'
import type { ProjectAudioActions } from './ProjectTracks.tsx'
import ProjectCompare from './ProjectCompare.tsx'
import StudioComposer from './StudioComposer.tsx'
import { StudioSidebar, StudioTopBar, StudioWorkflowStepper } from './StudioShellParts.tsx'
import StatusNotice from './StatusNotice.tsx'
import useStudioProjects from './useStudioProjects.ts'
import type { TrackLibrary } from './lib/localTracks.ts'
import { deriveMoodDna } from './lib/moodDna.ts'
import type { MoodDna } from './lib/moodDna.ts'
import { getMood } from './data/moods.ts'
import { combineVisualCharacteristics, genreVisualCharacteristics } from './lib/visualPersonality.ts'
import { STUDIO_VIEWS, historicalTrack, playbackViewActive } from './lib/studioNavigation.ts'
import type { StudioView, CreateTool } from './lib/studioNavigation.ts'
import { reconcileProjectTrackSelection, selectProjectTrack, selectedProjectTrack } from './lib/studioInteraction.ts'
import type { ProjectTrackSelection } from './lib/studioInteraction.ts'
import { editProjectTrack } from './lib/studioProject.ts'
const visualPreviews = ['dreamlike', 'aggressive'].map(id => { const mood = getMood(id)!; return { id, label: mood.name, characteristics: mood.profile } })
export default function StudioShell() {
  const studio = useStudioProjects()
  const [visualMood, setVisualMood] = useState<MoodDna | null>(null)
  const [view, setView] = useState<StudioView>('create')
  const [tool, setTool] = useState<CreateTool>('overview')
  const [returnView, setReturnView] = useState<'tracks' | 'compare'>('tracks')
  const [audioPlaying, setAudioPlaying] = useState(false)
  const [playbackSnapshot, setPlaybackSnapshot] = useState<VisualiserPlaybackState>({ localTrackId: null, currentTime: 0, duration: 0, playing: false, ended: false })
  const [openedTrackId, setOpenedTrackId] = useState<string | null>(null)
  const [trackSelection, setTrackSelection] = useState<ProjectTrackSelection | null>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const pendingTrackFocus = useRef<string | null>(null)
  const previousView = useRef(view)
  const audioBridge = useRef<VisualiserAudio>(null)
  const [sessionLibrary, setSessionLibrary] = useState<TrackLibrary>({ tracks: [], selectedId: null })
  const [attachments, setAttachments] = useState<Record<string, string>>({})
  const attachmentsRef = useRef(attachments)
  useEffect(() => { audioBridge.current?.pause(); setOpenedTrackId(null); setReturnView('tracks'); setVisualMood(null) }, [studio.state.activeId])
  useEffect(() => { setTrackSelection(current => reconcileProjectTrackSelection(studio.active, current)) }, [studio.active])
  useEffect(() => {
    if (previousView.current === view) return
    previousView.current = view
    requestAnimationFrame(() => {
      const requestedTrack = pendingTrackFocus.current
      pendingTrackFocus.current = null
      if (requestedTrack && view === 'tracks') {
        document.getElementById(`project-track-${requestedTrack}`)?.scrollIntoView({ block: 'start' })
        document.querySelector<HTMLInputElement>(`[id="project-track-${CSS.escape(requestedTrack)}"] input[type="file"]`)?.focus({ preventScroll: true })
      } else headingRef.current?.focus()
    })
  }, [view])
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
  const selectedTrack = selectedProjectTrack(studio.active, trackSelection)
  function selectTrack(id: string) { setTrackSelection(selectProjectTrack(studio.active, id)) }
  const historicalMood = historical?.creationSnapshot.mood ? deriveMoodDna(historical.creationSnapshot.mood.selections) : null
  const currentMood = visualMood ?? (studio.active?.mood ? deriveMoodDna(studio.active.mood.selections) : null)
  const currentGenre = genreVisualCharacteristics(studio.active?.genre)
  const historicalGenre = genreVisualCharacteristics(historical?.creationSnapshot.genre)
  const currentCharacteristics = combineVisualCharacteristics(currentGenre, currentMood?.dimensions)
  const historicalCharacteristics = combineVisualCharacteristics(historicalGenre, historicalMood?.dimensions)
  const currentCharacterName = [studio.active?.genre?.label.replace(/ \(current mix\)$/, ''), currentMood?.dominantMood.name].filter(Boolean).join(' · ') || null
  const historicalCharacterName = [historical?.creationSnapshot.genre?.label.replace(/ \(current mix\)$/, ''), historicalMood?.dominantMood.name].filter(Boolean).join(' · ') || null
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
  function navigate(next: StudioView) {
    pendingTrackFocus.current = null
    if (next === 'tracks' && view !== 'tracks') audioBridge.current?.pause()
    setView(next)
  }
  function focusTrack(id: string) {
    selectTrack(id)
    pendingTrackFocus.current = id
    if (view === 'tracks') {
      requestAnimationFrame(() => {
        pendingTrackFocus.current = null
        document.getElementById(`project-track-${id}`)?.scrollIntoView({ block: 'start' })
        document.querySelector<HTMLInputElement>(`[id="project-track-${CSS.escape(id)}"] input[type="file"]`)?.focus({ preventScroll: true })
      })
    } else {
      audioBridge.current?.pause()
      setView('tracks')
    }
  }
  const active = studio.active
  const transportProjectTrackId = active && openedTrackId && attachments[openedTrackId] === playbackSnapshot.localTrackId && active.tracks.some(track => track.id === openedTrackId)
    ? openedTrackId
    : null
  const timelineTransport: TimelineTransport = {
    state: {
      projectTrackId: transportProjectTrackId,
      currentTime: playbackSnapshot.currentTime,
      duration: playbackSnapshot.duration,
      playing: playbackSnapshot.playing,
      ended: playbackSnapshot.ended,
    },
    isTrackAttached: id => {
      const localId = attachments[id]
      return Boolean(localId && sessionLibrary.tracks.some(track => track.id === localId))
    },
    play: (id, sourcePosition) => {
      const localId = attachments[id]
      if (!active?.tracks.some(track => track.id === id) || !localId || !sessionLibrary.tracks.some(track => track.id === localId) || !audioBridge.current) return false
      setOpenedTrackId(id)
      setSessionLibrary(current => ({ ...current, selectedId: localId }))
      selectTrack(id)
      audioBridge.current.playAt(localId, sourcePosition)
      return true
    },
    select: (id, sourcePosition) => {
      const localId = attachments[id]
      if (!active?.tracks.some(track => track.id === id) || !localId || !sessionLibrary.tracks.some(track => track.id === localId)) return
      setOpenedTrackId(id)
      setSessionLibrary(current => ({ ...current, selectedId: localId }))
      selectTrack(id)
      audioBridge.current?.chooseAt(localId, sourcePosition)
    },
    seek: sourcePosition => audioBridge.current?.seek(sourcePosition),
    pause: () => audioBridge.current?.pause(),
  }
  return <div className="studio-shell">
    <StudioTopBar active={active ?? null} projects={studio.state.projects} onSwitchProject={id => studio.save(studio.state.projects, id, id ? 'Project opened.' : 'No active project.')}/>
    <div className="studio-shell-layout">
      <StudioSidebar view={view} onNavigate={navigate}/>
      <main className="workflow-content">
      {view === 'create' && <button type="button" className={`studio-create-overview${tool === 'overview' ? ' active' : ''}`} aria-current={tool === 'overview' ? 'page' : undefined} onClick={() => setTool('overview')}>Identity &amp; Brief</button>}
      <StudioWorkflowStepper view={view} tool={tool} onOpenTool={openTool} onNavigate={navigate}/>
      <h1 ref={headingRef} tabIndex={-1}>{STUDIO_VIEWS.find(item => item.id === view)!.label}</h1>
      <p className="project-context"><strong>{active?.name ?? 'No active project'}</strong>{active && <span> · {active.tracks.length} tracks · {active.comparisons.length} comparisons · {['genre', 'vocal', 'mood'].filter(k => active[k as 'genre' | 'vocal' | 'mood']).length}/3 ingredients</span>}</p>
      <StatusNotice tone={studio.message.includes('unavailable') ? 'warning' : 'success'} className="studio-project-notice">{studio.message}</StatusNotice>
      <StudioComposer audio={audio} studio={studio} onNavigate={openTool} showIdentity={view === 'create' && tool === 'overview'}/>
      <div hidden={view !== 'create'}>
        <div hidden={tool !== 'overview'} className="workflow-next"><p>Attach each ingredient explicitly, then use your Creation Brief to make music in your own workflow.</p><button type="button" onClick={() => navigate('tracks')}>Go to Tracks</button></div>
        <div id="studio-tool-genre" hidden={tool !== 'genre'}><GenreMixer projectEnabled={!!active} onUse={snapshot => studio.attach('genre', snapshot)}/></div>
        <div id="studio-tool-vocal" hidden={tool !== 'vocal'}><VocalPersonaBuilder projectEnabled={!!active} onUse={snapshot => studio.attach('vocal', snapshot)}/></div>
        <div id="studio-tool-mood" hidden={tool !== 'mood'}><MoodMapper onCharacteristics={setVisualMood} projectEnabled={!!active} onUse={snapshot => studio.attach('mood', snapshot)}/></div>
      </div>
      <div hidden={view !== 'tracks'} className="studio-composer destination-panel">{active ? <>
        <ProjectTracks key={`tracks-${active.id}`} project={active} update={studio.update} audio={audio} selectedTrackId={selectedTrack?.id ?? null} onSelectTrack={selectTrack}/>
        <button type="button" onClick={() => navigate('compare')}>Compare versions</button>
        <section className="studio-composer timeline-workspace-region" aria-label="Timeline arrangement workspace">
          <Timeline key={`timeline-${active.id}`} project={active} update={studio.update} selectedTrackId={selectedTrack?.id ?? null} onSelectTrack={selectTrack} transport={timelineTransport} active={view === 'tracks'}/>
        </section>
      </> : <StatusNotice tone="empty">Create or open a project to add your first result.</StatusNotice>}</div>
      <div hidden={view !== 'compare'} className="studio-composer destination-panel">{active ? <ProjectCompare key={`compare-${active.id}`} project={active} update={studio.update} audio={audio} onAttach={focusTrack}/> : <p>Create or open a project, then add at least two tracks before comparing versions.</p>}<button type="button" onClick={() => navigate('tracks')}>Return to Tracks</button></div>
      <div id="studio-visualiser" className={view === 'compare' ? 'comparison-player' : ''} hidden={view !== 'visualise' && view !== 'compare'}>
        <div hidden={view !== 'visualise'} className="listening-context"><p>{historical ? `Project track · ${historical.title}${historical.version ? ' · ' + historical.version : ''} · Track creation identity` : 'Standalone session audio · files stay in this browser session'}</p>{historical && <button type="button" onClick={() => navigate(returnView)}>Return to {returnView === 'compare' ? 'Compare' : 'Tracks'}</button>}</div>
        <Visualiser onPlaying={setAudioPlaying} onPlaybackState={setPlaybackSnapshot} audioBridge={audioBridge} onLibrary={setSessionLibrary} onStandaloneSelect={() => setOpenedTrackId(null)} historicalLabel={historical?.title} previews={visualPreviews} characteristics={historical ? historicalCharacteristics : currentCharacteristics} characterName={historical ? historicalCharacterName : currentCharacterName} active={playbackViewActive(view) || view === 'tracks'}/>
      </div>
      </main>
      <ContextRail
        project={active ?? null}
        selection={trackSelection}
        statusMessage={studio.message}
        onProjectNotesChange={notes => active && studio.update({ ...active, notes, updatedAt: new Date().toISOString() })}
        onSaveTrackNotes={(id, notes) => active && studio.update(editProjectTrack(active, id, { notes }))}
        onOpenIngredient={openTool}
      />
    </div>
  </div>
}
