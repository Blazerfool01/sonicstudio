import { createVoiceDna } from './voiceDna.ts'
import type { VocalSelections, VoiceDna } from './voiceDna.ts'

export type VocalPersona = {
  id: string
  name: string
  identityDescription: string
  selections: VocalSelections
  voiceDna: VoiceDna
}

export function createVocalPersona(name: string, identityDescription: string, selections: VocalSelections): VocalPersona {
  const cleanName = name.trim()
  const cleanDescription = identityDescription.trim()
  if (!cleanName) throw new Error('Enter a persona name')
  if (!cleanDescription) throw new Error('Enter a short identity description')
  if (cleanName.length > 80 || cleanDescription.length > 240) throw new Error('Persona identity is too long')

  const snapshot = { ...selections }
  return {
    id: crypto.randomUUID(),
    name: cleanName,
    identityDescription: cleanDescription,
    selections: snapshot,
    voiceDna: createVoiceDna(snapshot),
  }
}
