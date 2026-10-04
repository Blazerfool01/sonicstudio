/** Include property acquisition in the recovery boundary, not just getItem(). */
export function readBrowserStorage<T>(read: (storage: Storage) => T, fallback: T): T {
  try { return read(globalThis.localStorage) } catch { return fallback }
}
