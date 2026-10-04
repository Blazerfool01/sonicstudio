import { useEffect, useRef, useState } from 'react'
import { addTracks, audioCandidate, displayName, removeTrack, selectTrack } from './lib/localTracks.ts'
import type { LocalTrack, TrackLibrary } from './lib/localTracks.ts'
import { AudioAnalyzer, SILENT_METRICS } from './lib/audioAnalysis.ts'
import type { SignalMetrics } from './lib/audioAnalysis.ts'
import './visualiser.css'

function timeLabel(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const whole = Math.floor(seconds)
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`
}

const emptyLibrary: TrackLibrary = { tracks: [], selectedId: null }

export default function Visualiser({ active, onNavigate }: { active: boolean, onNavigate: (view: 'genre' | 'vocal' | 'mood') => void }) {
  const [library, setLibrary] = useState<TrackLibrary>(emptyLibrary)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [message, setMessage] = useState('')
  const [metrics, setMetrics] = useState<SignalMetrics>(SILENT_METRICS)
  const [analysisError, setAnalysisError] = useState('')
  const audioRef = useRef<HTMLAudioElement>(null)
  const analyzerRef = useRef<AudioAnalyzer | null>(null)
  const graphCreationsRef = useRef(0)
  const frameRef = useRef<number | null>(null)
  const lastDisplayRef = useRef(0)
  const disposeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const urlsRef = useRef(new Map<string, string>())
  const playRequestRef = useRef(0)
  const selected = library.tracks.find(track => track.id === library.selectedId)

  function stopAnalysis() {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    frameRef.current = null
    lastDisplayRef.current = 0
    setMetrics(SILENT_METRICS)
  }

  function startAnalysis() {
    if (frameRef.current !== null || !analyzerRef.current) return
    const tick = (now: number) => {
      if (audioRef.current?.paused || !analyzerRef.current) {
        frameRef.current = null
        setMetrics(SILENT_METRICS)
        return
      }
      const next = analyzerRef.current.read()
      if (now - lastDisplayRef.current >= 65) {
        setMetrics(next)
        lastDisplayRef.current = now
      }
      frameRef.current = requestAnimationFrame(tick)
    }
    frameRef.current = requestAnimationFrame(tick)
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    ++playRequestRef.current
    stopAnalysis()
    audio.pause()
    audio.removeAttribute('src')
    audio.load()
    setPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    setAnalysisError('')
    if (library.selectedId) {
      const url = urlsRef.current.get(library.selectedId)
      if (url) audio.src = url
    }
  }, [library.selectedId])

  useEffect(() => {
    if (active) return
    ++playRequestRef.current
    audioRef.current?.pause()
    stopAnalysis()
    if (analyzerRef.current?.context.state === 'running') void analyzerRef.current.context.suspend()
  }, [active])

  useEffect(() => {
    // StrictMode replays effects on the same DOM audio element. Defer graph
    // disposal one task so that replay can cancel it before the source closes.
    if (disposeTimerRef.current !== null) clearTimeout(disposeTimerRef.current)
    disposeTimerRef.current = null
    return () => {
      ++playRequestRef.current
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
      frameRef.current = null
      audioRef.current?.pause()
      for (const url of urlsRef.current.values()) URL.revokeObjectURL(url)
      urlsRef.current.clear()
      disposeTimerRef.current = setTimeout(() => {
        analyzerRef.current?.close()
        analyzerRef.current = null
        disposeTimerRef.current = null
      }, 0)
    }
  }, [])

  function importFiles(files: FileList | null) {
    if (!files) return
    const audio = audioRef.current
    const added: LocalTrack[] = []
    let rejected = 0
    for (const file of Array.from(files)) {
      if (!audioCandidate(file) || (file.type && audio?.canPlayType(file.type) === '')) {
        rejected++
        continue
      }
      const id = crypto.randomUUID()
      try {
        urlsRef.current.set(id, URL.createObjectURL(file))
        added.push({ id, filename: file.name, name: displayName(file.name), type: file.type || 'Unknown audio type', size: file.size })
      } catch { rejected++ }
    }
    if (added.length) setLibrary(current => addTracks(current, added))
    setMessage(`${added.length} track${added.length === 1 ? '' : 's'} imported.${rejected ? ` ${rejected} unsupported or empty file${rejected === 1 ? '' : 's'} skipped.` : ''}`)
  }

  function choose(id: string) {
    if (id === library.selectedId) return
    setMessage('')
    setLibrary(current => selectTrack(current, id))
  }

  function remove(id: string) {
    if (id === library.selectedId) {
      ++playRequestRef.current
      stopAnalysis()
      audioRef.current?.pause()
    }
    setLibrary(current => removeTrack(current, id))
    const url = urlsRef.current.get(id)
    if (url) URL.revokeObjectURL(url)
    urlsRef.current.delete(id)
    setMessage('Track removed.')
  }

  async function togglePlayback() {
    const audio = audioRef.current
    if (!audio || !selected) return
    if (!audio.paused) {
      ++playRequestRef.current
      audio.pause()
      setPlaying(false)
      return
    }
    const request = ++playRequestRef.current
    try {
      if (typeof AudioContext === 'undefined') {
        await audio.play()
        if (request !== playRequestRef.current) { audio.pause(); return }
        setPlaying(true)
        setAnalysisError('Web Audio is unavailable in this browser. Playback continues without diagnostics.')
        return
      }
      if (!analyzerRef.current) {
        analyzerRef.current = new AudioAnalyzer(audio)
        graphCreationsRef.current++
      }
      // Both calls start inside the same click gesture, satisfying browser
      // restrictions on AudioContext resume and HTML media playback.
      const resumed = analyzerRef.current.resume()
      const started = audio.play()
      await Promise.all([resumed, started])
      if (request !== playRequestRef.current) { audio.pause(); return }
      setPlaying(true)
      setMessage('')
      setAnalysisError('')
    } catch {
      if (request === playRequestRef.current) {
        audio.pause()
        setPlaying(false)
        if (audio.error) {
          setAnalysisError('')
          setMessage('This file could not be read or played in this browser.')
        } else {
          setAnalysisError('Playback or Web Audio analysis could not start in this browser.')
        }
      }
    }
  }

  const progress = duration > 0 ? Math.min(100, currentTime / duration * 100) : 0

  return <div className="app-shell">
    <aside className="rail" aria-label="Studio navigation"><div className="brand-mark" aria-label="Sonic Studio">S<span>·</span></div><div className="rail-center"><span className="rail-tick"/><span className="rail-tick"/><span className="rail-tick"/><span className="rail-tick active"/></div><span className="rail-bottom">04 / 04</span></aside>
    <main className="main visualiser-main">
      <header className="topbar"><div className="wordmark">SONIC <span>STUDIO</span><small>V1.6 / AUDIO ANALYSIS</small></div><div className="topbar-right"><span className="status-dot"/> LOCAL SESSION</div></header>
      <nav className="tool-nav" aria-label="Studio tools"><button onClick={() => onNavigate('genre')}>01 / Genre Mixer</button><button onClick={() => onNavigate('vocal')}>02 / Vocal Persona</button><button onClick={() => onNavigate('mood')}>03 / Mood Mapper</button><button className="active" aria-current="page">04 / Visualiser</button></nav>
      <section className="intro"><div className="eyebrow">BLOCK 04 / AUDIO ANALYSIS</div><div className="intro-row"><div><h1>Listen <em>locally.</em></h1><p>Import a few tracks, choose one, and inspect their live signal. Your files stay in this browser session.</p></div><div className="intro-index">SONIC STUDIO<span>04 / 04</span></div></div></section>
      <div className="visualiser-layout">
        <section className="visualiser-panel" aria-labelledby="player-heading"><div className="section-heading"><div><span className="eyebrow">01 / PLAYER</span><h2 id="player-heading">Now playing<span className="heading-period">.</span></h2></div></div>
          <div className="visualiser-current"><span>SELECTED TRACK</span><strong>{selected?.name ?? 'No track selected'}</strong><small>{selected?.filename ?? 'Import audio to begin'}</small></div>
          <div className="visualiser-controls"><button type="button" onClick={togglePlayback} disabled={!selected} aria-label={playing ? 'Pause' : 'Play'}>{playing ? 'Pause' : 'Play'}</button><div className="visualiser-seek"><input type="range" min="0" max={duration || 0} step="0.01" value={Math.min(currentTime, duration || 0)} disabled={!selected || !duration} aria-label="Seek through track" style={{ '--progress': `${progress}%` } as React.CSSProperties} onChange={event => { const audio = audioRef.current; if (!audio) return; const next = Number(event.target.value); audio.currentTime = next; setCurrentTime(next) }}/><div className="visualiser-times"><span>{timeLabel(currentTime)}</span><span>{timeLabel(duration)}</span></div></div></div>
          <p className="visualiser-message" role="status">{analysisError || message}</p>
          <audio ref={audioRef} preload="metadata" onLoadedMetadata={event => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)} onDurationChange={event => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)} onTimeUpdate={event => setCurrentTime(event.currentTarget.currentTime)} onPause={() => { setPlaying(false); stopAnalysis() }} onPlay={() => { setPlaying(true); startAnalysis() }} onEnded={() => { setPlaying(false); stopAnalysis(); setCurrentTime(audioRef.current?.duration || 0) }} onError={() => { if (selected) { setPlaying(false); stopAnalysis(); setMessage('This file could not be read or played in this browser.') } }}/>
        </section>
        <section className="visualiser-panel" aria-labelledby="tracks-heading"><div className="section-heading"><div><span className="eyebrow">02 / IMPORTED TRACKS</span><h2 id="tracks-heading">Your session<span className="heading-period">.</span></h2></div><span className="visualiser-count">{library.tracks.length} TRACKS</span></div>
          <label className="visualiser-import">Import audio files<input type="file" accept="audio/*,.mp3,.wav,.ogg,.oga,.m4a,.aac,.mp4" multiple onChange={event => { importFiles(event.target.files); event.target.value = '' }}/></label>
          {library.tracks.length === 0 ? <p className="visualiser-empty">No audio imported yet. Choose files from your device to start.</p> : <div className="visualiser-list">{library.tracks.map((track, index) => <article className={track.id === library.selectedId ? 'visualiser-track selected' : 'visualiser-track'} key={track.id}><button type="button" className="visualiser-select" onClick={() => choose(track.id)} aria-current={track.id === library.selectedId ? 'true' : undefined}><span>{String(index + 1).padStart(2, '0')}</span><span><strong>{track.name}</strong><small title={track.filename}>{track.filename} · {track.type} · {(track.size / 1048576).toFixed(2)} MB</small></span></button><button type="button" className="visualiser-remove" aria-label={`Remove ${track.name}`} onClick={() => remove(track.id)}>Remove</button></article>)}</div>}
          <p className="visualiser-note">Files are not uploaded or saved. Reloading clears this list.</p>
        </section>
      </div>
      <section className="visualiser-diagnostics" aria-labelledby="analysis-heading" data-graph-creations={graphCreationsRef.current} data-waveform-samples={analyzerRef.current?.waveform.length ?? 0} data-spectrum-bins={analyzerRef.current?.spectrum.length ?? 0}><div className="section-heading"><div><span className="eyebrow">03 / LIVE SIGNAL</span><h2 id="analysis-heading">Audio diagnostics<span className="heading-period">.</span></h2></div><span className="visualiser-count">{playing ? analyzerRef.current ? 'ANALYSING' : 'UNAVAILABLE' : 'IDLE'}</span></div><p>Live levels from the selected track. Readings settle to zero when playback stops.</p><div className="visualiser-meter-grid">{([['amplitude', 'Overall amplitude'], ['low', 'Low · 20–250 Hz'], ['mid', 'Mid · 250–2,000 Hz'], ['high', 'High · 2,000–10,000 Hz']] as const).map(([key, label]) => <div className="visualiser-meter" key={key}><div><span>{label}</span><strong>{metrics[key].toFixed(3)}</strong></div><div className="visualiser-meter-track"><span style={{ width: `${metrics[key] * 100}%` }}/></div></div>)}</div><small>0 = no measured signal · 1 = maximum normalised level. Waveform and spectrum samples are available to later visual modes.</small></section>
      <footer className="page-footer"><span>SONIC STUDIO / AUDIO ANALYSIS</span><span>VISUAL MODES FOLLOW IN V1.7.</span></footer>
    </main>
  </div>
}
