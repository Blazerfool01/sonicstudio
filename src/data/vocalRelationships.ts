import type { VocalDimension, VocalSelections } from '../lib/voiceDna.ts'

export type VocalRelationshipKind = 'reinforcing' | 'complementary' | 'contrasting' | 'conflicting'
export type VocalTraitField = 'register' | 'texture' | 'delivery' | 'effect'
export type VocalBand = 'low' | 'middle' | 'high'
export type VocalRelationshipCondition =
  | { [Field in VocalTraitField]: { field: Field; value: VocalSelections[Field] } }[VocalTraitField]
  | { field: VocalDimension; band: VocalBand }

export type VocalRelationshipRule = {
  id: string
  kind: VocalRelationshipKind
  conditions: readonly [VocalRelationshipCondition, VocalRelationshipCondition]
  explanation: string
}

// Each rule names a specific interaction; an unlisted pairing has no inferred relationship.
export const vocalRelationshipRules = [
  { id: 'airy-breath', kind: 'reinforcing', conditions: [{ field: 'texture', value: 'airy' }, { field: 'breathiness', band: 'high' }], explanation: 'Airy texture and audible breath reinforce the same light, open vocal quality.' },
  { id: 'airy-dry', kind: 'conflicting', conditions: [{ field: 'texture', value: 'airy' }, { field: 'breathiness', band: 'low' }], explanation: 'Airy texture calls for audible air, while low breathiness asks for a dry, focused sound.' },
  { id: 'raspy-rasp', kind: 'reinforcing', conditions: [{ field: 'texture', value: 'raspy' }, { field: 'rasp', band: 'high' }], explanation: 'Raspy texture and high rasp reinforce a pronounced rough edge.' },
  { id: 'raspy-smooth', kind: 'conflicting', conditions: [{ field: 'texture', value: 'raspy' }, { field: 'rasp', band: 'low' }], explanation: 'Raspy texture calls for roughness, while low rasp asks for a smooth vocal surface.' },
  { id: 'husky-rasp', kind: 'complementary', conditions: [{ field: 'texture', value: 'husky' }, { field: 'rasp', band: 'middle' }], explanation: 'A husky tone and moderate rasp add grain without making the edge dominant.' },
  { id: 'intimate-restraint', kind: 'reinforcing', conditions: [{ field: 'delivery', value: 'intimate' }, { field: 'power', band: 'low' }], explanation: 'Intimate phrasing and restrained power reinforce a close, personal performance.' },
  { id: 'intimate-force', kind: 'contrasting', conditions: [{ field: 'delivery', value: 'intimate' }, { field: 'power', band: 'high' }], explanation: 'Intimate phrasing stays close while high power pushes the voice outward; the dynamics contrast.' },
  { id: 'assertive-force', kind: 'reinforcing', conditions: [{ field: 'delivery', value: 'assertive' }, { field: 'power', band: 'high' }], explanation: 'Assertive attacks and high power reinforce a direct, forceful delivery.' },
  { id: 'assertive-restraint', kind: 'conflicting', conditions: [{ field: 'delivery', value: 'assertive' }, { field: 'power', band: 'low' }], explanation: 'Assertive delivery asks for emphatic attacks, while low power asks for a restrained presence.' },
  { id: 'soaring-high', kind: 'complementary', conditions: [{ field: 'register', value: 'high' }, { field: 'delivery', value: 'soaring' }], explanation: 'A high register gives soaring phrasing room to sustain and expand.' },
  { id: 'warm-air', kind: 'complementary', conditions: [{ field: 'warmth', band: 'high' }, { field: 'breathiness', band: 'high' }], explanation: 'Warm colour adds body to an airy breath profile without removing its softness.' },
  { id: 'force-grit', kind: 'complementary', conditions: [{ field: 'power', band: 'high' }, { field: 'rasp', band: 'high' }], explanation: 'Strong projection and rough texture combine force with grit.' },
  { id: 'breath-force', kind: 'contrasting', conditions: [{ field: 'breathiness', band: 'high' }, { field: 'power', band: 'high' }], explanation: 'Audible breath softens the edge of a voice that also has forceful dynamics.' },
  { id: 'intimate-reverb', kind: 'contrasting', conditions: [{ field: 'delivery', value: 'intimate' }, { field: 'effect', value: 'reverb' }], explanation: 'Close, personal phrasing contrasts with the larger space created by reverb.' },
  { id: 'assertive-doubled', kind: 'complementary', conditions: [{ field: 'delivery', value: 'assertive' }, { field: 'effect', value: 'doubled' }], explanation: 'Doubling supports firm, assertive attacks with a second vocal layer.' },
] as const satisfies readonly VocalRelationshipRule[]

