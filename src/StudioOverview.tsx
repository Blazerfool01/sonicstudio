import type { StudioProject } from './lib/studioProject.ts'
import { getGenre } from './data/registry.ts'
import { moodDimensions } from './data/moods.ts'
import { deriveMoodDna } from './lib/moodDna.ts'

// Decorative curves are static studio artwork, never an audio-analysis preview.
function StudioWave() {
  return <svg className="studio-wave-art" viewBox="0 0 900 140" preserveAspectRatio="none" aria-hidden="true">{Array.from({ length: 12 }, (_, i) => <path key={i} d={`M0 ${70 + i * 3} C120 ${-45 + i * 5} 180 ${180 - i * 3} 290 70 S440 ${-20 + i * 6} 560 75 S760 ${160 - i * 4} 900 ${30 + i * 6}`} fill="none" stroke={i < 4 ? '#38c9fa' : i < 8 ? '#8657ff' : '#d559ec'} strokeWidth="1.4" opacity={.7 - i * .025}/>)}</svg>
}

export function StudioHero({ project }: { project: StudioProject | null }) {
  return <section className="studio-hero" aria-label="Studio project identity"><div><span className="eyebrow">CREATE · BLEND · SHAPE · VISUALISE · EXPORT</span><h2>Your Sound. More Possible.</h2><p>{project ? project.name : 'Start with a sound. Make it your own.'}</p><small>Genre, voice and mood. One creative direction.</small></div><StudioWave/></section>
}

export function IngredientVisual({ project, kind }: { project: StudioProject; kind: 'genre' | 'vocal' | 'mood' }) {
  if (!project[kind]) return <div className="studio-module-empty"><span aria-hidden="true">{kind === 'genre' ? '≋' : kind === 'vocal' ? '◉' : '◇'}</span><p>Your {kind === 'genre' ? 'sound foundation' : kind === 'vocal' ? 'vocal identity' : 'emotional fingerprint'} starts here.</p></div>
  if (kind === 'genre') return <div className="studio-genre-summary">{project.genre!.genres.map((source, index) => <div key={source.genreId} className={`studio-genre-source source-${index}`}><div className="studio-genre-art" aria-hidden="true"><StudioWave/></div><strong>{getGenre(source.genreId).name}</strong><div className="studio-summary-meter"><span style={{ width: `${source.weight}%` }}/></div><small>{source.weight}% influence</small></div>)}</div>
  if (kind === 'vocal') return <dl className="studio-vocal-summary">{(['warmth', 'power', 'breathiness', 'rasp'] as const).map(id => <div key={id}><dt>{id}</dt><dd><div className="studio-summary-meter"><span style={{ width: `${project.vocal!.selections[id]}%` }}/></div><span>{project.vocal!.selections[id]}</span></dd></div>)}</dl>
  const dna = deriveMoodDna(project.mood!.selections)!
  const point = (index: number, value: number) => { const angle = index * Math.PI * 2 / moodDimensions.length - Math.PI / 2; return `${120 + Math.cos(angle) * value * .75},${100 + Math.sin(angle) * value * .75}` }
  return <div className="studio-mood-summary"><svg viewBox="0 0 240 200" role="img" aria-label={`Captured mood fingerprint: ${moodDimensions.map(d => `${d.id} ${dna.dimensions[d.id]}`).join(', ')}`}>
    {[33, 66, 100].map(value => <polygon key={value} points={moodDimensions.map((_, i) => point(i, value)).join(' ')} fill="none" stroke="#24384d"/>)}
    {moodDimensions.map((dimension, i) => <g key={dimension.id}><line x1="120" y1="100" x2={point(i, 100).split(',')[0]} y2={point(i, 100).split(',')[1]} stroke="#24384d"/><text x={point(i, 120).split(',')[0]} y={point(i, 120).split(',')[1]} textAnchor="middle" fill="#a8bad4" fontSize="9">{dimension.id}</text></g>)}
    <polygon points={moodDimensions.map((d, i) => point(i, dna.dimensions[d.id])).join(' ')} fill="#7652ee66" stroke="#39d7f4" strokeWidth="2"/>
  </svg><span>Dominant mood · {dna.dominantMood.name}</span></div>
}

export function StudioListeningEntry({ trackCount, onVisualise }: { trackCount: number; onVisualise: () => void }) {
  return <section className="studio-listening-entry"><header><div><h2>Audio Visualiser</h2><p>{trackCount ? `${trackCount} local audio ${trackCount === 1 ? 'file' : 'files'} in this session` : 'Attach local audio to explore your sound'}</p></div><button type="button" onClick={onVisualise}>Open Visualiser →</button></header><StudioWave/><small>Spectrum · Waveform · Radial <span>Studio artwork · open Visualiser for live analysis</span></small></section>
}
