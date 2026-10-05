import type { ProjectIdentitySnapshot } from './studioProject.ts'
import { ingredientDescription } from './projectIdentity.ts'
export type IdentityDimension = 'genre' | 'vocal' | 'mood'
export type ProvenanceChange = 'presence' | 'sources' | 'weights' | 'origin' | 'selections' | 'description'
export type ProvenanceDifference = { dimension: IdentityDimension; unchanged: boolean; changes: ProvenanceChange[]; before: string; after: string }
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)
function summary(snapshot: ProjectIdentitySnapshot, dimension: IdentityDimension): string {
  const source = snapshot[dimension]
  if (!source) return 'Not captured'
  const description = ingredientDescription(snapshot, dimension)
  if (dimension !== 'vocal' || !snapshot.vocal) return `${source.label} · ${description}`
  const s = snapshot.vocal.selections
  return `${source.label} · ${description} · Breathiness ${s.breathiness}, Power ${s.power}, Warmth ${s.warmth}, Rasp ${s.rasp}${snapshot.vocal.identityDescription ? ` · ${snapshot.vocal.identityDescription}` : ''}`
}
export function provenanceDifferences(a: ProjectIdentitySnapshot, b: ProjectIdentitySnapshot): ProvenanceDifference[] {
  return (['genre', 'vocal', 'mood'] as const).map(dimension => {
    const left = a[dimension], right = b[dimension]
    const changes: ProvenanceChange[] = []
    if (!!left !== !!right) changes.push('presence')
    else if (left && right) {
      if (left.label !== right.label || left.sourceId !== right.sourceId) changes.push('origin')
      if (dimension === 'genre' && a.genre && b.genre) {
        const before = a.genre.genres, after = b.genre.genres
        if (!same(before.map(s => s.genreId), after.map(s => s.genreId))) changes.push('sources')
        if (!same(before.map(s => [s.genreId, s.weight]), after.map(s => [s.genreId, s.weight]))) {
          if (!changes.includes('sources')) changes.push('weights')
        }
      } else if (dimension === 'mood' && a.mood && b.mood) {
        if (!same(a.mood.selections.map(s => s.moodId), b.mood.selections.map(s => s.moodId))) changes.push('sources')
        if (!same(a.mood.selections.map(s => [s.moodId, s.weight]), b.mood.selections.map(s => [s.moodId, s.weight])) && !changes.includes('sources')) changes.push('weights')
      } else if (dimension === 'vocal' && a.vocal && b.vocal) {
        if ((['register', 'texture', 'delivery', 'effect', 'breathiness', 'power', 'warmth', 'rasp'] as const).some(key => a.vocal!.selections[key] !== b.vocal!.selections[key])) changes.push('selections')
        if (a.vocal.identityDescription !== b.vocal.identityDescription) changes.push('description')
      }
    }
    return { dimension, unchanged: changes.length === 0, changes, before: summary(a, dimension), after: summary(b, dimension) }
  })
}
