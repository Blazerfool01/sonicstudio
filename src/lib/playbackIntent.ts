type Media = Pick<HTMLMediaElement, 'play' | 'pause' | 'paused'>
type Context = Pick<AudioContext, 'state' | 'resume' | 'suspend'>
export type PlaybackResult = 'playing' | 'stale' | 'failed'

/** Owns current intent, not the media element, graph, buffers, or animation loop. */
export class PlaybackIntent {
  private request = 0
  private active = false
  private mounted = false
  private desiredPlayback = false
  private media: Media | null = null
  private context: Context | null = null
  private pendingResume: Promise<void> | null = null
  private pendingSuspend: Promise<void> | null = null
  private readonly onContextError: () => void

  constructor(onContextError: () => void = () => {}) { this.onContextError = onContextError }

  get playing(): boolean { return this.mounted && this.active && this.desiredPlayback }

  isCurrent(request: number): boolean {
    return this.mounted && this.active && request === this.request
  }

  mount(media: Media, active: boolean): void {
    this.media = media
    this.mounted = true
    this.setActive(active)
  }

  setActive(active: boolean): void {
    this.active = active
    if (!active) this.cancel()
  }

  cancel(): void {
    ++this.request
    this.desiredPlayback = false
    this.media?.pause()
    this.reconcileContext()
  }

  unmount(): void {
    this.mounted = false
    this.cancel()
  }

  start(context: Context | null): { request: number; completion: Promise<PlaybackResult> } {
    const request = ++this.request
    if (!this.mounted || !this.active || !this.media) {
      return { request, completion: Promise.resolve('stale') }
    }
    this.desiredPlayback = true
    this.context = context
    // Start both browser operations inside the user gesture. Their completion
    // never grants an old request permission to touch the shared player.
    const completion = this.startMedia(request)
    return { request, completion }
  }

  private async startMedia(request: number): Promise<PlaybackResult> {
    try {
      const resumed = this.context ? this.resumeContext() : Promise.resolve()
      // Convert a synchronous play() throw into a handled rejection too.
      const started = new Promise<void>((resolve, reject) => {
        try { resolve(this.media!.play()) } catch (error) { reject(error) }
      })
      await Promise.all([resumed, started])
      return this.isCurrent(request) && this.playing ? 'playing' : 'stale'
    } catch {
      if (!this.isCurrent(request)) return 'stale'
      this.desiredPlayback = false
      this.media?.pause()
      this.reconcileContext()
      return 'failed'
    }
  }

  private resumeContext(): Promise<void> {
    if (this.pendingResume) return this.pendingResume
    const pending = this.context!.resume().then(() => {
      this.pendingResume = null
      this.reconcileContext()
    }, error => {
      this.pendingResume = null
      throw error
    })
    this.pendingResume = pending
    return pending
  }

  /** Context settlements reconcile *current* intent independently of any Play token. */
  private reconcileContext(): void {
    const context = this.context
    if (!context || context.state === 'closed') return
    if (this.playing) {
      if (context.state !== 'running' && !this.pendingResume && !this.pendingSuspend) {
        const request = this.request
        try {
          void this.resumeContext().catch(() => {
            if (!this.isCurrent(request) || !this.playing) return
            this.cancel()
            this.onContextError()
          })
        } catch {
          this.cancel()
          this.onContextError()
        }
      }
    } else if (context.state === 'running' && !this.pendingSuspend) {
      try {
        this.pendingSuspend = context.suspend().then(() => {
          this.pendingSuspend = null
          this.reconcileContext()
        }, () => {
          this.pendingSuspend = null
          if (this.mounted && !this.playing) this.onContextError()
        })
      } catch {
        if (this.mounted && !this.playing) this.onContextError()
      }
    }
  }
}
