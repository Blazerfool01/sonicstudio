import type { StudioProject } from './lib/studioProject.ts'
import { IngredientVisual } from './StudioOverview.tsx'
import { getGenre } from './data/registry.ts'
import { getMood } from './data/moods.ts'
import { analyzeCompatibility } from './lib/compatibility.ts'
import BlendProgress from './BlendProgress.tsx'

export default function FidelityDashboardModules({ project, onOpen }: {
  project: StudioProject
  onOpen: (tool: 'genre' | 'vocal' | 'mood') => void
}) {
  const genreSources = project.genre?.genres
  const primary = genreSources ? getGenre(genreSources[0].genreId) : null
  const secondary = genreSources ? getGenre(genreSources[1].genreId) : null
  const compatibility = primary && secondary ? analyzeCompatibility(primary, secondary, genreSources![0].weight) : null
  return <section className="dashboard-modules" aria-label="Creative studio modules">
    <article className="dashboard-card sound-card fidelity-sound-card">
      <header><h2>◈ Sound DNA / Genre Blend</h2><button onClick={() => onOpen('genre')}>Explore Genres →</button></header>
      <div className="sound-dna-composition">
        <div className="dashboard-genres">{genreSources?.map((genre, i) => { const source = getGenre(genre.genreId); return <div className="dashboard-genre" key={genre.genreId}>
          <div className={`reference-art genre-art-${i}`} aria-hidden="true"/>
          <strong>{source.name}</strong><small>{source.family} · {source.tempo[0]}–{source.tempo[1]} BPM</small>
          <div className="genre-weight"><div className="studio-summary-meter"><span style={{ width: `${genre.weight}%` }}/></div><small>{genre.weight}%</small></div>
        </div>})}</div>
        <BlendProgress primary={primary} secondary={secondary} primaryWeight={genreSources?.[0].weight ?? 0} compatibility={compatibility} compact/>
      </div>
      <svg className="reference-wave compact" viewBox="0 0 454 77" preserveAspectRatio="none" role="img" aria-label="Dual sine-wave studio artwork"><image href="/reference/studio-target.png" x="-227" y="-500" width="1672" height="941"/></svg>
    </article>
    <article className="dashboard-card vocal-card">
      <header><h2>♩ Vocal Persona Lab</h2><button onClick={() => onOpen('vocal')}>Browse Personas</button></header>
      <div className="dashboard-persona"><div className="reference-art persona-art" aria-hidden="true"/><div><strong>{project.vocal?.label ?? 'Vocal identity'}</strong><div className="persona-tags"><span>{project.vocal?.selections.texture}</span><span>{project.vocal?.selections.delivery}</span><span>{project.vocal?.selections.effect}</span></div><p>{project.vocal?.identityDescription}</p></div></div>
      <IngredientVisual project={project} kind="vocal"/><small className="dashboard-footnote">Captured voice · edit in Vocal Persona</small>
    </article>
    <article className="dashboard-card mood-card">
      <header><h2>✤ Mood Mapper</h2><button onClick={() => onOpen('mood')}>Custom ⌄</button></header>
      <IngredientVisual project={project} kind="mood"/>
      <div className="dashboard-moods">{project.mood?.selections.map(s => <button key={s.moodId} onClick={() => onOpen('mood')}>{getMood(s.moodId)?.name}<span>{s.weight}%</span></button>)}</div>
    </article>
  </section>
}
