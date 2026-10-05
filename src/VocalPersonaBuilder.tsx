import { useMemo, useState } from 'react'
import type { VocalProjectSnapshot } from './lib/studioProject.ts'
import { deliveries, registers, textures, vocalEffects } from './data/vocalTraits.ts'
import { createVoiceDna, defaultVocalSelections } from './lib/voiceDna.ts'
import type { VocalDimension, VocalSelections } from './lib/voiceDna.ts'
import { createVocalPersona } from './lib/vocalPersona.ts'
import type { VocalPersona } from './lib/vocalPersona.ts'
import { readSavedPersonas, writeSavedPersonas } from './lib/savedPersonas.ts'
import { createVocalInterpretation } from './lib/vocalInterpretation.ts'
import { createVocalPrompts } from './lib/vocalPrompts.ts'
import { compareVocalPersonas } from './lib/vocalComparison.ts'
import { createVocalExperiment, readVocalExperiments, writeVocalExperiments } from './lib/vocalExperiments.ts'
import type { VocalExperiment } from './lib/vocalExperiments.ts'
import { readBrowserStorage } from './lib/browserStorage.ts'

const groups = [
  { key: 'register', label: 'Register', options: registers },
  { key: 'texture', label: 'Texture', options: textures },
  { key: 'delivery', label: 'Delivery', options: deliveries },
  { key: 'effect', label: 'Vocal effect', options: vocalEffects },
] as const
const sliders: { key: VocalDimension; label: string }[] = [
  { key: 'breathiness', label: 'Breathiness' },
  { key: 'power', label: 'Power' },
  { key: 'warmth', label: 'Warmth' },
  { key: 'rasp', label: 'Rasp' },
]

