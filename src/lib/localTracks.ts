export interface LocalTrack {
  id: string
  filename: string
  name: string
  type: string
  size: number
}

export interface TrackLibrary {
  tracks: LocalTrack[]
  selectedId: string | null
}

export function displayName(filename: string): string {
  return filename.replace(/\.[^.]+$/, '') || filename
}

export function addTracks(library: TrackLibrary, tracks: LocalTrack[]): TrackLibrary {
  return {
    tracks: [...library.tracks, ...tracks],
    selectedId: library.selectedId ?? tracks[0]?.id ?? null,
  }
}

export function selectTrack(library: TrackLibrary, id: string): TrackLibrary {
  return library.tracks.some(track => track.id === id) ? { ...library, selectedId: id } : library
}

export function removeTrack(library: TrackLibrary, id: string): TrackLibrary {
  const index = library.tracks.findIndex(track => track.id === id)
  if (index < 0) return library
  const tracks = library.tracks.filter(track => track.id !== id)
  return {
    tracks,
    selectedId: library.selectedId === id
      ? (tracks[index]?.id ?? tracks[index - 1]?.id ?? null)
      : library.selectedId,
  }
}

const allowedExtensions = new Set(['mp3', 'wav', 'wave', 'ogg', 'oga', 'm4a', 'aac', 'mp4'])

export function audioCandidate(file: Pick<File, 'name' | 'type' | 'size'>): boolean {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
  return file.size > 0 && allowedExtensions.has(extension) && (!file.type || file.type.startsWith('audio/'))
}
