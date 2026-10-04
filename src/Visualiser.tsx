import { useEffect, useRef, useState } from 'react'
import { addTracks, audioCandidate, displayName, removeTrack, selectTrack } from './lib/localTracks.ts'
import type { LocalTrack, TrackLibrary } from './lib/localTracks.ts'
import './visualiser.css'

function timeLabel(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const whole = Math.floor(seconds)
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`
}

const emptyLibrary: TrackLibrary = { tracks: [], selectedId: null }

export default function Visualiser({ onNavigate }: { onNavigate: (view: 'genre' | 'vocal' | 'mood') => void }) {
  const [library, setLibrary] = useState<TrackLibrary>(emptyLibrary)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [message, setMessage] = useState('')
  const audioRef = useRef<HTMLAudioElement>(null)
  const urlsRef = useRef(new Map<string, string>())
  const playRequestRef = useRef(0)
  const selected = library.tracks.find(track => track.id === library.selectedId)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    ++playRequestRef.current
    audio.pause()
    audio.removeAttribute('src')
    audio.load()
    setPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    if (library.selectedId) {
      const url = urlsRef.current.get(library.selectedId)
      if (url) audio.src = url
    }
  }, [library.selectedId])

  useEffect(() => () => {
    ++playRequestRef.current
    audioRef.current?.pause()
    for (const url of urlsRef.current.values()) URL.revokeObjectURL(url)
    urlsRef.current.clear()
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
      await audio.play()
      if (request !== playRequestRef.current) { audio.pause(); return }
      setPlaying(true)
      setMessage('')
    } catch {
      if (request === playRequestRef.current) {
        setPlaying(false)
        setMessage('This file could not be played in this browser. Try another audio file.')
      }
    }
  }

  const progress = duration > 0 ? Math.min(100, currentTime / duration * 100) : 0

  return <div className="app-shell">
    <aside className="rail" aria-label="Studio navigation"><div className="brand-mark" aria-label="Sonic Studio">S<span>·</span></div><div className="rail-center"><span className="rail-tick"/><span className="rail-tick"/><span className="rail-tick"/><span className="rail-tick active"/></div><span className="rail-bottom">04 / 04</span></aside>
    <main className="main visualiser-main">
      <header className="topbar"><div className="wordmark">SONIC <span>STUDIO</span><small>V1.5 / LOCAL AUDIO</small></div><div className="topbar-right"><span className="status-dot"/> LOCAL SESSION</div></header>
      <nav className="tool-nav" aria-label="Studio tools"><button onClick={() => onNavigate('genre')}>01 / Genre Mixer</button><button onClick={() => onNavigate('vocal')}>02 / Vocal Persona</button><button onClick={() => onNavigate('mood')}>03 / Mood Mapper</button><button className="active" aria-current="page">04 / Visualiser</button></nav>
      <section className="intro"><div className="eyebrow">BLOCK 04 / LOCAL AUDIO</div><div className="intro-row"><div><h1>Listen <em>locally.</em></h1><p>Import a few tracks, choose one, and control playback. Your files stay in this browser session.</p></div><div className="intro-index">SONIC STUDIO<span>04 / 04</span></div></div></section>
      <div className="visualiser-layout">
        <section className="visualiser-panel" aria-labelledby="player-heading"><div className="section-heading"><div><span className="eyebrow">01 / PLAYER</span><h2 id="player-heading">Now playing<span className="heading-period">.</span></h2></div></div>
          <div className="visualiser-current"><span>SELECTED TRACK</span><strong>{selected?.name ?? 'No track selected'}</strong><small>{selected?.filename ?? 'Import audio to begin'}</small></div>
          <div className="visualiser-controls"><button type="button" onClick={togglePlayback} disabled={!selected} aria-label={playing ? 'Pause' : 'Play'}>{playing ? 'Pause' : 'Play'}</button><div className="visualiser-seek"><input type="range" min="0" max={duration || 0} step="0.01" value={Math.min(currentTime, duration || 0)} disabled={!selected || !duration} aria-label="Seek through track" style={{ '--progress': `${progress}%` } as React.CSSProperties} onChange={event => { const audio = audioRef.current; if (!audio) return; const next = Number(event.target.value); audio.currentTime = next; setCurrentTime(next) }}/><div className="visualiser-times"><span>{timeLabel(currentTime)}</span><span>{timeLabel(duration)}</span></div></div></div>
          <p className="visualiser-message" role="status">{message}</p>
          <audio ref={audioRef} preload="metadata" onLoadedMetadata={event => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)} onDurationChange={event => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)} onTimeUpdate={event => setCurrentTime(event.currentTarget.currentTime)} onPause={() => setPlaying(false)} onPlay={() => setPlaying(true)} onEnded={() => { setPlaying(false); setCurrentTime(audioRef.current?.duration || 0) }} onError={() => { if (selected) { setPlaying(false); setMessage('This file could not be read or played in this browser.') } }}/>
        </section>
        <section className="visualiser-panel" aria-labelledby="tracks-heading"><div className="section-heading"><div><span className="eyebrow">02 / IMPORTED TRACKS</span><h2 id="tracks-heading">Your session<span className="heading-period">.</span></h2></div><span className="visualiser-count">{library.tracks.length} TRACKS</span></div>
          <label className="visualiser-import">Import audio files<input type="file" accept="audio/*,.mp3,.wav,.ogg,.oga,.m4a,.aac,.mp4" multiple onChange={event => { importFiles(event.target.files); event.target.value = '' }}/></label>
          {library.tracks.length === 0 ? <p className="visualiser-empty">No audio imported yet. Choose files from your device to start.</p> : <div className="visualiser-list">{library.tracks.map((track, index) => <article className={track.id === library.selectedId ? 'visualiser-track selected' : 'visualiser-track'} key={track.id}><button type="button" className="visualiser-select" onClick={() => choose(track.id)} aria-current={track.id === library.selectedId ? 'true' : undefined}><span>{String(index + 1).padStart(2, '0')}</span><span><strong>{track.name}</strong><small title={track.filename}>{track.filename} · {track.type} · {(track.size / 1048576).toFixed(2)} MB</small></span></button><button type="button" className="visualiser-remove" aria-label={`Remove ${track.name}`} onClick={() => remove(track.id)}>Remove</button></article>)}</div>}
          <p className="visualiser-note">Files are not uploaded or saved. Reloading clears this list.</p>
        </section>
      </div>
      <footer className="page-footer"><span>SONIC STUDIO / LOCAL AUDIO</span><span>VISUAL MODES FOLLOW IN A LATER STAGE.</span></footer>
    </main>
  </div>
}
