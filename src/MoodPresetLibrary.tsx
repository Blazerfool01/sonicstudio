import { useState } from 'react'
import { getMood } from './data/moods.ts'
import type { MoodSelection } from './lib/moodDna.ts'
import {
  deleteMoodPreset, makeMoodPreset, readMoodPresets, selectionsOf, updateMoodPreset, writeMoodPresets,
} from './lib/moodPresetStorage.ts'
import type { MoodPreset } from './lib/moodPresetStorage.ts'
import './moodPresets.css'
import { readBrowserStorage } from './lib/browserStorage.ts'

function sameSelections(a: readonly MoodSelection[], b: readonly MoodSelection[]) {
  return a.length === b.length && a.every((item, index) => item.moodId === b[index].moodId && item.weight === b[index].weight)
}

export default function MoodPresetLibrary({ selections, onOpen }: { selections: readonly MoodSelection[]; onOpen: (selections: MoodSelection[]) => void }) {
  const [presets, setPresets] = useState<MoodPreset[]>(() => readBrowserStorage(readMoodPresets, []))
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const selected = presets.find(preset => preset.id === selectedId)
  const dirty = Boolean(selected && (selected.name !== name.trim() || !sameSelections(selected.selections, selections)))
  const canSaveNew = selections.length > 0 && Boolean(name.trim()) && (!selected || selected.name !== name.trim())

  function persist(next: MoodPreset[], success: string): boolean {
    try {
      writeMoodPresets(localStorage, next)
      setPresets(next)
      setMessage(success)
      return true
    } catch {
      setMessage('Could not save mood presets on this device.')
      return false
    }
  }

  function saveNew() {
    if (!canSaveNew) return
    const preset = makeMoodPreset(name, selections)
    if (persist([preset, ...presets], `Saved ${preset.name}.`)) setSelectedId(preset.id)
  }

  function update() {
    if (!selected || !dirty || !name.trim() || selections.length === 0) return
    const changed = updateMoodPreset(selected, name, selections)
    persist(presets.map(preset => preset.id === selected.id ? changed : preset), `Updated ${changed.name}.`)
  }

  function open(preset: MoodPreset) {
    onOpen(selectionsOf(preset))
    setSelectedId(preset.id)
    setName(preset.name)
    setMessage(`Opened ${preset.name}. Its guidance was regenerated from saved moods and weights.`)
  }

  function remove(preset: MoodPreset) {
    if (persist(deleteMoodPreset(presets, preset.id), `Deleted ${preset.name}.`) && selectedId === preset.id) {
      setSelectedId(null)
      setName('')
    }
  }

  return <section className="mood-presets" aria-labelledby="mood-presets-heading">
    <div className="mood-presets-heading"><div><span className="eyebrow">03 / SAVED SETUPS</span><h3 id="mood-presets-heading">Mood presets</h3></div><span>{presets.length} SAVED</span></div>
    <p>Keep the selected moods and exact weights on this device. Guidance is rebuilt when opened.</p>
    <label className="mood-preset-name" htmlFor="mood-preset-name">PRESET NAME</label>
    <input id="mood-preset-name" maxLength={80} value={name} onChange={event => setName(event.target.value)} placeholder="Preset name"/>
    <div className="mood-preset-actions"><button onClick={saveNew} disabled={!canSaveNew}>Save as new</button><button onClick={update} disabled={!selected || !dirty || !name.trim() || selections.length === 0}>Update open preset</button></div>
    {selected && <p className="mood-preset-current">Open: {selected.name} · {dirty ? 'Unsaved edits' : 'Up to date'}</p>}
    <p className="mood-preset-message" role="status">{message}</p>
    {presets.length === 0 ? <p className="mood-preset-empty">No saved mood presets yet.</p> : <div className="mood-preset-list">{presets.map(preset => <article className={`mood-preset-item ${preset.id === selectedId ? 'active' : ''}`} key={preset.id}><div><strong>{preset.name}</strong><span>{preset.selections.map(item => `${getMood(item.moodId)!.name} ${item.weight}`).join(' · ')}</span></div><div className="mood-preset-item-actions"><button onClick={() => open(preset)}>Open</button><button onClick={() => remove(preset)}>Delete</button></div></article>)}</div>}
  </section>
}
