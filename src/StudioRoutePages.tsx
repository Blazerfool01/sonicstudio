import type { RefObject, ReactNode, SyntheticEvent } from 'react'
import GenreMixer from './GenreMixer.tsx'
import VocalPersonaBuilder from './VocalPersonaBuilder.tsx'
import MoodMapper from './MoodMapper.tsx'
import Visualiser from './Visualiser.tsx'
import type { VisualiserAudio, VisualiserPlaybackState } from './Visualiser.tsx'
import Timeline from './Timeline.tsx'
import type { TimelineTransport } from './Timeline.tsx'
import ExportPanel from './ExportPanel.tsx'
import PowerActions from './PowerActions.tsx'
import type { CompareSeed, HistoricalDraftRequest, IngredientKind } from './lib/experimentActions.ts'
import ProjectTracks from './ProjectTracks.tsx'
import type { ProjectAudioActions } from './ProjectTracks.tsx'
import ProjectCompare from './ProjectCompare.tsx'
import StudioComposer from './StudioComposer.tsx'
import StatusNotice from './StatusNotice.tsx'
import type { TrackLibrary } from './lib/localTracks.ts'
import type { StudioProjectsController } from './StudioProvider.tsx'
import type { StudioRoute, ProjectTab } from './StudioRouter.tsx'
import type { StudioProject } from './lib/studioProject.ts'
import type { ProjectTrack } from './lib/studioProject.ts'
import type { MusicalCharacteristics } from './lib/visualPersonality.ts'
import type { MoodDna } from './lib/moodDna.ts'
import { StudioHero } from './StudioOverview.tsx'
import DashboardModules from './ReferenceStudioModules.tsx'
import { projectTabUrl } from './StudioRouter.tsx'
import './projectWorkspace.css'

export function DashboardRoutePage({ onOpenTool, onOpenVisualiser }: { onOpenTool: (tool: 'genre' | 'vocal' | 'mood') => void; onOpenVisualiser: () => void }) {
  return <>
    <StudioHero onStart={() => onOpenTool('genre')}/>
    <DashboardModules onOpen={onOpenTool} onOpenVisualiser={onOpenVisualiser}/>
  </>
}

export function GenreMixerRoutePage({ draft, projectEnabled, onUse, onEditorEvent }: {
  draft: HistoricalDraftRequest<'genre'> | null
  projectEnabled: boolean
  onUse: (snapshot: NonNullable<StudioProject['genre']>) => void
  onEditorEvent: (event: SyntheticEvent, kind: 'genre') => void
}) {
  return <div id="studio-tool-genre" className="creative-workspace" onClick={event => onEditorEvent(event, 'genre')} onChange={event => onEditorEvent(event, 'genre')}>
    <GenreMixer historicalDraft={draft} projectEnabled={projectEnabled} onUse={onUse}/>
  </div>
}

export function VocalPersonaRoutePage({ draft, projectEnabled, onUse, onEditorEvent }: {
  draft: HistoricalDraftRequest<'vocal'> | null
  projectEnabled: boolean
  onUse: (snapshot: NonNullable<StudioProject['vocal']>) => void
  onEditorEvent: (event: SyntheticEvent, kind: 'vocal') => void
}) {
  return <div id="studio-tool-vocal" className="creative-workspace" onClick={event => onEditorEvent(event, 'vocal')} onChange={event => onEditorEvent(event, 'vocal')}>
    <VocalPersonaBuilder historicalDraft={draft} projectEnabled={projectEnabled} onUse={onUse}/>
  </div>
}

export function MoodMapperRoutePage({ draft, projectEnabled, onUse, onCharacteristics, onEditorEvent }: {
  draft: HistoricalDraftRequest<'mood'> | null
  projectEnabled: boolean
  onUse: (snapshot: NonNullable<StudioProject['mood']>) => void
  onCharacteristics: (mood: MoodDna | null) => void
  onEditorEvent: (event: SyntheticEvent, kind: 'mood') => void
}) {
  return <div id="studio-tool-mood" className="creative-workspace" onClick={event => onEditorEvent(event, 'mood')} onChange={event => onEditorEvent(event, 'mood')}>
    <MoodMapper historicalDraft={draft} projectEnabled={projectEnabled} onCharacteristics={onCharacteristics} onUse={onUse}/>
  </div>
}

