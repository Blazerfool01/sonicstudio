export type VocalTrait = { id: string; label: string; description: string }

export const registers = [
  { id: 'low', label: 'Low', description: 'A grounded lower register with a deep centre.' },
  { id: 'mid', label: 'Mid', description: 'A balanced middle register with an adaptable centre.' },
  { id: 'high', label: 'High', description: 'A lifted upper register with a bright centre.' },
] as const satisfies readonly VocalTrait[]

export const textures = [
  { id: 'airy', label: 'Airy', description: 'Light, open tone with audible air around the notes.' },
  { id: 'clear', label: 'Clear', description: 'Focused tone with clean edges and definition.' },
  { id: 'husky', label: 'Husky', description: 'Grainy tone with a soft, smoky edge.' },
  { id: 'raspy', label: 'Raspy', description: 'Coarse tone with a pronounced rough edge.' },
] as const satisfies readonly VocalTrait[]

export const deliveries = [
  { id: 'intimate', label: 'Intimate', description: 'Close, restrained phrasing that feels personal.' },
  { id: 'conversational', label: 'Conversational', description: 'Natural, speech-like phrasing.' },
  { id: 'assertive', label: 'Assertive', description: 'Direct, emphatic phrasing with firm attacks.' },
  { id: 'soaring', label: 'Soaring', description: 'Sustained, expansive phrasing that reaches outward.' },
] as const satisfies readonly VocalTrait[]

export const vocalEffects = [
  { id: 'none', label: 'None', description: 'An unadorned vocal presentation.' },
  { id: 'doubled', label: 'Doubled', description: 'A second vocal layer reinforces the lead.' },
  { id: 'reverb', label: 'Reverb', description: 'A reverberant tail extends the vocal space.' },
  { id: 'delay', label: 'Delay', description: 'Repeats trail selected vocal phrases.' },
] as const satisfies readonly VocalTrait[]
