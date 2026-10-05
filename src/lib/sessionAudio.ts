// Session-only URL owner. Neither Files nor URLs enter project persistence.
export class SessionAudio {
  private urls = new Map<string, string>()
  private create: (file: Blob) => string
  private revoke: (url: string) => void
  constructor(create = (file: Blob) => URL.createObjectURL(file), revoke = (url: string) => URL.revokeObjectURL(url)) { this.create = create; this.revoke = revoke }
  attach(id: string, file: Blob): string {
    const url = this.create(file) // Failed creation leaves the previous source usable.
    this.delete(id); this.urls.set(id, url); return url
  }
  get(id: string): string | undefined { return this.urls.get(id) }
  delete(id: string): void { const url = this.urls.get(id); if (url !== undefined) { this.urls.delete(id); this.revoke(url) } }
  clear(): void { for (const id of this.urls.keys()) this.delete(id) }
}
