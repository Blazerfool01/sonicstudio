import { useCallback, useEffect, useRef } from 'react'
import type { SyntheticEvent } from 'react'
import ContextRail from './ContextRail.tsx'
import FeedbackToast from './FeedbackToast.tsx'
import MotionSidePanel from './MotionSidePanel.tsx'
import StatusNotice from './StatusNotice.tsx'
import { DashboardRail } from './ReferenceContextRail.tsx'
import type { RailTab } from './ReferenceContextRail.tsx'
import { StudioSidebar, StudioTopBar, StudioWorkflowStepper, studioStatus } from './StudioShellParts.tsx'
import useReferenceMotion from './useReferenceMotion.ts'
import { useStudioState } from './StudioProvider.tsx'
import { useStudioRouter, projectTabFromSearch, projectTabUrl } from './StudioRouter.tsx'
import type { ProjectTab, StudioRoute } from './StudioRouter.tsx'
import type { ProjectAudioActions } from './ProjectTracks.tsx'
import type { TimelineTransport } from './Timeline.tsx'
import type { IngredientKind } from './lib/experimentActions.ts'
import { createCompareSeed, historicalDraft, shortcutAction } from './lib/experimentActions.ts'
import { editProjectTrack } from './lib/studioProject.ts'
import { StudioListeningEntry } from './StudioOverview.tsx'
import { DashboardRoutePage, GenreMixerRoutePage, MoodMapperRoutePage, ProjectRoutePage, studioRouteTitle, VisualiserRoutePage, VocalPersonaRoutePage } from './StudioRoutePages.tsx'
import { getMood } from './data/moods.ts'

const visualPreviews = ['dreamlike', 'aggressive'].map(id => { const mood = getMood(id)!; return { id, label: mood.name, characteristics: mood.profile } })
const toolRoutes: Record<'genre' | 'vocal' | 'mood', StudioRoute> = {
  genre: '/genre-mixer', vocal: '/vocal-persona', mood: '/mood-mapper',
}