export default function VocalPersonaBuilder({ onUse, projectEnabled }: { onUse: (snapshot: VocalProjectSnapshot) => void; projectEnabled: boolean }) {
  const [selections, setSelections] = useState<VocalSelections>(defaultVocalSelections)
  const dna = useMemo(() => createVoiceDna(selections), [selections])
  const [personaName, setPersonaName] = useState('')
  const [identityDescription, setIdentityDescription] = useState('')
  const [personas, setPersonas] = useState<VocalPersona[]>(() => readBrowserStorage(readSavedPersonas, []))
  const [openedPersonaId, setOpenedPersonaId] = useState<string | null>(null)
  const [creationMessage, setCreationMessage] = useState('')
  const [copyMessage, setCopyMessage] = useState('')
  const [compareFirstId, setCompareFirstId] = useState('')
  const [compareSecondId, setCompareSecondId] = useState('')
  const [experiments, setExperiments] = useState<VocalExperiment[]>(() => readBrowserStorage(readVocalExperiments, []))
  const [experimentLabel, setExperimentLabel] = useState('')
  const [experimentNote, setExperimentNote] = useState('')
  const [experimentPersonaId, setExperimentPersonaId] = useState('')
  const [experimentMessage, setExperimentMessage] = useState('')
  const openedPersona = personas.find(persona => persona.id === openedPersonaId)
  const displayedDna = openedPersona?.voiceDna ?? dna
  const guidance = useMemo(() => createVocalInterpretation(openedPersona?.selections ?? selections), [openedPersona, selections])
  const prompts = useMemo(() => createVocalPrompts(openedPersona?.selections ?? selections, displayedDna), [openedPersona, selections, displayedDna])
  const compareFirst = personas.find(persona => persona.id === compareFirstId) ?? personas[0]
  const compareSecond = personas.find(persona => persona.id === compareSecondId && persona.id !== compareFirst?.id) ?? personas.find(persona => persona.id !== compareFirst?.id)
  const comparison = compareFirst && compareSecond ? compareVocalPersonas(compareFirst, compareSecond) : []
  const experimentPersona = personas.find(persona => persona.id === experimentPersonaId) ?? openedPersona ?? personas[0]

  async function copyPrompt(kind: 'concise' | 'detailed', value: string) {
    try {
      await navigator.clipboard.writeText(value)
      setCopyMessage(`${kind === 'concise' ? 'Concise' : 'Detailed'} vocal prompt copied.`)
    } catch { setCopyMessage('Clipboard unavailable. Select the prompt text to copy it.') }
  }

  function saveExperiment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!experimentPersona) { setExperimentMessage('Save a persona first.'); return }
    try {
      const next = [createVocalExperiment(experimentLabel, experimentNote, experimentPersona.id), ...experiments]
      writeVocalExperiments(localStorage, next)
      setExperiments(next)
      setExperimentLabel('')
      setExperimentNote('')
      setExperimentMessage(`Experiment saved with Persona ID ${experimentPersona.id}.`)
    } catch (error) {
      setExperimentMessage(error instanceof Error ? error.message : 'Could not save experiment.')
    }
  }

  function change<K extends keyof VocalSelections>(key: K, value: VocalSelections[K]) {
    setSelections(previous => ({ ...previous, [key]: value }))
    setOpenedPersonaId(null)
    setCopyMessage('')
    setCreationMessage('Builder changed. Saved personas remain unchanged.')
  }

  function createPersona(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      const persona = createVocalPersona(personaName, identityDescription, selections)
      const next = [persona, ...personas]
      writeSavedPersonas(localStorage, next)
      setPersonas(next)
      setOpenedPersonaId(persona.id)
      setPersonaName('')
      setIdentityDescription('')
      setCreationMessage(`Saved ${persona.name} on this device.`)
    } catch (error) {
      setCreationMessage(error instanceof Error && error.message.startsWith('Enter') ? error.message : 'Could not save persona. Check local storage and try again.')
    }
  }

  function openPersona(persona: VocalPersona) {
    setSelections({ ...persona.selections })
    setOpenedPersonaId(persona.id)
    setCopyMessage('')
    setCreationMessage(`Opened ${persona.name}. Its saved record is unchanged.`)
  }

  return <div className="app-shell">
    <div className="main">
      <button className="project-use" disabled={!projectEnabled} aria-describedby={!projectEnabled ? 'vocal-project-help' : undefined} onClick={() => onUse({ label: openedPersona?.name ?? 'Current vocal builder', sourceId: openedPersona?.id ?? null, identityDescription: openedPersona?.identityDescription ?? '', selections: openedPersona?.selections ?? selections })}>{openedPersona ? 'Use opened persona' : 'Use current voice'} in project / replace vocal</button>{!projectEnabled && <small id="vocal-project-help">Create or open a project to attach this voice.</small>}
      <section className="intro"><div className="eyebrow"><span>02</span> / VOCAL PERSONA BUILDER</div><div className="intro-row"><div><h2 className="tool-title">Shape the voice<br/><em>behind the sound.</em></h2><p>Choose a vocal character and adjust its four expressive dimensions. Voice DNA updates as you work.</p></div><div className="intro-index">AN INDEPENDENT<br/>VOCAL STUDY <span>↘</span></div></div></section>
      <div className="workspace vocal-workspace">
        <section className="mix-panel" aria-labelledby="vocal-input-heading"><div className="section-heading"><div><span className="eyebrow">01 / INPUT</span><h2 id="vocal-input-heading">Build a voice</h2></div><button className="text-button" onClick={() => { setSelections(defaultVocalSelections); setOpenedPersonaId(null); setCopyMessage('') }}>↺ &nbsp; Reset voice</button></div>
          <p className="section-lead">Select one trait in each group, then adjust the dimensions.</p>
          {groups.map(group => <fieldset className="vocal-fieldset" key={group.key}><legend>{group.label}</legend><div className="vocal-options">{group.options.map(option => <button type="button" key={option.id} className={selections[group.key] === option.id ? 'vocal-option selected' : 'vocal-option'} aria-pressed={selections[group.key] === option.id} onClick={() => change(group.key, option.id)} title={option.description}>{option.label}</button>)}</div></fieldset>)}
          <div className="vocal-sliders">{sliders.map(({ key, label }) => <label className="vocal-slider" key={key}><span>{label}<strong>{selections[key]} / 100</strong></span><input type="range" min="0" max="100" step="1" value={selections[key]} onChange={event => change(key, Number(event.target.value))}/></label>)}</div>
        </section>
        <section className="output-panel" aria-labelledby="voice-dna-heading"><div className="output-head"><div className="eyebrow">02 / THE RESULT <span className="live-pill"><i/> {openedPersona ? 'SAVED DNA' : 'LIVE DNA'}</span></div><h2 id="voice-dna-heading">Voice DNA<span className="heading-period">.</span></h2><p>{openedPersona ? 'The exact Voice DNA captured with this persona.' : 'A structured vocal identity derived from the current controls.'}</p></div>
          <div className="dna-identity"><span>VOCAL CHARACTER</span><strong>{displayedDna.register.label} · {displayedDna.texture.label} · {displayedDna.delivery.label}</strong><div><span>{displayedDna.effect.label} effect</span></div></div>
          <div className="dna-content vocal-dna-content"><p className="vocal-summary">{displayedDna.description}</p>{groups.map(group => { const trait = displayedDna[group.key]; return <div className="dna-field" key={group.key}><div className="field-index">{group.label.toUpperCase()} / {trait.label.toUpperCase()}</div><p className="relationship-text">{trait.description}</p></div> })}<div className="vocal-dimensions">{sliders.map(({ key, label }) => <div className="dna-field" key={key}><div className="field-index">{label.toUpperCase()} / {displayedDna.dimensions[key].value}</div><p className="relationship-text">{displayedDna.dimensions[key].description}</p></div>)}</div></div>
          <div className="output-foot"><span>BUILT FROM VOCAL TRAIT DATA</span><span>NO RANDOMNESS · NO API</span></div>
        </section>
      </div>
      <section className="guidance-panel" aria-labelledby="vocal-guidance-heading"><div className="guidance-head"><span className="eyebrow">03 / VOCAL GUIDANCE</span><h2 id="vocal-guidance-heading">How this voice holds together<span className="heading-period">.</span></h2><p>{openedPersona ? `Derived from ${openedPersona.name}'s saved selections.` : 'A live interpretation of the selected vocal qualities.'}</p></div>
        <div className="guidance-strategy"><span>DOMINANT QUALITY</span><strong>{guidance.dominantQuality}</strong><span>PERFORMANCE STRATEGY</span><p>{guidance.strategy}</p></div>
        <div className="guidance-groups"><div className="guidance-group"><h3>Supporting qualities <span>{guidance.supportingQualities.length}</span></h3>{guidance.supportingQualities.length === 0 ? <p className="guidance-empty">No curated supporting pair is active for this voice.</p> : guidance.supportingQualities.map(item => <article className="guidance-item support" key={item.relationshipId}><span>{item.kind}</span><p>{item.explanation}</p></article>)}</div><div className="guidance-group"><h3>Creative tensions <span>{guidance.tensions.length}</span></h3>{guidance.tensions.length === 0 ? <p className="guidance-empty">No contrasting or conflicting pair needs a resolution.</p> : guidance.tensions.map(item => <article className="guidance-item tension" key={item.relationshipId}><span>Creative tension · {item.kind}</span><p>{item.explanation}</p><div className="guidance-resolution"><strong>How it resolves</strong><p>{item.resolution}</p></div></article>)}</div></div>
      </section>
      <section className="vocal-prompts-panel" aria-labelledby="vocal-prompts-heading"><div className="persona-panel-head"><span className="eyebrow">04 / VOCAL PROMPTS</span><h2 id="vocal-prompts-heading">Take the voice further<span className="heading-period">.</span></h2><p>{openedPersona ? `Rebuilt from ${openedPersona.name}'s saved identity.` : 'Generator-neutral vocal directions from the live voice.'}</p></div><div className="vocal-prompt-grid"><article className="vocal-prompt-card"><div className="vocal-prompt-title"><h3>Concise prompt</h3><button type="button" onClick={() => copyPrompt('concise', prompts.concise)}>Copy concise</button></div><p>{prompts.concise}</p></article><article className="vocal-prompt-card"><div className="vocal-prompt-title"><h3>Detailed prompt</h3><button type="button" onClick={() => copyPrompt('detailed', prompts.detailed)}>Copy detailed</button></div><pre>{prompts.detailed}</pre></article></div><p className="vocal-action-message" role="status">{copyMessage}</p></section>
      <section className="persona-panel" aria-labelledby="persona-heading"><div className="persona-panel-head"><span className="eyebrow">05 / PERSONA IDENTITY</span><h2 id="persona-heading">Give this voice an identity<span className="heading-period">.</span></h2><p>Create a persona from the current Voice DNA and keep it on this device.</p></div>
        {openedPersona && <div className="persona-opened"><span>OPEN IN BUILDER</span><strong>{openedPersona.name}</strong><code>{openedPersona.id}</code><p>{openedPersona.identityDescription}</p></div>}
        <form className="persona-form" onSubmit={createPersona}><label>PERSONA NAME<input maxLength={80} value={personaName} onChange={event => setPersonaName(event.target.value)} placeholder="A name for this voice" required/></label><label>SHORT IDENTITY DESCRIPTION<textarea maxLength={240} rows={3} value={identityDescription} onChange={event => setIdentityDescription(event.target.value)} placeholder="What makes this singer recognisable?" required/></label><button type="submit">Create and save</button></form>
        <p className="persona-message" role="status">{creationMessage}</p>
        <div className="persona-records"><h3>Saved persona library <span>{personas.length}</span></h3>{personas.length === 0 ? <p>No saved personas yet.</p> : personas.map(persona => <article className="persona-record" key={persona.id}><div className="persona-record-top"><strong>{persona.name}</strong><code>{persona.id}</code></div><p>{persona.identityDescription}</p><div className="persona-record-dna"><span>CAPTURED VOICE DNA</span><p>{persona.voiceDna.description}</p><div className="persona-record-traits"><span>{persona.voiceDna.register.label} register</span><span>{persona.voiceDna.texture.label} texture</span><span>{persona.voiceDna.delivery.label} delivery</span><span>{persona.voiceDna.effect.label} effect</span>{sliders.map(({key,label}) => <span key={key}>{label} {persona.voiceDna.dimensions[key].value}/100</span>)}</div></div><button type="button" className="persona-open-button" onClick={() => openPersona(persona)}>Open in builder</button></article>)}</div>
      </section>
      <section className="vocal-comparison-panel" aria-labelledby="vocal-comparison-heading"><div className="persona-panel-head"><span className="eyebrow">06 / COMPARE SAVED VOICES</span><h2 id="vocal-comparison-heading">Hear the difference on paper<span className="heading-period">.</span></h2><p>Choose two saved Personas. Their captured identities and prompts remain independent.</p></div>{personas.length < 2 ? <p className="guidance-empty">Save two Personas to compare them side by side.</p> : <><div className="vocal-compare-selectors"><label>FIRST PERSONA<select aria-label="First comparison persona" value={compareFirst?.id ?? ''} onChange={event => setCompareFirstId(event.target.value)}>{personas.map(persona => <option key={persona.id} value={persona.id}>{persona.name}</option>)}</select></label><label>SECOND PERSONA<select aria-label="Second comparison persona" value={compareSecond?.id ?? ''} onChange={event => setCompareSecondId(event.target.value)}>{personas.filter(persona => persona.id !== compareFirst?.id).map(persona => <option key={persona.id} value={persona.id}>{persona.name}</option>)}</select></label></div><div className="vocal-difference-table" role="table" aria-label="Vocal differences"><div className="vocal-difference-row header" role="row"><span role="columnheader">QUALITY</span><strong role="columnheader">{compareFirst?.name}</strong><strong role="columnheader">{compareSecond?.name}</strong></div>{comparison.map(item => <div className={item.differs ? 'vocal-difference-row changed' : 'vocal-difference-row'} role="row" key={item.label}><span role="cell">{item.label}</span><span role="cell">{item.first}</span><span role="cell">{item.second}</span></div>)}</div><div className="vocal-compare-prompts">{[compareFirst, compareSecond].map(persona => persona && <article className="vocal-prompt-card" key={persona.id}><h3>{persona.name}</h3><p className="vocal-compare-identity">{persona.identityDescription}</p><span>CONCISE VOCAL PROMPT</span><p>{createVocalPrompts(persona.selections, persona.voiceDna).concise}</p><span>DETAILED VOCAL PROMPT</span><pre>{createVocalPrompts(persona.selections, persona.voiceDna).detailed}</pre></article>)}</div></>}</section>
      <section className="vocal-experiment-panel" aria-labelledby="vocal-experiment-heading"><div className="persona-panel-head"><span className="eyebrow">07 / EXPERIMENT REFERENCES</span><h2 id="vocal-experiment-heading">Keep track of the singer<span className="heading-period">.</span></h2><p>Record which saved Persona an external experiment used. This reference does not edit the Persona.</p></div><form className="vocal-experiment-form" onSubmit={saveExperiment}><label>EXPERIMENT LABEL<input value={experimentLabel} onChange={event => setExperimentLabel(event.target.value)} maxLength={80} placeholder="e.g. First chorus draft" required/></label><label>PERSONA<select value={experimentPersona?.id ?? ''} onChange={event => setExperimentPersonaId(event.target.value)} disabled={!personas.length} aria-label="Experiment Persona">{personas.length ? personas.map(persona => <option key={persona.id} value={persona.id}>{persona.name}</option>) : <option value="">Save a Persona first</option>}</select></label><label className="vocal-experiment-note">NOTE (OPTIONAL)<textarea value={experimentNote} onChange={event => setExperimentNote(event.target.value)} maxLength={240} rows={2} placeholder="What did you try?"/></label><button type="submit" disabled={!personas.length}>Save reference</button></form><p className="vocal-action-message" role="status">{experimentMessage}</p><div className="vocal-experiment-list">{experiments.map(experiment => { const persona = personas.find(item => item.id === experiment.personaId); return <article key={experiment.id}><strong>{experiment.label}</strong><span>{persona?.name ?? 'Unavailable Persona'} · {experiment.personaId}</span>{experiment.note && <p>{experiment.note}</p>}</article> })}</div></section>
      <footer className="page-footer"><span>SONIC STUDIO / VOCAL PERSONA</span><span>EXPLORE THE VOICE.</span></footer>
    </div>
  </div>
}