export function ProjectRoutePage({
  tab, navigateTab, onOpenTool, project, studio, audio, selectedTrack, selectTrack, snapshotRequest, timelineTransport,
  compareTrack, reopenSettings, focusTrack, compareSeed, onClearCompareSeed, onVisualise, listeningEntry,
}: {
  tab: ProjectTab
  navigateTab: (tab: ProjectTab) => void
  onOpenTool: (tool: 'genre' | 'vocal' | 'mood') => void
  project: StudioProject | null
  studio: StudioProjectsController
  audio: ProjectAudioActions
  selectedTrack: ProjectTrack | null
  selectTrack: (id: string) => void
  snapshotRequest: string | null
  timelineTransport: TimelineTransport
  compareTrack: (id: string) => void
  reopenSettings: (id: string, kind: IngredientKind) => void
  focusTrack: (id: string) => void
  compareSeed: CompareSeed | null
  onClearCompareSeed: () => void
  onVisualise: () => void
  listeningEntry: ReactNode
}) {
  const tabList: { id: ProjectTab; label: string }[] = [
    { id: 'overview', label: 'Overview' }, { id: 'tracks', label: 'Tracks & arrangement' },
    { id: 'compare', label: 'Compare' }, { id: 'export', label: 'Export' },
  ]

  return <section className="project-workspace" aria-label="Project workspace">
    <nav className="project-workspace-tabs" aria-label="Project workspace sections">
      {tabList.map(item => <a key={item.id} href={projectTabUrl(item.id)} aria-current={tab === item.id ? 'page' : undefined} className={tab === item.id ? 'active' : ''} onClick={event => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
        event.preventDefault()
        navigateTab(item.id)
      }}>{item.label}</a>)}
    </nav>
    {tab === 'overview' && <div className="project-workspace-content">
      <StudioComposer audio={audio} studio={studio} onNavigate={onOpenTool} showIdentity listeningEntry={listeningEntry}/>
      {!project && <StatusNotice tone="empty">Create or open a project to begin.</StatusNotice>}
      {project && <button type="button" className="project-workspace-action" onClick={onVisualise}>Open Visualiser</button>}
    </div>}
    {tab === 'tracks' && <div className="project-workspace-content destination-panel">{project ? <>
      <PowerActions key={`power-${project.id}`} project={project} update={studio.update} onSelectTrack={selectTrack} snapshotRequest={snapshotRequest}/>
      <button type="button" disabled={!selectedTrack} title="Compare selected track (Alt+Shift+C outside text fields)" aria-keyshortcuts="Alt+Shift+C" onClick={() => selectedTrack && compareTrack(selectedTrack.id)}>Compare selected track… <small>Alt+Shift+C</small></button>
      <section className="studio-composer timeline-workspace-region" aria-label="Timeline arrangement workspace">
        <Timeline key={`timeline-${project.id}`} project={project} update={studio.update} selectedTrackId={selectedTrack?.id ?? null} onSelectTrack={selectTrack} transport={timelineTransport} active/>
      </section>
      <ProjectTracks key={`tracks-${project.id}`} project={project} update={studio.update} audio={audio} selectedTrackId={selectedTrack?.id ?? null} onSelectTrack={selectTrack} onCompareTrack={compareTrack} onReopenSettings={reopenSettings}/>
      <button type="button" onClick={() => navigateTab('compare')}>Compare versions</button>
    </> : <StatusNotice tone="empty">Create or open a project to add your first result.</StatusNotice>}</div>}
    {tab === 'compare' && <div className="project-workspace-content destination-panel">{project ? <ProjectCompare key={`compare-${project.id}`} project={project} update={studio.update} audio={audio} onAttach={focusTrack} compareSeed={compareSeed} onClearCompareSeed={onClearCompareSeed}/> : <p>Create or open a project, then add at least two tracks before comparing versions.</p>}<button type="button" onClick={() => navigateTab('tracks')}>Return to Tracks</button></div>}
    {tab === 'export' && <div className="project-workspace-content"><ExportPanel key={project?.id ?? 'no-project'} project={project} active/></div>}
  </section>
}

export function VisualiserRoutePage({ visible, active, onPlaying, onPlaybackState, audioBridge, onLibrary, onStandaloneSelect, historical, returnProjectTab, onReturn, previews, characteristics, characterName, comparison }: {
  visible: boolean
  active: boolean
  onPlaying: (playing: boolean) => void
  onPlaybackState: (state: VisualiserPlaybackState) => void
  audioBridge: RefObject<VisualiserAudio | null>
  onLibrary: (library: TrackLibrary) => void
  onStandaloneSelect: () => void
  historical: ProjectTrack | undefined
  returnProjectTab: 'tracks' | 'compare'
  onReturn: () => void
  previews: readonly { id: string; label: string; characteristics: MusicalCharacteristics }[]
  characteristics: MusicalCharacteristics | null
  characterName: string | null
  comparison: boolean
}) {
  return <Visualiser
    workspace={visible}
    comparison={comparison}
    context={<div hidden={comparison} className="listening-context"><p>{historical ? `Project track · ${historical.title}${historical.version ? ` · ${historical.version}` : ''} · Track creation identity` : 'Standalone session audio · files stay in this browser session'}</p>{historical && <button type="button" onClick={onReturn}>Return to {returnProjectTab === 'compare' ? 'Compare' : 'Tracks'}</button>}</div>}
    onPlaying={onPlaying}
    onPlaybackState={onPlaybackState}
    audioBridge={audioBridge}
    onLibrary={onLibrary}
    onStandaloneSelect={onStandaloneSelect}
    historicalLabel={historical?.title}
    previews={previews}
    characteristics={characteristics}
    characterName={characterName}
    active={active}
  />
}

export function studioRouteTitle(route: StudioRoute, tab: ProjectTab): string {
  if (route === '/dashboard') return 'Studio dashboard'
  if (route === '/genre-mixer') return 'Genre Mixer'
  if (route === '/vocal-persona') return 'Vocal Persona'
  if (route === '/mood-mapper') return 'Mood Mapper'
  if (route === '/visualiser') return 'Visualiser'
  return tab === 'tracks' ? 'Tracks & arrangement' : tab === 'compare' ? 'Compare' : tab === 'export' ? 'Export' : 'Project overview'
}
