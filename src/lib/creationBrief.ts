import type { StudioProject } from './studioProject.ts'
import { getGenre } from '../data/registry.ts'
import { mergeGenres } from './merge.ts'
import { createVocalPrompts } from './vocalPrompts.ts'
import { deriveMoodDna } from './moodDna.ts'
import { describeMoodDna } from './moodDescription.ts'
import { translateMoodDna } from './moodTranslation.ts'

export function createCreationBrief(project: StudioProject) {
  const genre = project.genre
  const mood = project.mood ? deriveMoodDna(project.mood.selections) : null
  const voice = project.vocal ? createVocalPrompts(project.vocal.selections) : null
  const dna = genre ? mergeGenres(getGenre(genre.genres[0].genreId), getGenre(genre.genres[1].genreId), genre.genres[0].weight) : null
  const genreIdentity = genre ? genre.genres.map(s => `${getGenre(s.genreId).name} ${s.weight}%`).join(' / ') : ''
  const foundation = dna ? [`${genreIdentity}. Tempo foundation: ${dna.tempo[0]}–${dna.tempo[1]} BPM (${dna.tempoSource}).`, ...(['rhythm', 'bass', 'harmony', 'instrumentation', 'texture', 'production', 'intensity'] as const).map(key => `${key}: ${dna[key].text}`)].join('\n') : 'Genre foundation is open; choose instrumentation and tempo in your generation workflow.'
  const treatment: string[] = []
  if (mood) {
    const d = mood.dimensions
    if (dna) {
      treatment.push(`Keep the ${genreIdentity} foundation and its ${dna.tempo[0]}–${dna.tempo[1]} BPM range. ${d.motion > 60 ? 'Favor the upper part of that range with more active subdivisions' : d.motion < 40 ? 'Favor the lower part of that range with more space between gestures' : 'Stay near the middle of that range with a measured pulse'}.`)
      treatment.push(`Treat the genre instrumentation with ${d.energy > 60 ? 'stronger accents and dynamic contrast' : d.energy < 40 ? 'gentler attacks and restrained peaks' : 'balanced dynamics'}; ${d.weight > 60 ? 'give its low end more physical emphasis' : d.weight < 40 ? 'keep its low end lighter' : 'retain balanced low-end weight'}.`)
      treatment.push(`Retain the genre harmonic centre, shading its voicings ${d.valence < 40 ? 'darker' : d.valence > 60 ? 'toward melodic lift' : 'with flexible colour'} and ${d.tension > 60 ? 'use unresolved extensions as accents' : d.tension < 40 ? 'favor stable arrivals' : 'balance suspension and release'}.`)
    } else treatment.push('With no genre attached, these emotional directions leave tempo and instrumentation open.')
    const translation = translateMoodDna(mood)
    // Only treatment domains cross the genre boundary. Rhythm/harmony stay under the explicit rules above.
    for (const domain of ['density', 'space', 'texture', 'arrangement'] as const) {
      const signals = translation.domains[domain].signals
      const interactions = signals.filter(s => s.interactionId)
      const chosen = interactions.length ? interactions : signals
      treatment.push(`${domain}: ${chosen.map(s => s.guidance).join(' ')}`)
    }
    if (!dna) treatment.push(translation.overallDirection)
    if (voice) treatment.push(`Shape phrasing toward ${d.intimacy > 60 ? 'a close emotional connection' : 'the wider emotional scene'}, while retaining the captured register, texture, delivery, power and effects. Express mood through phrasing and arrangement around this singer.`)
  }
  const moodDirection = mood ? `${describeMoodDna(mood)}\n${treatment.join('\n')}` : 'Mood direction is open; retain the foundation and vocal character without imposing an emotional treatment.'
  const vocalIdentity = voice?.detailed ?? 'No vocal identity attached; vocal or instrumental choice remains open.'
  const identitySummary = [genreIdentity || 'Open musical foundation', project.vocal ? `${project.vocal.label} vocal identity` : 'voice undecided', mood ? `${mood.dominantMood.name.toLowerCase()} emotional direction` : 'mood undecided'].join(' · ')
  const prompt = !genre && !voice && !mood ? 'This project has no musical ingredients yet. Attach a genre mix, vocal identity, or mood to begin its creation brief.' : [
    'Create a cohesive piece from the following identity.',
    `GENRE FOUNDATION\n${foundation}`,
    `VOCAL IDENTITY\n${vocalIdentity}`,
    `MOOD / PRODUCTION DIRECTION\n${moodDirection}`,
    'Apply emotional treatment within the musical foundation; preserve the singer identity. Project notes are separate from this musical guidance.',
  ].join('\n\n')
  return { identitySummary, genreFoundation: foundation, vocalIdentity, moodDirection, prompt, notes: project.notes }
}
