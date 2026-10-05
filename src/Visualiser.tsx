import { useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { addTracks, audioCandidate, displayName, removeTrack, selectTrack } from './lib/localTracks.ts'
import type { LocalTrack, TrackLibrary } from './lib/localTracks.ts'
import { AudioAnalyzer, SILENT_METRICS } from './lib/audioAnalysis.ts'
import type { SignalMetrics } from './lib/audioAnalysis.ts'
import { drawVisualFrame, drawVisualIdle, VISUAL_MODES } from './lib/visualModes.ts'
import type { VisualMode } from './lib/visualModes.ts'
import { PlaybackIntent } from './lib/playbackIntent.ts'
import { deriveVisualPersonality, responseStep } from './lib/visualPersonality.ts'
import type { MusicalCharacteristics } from './lib/visualPersonality.ts'
import './visualiser.css'
import { TrackSeek } from './lib/trackSeek.ts'
import { SessionAudio } from './lib/sessionAudio.ts'
import type { Ref } from 'react'
export type VisualiserAudio = { importFile: (file: File) => LocalTrack; choose: (id: string) => void; remove: (id: string) => void; play: (id: string, preservePosition: boolean) => void; pause: () => void }


function timeLabel(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const whole = Math.floor(seconds)
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`
}

const emptyLibrary: TrackLibrary = { tracks: [], selectedId: null }

export default function Visualiser({ active, onNavigate, characteristics, characterName, previews, audioBridge, onLibrary, historicalLabel, onPlaying }: { onPlaying?: (playing: boolean) => void; audioBridge?: Ref<VisualiserAudio>; onLibrary?: (library: TrackLibrary) => void; historicalLabel?: string; previews: readonly { id: string, label: string, characteristics: MusicalCharacteristics }[], characteristics: MusicalCharacteristics | null, characterName: string | null, active: boolean, onNavigate: (view: 'genre' | 'vocal' | 'mood') => void }) {
  const [library, setLibrary] = useState<TrackLibrary>(emptyLibrary)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [message, setMessage] = useState('')
  const [metrics, setMetrics] = useState<SignalMetrics>(SILENT_METRICS)
  const [personalitySource, setPersonalitySource] = useState('current')
  const preview = previews.find(item => item.id === personalitySource)
  const activeCharacteristics = preview?.characteristics ?? (personalitySource === 'current' ? characteristics : null)
  const activeCharacterName = preview ? `${preview.label} preview` : activeCharacteristics ? `${characterName} ${historicalLabel ? 'track creation identity' : 'influence'}` : historicalLabel ? 'Track creation identity / Classic signal' : 'Classic signal'
  const personality = useMemo(() => deriveVisualPersonality(activeCharacteristics), [activeCharacteristics])
  const personalityRef = useRef(personality)
  personalityRef.current = personality
  const responseRef = useRef({ bass: 0, high: 0, time: 0 })
  const [visualMode, setVisualMode] = useState<VisualMode>('spectrum')
  const [hasRenderedSignal, setHasRenderedSignal] = useState(false)
  const [analysisError, setAnalysisError] = useState('')
  const audioRef = useRef<HTMLAudioElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const analyzerRef = useRef<AudioAnalyzer | null>(null)
  const visualModeRef = useRef<VisualMode>(visualMode)
  visualModeRef.current = visualMode
  const reducedMotionRef = useRef(false)
  const hasSignalFrameRef = useRef(false)
  const graphCreationsRef = useRef(0)
  const frameRef = useRef<number | null>(null)
  const lastDisplayRef = useRef(0)
  const lastVisualRef = useRef(0)
  const disposeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const urlsRef = useRef(new SessionAudio())
  const [playback] = useState(() => new PlaybackIntent(() => {
    setPlaying(false)
    setAnalysisError('Web Audio could not change playback state. Try Play again.')
  }))
  const loadedIdRef = useRef<string | null>(null)
  const [trackSeek] = useState(() => new TrackSeek())
  const selected = library.tracks.find(track => track.id === library.selectedId)

  function drawIdle() {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (canvas && ctx) drawVisualIdle(ctx, canvas.clientWidth, canvas.clientHeight)
  }

  function drawSignalFrame(analyzer: AudioAnalyzer, mode = visualModeRef.current) {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (canvas && ctx) {
      drawVisualFrame(ctx, canvas.clientWidth, canvas.clientHeight, mode, analyzer.waveform, analyzer.spectrum, analyzer.context.sampleRate, analyzer.analyser.fftSize, personalityRef.current, responseRef.current.bass, responseRef.current.high)
    }
  }

  function stopAnalysis() {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    frameRef.current = null
    lastDisplayRef.current = 0
    responseRef.current.time = 0
    setMetrics(SILENT_METRICS)
  }

  function startAnalysis() {
    if (!playback.playing || frameRef.current !== null || !analyzerRef.current) return
    const tick = (now: number) => {
      if (!playback.playing || !audioRef.current || audioRef.current.paused || !analyzerRef.current) {
        frameRef.current = null
        setMetrics(SILENT_METRICS)
        return
      }
      const analyzer = analyzerRef.current
      const next = analyzer.read()
      if (!hasSignalFrameRef.current) setHasRenderedSignal(true)
      hasSignalFrameRef.current = true
      if (!reducedMotionRef.current || now - lastVisualRef.current >= 125) {
        const response = responseRef.current
        const elapsed = response.time ? now - response.time : 16
        response.bass = responseStep(response.bass, next.low, elapsed, personalityRef.current.responseMs)
        response.high = responseStep(response.high, next.high, elapsed, personalityRef.current.responseMs)
        response.time = now
        drawSignalFrame(analyzer)
        lastVisualRef.current = now
      }
      if (now - lastDisplayRef.current >= 65) {
        setMetrics(next)
        lastDisplayRef.current = now
      }
      frameRef.current = requestAnimationFrame(tick)
    }
    frameRef.current = requestAnimationFrame(tick)
  }

  function loadTrack(id: string | null, position = 0) {
    const audio = audioRef.current
    if (!audio) return
    playback.cancel()
    stopAnalysis()
    trackSeek.clear()
    loadedIdRef.current = id
    audio.removeAttribute('src')
    audio.load()
    setPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    setAnalysisError('')
    hasSignalFrameRef.current = false
    responseRef.current.bass = 0
    responseRef.current.high = 0
    setHasRenderedSignal(false)
    drawIdle()
    const url = id ? urlsRef.current.get(id) : null
    if (url && id) { trackSeek.queue(id, position); audio.src = url }
  }
  useEffect(() => {
    // An imperative switch has already loaded the same media element in the
    // click gesture. React selection must not cancel its new PlaybackIntent.
    if (loadedIdRef.current !== library.selectedId) loadTrack(library.selectedId)
  }, [library.selectedId])
  function metadataLoaded(audio: HTMLAudioElement) {
    if (audio.readyState < 1) return
    setDuration(Number.isFinite(audio.duration) ? audio.duration : 0)
    const position = trackSeek.take(loadedIdRef.current, audio.duration)
    if (position !== null) { audio.currentTime = position; setCurrentTime(position) }
  }
  function pausePlayback() {
    trackSeek.clear()
    playback.cancel()
    setPlaying(false)
    stopAnalysis()
  }
  function playTrack(id: string, preservePosition: boolean) {
    if (!urlsRef.current.get(id)) return
    const position = preservePosition ? trackSeek.position(loadedIdRef.current, audioRef.current?.currentTime ?? 0) : 0
    setPersonalitySource('current')
    if (loadedIdRef.current !== id) {
      loadTrack(id, position)
      setLibrary(current => selectTrack(current, id))
    }
    // App opens the existing playback surface in this same interaction.
    playback.setActive(true)
    void startPlayback()
  }

  useEffect(() => {
    playback.setActive(active)
    if (active) return
    trackSeek.clear()
    setPlaying(false)
    stopAnalysis()
  }, [active])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const syncSize = () => {
      const dpr = window.devicePixelRatio || 1
      const width = Math.max(1, Math.round(canvas.clientWidth * dpr))
      const height = Math.max(1, Math.round(canvas.clientHeight * dpr))
      if (canvas.width === width && canvas.height === height) return
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const analyzer = analyzerRef.current
      if (hasSignalFrameRef.current && analyzer) drawSignalFrame(analyzer)
      else drawVisualIdle(ctx, canvas.clientWidth, canvas.clientHeight)
    }
    const observer = new ResizeObserver(syncSize)
    observer.observe(canvas)
    window.addEventListener('resize', syncSize)
    syncSize()
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', syncSize)
    }
  }, [])

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => { reducedMotionRef.current = preference.matches }
    update()
    preference.addEventListener('change', update)
    return () => preference.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const analyzer = analyzerRef.current
    if (!playing && hasSignalFrameRef.current && analyzer) drawSignalFrame(analyzer, visualMode)
  }, [visualMode, playing])

  useEffect(() => {
    const audio = audioRef.current
    if (audio) playback.mount(audio, active)
    // StrictMode replays effects on the same DOM audio element. Defer graph
    // disposal one task so that replay can cancel it before the source closes.
    if (disposeTimerRef.current !== null) clearTimeout(disposeTimerRef.current)
    disposeTimerRef.current = null
    return () => {
      trackSeek.clear()
      playback.unmount()
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
      frameRef.current = null
      hasSignalFrameRef.current = false
      urlsRef.current.clear()
      disposeTimerRef.current = setTimeout(() => {
        analyzerRef.current?.close()
        analyzerRef.current = null
        disposeTimerRef.current = null
      }, 0)
    }
  }, [])

  function importFile(file: File): LocalTrack {
    if (!audioCandidate(file) || (file.type && audioRef.current?.canPlayType(file.type) === '')) throw new Error('Choose a supported, non-empty audio file.')
    const id = crypto.randomUUID()
    urlsRef.current.attach(id, file)
    const track = { id, filename: file.name, name: displayName(file.name), type: file.type, size: file.size }
    setLibrary(current => addTracks(current, [track]))
    return track
  }
  function importFiles(files: FileList | null) {
    let imported = 0; let rejected = 0
    for (const file of Array.from(files ?? [])) { try { importFile(file); imported++ } catch { rejected++ } }
    setMessage(`${imported} tracks imported.${rejected ? ` ${rejected} unsupported, empty or unreadable files skipped.` : ''}`)
  }
  useImperativeHandle(audioBridge, () => ({ importFile, choose: id => { setPersonalitySource('current'); choose(id) }, remove, play: playTrack, pause: pausePlayback }))
  useEffect(() => { onPlaying?.(playing) }, [playing, onPlaying])
  useEffect(() => { onLibrary?.(library) }, [library, onLibrary])
  useEffect(() => { if (historicalLabel) setPersonalitySource('current') }, [library.selectedId, historicalLabel])

  function choose(id: string) {
    if (id === library.selectedId) return
    trackSeek.clear()
    playback.cancel()
    setPlaying(false)
    stopAnalysis()
    setMessage('')
    setLibrary(current => selectTrack(current, id))
  }

  function remove(id: string) {
    if (id === library.selectedId) {
      trackSeek.clear()
      playback.cancel()
      setPlaying(false)
      stopAnalysis()
      hasSignalFrameRef.current = false
      setHasRenderedSignal(false)
      drawIdle()
      audioRef.current?.removeAttribute('src')
      audioRef.current?.load()
    }
    setLibrary(current => removeTrack(current, id))
    urlsRef.current.delete(id)
    setMessage('Track removed.')
  }

  function togglePlayback() {
    if (!selected) return
    if (playback.playing) { pausePlayback(); return }
    void startPlayback()
  }
  async function startPlayback() {
    const audio = audioRef.current
    if (!audio || !loadedIdRef.current) return
    try {
      if (typeof AudioContext !== 'undefined' && !analyzerRef.current) {
        analyzerRef.current = new AudioAnalyzer(audio)
        graphCreationsRef.current++
      }
    } catch {
      // Only synchronous graph construction can reach this recovery path.
      playback.cancel()
      showStartupError(audio)
      return
    }
    const { request, completion } = playback.start(analyzerRef.current?.context ?? null)
    // A pending Play is already user intent, so another click can cancel it.
    setPlaying(playback.playing)
    const result = await completion
    if (!playback.isCurrent(request) || result === 'stale') return
    if (result === 'failed') {
      showStartupError(audio)
      return
    }
    setMessage('')
    setAnalysisError(analyzerRef.current ? '' : 'Web Audio is unavailable in this browser. Playback continues without diagnostics.')
  }

  function showStartupError(audio: HTMLAudioElement) {
    setPlaying(false)
    stopAnalysis()
    if (audio.error) {
      setAnalysisError('')
      setMessage('This file could not be read or played in this browser.')
    } else setAnalysisError('Playback or Web Audio analysis could not start in this browser.')
  }

  function navigate(view: 'genre' | 'vocal' | 'mood') {
    trackSeek.clear()
    playback.setActive(false)
    setPlaying(false)
    stopAnalysis()
    onNavigate(view)
  }

  const progress = duration > 0 ? Math.min(100, currentTime / duration * 100) : 0

  return <div className="app-shell">
    <aside className="rail" aria-label="Studio navigation"><div className="brand-mark" aria-label="Sonic Studio">S<span>·</span></div><div className="rail-center"><span className="rail-tick"/><span className="rail-tick"/><span className="rail-tick"/><span className="rail-tick active"/></div><span className="rail-bottom">04 / 04</span></aside>
    <main className="main visualiser-main">
      <header className="topbar"><div className="wordmark">SONIC <span>STUDIO</span><small>V2.0.0-stage.3 / REACTIVE PERSONALITY</small></div><div className="topbar-right"><span className="status-dot"/> LOCAL SESSION</div></header>
      <nav className="tool-nav" aria-label="Studio tools"><button onClick={() => navigate('genre')}>01 / Genre Mixer</button><button onClick={() => navigate('vocal')}>02 / Vocal Persona</button><button onClick={() => navigate('mood')}>03 / Mood Mapper</button><button className="active" aria-current="page">04 / Visualiser</button></nav>
      <section className="intro"><div className="eyebrow">BLOCK 04 / VISUAL MODES</div><div className="intro-row"><div><h1>Listen <em>locally.</em></h1><p>Import a few tracks, choose one, and inspect their live signal. Your files stay in this browser session.</p></div><div className="intro-index">SONIC STUDIO<span>04 / 04</span></div></div></section>
      <div className="visualiser-layout">
        <section className="visualiser-panel" aria-labelledby="player-heading"><div className="section-heading"><div><span className="eyebrow">01 / PLAYER</span><h2 id="player-heading">Now playing<span className="heading-period">.</span></h2></div></div>
          <div className="visualiser-current"><span>SELECTED TRACK</span><strong>{historicalLabel ?? selected?.name ?? 'No track selected'}</strong><small>{selected?.filename ?? 'Import audio to begin'}</small></div>
          <div className="visualiser-controls"><button type="button" onClick={togglePlayback} disabled={!selected} aria-label={playing ? 'Pause' : 'Play'}>{playing ? 'Pause' : 'Play'}</button><div className="visualiser-seek"><input type="range" min="0" max={duration || 0} step="0.01" value={Math.min(currentTime, duration || 0)} disabled={!selected || !duration} aria-label="Seek through track" style={{ '--progress': `${progress}%` } as React.CSSProperties} onChange={event => { const audio = audioRef.current; if (!audio) return; const next = Number(event.target.value); trackSeek.clear(); audio.currentTime = next; setCurrentTime(next) }}/><div className="visualiser-times"><span>{timeLabel(currentTime)}</span><span>{timeLabel(duration)}</span></div></div></div>
          <p className="visualiser-message" role="status">{analysisError || message}</p>
        <audio ref={audioRef} preload="metadata" onLoadedMetadata={event => metadataLoaded(event.currentTarget)} onDurationChange={event => metadataLoaded(event.currentTarget)} onTimeUpdate={event => setCurrentTime(event.currentTarget.currentTime)} onPause={event => { if (!event.currentTarget.paused) return; playback.cancel(); setPlaying(false); stopAnalysis() }} onPlay={event => { if (!playback.playing) { playback.cancel(); return }; if (event.currentTarget.paused) return; setPlaying(true); startAnalysis() }} onEnded={() => { playback.cancel(); setPlaying(false); stopAnalysis(); hasSignalFrameRef.current = false; setHasRenderedSignal(false); drawIdle(); setCurrentTime(audioRef.current?.duration || 0) }} onError={() => { if (selected) { trackSeek.clear(); playback.cancel(); setPlaying(false); stopAnalysis(); hasSignalFrameRef.current = false; setHasRenderedSignal(false); drawIdle(); setMessage('This file could not be read or played in this browser.') } }}/>
        </section>
        <section className="visualiser-panel" aria-labelledby="tracks-heading"><div className="section-heading"><div><span className="eyebrow">02 / IMPORTED TRACKS</span><h2 id="tracks-heading">Your session<span className="heading-period">.</span></h2></div><span className="visualiser-count">{library.tracks.length} TRACKS</span></div>
          <label className="visualiser-import">Import audio files<input type="file" accept="audio/*,.mp3,.wav,.ogg,.oga,.m4a,.aac,.mp4" multiple onChange={event => { importFiles(event.target.files); event.target.value = '' }}/></label>
          {library.tracks.length === 0 ? <p className="visualiser-empty">No audio imported yet. Choose files from your device to start.</p> : <div className="visualiser-list">{library.tracks.map((track, index) => <article className={track.id === library.selectedId ? 'visualiser-track selected' : 'visualiser-track'} key={track.id}><button type="button" className="visualiser-select" onClick={() => choose(track.id)} aria-current={track.id === library.selectedId ? 'true' : undefined}><span>{String(index + 1).padStart(2, '0')}</span><span><strong>{track.name}</strong><small title={track.filename}>{track.filename} · {track.type} · {(track.size / 1048576).toFixed(2)} MB</small></span></button><button type="button" className="visualiser-remove" aria-label={`Remove ${track.name}`} onClick={() => remove(track.id)}>Remove</button></article>)}</div>}
          <p className="visualiser-note">Files are not uploaded or saved. Reloading clears this list.</p>
        </section>
      </div>
      <section className="visualiser-stage" aria-labelledby="visual-stage-heading" data-graph-creations={graphCreationsRef.current} data-waveform-samples={analyzerRef.current?.waveform.length ?? 0} data-spectrum-bins={analyzerRef.current?.spectrum.length ?? 0}>
        <div className="visualiser-stage-heading"><div><span className="eyebrow">03 / LIVE VISUAL</span><h2 id="visual-stage-heading">{historicalLabel ?? selected?.name ?? 'Signal view'}<span className="heading-period">.</span></h2><p>{selected ? playing ? 'Live signal from the selected track.' : hasRenderedSignal ? 'Paused view holds the last measured signal.' : 'Press Play to view this track.' : 'Choose a track and press Play to begin.'}</p></div><div className="visualiser-mode-switch" role="group" aria-label="Visual mode">{VISUAL_MODES.map(mode => <button type="button" key={mode.id} aria-pressed={visualMode === mode.id} className={visualMode === mode.id ? 'active' : ''} onClick={() => setVisualMode(mode.id)}>{mode.label}</button>)}</div></div>
        <div className="visualiser-canvas-wrap"><canvas ref={canvasRef} className="visualiser-canvas" role="img" aria-label={`${visualMode} visualisation of ${selected?.name ?? 'no selected track'}`}/>{!selected || !playing ? <span className="visualiser-canvas-status" aria-hidden="true">{selected ? hasRenderedSignal ? 'SIGNAL HELD / PAUSED' : 'READY / PAUSED' : 'AWAITING AUDIO'}</span> : null}</div>
        {visualMode === 'spectrum' ? <div className="visualiser-frequency-scale" aria-hidden="true"><span>LOW / 20 HZ</span><span>HIGH / 20 KHZ</span></div> : visualMode === 'radial' ? <p className="visualiser-radial-key">LOW TO HIGH FREQUENCY / CLOCKWISE FROM TOP</p> : null}
      </section>
      <section className="visualiser-personality" aria-labelledby="personality-heading">
        <div><span className="eyebrow">VISUAL PERSONALITY</span><h2 id="personality-heading">{activeCharacterName}</h2><p>{personalitySource === 'classic' ? 'Original signal styling.' : preview ? 'Read-only catalogue preview. Your Mood Mapper blend stays as selected.' : historicalLabel ? `Captured Mood for ${historicalLabel}. Current project identity stays unchanged.` : characteristics ? 'Read-only from your current Mood Mapper blend. The audio remains the source of every shape.' : 'Select moods in Mood Mapper or preview a catalogue character. Classic styling is active.'}</p></div>
        <label className="personality-select">Visual character<select aria-label="Visual character" value={personalitySource} onChange={event => setPersonalitySource(event.target.value)}><option value="current">{historicalLabel ? 'Track creation mood' : 'Current mood'}{characterName ? ` / ${characterName}` : ' / none selected'}</option><option value="classic">Classic signal</option>{previews.map(item => <option key={item.id} value={item.id}>{item.label} preview</option>)}</select></label>
        {activeCharacteristics ? <p className="personality-sources">Energy {activeCharacteristics.energy} · Tension {activeCharacteristics.tension} · Atmosphere {activeCharacteristics.atmosphere} · Motion {activeCharacteristics.motion} · Weight {activeCharacteristics.weight} · Valence {activeCharacteristics.valence}</p> : null}
        <p className="personality-sources">Expansion {personality.gain.toFixed(2)}× · Line weight {personality.stroke.toFixed(2)}× · Glow {personality.glow.toFixed(0)} · Detail {Math.round(personality.detail * 100)}% · Response {Math.round(personality.responseMs)} ms · Bass pulse {Math.round(personality.bassPulse * 100)}%</p>
      </section>
      <section className="visualiser-diagnostics" aria-labelledby="analysis-heading"><div className="section-heading"><div><span className="eyebrow">04 / ANALYSIS</span><h2 id="analysis-heading">Audio diagnostics<span className="heading-period">.</span></h2></div><span className="visualiser-count">{playing ? analyzerRef.current ? 'ANALYSING' : 'UNAVAILABLE' : 'IDLE'}</span></div><p>Live levels from the selected track. Readings settle to zero when playback stops.</p><div className="visualiser-meter-grid">{([['amplitude', 'Overall amplitude'], ['low', 'Low · 20–250 Hz'], ['mid', 'Mid · 250–2,000 Hz'], ['high', 'High · 2,000–10,000 Hz']] as const).map(([key, label]) => <div className="visualiser-meter" key={key}><div><span>{label}</span><strong>{metrics[key].toFixed(3)}</strong></div><div className="visualiser-meter-track"><span style={{ width: `${metrics[key] * 100}%` }}/></div></div>)}</div><small>0 = no measured signal · 1 = maximum normalised level. Every visual mode reads these same reusable analyser buffers.</small></section>
      <footer className="page-footer"><span>SONIC STUDIO / VISUAL MODES</span><span>AUDIO × MUSICAL CHARACTER / V2.0.0-stage.3.</span></footer>
    </main>
  </div>
}
