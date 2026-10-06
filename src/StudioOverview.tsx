import type { StudioProject } from './lib/studioProject.ts'
import { getGenre } from './data/registry.ts'
import { deriveMoodDna } from './lib/moodDna.ts'
import MoodRadar from './MoodRadar.tsx'

// Static artwork follows the supplied moonlit-wave hero; it is not audio data.
function StudioHeroArtwork() {
  return <svg className="studio-hero-art" viewBox="0 0 560 230" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <radialGradient id="hero-nebula" cx="66%" cy="48%" r="64%"><stop stopColor="#2236bd" stopOpacity=".55"/><stop offset=".55" stopColor="#27167c" stopOpacity=".24"/><stop offset="1" stopColor="#071020" stopOpacity="0"/></radialGradient>
      <radialGradient id="hero-moon" cx="42%" cy="34%"><stop stopColor="#58dcff" stopOpacity=".95"/><stop offset=".45" stopColor="#4e49ff"/><stop offset="1" stopColor="#972bff" stopOpacity=".25"/></radialGradient>
      <linearGradient id="hero-mountain" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#07122c"/><stop offset=".42" stopColor="#14205d"/><stop offset=".74" stopColor="#26134d"/><stop offset="1" stopColor="#071327"/></linearGradient>
      <linearGradient id="hero-ridge" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#1b68ff"/><stop offset=".4" stopColor="#4944ff"/><stop offset=".78" stopColor="#b13cff"/><stop offset="1" stopColor="#e752e8"/></linearGradient>
      <linearGradient id="hero-current" x1="0" x2="1"><stop stopColor="#27d9ff"/><stop offset=".55" stopColor="#8163ff"/><stop offset="1" stopColor="#ec4ef8"/></linearGradient>
      <filter id="hero-glow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="7" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <rect width="560" height="230" fill="url(#hero-nebula)"/>
    <g fill="#86dcff" opacity=".72">
      <circle cx="32" cy="72" r="1"/><circle cx="66" cy="52" r="1.2"/><circle cx="126" cy="28" r="1"/><circle cx="186" cy="66" r="1.1"/>
      <circle cx="238" cy="34" r="1.2"/><circle cx="300" cy="52" r="1"/><circle cx="343" cy="25" r="1.1"/><circle cx="460" cy="48" r="1.3"/>
      <circle cx="511" cy="29" r="1"/><circle cx="538" cy="78" r="1.1"/><circle cx="278" cy="83" r=".8"/><circle cx="150" cy="91" r=".8"/>
    </g>
    <circle cx="405" cy="94" r="69" fill="url(#hero-moon)" opacity=".8" filter="url(#hero-glow)"/>
    <circle cx="405" cy="94" r="69" fill="none" stroke="#64dbff" strokeWidth="2" opacity=".9"/>
    <ellipse cx="400" cy="95" rx="106" ry="27" transform="rotate(-20 400 95)" fill="none" stroke="url(#hero-current)" strokeWidth="2" opacity=".8" filter="url(#hero-glow)"/>
    <path d="M0 178 C34 171 61 151 91 151 C121 151 127 168 151 155 C174 143 182 119 208 117 C232 115 245 131 265 119 C286 106 297 82 321 79 C344 76 352 98 371 95 C397 91 407 65 431 59 C454 53 469 77 492 76 C517 75 531 48 560 41V230H0Z" fill="url(#hero-mountain)" opacity=".94"/>
    <path d="M0 178 C34 171 61 151 91 151 C121 151 127 168 151 155 C174 143 182 119 208 117 C232 115 245 131 265 119 C286 106 297 82 321 79 C344 76 352 98 371 95 C397 91 407 65 431 59 C454 53 469 77 492 76 C517 75 531 48 560 41" fill="none" stroke="url(#hero-ridge)" strokeWidth="2.4" opacity=".9" filter="url(#hero-glow)"/>
    <path d="M0 190 C37 183 64 166 94 164 C124 162 132 179 157 167 C181 155 188 134 213 132 C237 130 249 146 270 134 C291 122 303 99 327 96 C349 93 357 114 377 111 C403 107 413 82 436 76 C459 70 475 94 497 92 C521 90 535 66 560 59" fill="none" stroke="#356fff" strokeWidth="1.6" opacity=".8"/>
    <path d="M0 204 C41 196 69 180 99 178 C130 176 138 192 163 181 C188 171 195 150 220 148 C244 146 255 162 277 151 C299 140 311 117 335 114 C358 111 365 132 386 129 C411 125 421 101 444 94 C468 87 482 111 504 109 C527 107 540 85 560 78" fill="none" stroke="#a13aff" strokeWidth="1.8" opacity=".85"/>
    <path d="M0 218 C46 209 73 194 105 192 C136 190 144 206 170 196 C195 186 203 166 228 164 C251 162 263 178 285 168 C307 158 319 137 343 134 C366 131 374 151 394 148 C420 144 430 121 453 113 C476 105 491 129 513 126 C535 123 546 104 560 97" fill="none" stroke="#27c8ff" strokeWidth="1.4" opacity=".68"/>
    <path d="M0 226 C62 215 103 222 158 214 S267 183 323 195 436 207 493 191 540 180 560 172" fill="none" stroke="#703cff" strokeWidth="1.2" opacity=".65"/>
  </svg>
}

function StudioWave() {
  return <svg className="studio-wave-art" viewBox="0 0 900 140" preserveAspectRatio="none" aria-hidden="true">{Array.from({ length: 12 }, (_, i) => <path key={i} d={`M0 ${70 + i * 3} C120 ${-45 + i * 5} 180 ${180 - i * 3} 290 70 S440 ${-20 + i * 6} 560 75 S760 ${160 - i * 4} 900 ${30 + i * 6}`} fill="none" stroke={i < 4 ? '#38c9fa' : i < 8 ? '#8657ff' : '#d559ec'} strokeWidth="1.4" opacity={.7 - i * .025}/>)}</svg>
}

export function StudioHero({ onStart }: { onStart: () => void }) {
  return <section className="studio-hero reference-home-hero" aria-label="Create without limits">
    <div className="reference-home-copy"><h2>Create<br/>Without Limits</h2><p>Mix genres. Shape voices. Set the mood.<br/>Bring your sound to life.</p><button type="button" className="dashboard-primary" onClick={onStart}>Start Creating <span aria-hidden="true">→</span></button></div>
    <StudioHeroArtwork/>
  </section>
}

export function IngredientVisual({ project, kind }: { project: StudioProject; kind: 'genre' | 'vocal' | 'mood' }) {
  if (!project[kind]) return <div className="studio-module-empty"><span aria-hidden="true">{kind === 'genre' ? '≋' : kind === 'vocal' ? '◉' : '◇'}</span><p>Your {kind === 'genre' ? 'sound foundation' : kind === 'vocal' ? 'vocal identity' : 'emotional fingerprint'} starts here.</p></div>
  if (kind === 'genre') return <div className="studio-genre-summary">{project.genre!.genres.map((source, index) => <div key={source.genreId} className={`studio-genre-source source-${index}`}><div className="studio-genre-art" aria-hidden="true"><StudioWave/></div><strong>{getGenre(source.genreId).name}</strong><div className="studio-summary-meter"><span style={{ width: `${source.weight}%` }}/></div><small>{source.weight}% influence</small></div>)}</div>
  if (kind === 'vocal') return <dl className="studio-vocal-summary">{(['warmth', 'power', 'breathiness', 'rasp'] as const).map(id => <div key={id}><dt>{id}</dt><dd><div className="studio-summary-meter"><span style={{ width: `${project.vocal!.selections[id]}%` }}/></div><span>{project.vocal!.selections[id]}</span></dd></div>)}</dl>
  const dna = deriveMoodDna(project.mood!.selections)!
  return <div className="studio-mood-summary"><MoodRadar dna={dna}/><span>Dominant mood · {dna.dominantMood.name}</span></div>
}

export function StudioListeningEntry({ trackCount, onVisualise }: { trackCount: number; onVisualise: () => void }) {
  return <section className="studio-listening-entry"><header><div><h2>Audio Visualiser</h2><p>{trackCount ? `${trackCount} local audio ${trackCount === 1 ? 'file' : 'files'} in this session` : 'Attach local audio to explore your sound'}</p></div><button type="button" onClick={onVisualise}>Open Visualiser →</button></header><StudioWave/><small>Spectrum · Waveform · Radial <span>Studio artwork · open Visualiser for live analysis</span></small></section>
}
