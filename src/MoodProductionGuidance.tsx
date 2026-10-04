import { moodDimensions } from './data/moods.ts'
import { musicalDomains } from './data/moodTranslationGuidance.ts'
import type { MoodTranslationSource, MusicalSignal, MoodTranslation } from './lib/moodTranslation.ts'
import './production.css'

const dimensionNames = Object.fromEntries(moodDimensions.map(item => [item.id, item.name]))

function Sources({ sources }: { sources: MoodTranslationSource[] }) {
  return <div className="production-sources" aria-label="Mood DNA sources">{sources.map(source => <span key={source.dimension}>{dimensionNames[source.dimension]} <strong>{source.value}</strong></span>)}</div>
}

function Signal({ signal }: { signal: MusicalSignal }) {
  return <li className="production-signal">{signal.interactionId && <span className="production-interaction">Combined direction</span>}<strong>{signal.trait}</strong><p>{signal.guidance}</p><Sources sources={signal.sources}/></li>
}

export default function MoodProductionGuidance({ translation }: { translation: MoodTranslation | null }) {
  if (!translation) return null

  return <section className="production-guidance" aria-labelledby="production-heading">
    <div className="production-head"><span className="eyebrow">05 / PRODUCTION GUIDANCE</span><h2 id="production-heading">Shape the production<span className="heading-period">.</span></h2><p>Musical choices derived from the Emotional Fingerprint. The relationship above describes how the source moods meet.</p></div>
    <div className="production-overall"><span>OVERALL DIRECTION</span><p>{translation.overallDirection}</p><Sources sources={translation.overallSources}/></div>
    <div className="production-block-head"><div><span className="eyebrow">01 / FOCUS</span><h3>Production priorities</h3></div><p>The strongest departures from the centre of the Mood DNA.</p></div>
    {translation.priorities.length ? <ol className="production-priorities">{translation.priorities.map((priority, index) => <li className="production-priority" key={`${priority.domain}-${priority.trait}`}><div className="production-priority-top"><span>{String(index + 1).padStart(2, '0')} / {priority.domain}</span>{priority.interactionId && <span className="production-interaction">Combined direction</span>}</div><h4>{priority.trait}</h4><p>{priority.guidance}</p><Sources sources={priority.sources}/></li>)}</ol> : <p className="production-balanced">No dimension is far from centre; the complete domain map below offers a balanced starting point.</p>}
    <div className="production-block-head"><div><span className="eyebrow">02 / DETAIL</span><h3>Seven musical domains</h3></div><p>Each direction keeps its Mood DNA source visible.</p></div>
    <div className="production-domains">{musicalDomains.map(domain => { const direction = translation.domains[domain]; return <article className="production-domain" key={domain}><div className="production-domain-head"><h4>{domain}</h4></div><ul>{direction.signals.map((signal, index) => <Signal signal={signal} key={`${index}-${signal.trait}`}/>)}</ul></article> })}</div>
  </section>
}
