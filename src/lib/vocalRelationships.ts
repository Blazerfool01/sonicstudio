import { vocalRelationshipRules } from '../data/vocalRelationships.ts'
import type { VocalRelationshipCondition, VocalRelationshipKind } from '../data/vocalRelationships.ts'
import { createVoiceDna } from './voiceDna.ts'
import type { VocalSelections } from './voiceDna.ts'

export type VocalRelationship = {
  id: string
  kind: VocalRelationshipKind
  fields: readonly [keyof VocalSelections, keyof VocalSelections]
  explanation: string
}

export type VocalRelationshipReport = {
  relationships: VocalRelationship[]
  counts: Record<VocalRelationshipKind, number>
}

function matches(selection: VocalSelections, condition: VocalRelationshipCondition): boolean {
  if ('value' in condition) return selection[condition.field] === condition.value
  const value = selection[condition.field]
  const band = value < 34 ? 'low' : value < 67 ? 'middle' : 'high'
  return band === condition.band
}

export function analyzeVocalRelationships(selections: VocalSelections): VocalRelationshipReport {
  // Reuse Voice DNA's trait and 0–100 validation without changing its output or source.
  createVoiceDna(selections)
  const relationships = vocalRelationshipRules
    .filter(rule => rule.conditions.every(condition => matches(selections, condition)))
    .map(rule => ({
      id: rule.id,
      kind: rule.kind,
      fields: [rule.conditions[0].field, rule.conditions[1].field] as const,
      explanation: rule.explanation,
    }))
  const counts: VocalRelationshipReport['counts'] = {
    reinforcing: 0, complementary: 0, contrasting: 0, conflicting: 0,
  }
  for (const relationship of relationships) counts[relationship.kind]++
  return { relationships, counts }
}
