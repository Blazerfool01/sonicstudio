/** One pending position handoff for the single media owner, never persisted. */
export function clampPlaybackPosition(position: number, duration: number): number {
  const safe = Number.isFinite(position) ? Math.max(0, position) : 0
  return Number.isFinite(duration) && duration > 0 ? Math.min(safe, Math.max(0, duration - 0.05)) : 0
}
export class TrackSeek {
  private pending: { id: string; position: number } | null = null
  queue(id: string, position: number): void { this.pending = { id, position } }
  position(id: string | null, actual: number): number { return this.pending?.id === id ? this.pending.position : actual }
  clear(): void { this.pending = null }
  take(id: string | null, duration: number): number | null {
    if (!this.pending || this.pending.id !== id || !Number.isFinite(duration) || duration <= 0) return null
    const next = clampPlaybackPosition(this.pending.position, duration)
    this.pending = null
    return next
  }
}
