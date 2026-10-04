import { moodDimensions } from '../data/moods.ts'
import type { MoodDimension } from '../data/moods.ts'
import {
  moodRegionBounds, moodTranslationGuidance, moodTranslationInteractions, musicalDomains,
} from '../data/moodTranslationGuidance.ts'
import type { DomainCue, MoodRegion, MusicalDomain } from '../data/moodTranslationGuidance.ts'
import type { MoodDna } from './moodDna.ts'

export type MoodTranslationSource = { dimension: MoodDimension; value: number; region: MoodRegion }
export type MusicalSignal = { trait: string; guidance: string; sources: MoodTranslationSource[]; interactionId?: string }
export type MusicalDirection = {
  domain: MusicalDomain
  intensity: number
  signals: MusicalSignal[]
  sources: MoodTranslationSource[]
}
export type MusicalPriority = MusicalSignal & { strength: number; domain: MusicalDomain }
export type MoodTranslation = {
  domains: Record<MusicalDomain, MusicalDirection>
  priorities: MusicalPriority[]
  overallDirection: string
  overallSources: MoodTranslationSource[]
}

export function moodRegion(value: number): MoodRegion {
  if (!Number.isInteger(value) || value < 0 || value > 100) throw new Error('Mood dimensions must be integers from 0 to 100.')
  if (value <= moodRegionBounds.strongLowMax) return 'strongLow'
  if (value <= moodRegionBounds.lowMax) return 'low'
  if (value <= moodRegionBounds.neutralMax) return 'neutral'
  if (value <= moodRegionBounds.highMax) return 'high'
  return 'strongHigh'
}

function cueFor(dimension: MoodDimension, domain: MusicalDomain, region: MoodRegion): DomainCue {
  const cues = moodTranslationGuidance[dimension].domains[domain]!
  return cues[region] ?? cues[region === 'strongLow' ? 'low' : region === 'strongHigh' ? 'high' : region]
}

function sourceFor(dimension: MoodDimension, dna: Pick<MoodDna, 'dimensions'>): MoodTranslationSource {
  const value = dna.dimensions[dimension]
  return { dimension, value, region: moodRegion(value) }
}

function distinctSources(signals: readonly MusicalSignal[]): MoodTranslationSource[] {
  const seen = new Set<MoodDimension>()
  return signals.flatMap(signal => signal.sources.filter(source => {
    if (seen.has(source.dimension)) return false
    seen.add(source.dimension)
    return true
  }))
}

const strengthOf = (value: number) => Math.abs(value - 50) / 50

export function translateMoodDna(dna: Pick<MoodDna, 'dimensions'>): MoodTranslation {
  if (!dna || !dna.dimensions || moodDimensions.some(({ id }) => !Number.isInteger(dna.dimensions[id]) || dna.dimensions[id] < 0 || dna.dimensions[id] > 100)) {
    throw new Error('Translation requires a complete seven-dimension Mood DNA profile on the 0–100 scale.')
  }

  const signals = Object.fromEntries(musicalDomains.map(domain => [domain, [] as MusicalSignal[]])) as Record<MusicalDomain, MusicalSignal[]>
  const candidates: (MusicalPriority & { order: number })[] = []
  moodDimensions.forEach(({ id }, dimensionIndex) => {
    const source = sourceFor(id, dna)
    const domains = Object.keys(moodTranslationGuidance[id].domains) as MusicalDomain[]
    domains.forEach((domain, domainIndex) => {
      const cue = cueFor(id, domain, source.region)
      signals[domain].push({ ...cue, sources: [source] })
      if (domainIndex === 0 && Math.abs(source.value - 50) >= moodRegionBounds.priorityMinDistance) {
        candidates.push({ ...cue, domain, sources: [source], strength: strengthOf(source.value), order: dimensionIndex })
      }
    })
  })

  moodTranslationInteractions.forEach((rule, index) => {
    const matched = rule.conditions.every(({ dimension, region }) => region === 'low'
      ? dna.dimensions[dimension] <= moodRegionBounds.interactionLowMax
      : region === 'high' ? dna.dimensions[dimension] >= moodRegionBounds.interactionHighMin
        : moodRegion(dna.dimensions[dimension]) === 'neutral')
    if (!matched) return
    const sources = rule.conditions.map(({ dimension }) => sourceFor(dimension, dna))
    const signal = { trait: rule.trait, guidance: rule.guidance, sources, interactionId: rule.id }
    signals[rule.domain].push(signal)
    const strength = Math.min(...sources.map(source => strengthOf(source.value)))
    if (strength >= moodRegionBounds.priorityMinDistance / 50) {
      candidates.push({ ...signal, domain: rule.domain, strength, order: moodDimensions.length + index })
    }
  })

  const domains = Object.fromEntries(musicalDomains.map(domain => {
    const domainSignals = signals[domain]
    const sources = distinctSources(domainSignals)
    return [domain, {
      domain, signals: domainSignals, sources,
      intensity: Math.round(Math.max(0, ...sources.map(source => strengthOf(source.value))) * 100),
    }]
  })) as Record<MusicalDomain, MusicalDirection>
  const priorities = candidates.sort((a, b) => b.strength - a.strength || a.order - b.order)
    .slice(0, 3).map(({ order: _order, ...priority }) => priority)
  const focus = priorities.slice(0, 2)
  const tension = domains.harmony.signals.find(signal => signal.sources.length === 1 && signal.sources[0].dimension === 'tension')!
  const includeBalancedTension = focus.length > 0 &&
    priorities[0].strength < moodRegionBounds.strongPriorityMinDistance / 50 && tension.sources[0].region === 'neutral'
  const gentlePulse = domains.rhythm.signals.find(signal => signal.interactionId === 'pulse-under-atmosphere')
  const overallDirection = focus.length === 0
    ? 'Keep the production balanced and adaptable; no dimension calls for a strong musical push.'
    : `${focus.map(item => item.guidance).join(' ')}${includeBalancedTension ? ` ${tension.guidance}` : ''}${gentlePulse ? ` ${gentlePulse.guidance}` : ''}`
  const overallSources = distinctSources([...focus, ...(includeBalancedTension ? [tension] : []), ...(gentlePulse ? [gentlePulse] : [])])
  return { domains, priorities, overallDirection, overallSources }
}
