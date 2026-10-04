import { useMemo, useState } from 'react'
import { genres, getGenre } from './data/registry.ts'
import { mergeGenres } from './lib/merge.ts'
import type { Relationship } from './lib/merge.ts'
import { analyzeCompatibility, dimensionLabels } from './lib/compatibility.ts'
import { makeMix, readSavedMixes, sourceOf, STORAGE_KEY, updateMix } from './lib/savedMixes.ts'
import type { SavedMix } from './lib/savedMixes.ts'
import { createRecipe } from './lib/recipe.ts'
import VocalPersonaBuilder from './VocalPersonaBuilder.tsx'
import MoodMapper from './MoodMapper.tsx'
import './vocal.css'

type Slot = 'a' | 'b'

function GenreMixer({ onNavigate }: { onNavigate: (view: 'vocal' | 'mood') => void }) {
  const [firstId, setFirstId] = useState('dark-rnb')
  const [secondId, setSecondId] = useState('hardwave')
  const [weight, setWeight] = useState(60)
  const [activeSlot, setActiveSlot] = useState<Slot>('a')
  const [savedMixes, setSavedMixes] = useState<SavedMix[]>(() => {
    try { return readSavedMixes(localStorage, genres.map(genre => genre.id)) } catch { return [] }
  })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [mixName, setMixName] = useState('')
  const [saveMessage, setSaveMessage] = useState('')
  const [copyMessage, setCopyMessage] = useState('')
  const selectedMix = savedMixes.find(mix => mix.id === selectedId)
  const currentSource = { firstId, secondId, weight }
  const dirty = Boolean(selectedMix && (selectedMix.name !== mixName.trim() || selectedMix.genres[0].genreId !== firstId || selectedMix.genres[1].genreId !== secondId || selectedMix.genres[0].weight !== weight))
  const first = getGenre(firstId)
  const second = getGenre(secondId)
  const dna = useMemo(() => mergeGenres(first, second, weight), [first, second, weight])
  const compatibility = useMemo(() => analyzeCompatibility(first, second, weight), [first, second, weight])
  const recipe = useMemo(() => createRecipe(first, second, weight), [first, second, weight])

  function chooseGenre(id: string) {
    setCopyMessage('')
    if (activeSlot === 'a') {
      if (id === secondId) setSecondId(firstId)
      setFirstId(id)
    } else {
      if (id === firstId) setFirstId(secondId)
      setSecondId(id)
    }
  }

  function reset() {
    setFirstId('dark-rnb')
    setSecondId('hardwave')
    setWeight(60)
    setActiveSlot('a')
    setSelectedId(null)
    setMixName('')
    setSaveMessage('')
    setCopyMessage('')
  }

  function persist(next: SavedMix[], message = 'Recipe saved locally on this device.') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      setSavedMixes(next)
      setSaveMessage(message)
      return true
    } catch {
      setSaveMessage('Local storage is unavailable. Your recipe is still open, but it was not saved.')
      return false
    }
  }

  function saveNew() {
    const name = mixName.trim()
    if (!name) { setSaveMessage('Enter a mix name first.'); return }
    const mix = makeMix(name, currentSource)
    if (persist([mix, ...savedMixes])) setSelectedId(mix.id)
  }

  function saveChanges() {
    if (!selectedMix || !mixName.trim()) { setSaveMessage('Select a saved mix and enter a name first.'); return }
    const changed = updateMix(selectedMix, mixName, currentSource)
    persist(savedMixes.map(mix => mix.id === changed.id ? changed : mix))
  }

  function openMix(mix: SavedMix) {
    const source = sourceOf(mix)
    setFirstId(source.firstId)
    setSecondId(source.secondId)
    setWeight(source.weight)
    setSelectedId(mix.id)
    setMixName(mix.name)
    setActiveSlot('a')
    setCopyMessage('')
    setSaveMessage(`Opened recipe ${mix.name}.`)
  }

  function duplicateMix(mix: SavedMix) {
    const copy = makeMix(`${mix.name} copy`, sourceOf(mix))
    if (persist([copy, ...savedMixes])) openMix(copy)
  }

  function deleteMix(mix: SavedMix) {
    if (!window.confirm(`Delete “${mix.name}”?`)) return
    if (persist(savedMixes.filter(item => item.id !== mix.id), `Deleted recipe ${mix.name}.`) && selectedId === mix.id) {
      setSelectedId(null)
      setMixName('')
    }
  }

  async function copyRecipe(kind: 'short' | 'detailed') {
    try {
      await navigator.clipboard.writeText(recipe[kind])
      setCopyMessage(`${kind === 'short' ? 'Short' : 'Detailed'} recipe copied.`)
    } catch {
      setCopyMessage('Clipboard access failed. Select the recipe text to copy it manually.')
    }
  }

  return <div className="app-shell">
    <aside className="rail" aria-label="Studio navigation">
      <div className="brand-mark" aria-label="Sonic Studio">S<span>·</span></div>
      <div className="rail-center"><span className="rail-tick active" /><span className="rail-tick" /><span className="rail-tick" /><span className="rail-tick" /></div>
      <span className="rail-bottom">01 / 04</span>
    </aside>
    <main className="main">
      <header className="topbar">
        <div className="wordmark">SONIC <span>STUDIO</span><small> / LAB 01</small></div>
        <div className="topbar-right"><span className="status-dot" /> LOCAL SESSION <span className="top-divider" /> V 1.2.2</div>
      </header>
      <nav className="tool-nav" aria-label="Studio tools"><button className="active" aria-current="page">01 / Genre Mixer</button><button onClick={() => onNavigate('vocal')}>02 / Vocal Persona</button><button onClick={() => onNavigate('mood')}>03 / Mood Mapper</button></nav>

      <section className="intro">
        <div className="eyebrow"><span>01</span> / THE GENRE MIXER</div>
        <div className="intro-row"><div><h1>Find the space<br/><em>between sounds.</em></h1><p>Choose two genres. Shift the balance. Discover the sound they make together.</p></div><div className="intro-index">A CREATIVE TOOL<br/>FOR SOUND DESIGN <span>↘</span></div></div>
      </section>

      <div className="workspace">
        <section className="mix-panel" aria-labelledby="blend-heading">
          <div className="section-heading"><div><span className="eyebrow">01 / INPUT</span><h2 id="blend-heading">Build your blend</h2></div><button className="text-button" onClick={reset}>↺ &nbsp; Reset mix</button></div>
          <p className="section-lead">Select a slot, then choose its sound from the library.</p>
          <div className="selected-pair">
            {([{genre:first, slot:'a', percent:weight, label:'SOURCE A'}, {genre:second, slot:'b', percent:100-weight, label:'SOURCE B'}] as const).map(({genre,slot,percent,label}) => <button key={slot} className={`source-card ${activeSlot === slot ? 'selected' : ''}`} style={{'--genre-color':genre.color} as React.CSSProperties} onClick={() => setActiveSlot(slot)} aria-pressed={activeSlot === slot}>
              <span className="source-top"><span>{label}</span><span className="source-indicator">{activeSlot === slot ? 'SELECTED' : 'CHANGE ↗'}</span></span>
              <span className="source-name">{genre.name}</span>
              <span className="source-bottom"><span>{genre.family}</span><strong>{percent}%</strong></span>
            </button>)}
          </div>
          <div className="balance">
            <div className="balance-top"><span>THE BALANCE</span><span>100% TOTAL</span></div>
            <div className="balance-labels"><strong>{first.name}</strong><span>↔</span><strong>{second.name}</strong></div>
            <input aria-label={`${first.name} proportion`} type="range" min="10" max="90" step="5" value={weight} onChange={e => { setWeight(Number(e.target.value)); setCopyMessage('') }} style={{'--split':`${weight}%`} as React.CSSProperties}/>
            <div className="balance-extents"><span>90 / 10</span><span>50 / 50</span><span>10 / 90</span></div>
          </div>
          <div className="library-heading"><span className="eyebrow">02 / SOUND LIBRARY</span><span>{genres.length} CURATED GENRES</span></div>
          <div className="genre-grid">{genres.map(genre => {
            const current = activeSlot === 'a' ? firstId : secondId
            const other = activeSlot === 'a' ? secondId : firstId
            return <button key={genre.id} className={`genre-option ${current === genre.id ? 'current' : ''}`} onClick={() => chooseGenre(genre.id)} title={genre.description} aria-pressed={current === genre.id}>
              <span className="genre-swatch" style={{background:genre.color}}/><span>{genre.name}</span><span className="genre-check">{current === genre.id ? '✓' : other === genre.id ? '↔' : '↗'}</span>
            </button>
          })}</div>
          <p className="library-note">Choosing the other source here swaps the pair.</p>
        </section>

        <section className="output-panel" aria-labelledby="dna-heading">
          <div className="output-head"><div className="eyebrow">03 / THE RESULT <span className="live-pill"><i/> LIVE DNA</span></div><h2 id="dna-heading">Sound DNA<span className="heading-period">.</span></h2><p>A musical arrangement of leading and supporting traits, shaped by your balance.</p></div>
          <div className="dna-identity"><span>YOUR BLEND</span><strong>{first.name} <i>×</i> {second.name}</strong><div><span>{weight}% {first.name}</span><span>{100-weight}% {second.name}</span></div></div>
          <div className="dna-content">
            <div className="tempo-row"><div><span className="field-index">01 / TEMPO</span><strong>{dna.tempo[0]}–{dna.tempo[1]} <small>BPM</small></strong><span className="tempo-source">Rhythmic engine: {dna.tempoSource}</span></div><div className="tempo-bars" aria-hidden="true">{[18,30,42,22,48,34,58,28,52,40,64,35,48,24,38,20].map((height,index)=><span key={index} style={{height:`${height}px`}}/>)}</div></div>
            <DnaField index="02" title="RHYTHMIC FEEL" relation={dna.rhythm}/>
            <DnaField index="03" title="BASS BEHAVIOUR" relation={dna.bass}/>
            <DnaField index="04" title="HARMONIC CHARACTER" relation={dna.harmony}/>
            <DnaField index="05" title="INSTRUMENTATION ROLE" relation={dna.instrumentation}/>
            <DnaField index="06" title="TEXTURE" relation={dna.texture}/>
            <DnaField index="07" title="PRODUCTION SPACE" relation={dna.production}/>
            <DnaField index="08" title="INTENSITY" relation={dna.intensity}/>
            <div className="meter-pair"><Meter title="ENERGY" value={dna.energy} index="09"/><Meter title="DARKNESS" value={dna.darkness} index="10"/></div>
          </div>
          <div className="output-foot"><span>BUILT FROM GENRE DATA</span><span>NO RANDOMNESS · NO API</span></div>
        </section>
      </div>
      <section className="saved-panel" aria-labelledby="saved-heading">
        <div className="saved-head"><div><span className="eyebrow">04 / YOUR RECIPES</span><h2 id="saved-heading">Keep this sound<span className="heading-period">.</span></h2><p>Save the two genres and their exact balance on this device. The recipe is rebuilt whenever you reopen it.</p></div><span className="saved-count">{savedMixes.length} SAVED</span></div>
        <div className="save-form"><label htmlFor="mix-name">RECIPE NAME</label><input id="mix-name" maxLength={80} value={mixName} onChange={event => setMixName(event.target.value)} placeholder="Name this recipe"/><button onClick={saveNew}>Save as new</button><button onClick={saveChanges} disabled={!selectedMix || !dirty || !mixName.trim()}>Update selected</button></div>
        {selectedMix && <p className="saved-selection">Editing {selectedMix.name}{dirty ? ' · Unsaved changes' : ' · Up to date'}</p>}
        <p className="save-message" role="status">{saveMessage}</p>
        {savedMixes.length === 0 ? <p className="saved-empty">No saved recipes yet.</p> : <div className="saved-list">{savedMixes.map(mix => <article className={mix.id === selectedId ? 'saved-item active' : 'saved-item'} key={mix.id}><div><strong>{mix.name}</strong><span>{getGenre(mix.genres[0].genreId).name} {mix.genres[0].weight}% × {getGenre(mix.genres[1].genreId).name} {mix.genres[1].weight}%</span></div><div className="saved-actions"><button onClick={() => openMix(mix)}>Open</button><button onClick={() => duplicateMix(mix)}>Duplicate</button><button onClick={() => deleteMix(mix)}>Delete</button></div></article>)}</div>}
      </section>
      <section className="compat-panel" aria-labelledby="compat-heading">
        <div className="compat-header"><div><span className="eyebrow">05 / THE RELATIONSHIP</span><h2 id="compat-heading">How the sounds meet<span className="heading-period">.</span></h2><p>Seven musical roles, each considered on its own terms. Move the balance to see who takes the lead.</p></div><div className="compat-counts" aria-label="Relationship counts"><span>{compatibility.counts.reinforcing} reinforce</span><span>{compatibility.counts.complementary} complement</span><span>{compatibility.counts.contrasting} contrast</span><span>{compatibility.counts.conflicting} conflict</span></div></div>
        <div className="compat-grid">{compatibility.dimensions.map(item => <article className={`compat-item ${item.kind}`} key={item.dimension}><div className="compat-item-top"><span>{dimensionLabels[item.dimension]}</span><strong>{item.kind}</strong></div><p>{item.explanation}</p>{item.resolution && <div className="resolution"><span>RESOLUTION</span><p>{item.resolution}</p></div>}</article>)}</div>
      </section>
      <section className="recipe-panel" aria-labelledby="recipe-heading">
        <div className="recipe-header"><span className="eyebrow">06 / EXPORTABLE RECIPE</span><h2 id="recipe-heading">Take the sound further<span className="heading-period">.</span></h2><p>Generator-neutral directions from the current mix. Copy either version into your own workflow.</p></div>
        <div className="recipe-grid">
          <article className="recipe-card"><div className="recipe-card-head"><h3>Short recipe</h3><button onClick={() => copyRecipe('short')}>Copy short</button></div><p className="recipe-text">{recipe.short}</p></article>
          <article className="recipe-card"><div className="recipe-card-head"><h3>Detailed recipe</h3><button onClick={() => copyRecipe('detailed')}>Copy detailed</button></div><pre className="recipe-text">{recipe.detailed}</pre></article>
        </div>
        <p className="copy-message" role="status">{copyMessage}</p>
      </section>
      <footer className="page-footer"><span>SONIC STUDIO / GENRE MIXER</span><span>EXPLORE THE IN-BETWEEN.</span></footer>
    </main>
  </div>
}

function DnaField({index,title,relation}:{index:string,title:string,relation:Relationship}) {
  return <div className="dna-field"><div className="field-index">{index} / {title}</div><p className="relationship-text">{relation.text}</p><div className="role-line"><span>LEAD · {relation.anchorGenre}</span><span>ACCENT · {relation.supportGenre}</span></div></div>
}

function Meter({index,title,value}:{index:string,title:string,value:number}) {
  return <div className="meter"><div className="field-index">{index} / {title}</div><div className="meter-number">{value}<small>/100</small></div><div className="meter-track"><span style={{width:`${value}%`}}/></div></div>
}

export default function App() {
  const [view, setView] = useState<'genre' | 'vocal' | 'mood'>('genre')
  return <>
    <div hidden={view !== 'genre'}><GenreMixer onNavigate={setView}/></div>
    <div hidden={view !== 'vocal'}><VocalPersonaBuilder onNavigate={setView}/></div>
    <div hidden={view !== 'mood'}><MoodMapper onNavigate={setView}/></div>
  </>
}
