import { deliveries, registers, textures, vocalEffects } from '../data/vocalTraits.ts'

export type RegisterId = typeof registers[number]['id']
export type TextureId = typeof textures[number]['id']
export type DeliveryId = typeof deliveries[number]['id']
export type VocalEffectId = typeof vocalEffects[number]['id']
export type VocalDimension = 'breathiness' | 'power' | 'warmth' | 'rasp'
export type VocalSelections = {
  register: RegisterId
  texture: TextureId
  delivery: DeliveryId
  effect: VocalEffectId
  breathiness: number
  power: number
  warmth: number
  rasp: number
}
export type VoiceDna = {
  register: { id: RegisterId; label: string; description: string }
  texture: { id: TextureId; label: string; description: string }
  delivery: { id: DeliveryId; label: string; description: string }
  effect: { id: VocalEffectId; label: string; description: string }
  dimensions: Record<VocalDimension, { value: number; description: string }>
  description: string
}

export const defaultVocalSelections: VocalSelections = {
  register: 'mid', texture: 'clear', delivery: 'conversational', effect: 'none',
  breathiness: 50, power: 50, warmth: 50, rasp: 50,
}

const dimensionLanguage: Record<VocalDimension, [string, string, string]> = {
  breathiness: ['a dry, focused breath profile', 'a balanced amount of breath', 'an audible, breath-forward profile'],
  power: ['a restrained dynamic presence', 'a measured dynamic presence', 'a forceful dynamic presence'],
  warmth: ['a cool tonal colour', 'a balanced tonal colour', 'a warm tonal colour'],
  rasp: ['a smooth surface', 'a lightly textured surface', 'a rough, gritty surface'],
}

const dimensions: VocalDimension[] = ['breathiness', 'power', 'warmth', 'rasp']

function descriptionFor(dimension: VocalDimension, value: number): string {
  return dimensionLanguage[dimension][value < 34 ? 0 : value < 67 ? 1 : 2]
}

function findTrait<T extends { id: string; label: string; description: string }>(options: readonly T[], id: string): T {
  const trait = options.find(option => option.id === id)
  if (!trait) throw new Error(`Unknown vocal trait: ${id}`)
  return trait
}

export function createVoiceDna(selections: VocalSelections): VoiceDna {
  const register = findTrait(registers, selections.register)
  const texture = findTrait(textures, selections.texture)
  const delivery = findTrait(deliveries, selections.delivery)
  const effect = findTrait(vocalEffects, selections.effect)
  const values = Object.fromEntries(dimensions.map(dimension => {
    const value = selections[dimension]
    if (!Number.isInteger(value) || value < 0 || value > 100) throw new Error(`${dimension} must be an integer from 0 to 100`)
    return [dimension, { value, description: descriptionFor(dimension, value) }]
  })) as VoiceDna['dimensions']
  return {
    register, texture, delivery, effect, dimensions: values,
    description: `${register.label} register; ${texture.description} ${delivery.description} ${effect.description} The voice has ${values.breathiness.description}, ${values.power.description}, ${values.warmth.description}, and ${values.rasp.description}.`,
  }
}
