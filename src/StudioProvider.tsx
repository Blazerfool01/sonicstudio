import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { Dispatch, ReactNode, RefObject, SetStateAction } from 'react'
import useStudioProjects from './useStudioProjects.ts'
import type { TrackLibrary } from './lib/localTracks.ts'
import type { MoodDna } from './lib/moodDna.ts'
import type { CompareSeed, HistoricalDraftRequest } from './lib/experimentActions.ts'
import type { ProjectTrackSelection } from './lib/studioInteraction.ts'
import type { VisualiserAudio, VisualiserPlaybackState } from './Visualiser.tsx'
import { reconcileProjectTrackSelection, selectProjectTrack, selectedProjectTrack } from './lib/studioInteraction.ts'
import type { ProjectTrack } from './lib/studioProject.ts'
import { historicalTrack } from './lib/studioNavigation.ts'
import { deriveMoodDna } from './lib/moodDna.ts'
import { combineVisualCharacteristics, genreVisualCharacteristics } from './lib/visualPersonality.ts'

export type StudioProjectsController = ReturnType<typeof useStudioProjects>
type StudioState = {
  studio: StudioProjectsController
  visualMood: MoodDna | null
  setVisualMood: (mood: MoodDna | null) => void
  railTab: 'project' | 'track' | 'guidance' | 'presets'
  setRailTab: (tab: 'project' | 'track' | 'guidance' | 'presets') => void
  settingsExpanded: boolean
  setSettingsExpanded: (expanded: boolean) => void
  returnProjectTab: 'tracks' | 'compare'
  setReturnProjectTab: (tab: 'tracks' | 'compare') => void
  audioPlaying: boolean
  setAudioPlaying: (playing: boolean) => void
  playbackSnapshot: VisualiserPlaybackState
  setPlaybackSnapshot: (state: VisualiserPlaybackState) => void
  openedTrackId: string | null
  setOpenedTrackId: (id: string | null) => void
  trackSelection: ProjectTrackSelection | null
  setTrackSelection: (selection: ProjectTrackSelection | null) => void
  compareSeed: CompareSeed | null
  setCompareSeed: (seed: CompareSeed | null) => void
  snapshotRequest: string | null
  setSnapshotRequest: (id: string | null) => void
  genreDraft: HistoricalDraftRequest<'genre'> | null
  setGenreDraft: (draft: HistoricalDraftRequest<'genre'> | null) => void
  vocalDraft: HistoricalDraftRequest<'vocal'> | null
  setVocalDraft: (draft: HistoricalDraftRequest<'vocal'> | null) => void
  moodDraft: HistoricalDraftRequest<'mood'> | null
  setMoodDraft: (draft: HistoricalDraftRequest<'mood'> | null) => void
  audioBridge: RefObject<VisualiserAudio | null>
  sessionLibrary: TrackLibrary
  setSessionLibrary: (library: TrackLibrary | ((current: TrackLibrary) => TrackLibrary)) => void
  attachments: Record<string, string>
  setAttachment: (projectTrackId: string, localTrackId: string | null) => void
  release: (projectTrackId: string) => void
  selectedTrack: ProjectTrack | null
  historical: ReturnType<typeof historicalTrack> | undefined
  currentMood: MoodDna | null
  currentCharacteristics: ReturnType<typeof combineVisualCharacteristics>
  historicalCharacteristics: ReturnType<typeof combineVisualCharacteristics>
  currentCharacterName: string | null
  historicalCharacterName: string | null
  selectTrack: (id: string) => void
  workspaceDrafts: Record<string, unknown>
  updateWorkspaceDraft: (key: string, value: unknown) => void
}

const StudioContext = createContext<StudioState | null>(null)

