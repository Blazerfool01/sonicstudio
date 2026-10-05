import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import type { StudioProject } from './lib/studioProject.ts'
import {
  activeTimelineClipAt, addTimelineClip, eligibleTimelineClips, moveTimelineClip,
  nextEligibleTimelineClip, orderedTimelineClips, reconcileTimelineSelection,
  removeTimelineClip, setTimelineClipFlag, timelineClipEnd, trimTimelineClip,
} from './lib/studioTimeline.ts'
import type { TimelineClip } from './lib/studioTimeline.ts'
import './timeline.css'

export type TimelineTransportState = {
  projectTrackId: string | null
  currentTime: number
  duration: number
  playing: boolean
  ended: boolean
}

/** The shell maps project-track IDs to the existing Visualiser/session-audio owner. */
export type TimelineTransport = {
  state: TimelineTransportState
  isTrackAttached: (projectTrackId: string) => boolean
  play: (projectTrackId: string, sourcePosition: number) => boolean | void
  select: (projectTrackId: string, sourcePosition: number) => void
  seek: (sourcePosition: number) => void
  pause: () => void
}

type Props = {
  project: StudioProject
  update: (project: StudioProject) => void
  selectedTrackId: string | null
  onSelectTrack: (trackId: string) => void
  transport?: TimelineTransport
  active?: boolean
}

