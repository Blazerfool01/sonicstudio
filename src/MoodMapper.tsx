import { useEffect, useMemo, useState } from 'react'
import type { MoodProjectSnapshot } from './lib/studioProject.ts'
import { moods, moodDimensions } from './data/moods.ts'
import { deriveMoodDna } from './lib/moodDna.ts'
import type { MoodDna, MoodSelection } from './lib/moodDna.ts'
import { describeMoodDna } from './lib/moodDescription.ts'
import { analyzeMoodRelationships } from './lib/moodRelationships.ts'
import { interpretMoodRelationships } from './lib/moodRelationshipInterpretation.ts'
import { productionGuidanceForMoodDna } from './lib/moodProductionGuidance.ts'
import MoodProductionGuidance from './MoodProductionGuidance.tsx'
import MoodPresetLibrary from './MoodPresetLibrary.tsx'
import './mood.css'

export default function MoodMapper({ onCharacteristics, onUse, projectEnabled }: { onCharacteristics: (dna: MoodDna | null) => void; onUse: (snapshot: MoodProjectSnapshot) => void; projectEnabled: boolean }) {
  const [selections, setSelections] = useState<MoodSelection[]>([])
  const dna = useMemo(() => deriveMoodDna(selections), [selections])
  useEffect(() => { onCharacteristics(dna) }, [dna, onCharacteristics])
  const translation = useMemo(() => productionGuidanceForMoodDna(dna), [dna])
  const relationship = useMemo(() => analyzeMoodRelationships(selections), [selections])
  const guidance = useMemo(() => interpretMoodRelationships(relationship, selections), [relationship, selections])
  const relationshipLabel = relationship.overall.type === 'none' ? null : relationship.overall.type[0].toUpperCase() + relationship.overall.type.slice(1)

  function toggle(moodId: string) {
    setSelections(current => current.some(item => item.moodId === moodId)
      ? current.filter(item => item.moodId !== moodId)
      : current.length < 3 ? [...current, { moodId, weight: 50 }] : current)
  }

  return <div className="app-shell">
    <div className="main">
      <button className="project-use" disabled={!projectEnabled || !dna} aria-describedby={!projectEnabled || !dna ? 'mood-project-help' : undefined} onClick={() => onUse({ label: selections.map(s => `${moods.find(m => m.id === s.moodId)!.name} ${s.weight}`).join(' / '), sourceId: null, selections })}>Use current mood in project / replace mood</button>{(!projectEnabled || !dna) && <small id="mood-project-help">{!projectEnabled ? 'Create or open a project to attach this mood.' : 'Select at least one mood before attaching it.'}</small>}
      <section className="intro"><div className="eyebrow"><span>03</span> / THE MOOD MAPPER</div><div className="intro-row"><div><h2 className="tool-title">Shape the feeling<br/><em>behind the sound.</em></h2><p>Choose up to three moods, set their influence, and explore their shared emotional fingerprint.</p></div><div className="intro-index">A CREATIVE TOOL<br/>FOR EMOTIONAL IDENTITY <span>↘</span></div></div></section>
      <div className="workspace mood-workspace">
        <section className="mix-panel" aria-labelledby="mood-heading"><div className="section-heading"><div><span className="eyebrow">01 / INPUT</span><h2 id="mood-heading">Choose your moods</h2></div><button className="text-button" onClick={() => setSelections([])}>↺ &nbsp; Reset</button></div><p className="section-lead">Select up to three. Each influence is relative to the others.</p>
          <div className="mood-grid">{moods.map(mood => { const selected = selections.some(item => item.moodId === mood.id); return <button key={mood.id} className={`mood-option ${selected ? 'selected' : ''}`} aria-pressed={selected} disabled={!selected && selections.length === 3} onClick={() => toggle(mood.id)}>{mood.name}<span>{selected ? '✓' : '+'}</span></button> })}</div>
          <div className="mood-weights"><div className="library-heading"><span className="eyebrow">02 / INFLUENCE</span><span>{selections.length} / 3 SELECTED</span></div>{selections.length === 0 ? <p className="mood-empty">Select a mood to begin.</p> : selections.map(item => { const mood = moods.find(entry => entry.id === item.moodId)!; return <label className="mood-weight" key={item.moodId}><span><strong>{mood.name}</strong><output>{item.weight} / 100</output></span><input type="range" min="1" max="100" step="1" value={item.weight} aria-label={`${mood.name} influence`} onChange={event => setSelections(current => current.map(selection => selection.moodId === item.moodId ? { ...selection, weight: Number(event.target.value) } : selection))}/></label> })}</div>
          <MoodPresetLibrary selections={selections} onOpen={setSelections}/>
        </section>
        <section className="output-panel" aria-labelledby="fingerprint-heading"><div className="output-head"><span className="eyebrow">03 / MOOD DNA</span><span className="live-pill"><i/> LIVE OUTPUT</span><h2 id="fingerprint-heading">Emotional Fingerprint<span className="heading-period">.</span></h2><p>Seven dimensions on a shared 0–100 scale.</p></div><div className="mood-dominant"><span>DOMINANT MOOD</span><strong>{dna?.dominantMood.name ?? 'Awaiting a mood'}</strong></div><div className="dna-content mood-fingerprint">{moodDimensions.map((dimension, index) => { const value = dna?.dimensions[dimension.id]; return <div className="mood-dimension" key={dimension.id}><div className="field-index">{String(index + 1).padStart(2, '0')} / {dimension.name}</div><div className="mood-axis"><span>{dimension.low}</span><strong>{value === undefined ? '—' : value}</strong><span>{dimension.high}</span></div><div className="mood-track"><span style={{ left: `${value ?? 50}%` }}/></div></div> })}<p className="mood-description">{describeMoodDna(dna)}</p></div><div className="output-foot"><span>DERIVED FROM SELECTED MOODS + INFLUENCE</span><span>SONIC STUDIO / 03</span></div></section>
      </div>
      {selections.length > 0 && <section className={`mood-guidance mood-guidance-${relationship.overall.type}`} aria-labelledby="mood-guidance-heading">
        <div className="mood-guidance-head"><span className="eyebrow">04 / RELATIONSHIP GUIDANCE</span><h2 id="mood-guidance-heading">How the moods meet<span className="heading-period">.</span></h2><p>Derived from the current moods and their influence.</p></div>
        {selections.length === 1 ? <div className="mood-guidance-single"><span>ONE EMOTIONAL CHARACTER</span><h3>{guidance.headline}</h3><p>{guidance.summary}</p><div className="mood-guidance-direction"><strong>Creative direction</strong><p>{guidance.strategy}</p></div></div> : <>
          <div className="mood-guidance-overview"><div className="mood-guidance-title"><span className="mood-relationship-label">{relationshipLabel}</span><h3>{guidance.headline}</h3></div><p>{guidance.summary}</p></div>
          <div className="mood-guidance-direction"><strong>Creative direction</strong><p>{guidance.strategy}</p></div>
          <div className="mood-role-section"><h3>Mood roles</h3><div className="mood-role-list">{guidance.roles.map(role => <div className="mood-role-row" key={role.moodId}><strong>{role.name}</strong><span>{role.role}</span><span>{role.weight} / 100</span></div>)}</div></div>
          {(guidance.supports.length > 0 || guidance.tensions.length > 0) && <div className="mood-guidance-groups">
            {guidance.supports.length > 0 && <div className="mood-guidance-group"><h3>Shared qualities</h3>{guidance.supports.map(item => { const dimension = moodDimensions.find(entry => entry.id === item.dimension)!; return <article className="mood-guidance-card support" key={`${item.pair.join('-')}-${item.dimension}`}><span className="mood-pair">{moods.find(mood => mood.id === item.pair[0])!.name} + {moods.find(mood => mood.id === item.pair[1])!.name}</span><strong>{dimension.name} · {item.endpoint}</strong><p>{item.explanation}</p></article> })}</div>}
            {guidance.tensions.length > 0 && <div className="mood-guidance-group"><h3>Creative tensions</h3>{guidance.tensions.map(item => { const dimension = moodDimensions.find(entry => entry.id === item.dimension)!; return <article className="mood-guidance-card tension" key={`${item.pair.join('-')}-${item.dimension}`}><span className="mood-pair">{moods.find(mood => mood.id === item.pair[0])!.name} ↔ {moods.find(mood => mood.id === item.pair[1])!.name}</span><strong>{dimension.name}</strong><span className="mood-directions">{item.firstDirection} ↔ {item.secondDirection}</span><p>{item.explanation}</p><div className="mood-card-resolution"><span>Use it</span><p>{item.resolution}</p></div></article> })}</div>}
          </div>}
        </>}
      </section>}
      <MoodProductionGuidance translation={translation}/>
      <footer className="page-footer"><span>SONIC STUDIO / MOOD MAPPER</span><span>FIND THE FEELING.</span></footer>
    </div>
  </div>
}
