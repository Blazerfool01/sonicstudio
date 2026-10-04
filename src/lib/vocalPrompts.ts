import { createVoiceDna } from './voiceDna.ts'
import type { VocalSelections, VoiceDna } from './voiceDna.ts'
import { createVocalInterpretation } from './vocalInterpretation.ts'

export type VocalPrompts = { concise: string; detailed: string }

export function createVocalPrompts(selections: VocalSelections, capturedDna?: VoiceDna): VocalPrompts {
  const dna = capturedDna ?? createVoiceDna(selections)
  const interpretation = createVocalInterpretation(selections)
  const identity = `${dna.register.label.toLowerCase()} register, ${dna.texture.label.toLowerCase()} texture, ${dna.delivery.label.toLowerCase()} delivery`
  const effect = selections.effect === 'none' ? 'unadorned lead' : `${dna.effect.label.toLowerCase()} effect`
  const concise = `Lead vocal: ${identity}; ${effect}. ${interpretation.strategy}`
  const dimensions = (['breathiness', 'power', 'warmth', 'rasp'] as const)
    .map(key => `${key}: ${dna.dimensions[key].description}`).join('; ')
  const resolution = interpretation.tensions.length
    ? `\n\nCOEXISTENCE\n${interpretation.tensions.map(item => item.resolution).join(' ')}`
    : ''
  const detailed = `VOCAL CHARACTER\n${dna.register.description} ${dna.texture.description} ${dna.delivery.description}\n\nPERFORMANCE\n${interpretation.strategy}\n\nVOICE COLOUR\n${dimensions}.\n\nVOCAL EFFECT\n${dna.effect.description}${resolution}`
  return { concise, detailed }
}
