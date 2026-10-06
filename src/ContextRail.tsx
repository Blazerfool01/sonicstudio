import { useEffect, useLayoutEffect, useState } from 'react'
import type { ProjectTrackSelection } from './lib/studioInteraction.ts'
import type { StudioProject } from './lib/studioProject.ts'
import { deriveContextRailProjection } from './lib/contextRailProjection.ts'
import type { ContextRailIngredient } from './lib/contextRailProjection.ts'
import { draftStateLabel } from './lib/studioInteraction.ts'
import StatusNotice from './StatusNotice.tsx'
import './contextRail.css'

type Section = 'project' | 'guidance' | 'sources' | 'notes'
type IngredientKind = 'genre' | 'vocal' | 'mood'
const sectionLabels: Record<Section, string> = {
  project: 'Project', guidance: 'Guidance', sources: 'Presets / Sources', notes: 'Notes',
}
const toolLabels: Record<IngredientKind, string> = {
  genre: 'Genre Mixer', vocal: 'Vocal Persona', mood: 'Mood Mapper',
}

export default function ContextRail({ project, selection, statusMessage, onProjectNotesChange, onSaveTrackNotes, onOpenIngredient, follow }: {
  follow?: { kind: IngredientKind; sequence: number } | null
  project: StudioProject | null
  selection: ProjectTrackSelection | null
  statusMessage: string
  onProjectNotesChange: (notes: string) => void
  onSaveTrackNotes: (trackId: string, notes: string) => void
  onOpenIngredient: (kind: IngredientKind) => void
}) {
  const [section, setSection] = useState<Section>('project')
  useLayoutEffect(() => { if (follow) setSection('guidance') }, [follow])
  const projection = deriveContextRailProjection(project, selection)
  const selectedTrack = projection.selectedTrack
  const [trackNotesDraft, setTrackNotesDraft] = useState(selectedTrack?.notes ?? '')

  useEffect(() => {
    setTrackNotesDraft(selectedTrack?.notes ?? '')
  }, [projection.project?.id, selectedTrack?.id, selectedTrack?.notes])

  const activeIdentity = projection.identity
  const trackNotesDirty = Boolean(selectedTrack && trackNotesDraft !== selectedTrack.notes)

  return <aside className="studio-context-slot context-rail" aria-label="Context rail">
    <div className="context-rail-heading">
      <span className="studio-context-icon" aria-hidden="true">✳</span>
      <h2>Context rail</h2>
    </div>
    <nav className="context-rail-sections" aria-label="Context rail sections">
      {(Object.keys(sectionLabels) as Section[]).map(key => <button
        type="button"
        key={key}
        aria-pressed={section === key}
        aria-controls="context-rail-panel"
        className={section === key ? 'active' : ''}
        onClick={() => setSection(key)}
      >{sectionLabels[key]}</button>)}
    </nav>

    <section key={section} id="context-rail-panel" className="context-rail-panel" aria-labelledby="context-rail-panel-heading">
      <h3 id="context-rail-panel-heading">{sectionLabels[section]}</h3>

      {section === 'project' && <>
        {projection.project ? <>
          <p className="context-rail-project-name">{projection.project.name}</p>
          <p className="context-rail-context-label">Active project</p>
          <dl className="context-rail-stats">
            <div><dt>Ingredients</dt><dd>{projection.project.ingredientCount}/3</dd></div>
            <div><dt>Tracks</dt><dd>{projection.project.trackCount}</dd></div>
            <div><dt>Comparisons</dt><dd>{projection.project.comparisonCount}</dd></div>
          </dl>
          <section className="context-rail-subsection" aria-labelledby="context-rail-current-heading">
            <h4 id="context-rail-current-heading">Current project identity</h4>
            <IngredientList ingredients={projection.project.ingredients} onOpenMissing={onOpenIngredient}/>
          </section>
          {selectedTrack && <section className="context-rail-history" aria-labelledby="context-rail-history-heading">
            <span className="context-rail-history-tag">SELECTED HISTORICAL TRACK</span>
            <h4 id="context-rail-history-heading">{selectedTrack.title}{selectedTrack.version ? ` · ${selectedTrack.version}` : ''}</h4>
            <p>Source: {selectedTrack.source}{selectedTrack.sourceDetail ? ` · ${selectedTrack.sourceDetail}` : ''}</p>
            <p>Its captured ingredients and guidance are shown separately from current project identity.</p>
            <IngredientList ingredients={activeIdentity?.ingredients ?? []}/>
          </section>}
        </> : <StatusNotice tone="empty">Create or open a project to see its context here.</StatusNotice>}
      </>}

      {section === 'guidance' && <>
        {activeIdentity ? <>
          <p className="context-rail-context-label">Derived from {activeIdentity.label.toLowerCase()}.</p>
          <div className="motion-guidance-blocks" data-follow={follow?.kind}>
            <GuidanceSection title="Genre" guidance={activeIdentity.guidance.genre}/>
            <GuidanceSection title="Vocal" guidance={activeIdentity.guidance.vocal}/>
            <GuidanceSection title="Mood" guidance={activeIdentity.guidance.mood}/>
          </div>
        </> : <StatusNotice tone="empty">Guidance appears when a project identity is available.</StatusNotice>}
      </>}

      {section === 'sources' && <>
        {projection.project ? <>
          <p className="context-rail-context-label">Source references recorded in the project snapshots.</p>
          <section className="context-rail-subsection" aria-labelledby="context-rail-sources-current-heading">
            <h4 id="context-rail-sources-current-heading">Current project sources</h4>
            <SourceList ingredients={projection.project.ingredients}/>
          </section>
          {selectedTrack && <section className="context-rail-subsection" aria-labelledby="context-rail-sources-history-heading">
            <h4 id="context-rail-sources-history-heading">Selected track creation sources</h4>
            <SourceList ingredients={activeIdentity?.ingredients ?? []}/>
          </section>}
          <small className="context-rail-source-footnote">A saved source ID is the captured provenance reference. The rail does not edit or recreate saved presets.</small>
        </> : <StatusNotice tone="empty">Saved sources are shown after a project is opened.</StatusNotice>}
      </>}

      {section === 'notes' && <>
        {projection.project ? <>
          <label className="context-rail-note-label" htmlFor="context-rail-project-notes">PROJECT NOTES <span>Separate from guidance</span></label>
          <textarea
            id="context-rail-project-notes"
            aria-label="Project notes"
            rows={4}
            maxLength={4000}
            value={projection.project.notes}
            onChange={event => onProjectNotesChange(event.target.value)}
          />
          {selectedTrack ? <>
            <label className="context-rail-note-label" htmlFor="context-rail-track-notes">TRACK NOTES <span>Only for {selectedTrack.title}</span></label>
            <textarea
              id="context-rail-track-notes"
              aria-label="Track notes"
              rows={4}
              maxLength={4000}
              value={trackNotesDraft}
              onChange={event => setTrackNotesDraft(event.target.value)}
            />
            <p className="context-rail-draft-state" data-draft-state={trackNotesDirty ? "dirty" : "saved"} aria-live="polite">{draftStateLabel(trackNotesDirty, 'Saved track notes')}</p>
            <button
              type="button"
              className="context-rail-save"
              disabled={!trackNotesDirty}
              onClick={() => onSaveTrackNotes(selectedTrack.id, trackNotesDraft)}
            >Save track notes</button>
          </> : <StatusNotice tone="empty">Select a project track in Tracks to view or edit its separate notes.</StatusNotice>}
          <StatusNotice className="context-rail-storage-status" tone={statusMessage.includes('unavailable') ? 'warning' : 'info'}>{statusMessage}</StatusNotice>
        </> : <StatusNotice tone="empty">Notes are available after a project is opened.</StatusNotice>}
      </>}
    </section>
  </aside>
}

