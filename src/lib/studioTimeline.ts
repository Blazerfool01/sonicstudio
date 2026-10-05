import type { StudioProject } from './studioProject.ts'

export const MAX_TIMELINE_SECONDS = 86_400

/** One project-persisted arrangement item that points at an immutable project track. */
export type TimelineClip = {
  schemaVersion: 1
  id: string
  trackId: string
  start: number
  sourceIn: number
  sourceOut: number | null
  muted: boolean
  solo: boolean
}

export type TimelineClipInput = Pick<TimelineClip, 'start' | 'sourceIn' | 'sourceOut' | 'muted' | 'solo'>

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === 'object' && !Array.isArray(value))
const finiteSeconds = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)
const compareIds = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0

export function cleanTimelineClip(value: unknown, trackIds: readonly string[]): TimelineClip {
  if (!isRecord(value) || value.schemaVersion !== 1) throw new Error('Invalid timeline clip')
  if (typeof value.id !== 'string' || !value.id.trim() || value.id.length > 160) throw new Error('Invalid timeline clip ID')
  if (typeof value.trackId !== 'string' || !trackIds.includes(value.trackId)) throw new Error('Timeline clip must reference an existing project track')
  if (!finiteSeconds(value.start) || value.start < 0 || value.start > MAX_TIMELINE_SECONDS) throw new Error('Invalid timeline position')
  if (!finiteSeconds(value.sourceIn) || value.sourceIn < 0 || value.sourceIn > MAX_TIMELINE_SECONDS) throw new Error('Invalid source in-point')
  if (value.sourceOut !== null && (!finiteSeconds(value.sourceOut) || value.sourceOut <= value.sourceIn || value.sourceOut > MAX_TIMELINE_SECONDS)) throw new Error('Source out-point must follow the in-point')
  if (typeof value.muted !== 'boolean' || typeof value.solo !== 'boolean') throw new Error('Invalid timeline mute or solo state')
  return {
    schemaVersion: 1,
    id: value.id.trim(),
    trackId: value.trackId,
    start: value.start,
    sourceIn: value.sourceIn,
    sourceOut: value.sourceOut as number | null,
    muted: value.muted,
    solo: value.solo,
  }
}

/** A malformed or dangling clip is isolated; a damaged timeline never damages its project. */
export function parseTimeline(value: unknown, trackIds: readonly string[]): TimelineClip[] {
  if (!Array.isArray(value)) return []
  const seen = new Set<string>()
  const clips: TimelineClip[] = []
  for (const item of value) {
    try {
      const clip = cleanTimelineClip(item, trackIds)
      if (seen.has(clip.id)) continue
      seen.add(clip.id)
      clips.push(clip)
    } catch { /* Skip one invalid clip without losing its neighbours or project. */ }
  }
  return clips
}

export function createTimelineClip(
  trackIds: readonly string[],
  trackId: string,
  input: Partial<TimelineClipInput> = {},
  id?: string,
): TimelineClip {
  return cleanTimelineClip({
    schemaVersion: 1,
    id: id ?? crypto.randomUUID(),
    trackId,
    start: input.start ?? 0,
    sourceIn: input.sourceIn ?? 0,
    sourceOut: input.sourceOut ?? null,
    muted: input.muted ?? false,
    solo: input.solo ?? false,
  }, trackIds)
}

export function addTimelineClip(project: StudioProject, trackId: string, input: Partial<TimelineClipInput> = {}, id?: string, now = new Date().toISOString()): StudioProject {
  const clip = createTimelineClip(project.tracks.map(track => track.id), trackId, input, id)
  if (project.timeline.some(existing => existing.id === clip.id)) throw new Error('Timeline clip already exists')
  return { ...project, timeline: [...project.timeline, clip], updatedAt: now }
}

export function removeTimelineClip(project: StudioProject, id: string, now = new Date().toISOString()): StudioProject {
  return { ...project, timeline: project.timeline.filter(clip => clip.id !== id), updatedAt: now }
}

export function moveTimelineClip(clips: readonly TimelineClip[], id: string, start: number, trackIds: readonly string[]): TimelineClip[] {
  if (!finiteSeconds(start) || start < 0 || start > MAX_TIMELINE_SECONDS) throw new Error('Enter a timeline position between 0 and 24 hours')
  if (!clips.some(clip => clip.id === id)) throw new Error('Timeline clip no longer exists')
  return clips.map(clip => clip.id === id ? cleanTimelineClip({ ...clip, start }, trackIds) : clip)
}