export default function StudioLayout() {
  const motion = useReferenceMotion()
  const shared = useStudioState()
  const { pathname, search, navigate } = useStudioRouter()
  const projectTab = projectTabFromSearch(search)
  const { studio, audioBridge, attachments, sessionLibrary } = shared
  const active = studio.active
  const dashboard = pathname === '/dashboard'
  const fullFocus = pathname === '/visualiser'
  const headingRef = useRef<HTMLHeadingElement>(null)
  const pendingTrackFocus = useRef<string | null>(null)
  const pendingSnapshotFocus = useRef(false)
  const previousUrl = useRef(`${pathname}${search}`)
  const contextToggle = useRef<(() => void) | null>(null)
  const registerContextToggle = useCallback((toggle: (() => void) | null) => { contextToggle.current = toggle }, [])

  useEffect(() => {
    const currentUrl = `${pathname}${search}`
    if (previousUrl.current === currentUrl) return
    previousUrl.current = currentUrl
    requestAnimationFrame(() => {
      const requestedTrack = pendingTrackFocus.current
      pendingTrackFocus.current = null
      if (pendingSnapshotFocus.current && pathname === '/project' && projectTab === 'tracks') {
        pendingSnapshotFocus.current = false
        document.querySelector<HTMLInputElement>('.power-actions input[aria-label="Snapshot title"]')?.focus()
      } else if (requestedTrack && pathname === '/project' && projectTab === 'tracks') {
        document.getElementById(`project-track-${requestedTrack}`)?.scrollIntoView({ block: 'start' })
        document.querySelector<HTMLInputElement>(`[id="project-track-${CSS.escape(requestedTrack)}"] input[type="file"]`)?.focus({ preventScroll: true })
      } else if (dashboard) {
        document.querySelector<HTMLElement>('.workflow-content h1')?.focus()
      } else headingRef.current?.focus()
    })
  }, [pathname, search, projectTab, dashboard])

  function routeTransition(to: string, visualiserTransition = false) {
    pendingTrackFocus.current = null
    if ((to === projectTabUrl('tracks') || to === '/project') && pathname === '/visualiser') audioBridge.current?.pause()
    motion.changeScene(() => navigate(to), visualiserTransition || fullFocus || to === '/visualiser')
  }

  function navigateToTool(tool: 'genre' | 'vocal' | 'mood') {
    motion.echo(tool)
    routeTransition(toolRoutes[tool], fullFocus)
  }

  function openProjectTab(tab: ProjectTab) {
    if (tab === 'tracks' && (pathname === '/visualiser' || shared.audioPlaying)) audioBridge.current?.pause()
    routeTransition(projectTabUrl(tab), false)
  }

  function openExportPanel() { openProjectTab('export') }

  function revealContextPanel() {
    if (motion.root.current?.querySelector('.motion-rail[data-collapsed="true"]')) contextToggle.current?.()
  }

  function openRailSection(tab: RailTab) {
    revealContextPanel()
    shared.setRailTab(tab)
    shared.setSettingsExpanded(false)
    routeTransition('/dashboard', fullFocus)
  }

  function openSettings() {
    revealContextPanel()
    shared.setSettingsExpanded(true)
    openProjectTab('export')
  }

  function compareTrack(id: string) {
    if (!active?.tracks.some(track => track.id === id)) return
    shared.setCompareSeed(createCompareSeed(active, id))
    openProjectTab('compare')
  }

  function reopenSettings(id: string, kind: IngredientKind) {
    if (!active?.tracks.find(track => track.id === id)?.creationSnapshot[kind]) return
    if (kind === 'genre') shared.setGenreDraft(historicalDraft(active, id, 'genre'))
    if (kind === 'vocal') shared.setVocalDraft(historicalDraft(active, id, 'vocal'))
    if (kind === 'mood') shared.setMoodDraft(historicalDraft(active, id, 'mood'))
    navigateToTool(kind)
  }

  function focusTrack(id: string) {
    shared.selectTrack(id)
    pendingTrackFocus.current = id
    if (pathname === '/project' && projectTab === 'tracks') {
      requestAnimationFrame(() => {
        pendingTrackFocus.current = null
        document.getElementById(`project-track-${id}`)?.scrollIntoView({ block: 'start' })
        document.querySelector<HTMLInputElement>(`[id="project-track-${CSS.escape(id)}"] input[type="file"]`)?.focus({ preventScroll: true })
      })
    } else {
      audioBridge.current?.pause()
      openProjectTab('tracks')
    }
  }

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      const action = shortcutAction(event)
      if (action === 'snapshot' && active) {
        event.preventDefault()
        pendingSnapshotFocus.current = !(pathname === '/project' && projectTab === 'tracks')
        shared.setSnapshotRequest(crypto.randomUUID())
        openProjectTab('tracks')
      } else if (action === 'compare' && shared.selectedTrack) {
        event.preventDefault()
        compareTrack(shared.selectedTrack.id)
      }
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [active, shared.selectedTrack, pathname, projectTab])

  const historical = shared.historical
  const audio: ProjectAudioActions = {
    currentTrackId: historical?.id ?? null,
    playing: shared.audioPlaying,
    play: id => {
      const localId = attachments[id]
      if (!localId || !sessionLibrary.tracks.some(track => track.id === localId)) return
      shared.setOpenedTrackId(id)
      shared.setSessionLibrary(current => ({ ...current, selectedId: localId }))
      audioBridge.current?.play(localId, true)
    },
    pause: () => audioBridge.current?.pause(),
    localTracks: sessionLibrary.tracks,
    attached: id => sessionLibrary.tracks.some(track => track.id === attachments[id]),
    attach: (id, file) => {
      if (!audioBridge.current) throw new Error('Audio player is unavailable.')
      const local = audioBridge.current.importFile(file)
      shared.release(id)
      shared.setAttachment(id, local.id)
      return local
    },
    useLocal: (id, local) => {
      if (attachments[id] !== local.id) shared.release(id)
      shared.setAttachment(id, local.id)
    },
    release: shared.release,
    open: id => {
      const localId = attachments[id]
      if (!localId) return
      shared.setOpenedTrackId(id)
      shared.setSessionLibrary(current => ({ ...current, selectedId: localId }))
      audioBridge.current?.choose(localId)
      shared.setReturnProjectTab(projectTab === 'compare' ? 'compare' : 'tracks')
      routeTransition('/visualiser', true)
    },
  }

  const timelineTransport: TimelineTransport = {
    state: {
      projectTrackId: active && shared.openedTrackId && attachments[shared.openedTrackId] === shared.playbackSnapshot.localTrackId && active.tracks.some(track => track.id === shared.openedTrackId) ? shared.openedTrackId : null,
      currentTime: shared.playbackSnapshot.currentTime,
      duration: shared.playbackSnapshot.duration,
      playing: shared.playbackSnapshot.playing,
      ended: shared.playbackSnapshot.ended,
    },
    isTrackAttached: id => {
      const localId = attachments[id]
      return Boolean(localId && sessionLibrary.tracks.some(track => track.id === localId))
    },
    play: (id, sourcePosition) => {
      const localId = attachments[id]
      if (!active?.tracks.some(track => track.id === id) || !localId || !sessionLibrary.tracks.some(track => track.id === localId) || !audioBridge.current) return false
      shared.setOpenedTrackId(id)
      shared.setSessionLibrary(current => ({ ...current, selectedId: localId }))
      shared.selectTrack(id)
      audioBridge.current.playAt(localId, sourcePosition)
      return true
    },
    select: (id, sourcePosition) => {
      const localId = attachments[id]
      if (!active?.tracks.some(track => track.id === id) || !localId || !sessionLibrary.tracks.some(track => track.id === localId)) return
      shared.setOpenedTrackId(id)
      shared.setSessionLibrary(current => ({ ...current, selectedId: localId }))
      shared.selectTrack(id)
      audioBridge.current?.chooseAt(localId, sourcePosition)
    },
    seek: sourcePosition => audioBridge.current?.seek(sourcePosition),
    pause: () => audioBridge.current?.pause(),
  }

  const openVisualiser = () => routeTransition('/visualiser', true)
  const listeningEntry = <StudioListeningEntry trackCount={sessionLibrary.tracks.length} onVisualise={openVisualiser}/>
  const visualiserVisible = fullFocus || (pathname === '/project' && projectTab === 'compare')
  const visualiserActive = fullFocus || (pathname === '/project' && (projectTab === 'tracks' || projectTab === 'compare'))
  const title = studioRouteTitle(pathname, projectTab)

  return <div ref={motion.root} className="studio-shell reference-motion" data-project-state={active ? 'active' : 'empty'} data-dashboard={dashboard} data-layout-motion={motion.layoutMotion} data-focus-shift={motion.focusShift} data-full-focus={fullFocus}>
    <FeedbackToast message={studio.message} eventKey={studio.state} active={dashboard} tone={studio.message.includes('unavailable') ? 'warning' : 'success'}/>
    <div className="studio-shell-layout" onPointerMove={motion.magnetic} onPointerLeave={motion.resetMagnetic}>
      <StudioTopBar active={active ?? null} projects={studio.state.projects} onSwitchProject={id => studio.save(studio.state.projects, id, id ? 'Project opened.' : 'No active project.')} onToggleContext={() => contextToggle.current?.()}/>
      <MotionSidePanel onResize={() => motion.setLayoutMotion('collapse')} side="navigation" fullFocus={fullFocus} onFocusPanel={() => {}}>
        <div onClickCapture={() => motion.setFocusShift(true)}><StudioSidebar pathname={pathname} search={search} status={studioStatus(active, studio.message)} onNavigate={routeTransition} onOpenSettings={openSettings} onOpenHelp={() => openRailSection('guidance')}/></div>
      </MotionSidePanel>
      <main onPointerDown={() => motion.setFocusShift(false)} onFocusCapture={event => { if (event.target !== headingRef.current) motion.setFocusShift(false) }} className={`workflow-content${dashboard ? ' studio-overview-workspace' : ''}${pathname === '/project' ? ' project-route-workspace' : ''}`}>
        <h1 ref={headingRef} tabIndex={-1} className={dashboard ? 'sr-only' : undefined}>{title}</h1>
        {!dashboard && <p className="project-context"><strong>{active?.name ?? 'No active project'}</strong>{active && <span> · {active.tracks.length} tracks · {active.comparisons.length} comparisons · {['genre', 'vocal', 'mood'].filter(kind => active[kind as 'genre' | 'vocal' | 'mood']).length}/3 ingredients</span>}</p>}
        {!dashboard && <StatusNotice tone={studio.message.includes('unavailable') ? 'warning' : 'success'} className="studio-project-notice">{studio.message}</StatusNotice>}
        {!dashboard && pathname !== '/project' && <StudioWorkflowStepper pathname={pathname} projectTab={projectTab} onNavigate={routeTransition}/>}
        {dashboard && <DashboardRoutePage onOpenTool={navigateToTool} onOpenVisualiser={openVisualiser}/>}
        {pathname === '/genre-mixer' && <GenreMixerRoutePage draft={shared.genreDraft?.projectId === active?.id ? shared.genreDraft : null} projectEnabled={!!active} onUse={snapshot => { studio.attach('genre', snapshot); motion.echo('genre', true) }} onEditorEvent={(event: SyntheticEvent, kind) => motion.selectFromEditor(event, kind)}/>}
        {pathname === '/vocal-persona' && <VocalPersonaRoutePage draft={shared.vocalDraft?.projectId === active?.id ? shared.vocalDraft : null} projectEnabled={!!active} onUse={snapshot => { studio.attach('vocal', snapshot); motion.echo('vocal', true) }} onEditorEvent={(event: SyntheticEvent, kind) => motion.selectFromEditor(event, kind)}/>}
        {pathname === '/mood-mapper' && <MoodMapperRoutePage draft={shared.moodDraft?.projectId === active?.id ? shared.moodDraft : null} projectEnabled={!!active} onUse={snapshot => { studio.attach('mood', snapshot); motion.echo('mood', true) }} onCharacteristics={shared.setVisualMood} onEditorEvent={(event: SyntheticEvent, kind) => motion.selectFromEditor(event, kind)}/>}
        {pathname === '/project' && <ProjectRoutePage
          tab={projectTab} navigateTab={openProjectTab} onOpenTool={navigateToTool} project={active} studio={studio} audio={audio}
          selectedTrack={shared.selectedTrack} selectTrack={shared.selectTrack} snapshotRequest={shared.snapshotRequest} timelineTransport={timelineTransport}
          compareTrack={compareTrack} reopenSettings={reopenSettings} focusTrack={focusTrack} compareSeed={shared.compareSeed}
          onClearCompareSeed={() => shared.setCompareSeed(null)} onVisualise={openVisualiser} listeningEntry={listeningEntry}/ >}
        <VisualiserRoutePage visible={visualiserVisible} active={visualiserActive} onPlaying={shared.setAudioPlaying} onPlaybackState={shared.setPlaybackSnapshot} audioBridge={audioBridge} onLibrary={shared.setSessionLibrary} onStandaloneSelect={() => shared.setOpenedTrackId(null)} historical={historical} returnProjectTab={shared.returnProjectTab} onReturn={() => openProjectTab(shared.returnProjectTab)} previews={visualPreviews} characteristics={historical ? shared.historicalCharacteristics : shared.currentCharacteristics} characterName={historical ? shared.historicalCharacterName : shared.currentCharacterName} comparison={pathname === '/project' && projectTab === 'compare'}/>
      </main>
      <MotionSidePanel onResize={() => motion.setLayoutMotion('collapse')} side="rail" fullFocus={fullFocus} onFocusPanel={() => motion.setFocusShift(false)} onRegisterToggle={registerContextToggle}>
        {dashboard && active ? <DashboardRail project={active} onOpen={navigateToTool} onOpenVisualiser={openVisualiser} onOpenTrack={focusTrack} selectedTrackId={shared.selectedTrack?.id ?? null} tab={shared.railTab} onTab={shared.setRailTab} statusMessage={studio.message} onExport={openExportPanel} onSave={() => studio.update(active)} settingsExpanded={shared.settingsExpanded} onSettingsExpandedChange={shared.setSettingsExpanded}/> : <ContextRail
          follow={motion.follow} project={active ?? null} selection={shared.trackSelection} statusMessage={studio.message}
          onProjectNotesChange={notes => active && studio.update({ ...active, notes, updatedAt: new Date().toISOString() })}
          onSaveTrackNotes={(id, notes) => active && studio.update(editProjectTrack(active, id, { notes }))}
          onOpenIngredient={navigateToTool}
        />}
      </MotionSidePanel>
      <svg className="motion-energy" viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="motion-energy-gradient"><stop stopColor="#39d7e8"/><stop offset="1" stopColor="#d559ec"/></linearGradient></defs><path d="M 0 50 C 180 0 270 100 430 50 S 760 0 1000 50" pathLength="1"/></svg>
    </div>
  </div>
}
