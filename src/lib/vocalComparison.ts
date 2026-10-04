import type { VocalPersona } from './vocalPersona.ts'

export type VocalDifference = { label: string; first: string; second: string; differs: boolean }

export function compareVocalPersonas(first: VocalPersona, second: VocalPersona): VocalDifference[] {
  if (first.id === second.id) throw new Error('Choose two different personas')
  const traits = (['register', 'texture', 'delivery', 'effect'] as const).map(key => ({
    label: key === 'effect' ? 'Vocal effect' : key[0].toUpperCase() + key.slice(1),
    first: first.voiceDna[key].label,
    second: second.voiceDna[key].label,
    differs: first.selections[key] !== second.selections[key],
  }))
  const dimensions = (['breathiness', 'power', 'warmth', 'rasp'] as const).map(key => ({
    label: key[0].toUpperCase() + key.slice(1),
    first: `${first.selections[key]}/100 · ${first.voiceDna.dimensions[key].description}`,
    second: `${second.selections[key]}/100 · ${second.voiceDna.dimensions[key].description}`,
    differs: first.selections[key] !== second.selections[key],
  }))
  return [...traits, ...dimensions]
}
