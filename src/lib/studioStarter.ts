import { attachIngredient, createProject, createProjectTrack } from './studioProject.ts'
import type { StudioProject } from './studioProject.ts'
import { defaultVocalSelections } from './voiceDna.ts'

// Ordinary editable project records; no separate dashboard state or audio is created.
export function createStudioStarter(): StudioProject {
  let project = createProject('Midnight Echoes', '00000000-0000-4000-8000-000000000001', '2026-10-06T00:00:00.000Z')
  project = attachIngredient(project, 'genre', { label: 'Electronic × R&B', sourceId: null, genres: [{ genreId: 'synthwave', weight: 65 }, { genreId: 'dark-rnb', weight: 35 }] }, project.createdAt)
  project = attachIngredient(project, 'vocal', { label: 'Neo Soul Dreamer', sourceId: null, identityDescription: 'Warm, emotive and versatile. An airy, intimate voice for melodic hooks and atmospheric layers.', selections: { ...defaultVocalSelections, texture: 'airy', delivery: 'intimate', effect: 'reverb', warmth: 78, power: 62, breathiness: 71, rasp: 24 } }, project.createdAt)
  project = attachIngredient(project, 'mood', { label: 'Dreamlike / Serene / Hypnotic', sourceId: null, selections: [{ moodId: 'dreamlike', weight: 40 }, { moodId: 'serene', weight: 30 }, { moodId: 'hypnotic', weight: 30 }] }, project.createdAt)
  project.notes = 'Add atmospheric pad in intro\nBoost vocal presence in chorus\nAdd subtle vinyl texture'
  project.tracks = ['Drums', 'Synths', 'Vocals', 'Atmosphere'].map((name, i) => createProjectTrack(project, name, `00000000-0000-4000-8000-00000000000${i + 2}`, project.createdAt))
  project.timeline = project.tracks.flatMap((track, i) => [0, 1].map(part => ({ schemaVersion: 1 as const, id: `midnight-clip-${i}-${part}`, trackId: track.id, start: part ? 100 + i * 8 : i * 12, sourceIn: 0, sourceOut: part ? (i === 3 ? 84 : 85 - i * 5) : 65 + i * 6, muted: false, solo: false })))
  return project
}
