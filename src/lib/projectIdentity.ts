import type { StudioProject } from './studioProject.ts'
import { getGenre } from '../data/registry.ts'
import { getMood } from '../data/moods.ts'

export function ingredientDescription(project: Pick<StudioProject, 'genre' | 'vocal' | 'mood'>, kind: 'genre' | 'vocal' | 'mood') {
  if (kind === 'genre') return project.genre?.genres.map(s => `${getGenre(s.genreId).name} ${s.weight}%`).join(' / ')
  if (kind === 'mood') return project.mood?.selections.map(s => `${getMood(s.moodId)!.name} ${s.weight} influence`).join(' / ')
  const s = project.vocal?.selections
  return s ? `${s.register} register · ${s.texture} texture · ${s.delivery} delivery · ${s.effect} effect` : ''
}