const PIXELS_PER_SECOND = 10
const MIN_TIMELINE_SECONDS = 60
const formatTime = (seconds: number) => {
  const safe = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`
}

function writeTimeline(project: StudioProject, update: Props['update'], timeline: TimelineClip[]) {
  update({ ...project, timeline, updatedAt: new Date().toISOString() })
}

export default function Timeline({ project, update, selectedTrackId, onSelectTrack, transport, active = true }: Props) {
  const trackIds = useMemo(() => project.tracks.map(track => track.id), [project.tracks])
  const [selection, setSelection] = useState<{ projectId: string; clipId: string } | null>(null)
  const selectedClipId = selection?.projectId === project.id ? reconcileTimelineSelection(project.timeline, selection.clipId) : null
  const selectedClip = project.timeline.find(clip => clip.id === selectedClipId) ?? null
  const [trackToAdd, setTrackToAdd] = useState('')
  const [startToAdd, setStartToAdd] = useState('0')
  const [startDraft, setStartDraft] = useState('0')
  const [sourceInDraft, setSourceInDraft] = useState('0')
  const [sourceOutDraft, setSourceOutDraft] = useState('')
  const [playhead, setPlayhead] = useState(0)
  const [message, setMessage] = useState('')
  const runRef = useRef(false)
  const pendingTrackRef = useRef<string | null>(null)
  const pendingStartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const internalPauseRef = useRef(false)
  const waitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const previousProjectId = useRef(project.id)
  const durations: Record<string, number> = {}
  if (transport?.state.projectTrackId && transport.state.duration > 0) durations[transport.state.projectTrackId] = transport.state.duration

  useEffect(() => {
    setSelection(current => current?.projectId === project.id && reconcileTimelineSelection(project.timeline, current.clipId)
      ? current
      : null)
  }, [project.id, project.timeline])

  useEffect(() => {
    if (previousProjectId.current === project.id) return
    previousProjectId.current = project.id
    runRef.current = false
    clearPendingTrack()
    internalPauseRef.current = false
    if (waitTimerRef.current) clearTimeout(waitTimerRef.current)
    waitTimerRef.current = null
    setPlayhead(0)
    setMessage('')
  }, [project.id])

  useEffect(() => {
    if (active) return
    runRef.current = false
    clearPendingTrack()
    internalPauseRef.current = false
    if (waitTimerRef.current) clearTimeout(waitTimerRef.current)
    waitTimerRef.current = null
    if (transport?.state.playing) transport.pause()
  }, [active])

  useEffect(() => () => {
    runRef.current = false
    clearPendingTrack()
    if (waitTimerRef.current) clearTimeout(waitTimerRef.current)
  }, [])

  useEffect(() => {
    if (!selectedClip) {
      setStartDraft('0')
      setSourceInDraft('0')
      setSourceOutDraft('')
      return
    }
    setStartDraft(String(selectedClip.start))
    setSourceInDraft(String(selectedClip.sourceIn))
    setSourceOutDraft(selectedClip.sourceOut === null ? '' : String(selectedClip.sourceOut))
  }, [selectedClip?.id, selectedClip?.start, selectedClip?.sourceIn, selectedClip?.sourceOut])

  const sorted = orderedTimelineClips(project.timeline, trackIds)
  const knownEnd = sorted.reduce((end, clip) => {
    const runtimeDuration = durations[clip.trackId] ?? null
    return Math.max(end, timelineClipEnd(clip, runtimeDuration) ?? clip.start + 20)
  }, MIN_TIMELINE_SECONDS)
  const rulerEnd = Math.min(86_400, knownEnd)
  const rulerWidth = Math.max(600, rulerEnd * PIXELS_PER_SECOND)
  const rulerStep = rulerEnd <= 600 ? 10 : rulerEnd <= 3_600 ? 60 : 300
  const rulerMarks = Array.from({ length: Math.floor(rulerEnd / rulerStep) + 1 }, (_, index) => index * rulerStep)
  const selectedRuntimeDuration = selectedClip && transport?.state.projectTrackId === selectedClip.trackId && transport.state.duration > 0
    ? transport.state.duration
    : null
  const isPlayingTimelineClip = Boolean(transport?.state.playing && transport.state.projectTrackId && project.timeline.some(clip => clip.trackId === transport.state.projectTrackId))
  function clearPendingTrack() {
    pendingTrackRef.current = null
    if (pendingStartTimerRef.current) clearTimeout(pendingStartTimerRef.current)
    pendingStartTimerRef.current = null
  }

  function waitForTrackStart(trackId: string) {
    clearPendingTrack()
    pendingTrackRef.current = trackId
    pendingStartTimerRef.current = setTimeout(() => {
      if (pendingTrackRef.current !== trackId) return
      clearPendingTrack()
      runRef.current = false
      setMessage('Timeline playback did not start. Check that this audio is playable in the current session.')
    }, 10_000)
  }

  function selectClip(clip: TimelineClip) {
    setSelection({ projectId: project.id, clipId: clip.id })
    onSelectTrack(clip.trackId)
    setMessage('')
  }

  function setClipStart(clip: TimelineClip, value: string) {
    setStartDraft(value)
    if (!value.trim()) return
    const start = Number(value)
    if (!Number.isFinite(start) || start < 0) return
    try {
      const timeline = moveTimelineClip(project.timeline, clip.id, start, trackIds)
      writeTimeline(project, update, timeline)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not move this clip.')
    }
  }

  function chooseAt(position: number, resume = Boolean(transport?.state.playing || runRef.current)) {
    const target = activeTimelineClipAt(project.timeline, trackIds, position, durations)
    setPlayhead(position)
    if (!target) {
      if (resume) {
        runRef.current = false
        if (waitTimerRef.current) clearTimeout(waitTimerRef.current)
        waitTimerRef.current = null
        transport?.pause()
      }
      setMessage('The playhead is in an empty or trimmed section.')
      return
    }
    const sourcePosition = target.sourceIn + Math.max(0, position - target.start)
    setSelection({ projectId: project.id, clipId: target.id })
    onSelectTrack(target.trackId)
    if (!transport) {
      setMessage('Timeline playback connects through the existing Visualiser during shell integration.')
      return
    }
    if (!transport.isTrackAttached(target.trackId)) {
      if (resume) {
        runRef.current = false
        transport.pause()
      }
      setMessage('Attach this project track’s audio in Tracks before playing or seeking it.')
      return
    }
    if (resume) {
      waitForTrackStart(target.trackId)
      const started = transport.play(target.trackId, sourcePosition)
      if (started === false) {
        clearPendingTrack()
        runRef.current = false
        setMessage('The attached audio is not available in this session.')
      }
    } else if (transport.state.projectTrackId === target.trackId) transport.seek(sourcePosition)
    else transport.select(target.trackId, sourcePosition)
    setMessage('')
  }

  function startClip(clip: TimelineClip, position = clip.start) {
    if (!transport?.isTrackAttached(clip.trackId)) {
      setMessage(`Attach audio for “${project.tracks.find(track => track.id === clip.trackId)?.title ?? 'this track'}” before playback.`)
      return false
    }
    const sourcePosition = clip.sourceIn + Math.max(0, position - clip.start)
    setSelection({ projectId: project.id, clipId: clip.id })
    onSelectTrack(clip.trackId)
    waitForTrackStart(clip.trackId)
    const started = transport.play(clip.trackId, sourcePosition)
    if (started === false) {
      clearPendingTrack()
      setMessage('The attached audio is not available in this session.')
      return false
    }
    setMessage('')
    return true
  }

  function scheduleNext(afterPosition: number) {
    const next = nextEligibleTimelineClip(project.timeline, trackIds, afterPosition)
    if (!next) {
      runRef.current = false
      setMessage('No eligible clips remain in the timeline.')
      return
    }
    const delay = Math.max(0, next.start - afterPosition) * 1000
    setMessage(delay ? `Waiting for ${project.tracks.find(track => track.id === next.trackId)?.title ?? 'the next clip'} at ${formatTime(next.start)}.` : '')
    if (waitTimerRef.current) clearTimeout(waitTimerRef.current)
    waitTimerRef.current = setTimeout(() => {
      waitTimerRef.current = null
      const currentClips = project.timeline
      const chosen = activeTimelineClipAt(currentClips, trackIds, next.start, durations) ?? next
      if (!startClip(chosen, next.start)) {
        runRef.current = false
        return
      }
      setPlayhead(next.start)
    }, delay)
  }

  useEffect(() => {
    const state = transport?.state
    if (!state) return
    const current = project.timeline.find(clip => clip.trackId === state.projectTrackId)
    if (!current) {
      // The shell's existing player reports its new selected ID on the next
      // render after Play is requested. Preserve sequencing across that narrow
      // handoff instead of treating the stale/empty snapshot as cancellation.
      if (pendingTrackRef.current) return
      if (runRef.current) {
        runRef.current = false
        if (state.playing) transport?.pause()
      }
      return
    }
    if (pendingTrackRef.current === current.trackId) {
      if (!state.playing && !state.ended) return
      clearPendingTrack()
    }
    const arrangementTime = Math.max(0, current.start + state.currentTime - current.sourceIn)
    if (state.playing || state.ended || runRef.current) setPlayhead(arrangementTime)
    if (!runRef.current) return
    if (state.ended) {
      scheduleNext(arrangementTime)
      return
    }
    if (!state.playing) {
      if (internalPauseRef.current) internalPauseRef.current = false
      else runRef.current = false
      return
    }
    const eligible = eligibleTimelineClips(project.timeline, trackIds)
    if (!eligible.some(clip => clip.id === current.id)) {
      const replacement = activeTimelineClipAt(project.timeline, trackIds, arrangementTime, durations)
      if (replacement && replacement.id !== current.id) {
        startClip(replacement, arrangementTime)
        return
      }
      internalPauseRef.current = true
      transport?.pause()
      const next = nextEligibleTimelineClip(project.timeline, trackIds, arrangementTime)
      if (next) scheduleNext(arrangementTime)
      else {
        runRef.current = false
        setMessage('No eligible clips. Unmute a clip or turn off solo.')
      }
      return
    }
    const active = activeTimelineClipAt(project.timeline, trackIds, arrangementTime, durations)
    if (active && active.id !== current.id) {
      if (!startClip(active, arrangementTime)) {
        internalPauseRef.current = true
        transport?.pause()
        scheduleNext(active.start)
      }
      return
    }
    const next = nextEligibleTimelineClip(project.timeline, trackIds, current.start)
    const sourceEnd = current.sourceOut ?? (state.duration > 0 ? state.duration : null)
    const reachedSourceEnd = sourceEnd !== null && state.currentTime >= sourceEnd
    if (reachedSourceEnd) {
      internalPauseRef.current = true
      transport?.pause()
      scheduleNext(arrangementTime)
    } else if (next && arrangementTime >= next.start) {
      startClip(next, arrangementTime)
    }
  }, [transport?.state, project.id, project.timeline])

  function togglePlayback() {
    if (!transport) {
      setMessage('Timeline playback connects through the existing Visualiser during shell integration.')
      return
    }
    if (runRef.current || isPlayingTimelineClip) {
      runRef.current = false
      internalPauseRef.current = false
      if (waitTimerRef.current) clearTimeout(waitTimerRef.current)
      waitTimerRef.current = null
      transport.pause()
      setMessage('Timeline playback paused.')
      return
    }
    const active = activeTimelineClipAt(project.timeline, trackIds, playhead, durations)
    const next = active ?? nextEligibleTimelineClip(project.timeline, trackIds, Math.max(0, playhead - 0.001))
    if (!next) {
      setMessage(eligibleTimelineClips(project.timeline, trackIds).length ? 'Move the playhead to an eligible clip.' : 'No eligible clips. Unmute a clip or turn off solo.')
      return
    }
    runRef.current = true
    const targetPosition = active ? playhead : next.start
    setPlayhead(targetPosition)
    if (!startClip(next, targetPosition)) runRef.current = false
  }

  function addClip() {
    if (!trackToAdd) return
    const start = Number(startToAdd)
    if (!Number.isFinite(start) || start < 0) {
      setMessage('Enter a valid timeline start position.')
      return
    }
    try {
      const next = addTimelineClip(project, trackToAdd, { start }, undefined, new Date().toISOString())
      writeTimeline(project, update, next.timeline)
      const created = next.timeline[next.timeline.length - 1]
      if (created) {
        selectClip(created)
        const nextPosition = timelineClipEnd(created, durations[created.trackId] ?? null)
        setStartToAdd(nextPosition === null ? '' : String(nextPosition))
      }
      setMessage('Clip added to the project timeline.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not add this clip.')
    }
  }

  function saveTrim(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedClip) return
    const sourceIn = Number(sourceInDraft)
    const sourceOut = sourceOutDraft.trim() ? Number(sourceOutDraft) : null
    try {
      const timeline = trimTimelineClip(project.timeline, selectedClip.id, sourceIn, sourceOut, selectedRuntimeDuration, trackIds)
      writeTimeline(project, update, timeline)
      setMessage('Source bounds saved as a non-destructive timeline edit.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Enter valid source bounds.')
    }
  }

  const availableTracks = project.tracks.filter(track => !project.timeline.some(clip => clip.trackId === track.id))
  const trackLabel = (clip: TimelineClip) => {
    const track = project.tracks.find(item => item.id === clip.trackId)
    return track ? `${track.title}${track.version ? ` · ${track.version}` : ''}` : 'Missing project track'
  }

  return <section className="timeline-panel" aria-labelledby="timeline-heading">
    <div className="timeline-heading-row">
      <div><span className="timeline-eyebrow">STUDIO / ARRANGEMENT</span><h2 id="timeline-heading">Timeline<span>.</span></h2></div>
    <div className="timeline-transport"><button type="button" onClick={togglePlayback} disabled={!project.timeline.length}>{runRef.current || isPlayingTimelineClip ? 'Pause timeline' : 'Play timeline'}</button><span>{transport?.state.playing ? 'PLAYING' : runRef.current ? 'SEQUENCING' : 'PAUSED'}</span></div>
    </div>
    <p className="timeline-intro">Arrange project tracks on one shared time ruler. Only one source plays at once. The latest-starting eligible clip shadows earlier overlaps; when it ends, older clips do not resume, so playback may stay silent until a later eligible clip. Ties go to the earliest project row, then the lexically earliest clip ID.</p>

    <div className="timeline-add-row">
      <label>Project track<select aria-label="Project track to add to timeline" value={trackToAdd} onChange={event => setTrackToAdd(event.target.value)} disabled={!availableTracks.length}><option value="">{availableTracks.length ? 'Choose a project track' : 'All project tracks are arranged'}</option>{availableTracks.map(track => <option key={track.id} value={track.id}>{track.title}{track.version ? ` · ${track.version}` : ''}</option>)}</select></label>
      <label>Start position (seconds)<input aria-label="New clip start position" type="number" min="0" max="86400" step="1" value={startToAdd} onChange={event => setStartToAdd(event.target.value)} disabled={!availableTracks.length}/></label>
      <button type="button" onClick={addClip} disabled={!trackToAdd || !startToAdd.trim()}>Add clip</button>
      {!startToAdd.trim() && <small className="timeline-add-help">Set a start position; source length stays unknown until attached audio reports it.</small>}
    </div>

    {!project.tracks.length ? <p className="timeline-empty">Create a project track in Tracks, then add it here as a clip.</p> : !project.timeline.length ? <p className="timeline-empty">Choose a project track and start position to add the first clip.</p> : <>
      <div className="timeline-seek-row">
        <label htmlFor="timeline-playhead">Playhead <strong>{formatTime(playhead)}</strong></label>
        <input id="timeline-playhead" aria-label="Timeline playhead position" type="range" min="0" max={rulerEnd} step="0.1" value={Math.min(playhead, rulerEnd)} onChange={event => chooseAt(Number(event.target.value))}/>
      </div>
      <div className="timeline-board" role="region" aria-label="Project timeline arrangement">
        <div className="timeline-board-inner" style={{ '--timeline-width': `${rulerWidth}px` } as CSSProperties}>
          <div className="timeline-ruler-row"><div className="timeline-row-heading">TRACK / CLIP</div><div className="timeline-ruler-lane" style={{ width: rulerWidth }}>
            {rulerMarks.map(mark => <span className="timeline-ruler-mark" key={mark} style={{ left: mark * PIXELS_PER_SECOND }}>{formatTime(mark)}</span>)}
          </div></div>
          {project.tracks.map((track, index) => {
            const trackClips = sorted.filter(clip => clip.trackId === track.id)
            return <div className={`timeline-track-row${selectedTrackId === track.id ? ' project-selected' : ''}`} key={track.id} data-project-track-selected={selectedTrackId === track.id || undefined}>
              <div className="timeline-row-label"><span>{String(index + 1).padStart(2, '0')}</span><strong>{track.title}</strong>{track.version && <small>{track.version}</small>}
                {trackClips.map(clip => <div className="timeline-row-switches" key={clip.id}><button type="button" aria-pressed={clip.muted} onClick={() => writeTimeline(project, update, setTimelineClipFlag(project.timeline, clip.id, 'muted', !clip.muted, trackIds))}>{clip.muted ? 'Unmute' : 'Mute'}</button><button type="button" aria-pressed={clip.solo} onClick={() => writeTimeline(project, update, setTimelineClipFlag(project.timeline, clip.id, 'solo', !clip.solo, trackIds))}>{clip.solo ? 'Unsolo' : 'Solo'}</button></div>)}
                {!trackClips.length && <small className="timeline-unarranged">Not arranged</small>}
              </div>
              <div className="timeline-lane" style={{ width: rulerWidth }}>
                {playhead <= rulerEnd && <span className="timeline-playhead-line" style={{ left: playhead * PIXELS_PER_SECOND }} aria-hidden="true"/>}
                {trackClips.map(clip => {
                  const later = sorted.find(other => other.start > clip.start)
                  const knownDuration = durations[track.id] ?? null
                  const end = timelineClipEnd(clip, knownDuration)
                  const visualEnd = end ?? (later ? Math.min(later.start, rulerEnd) : rulerEnd)
                  const width = Math.max(18, (visualEnd - clip.start) * PIXELS_PER_SECOND)
                  const attached = transport?.isTrackAttached(track.id) ?? false
                  const chosen = selectedClipId === clip.id
                  return <button type="button" key={clip.id} className={`timeline-clip${chosen ? ' selected' : ''}${clip.muted ? ' muted' : ''}${clip.solo ? ' solo' : ''}`} aria-pressed={chosen} aria-label={`${trackLabel(clip)}, starts at ${formatTime(clip.start)}, ${clip.sourceOut === null ? 'full source' : `source ${formatTime(clip.sourceIn)} to ${formatTime(clip.sourceOut)}`}${attached ? ', audio attached' : ', audio unattached'}`} style={{ left: clip.start * PIXELS_PER_SECOND, width }} onClick={() => selectClip(clip)}>
                    <span>{trackLabel(clip)}</span><small>{clip.sourceOut === null ? 'FULL SOURCE ↗' : `${formatTime(clip.sourceIn)} — ${formatTime(clip.sourceOut)}`}</small>
                  </button>
                })}
              </div>
            </div>
          })}
        </div>
      </div>

      {selectedClip && <div className="timeline-clip-editor">
        <div className="timeline-clip-editor-heading"><div><span className="timeline-eyebrow">SELECTED CLIP</span><h3>{trackLabel(selectedClip)}</h3></div><button type="button" className="timeline-remove" onClick={() => { writeTimeline(project, update, removeTimelineClip(project, selectedClip.id).timeline); setSelection(null); setMessage('Clip removed from the timeline. The project track remains unchanged.') }}>Remove clip</button></div>
        <div className="timeline-edit-grid">
          <label>Position on timeline (seconds)<input type="number" min="0" max="86400" step="0.1" value={startDraft} onChange={event => setClipStart(selectedClip, event.target.value)}/></label>
          <label>Move along ruler<input type="range" min="0" max={rulerEnd} step="0.1" value={Math.min(selectedClip.start, rulerEnd)} onChange={event => setClipStart(selectedClip, event.target.value)}/></label>
          <span className="timeline-source-status">{transport?.isTrackAttached(selectedClip.trackId) ? 'Audio attached this session' : 'Attach audio in Tracks to play'}{selectedRuntimeDuration ? ` · ${formatTime(selectedRuntimeDuration)} source length` : ''}</span>
        </div>
        <form className="timeline-trim-form" onSubmit={saveTrim}>
          <label>Source in-point (seconds)<input type="number" min="0" max={selectedRuntimeDuration ?? 86400} step="0.1" value={sourceInDraft} onChange={event => setSourceInDraft(event.target.value)}/></label>
          <label>Source out-point (seconds)<input type="number" min="0" max={selectedRuntimeDuration ?? 86400} step="0.1" value={sourceOutDraft} placeholder="Full source" onChange={event => setSourceOutDraft(event.target.value)}/></label>
          <button type="submit">Save source bounds</button>
          <small>Bounds change this timeline clip only; project track audio and captured creation identity stay unchanged. Leave out-point empty to use the full source.</small>
        </form>
      </div>}
    </>}
    <p className="timeline-message" role="status">{message}</p>
  </section>
}