function IngredientList({ ingredients, onOpenMissing }: { ingredients: ContextRailIngredient[]; onOpenMissing?: (kind: IngredientKind) => void }) {
  return <ul className="context-rail-ingredients">
    {ingredients.map(item => <li key={item.kind}>
      <span className="context-rail-ingredient-kind">{item.kind}</span>
      <strong>{item.label}</strong>
      <span className={!item.present ? 'missing' : ''}>{item.detail}</span>
      {!item.present && onOpenMissing && <button type="button" className="context-rail-ingredient-action" onClick={() => onOpenMissing(item.kind)}>Open {toolLabels[item.kind]}</button>}
    </li>)}
  </ul>
}

function SourceList({ ingredients }: { ingredients: ContextRailIngredient[] }) {
  return <ul className="context-rail-sources">
    {ingredients.map(item => <li key={item.kind}>
      <strong>{item.kind}</strong>
      <span>{item.present ? item.label : item.originLabel}</span>
      {item.present && <small>{item.originLabel}</small>}
    </li>)}
  </ul>
}

function GuidanceSection({ title, guidance }: { title: string; guidance: { present: boolean; lines: string[] } }) {
  return <section className="context-rail-guidance" data-motion-guidance={title.toLowerCase()} aria-label={`${title} guidance`}>
    <h4>{title}</h4>
    {guidance.present ? guidance.lines.map((line, index) => <p key={`${title}-${index}`}>{line}</p>)
      : <p className="context-rail-missing">No {title.toLowerCase()} ingredient is attached; its guidance remains open.</p>}
  </section>
}