export function StudioProvider({ children }: { children: ReactNode }) {
  const studio = useStudioProjects()
  const [visualMood, setVisualMood] = useState<MoodDna | null>(null)
  const [railTab, setRailTab] = useState<StudioState['railTab']>('project')
  const [settingsExpanded, setSettingsExpanded] = useState(false)
  const [returnProjectTab, setReturnProjectTab] = useState<'tracks' | 'compare'>('tracks')
  const [audioPlaying, setAudioPlaying] = useState(false)
  const [playbackSnapshot, setPlaybackSnapshot] = useState<VisualiserPlaybackState>({ localTrackId: null, currentTime: 0, duration: 0, playing: false, ended: false })
  const [openedTrackId, setOpenedTrackId] = useState<string | null>(null)
  const [trackSelection, setTrackSelection] = useState<ProjectTrackSelection | null>(null)
  const [compareSeed, setCompareSeed] = useState<CompareSeed | null>(null)
  const [snapshotRequest, setSnapshotRequest] = useState<string | null>(null)
  const [genreDraft, setGenreDraft] = useState<HistoricalDraftRequest<'genre'> | null>(null)
  const [vocalDraft, setVocalDraft] = useState<HistoricalDraftRequest<'vocal'> | null>(null)
  const [moodDraft, setMoodDraft] = useState<HistoricalDraftRequest<'mood'> | null>(null)
  const audioBridge = useRef<VisualiserAudio>(null)
  const [sessionLibrary, setSessionLibrary] = useState<TrackLibrary>({ tracks: [], selectedId: null })
  const [attachments, setAttachments] = useState<Record<string, string>>({})
  const attachmentsRef = useRef(attachments)
  const [workspaceDrafts, setWorkspaceDrafts] = useState<Record<string, unknown>>({})

  useEffect(() => { audioBridge.current?.pause(); setOpenedTrackId(null); setReturnProjectTab('tracks'); setVisualMood(null) }, [studio.state.activeId])
  useEffect(() => { setCompareSeed(null); setSnapshotRequest(null); setGenreDraft(null); setVocalDraft(null); setMoodDraft(null) }, [studio.state.activeId])
  useEffect(() => { setTrackSelection(current => reconcileProjectTrackSelection(studio.active, current)) }, [studio.active])

  function setAttachment(projectTrackId: string, localTrackId: string | null) {
    const next = { ...attachmentsRef.current }
    if (localTrackId) next[projectTrackId] = localTrackId
    else delete next[projectTrackId]
    attachmentsRef.current = next
    setAttachments(next)
  }

  function release(projectTrackId: string) {
    const localTrackId = attachmentsRef.current[projectTrackId]
    setAttachment(projectTrackId, null)
    if (localTrackId && !Object.values(attachmentsRef.current).includes(localTrackId)) audioBridge.current?.remove(localTrackId)
  }

  const historical = historicalTrack(studio.state.projects.flatMap(project => project.tracks), openedTrackId, attachments, sessionLibrary.selectedId)
  const selectedTrack = selectedProjectTrack(studio.active, trackSelection)
  const historicalMood = historical?.creationSnapshot.mood ? deriveMoodDna(historical.creationSnapshot.mood.selections) : null
  const currentMood = visualMood ?? (studio.active?.mood ? deriveMoodDna(studio.active.mood.selections) : null)
  const currentGenre = genreVisualCharacteristics(studio.active?.genre)
  const historicalGenre = genreVisualCharacteristics(historical?.creationSnapshot.genre)
  const currentCharacteristics = combineVisualCharacteristics(currentGenre, currentMood?.dimensions)
  const historicalCharacteristics = combineVisualCharacteristics(historicalGenre, historicalMood?.dimensions)
  const currentCharacterName = [studio.active?.genre?.label.replace(/ \(current mix\)$/, ''), currentMood?.dominantMood.name].filter(Boolean).join(' · ') || null
  const historicalCharacterName = [historical?.creationSnapshot.genre?.label.replace(/ \(current mix\)$/, ''), historicalMood?.dominantMood.name].filter(Boolean).join(' · ') || null

  function selectTrack(id: string) { setTrackSelection(selectProjectTrack(studio.active, id)) }

  const updateWorkspaceDraft = useCallback((key: string, value: unknown) => {
    setWorkspaceDrafts(current => Object.is(current[key], value) ? current : { ...current, [key]: value })
  }, [])

  return <StudioContext.Provider value={{
    studio, visualMood, setVisualMood, railTab, setRailTab, settingsExpanded, setSettingsExpanded,
    returnProjectTab, setReturnProjectTab, audioPlaying, setAudioPlaying, playbackSnapshot, setPlaybackSnapshot,
    openedTrackId, setOpenedTrackId, trackSelection, setTrackSelection, compareSeed, setCompareSeed,
    snapshotRequest, setSnapshotRequest, genreDraft, setGenreDraft, vocalDraft, setVocalDraft, moodDraft, setMoodDraft,
    audioBridge, sessionLibrary, setSessionLibrary, attachments, setAttachment, release, selectedTrack, historical,
    currentMood, currentCharacteristics, historicalCharacteristics, currentCharacterName, historicalCharacterName, selectTrack,
    workspaceDrafts, updateWorkspaceDraft,
  }}>{children}</StudioContext.Provider>
}

export function useStudioDraftState<T>(key: string, initialValue: T | (() => T)): [T, Dispatch<SetStateAction<T>>] {
  const state = useContext(StudioContext)
  if (!state) throw new Error('useStudioDraftState must be used inside StudioProvider.')
  const saved = state.workspaceDrafts[key]
  const [value, setValue] = useState<T>(() => saved === undefined ? (typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue) : saved as T)
  const valueRef = useRef(value)
  valueRef.current = value
  const setSharedValue = useCallback<Dispatch<SetStateAction<T>>>(nextOrUpdater => {
    const next = typeof nextOrUpdater === 'function' ? (nextOrUpdater as (current: T) => T)(valueRef.current) : nextOrUpdater
    valueRef.current = next
    state.updateWorkspaceDraft(key, next)
    setValue(next)
  }, [key, state.updateWorkspaceDraft])
  return [value, setSharedValue]
}

export function useStudioState() {
  const state = useContext(StudioContext)
  if (!state) throw new Error('useStudioState must be used inside StudioProvider.')
  return state
}