export function trimTimelineClip(
  clips: readonly TimelineClip[],
  id: string,
  sourceIn: number,
  sourceOut: number | null,
  sourceDuration: number | null,
  trackIds: readonly string[],
): TimelineClip[] {
  if (!finiteSeconds(sourceIn) || sourceIn < 0) throw new Error('Enter a valid source in-point')
  if (sourceOut !== null && (!finiteSeconds(sourceOut) || sourceOut <= sourceIn)) throw new Error('Source out-point must be later than the in-point')
  if (sourceDuration !== null && (!finiteSeconds(sourceDuration) || sourceDuration <= 0)) throw new Error('Source duration is unavailable')
  if (!clips.some(clip => clip.id === id)) throw new Error('Timeline clip no longer exists')
  const limit = sourceDuration ?? MAX_TIMELINE_SECONDS
  const boundedIn = Math.min(sourceIn, limit)
  const boundedOut = sourceOut === null ? null : Math.min(sourceOut, limit)
  if (boundedIn >= limit || (boundedOut !== null && boundedOut <= boundedIn)) throw new Error('Trim leaves no playable source duration')
  return clips.map(clip => clip.id === id ? cleanTimelineClip({ ...clip, sourceIn: boundedIn, sourceOut: boundedOut }, trackIds) : clip)
}

export function setTimelineClipFlag(clips: readonly TimelineClip[], id: string, flag: 'muted' | 'solo', value: boolean, trackIds: readonly string[]): TimelineClip[] {
  if (typeof value !== 'boolean') throw new Error('Mute and solo must be on or off')
  if (!clips.some(clip => clip.id === id)) throw new Error('Timeline clip no longer exists')
  return clips.map(clip => clip.id === id ? cleanTimelineClip({ ...clip, [flag]: value }, trackIds) : clip)
}

export function eligibleTimelineClips(clips: readonly TimelineClip[], trackIds: readonly string[]): TimelineClip[] {
  const valid = parseTimeline(clips, trackIds)
  const hasSolo = valid.some(clip => clip.solo)
  return valid.filter(clip => !clip.muted && (!hasSolo || clip.solo))
}

export function orderedTimelineClips(clips: readonly TimelineClip[], trackIds: readonly string[]): TimelineClip[] {
  const row = new Map(trackIds.map((id, index) => [id, index]))
  return parseTimeline(clips, trackIds).sort((a, b) => a.start - b.start || (row.get(a.trackId)! - row.get(b.trackId)!) || compareIds(a.id, b.id))
}

/** Latest eligible start wins; equal starts resolve by earliest project row, then lexically earliest clip ID. */
export function activeTimelineClipAt(clips: readonly TimelineClip[], trackIds: readonly string[], position: number, sourceDurations: Readonly<Record<string, number>> = {}): TimelineClip | null {
  if (!finiteSeconds(position) || position < 0) return null
  const row = new Map(trackIds.map((id, index) => [id, index]))
  const candidates = orderedTimelineClips(eligibleTimelineClips(clips, trackIds), trackIds)
    .filter(clip => clip.start <= position)
    .sort((a, b) => b.start - a.start || row.get(a.trackId)! - row.get(b.trackId)! || compareIds(a.id, b.id))
  const clip = candidates[0]
  if (!clip) return null
  const sourcePosition = clip.sourceIn + position - clip.start
  const duration = sourceDurations[clip.trackId]
  const knownDuration = finiteSeconds(duration) && duration > 0 ? duration : null
  const sourceEnd = clip.sourceOut === null ? knownDuration : knownDuration === null ? clip.sourceOut : Math.min(clip.sourceOut, knownDuration)
  if (sourceEnd !== null && sourcePosition >= sourceEnd) return null
  return clip
}

export function nextEligibleTimelineClip(clips: readonly TimelineClip[], trackIds: readonly string[], afterPosition: number): TimelineClip | null {
  if (!finiteSeconds(afterPosition) || afterPosition < 0) return null
  return orderedTimelineClips(eligibleTimelineClips(clips, trackIds), trackIds).find(clip => clip.start > afterPosition) ?? null
}

export function reconcileTimelineSelection(clips: readonly TimelineClip[], selectedClipId: string | null): string | null {
  return selectedClipId && clips.some(clip => clip.id === selectedClipId) ? selectedClipId : null
}

export function timelineClipEnd(clip: TimelineClip, sourceDuration: number | null = null): number | null {
  const sourceOut = clip.sourceOut === null ? sourceDuration : sourceDuration === null ? clip.sourceOut : Math.min(clip.sourceOut, sourceDuration)
  return sourceOut !== null && finiteSeconds(sourceOut) && sourceOut > clip.sourceIn
    ? clip.start + sourceOut - clip.sourceIn
    : null
}

