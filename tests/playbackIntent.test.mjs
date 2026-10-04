import test from 'node:test'
import assert from 'node:assert/strict'
import { PlaybackIntent } from '../src/lib/playbackIntent.ts'

function deferred() {
  let resolve, reject
  const promise = new Promise((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}

function fixture() {
  const plays = [], resumes = [], suspends = []
  const media = {
    paused: true,
    pauses: 0,
    play() { this.paused = false; const operation = deferred(); plays.push(operation); return operation.promise },
    pause() { this.paused = true; this.pauses++ },
  }
  const context = {
    state: 'suspended',
    resume() {
      const operation = deferred()
      operation.finished = operation.promise.then(() => { this.state = 'running' })
      resumes.push(operation)
      return operation.finished
    },
    suspend() {
      const operation = deferred()
      operation.finished = operation.promise.then(() => { this.state = 'suspended' })
      suspends.push(operation)
      return operation.finished
    },
  }
  let errors = 0
  const owner = new PlaybackIntent(() => errors++)
  owner.mount(media, true)
  return { owner, media, context, plays, resumes, suspends, errors: () => errors }
}

test('Play → Pause → Play: late first startup cannot pause or invalidate the newer request', async () => {
  const f = fixture()
  const first = f.owner.start(f.context)
  assert.equal(f.owner.playing, true, 'pending startup can be cancelled immediately')
  f.owner.cancel()
  const second = f.owner.start(f.context)
  const pauses = f.media.pauses
  f.resumes[0].resolve()
  f.plays[1].resolve()
  assert.equal(await second.completion, 'playing')
  f.plays[0].resolve()
  assert.equal(await first.completion, 'stale')
  assert.equal(f.media.pauses, pauses)
  assert.equal(f.media.paused, false)
  assert.equal(f.owner.playing, true)
  assert.equal(f.owner.isCurrent(second.request), true)
  assert.equal(f.suspends.length, 0)
})

test('navigation during pending resume settles inactive, and returning can reuse the same context', async () => {
  const f = fixture()
  const first = f.owner.start(f.context)
  f.owner.setActive(false)
  f.resumes[0].resolve()
  await f.resumes[0].finished
  assert.equal(f.suspends.length, 1, 'late running context is reconciled by current inactive intent')
  f.suspends[0].resolve()
  await f.suspends[0].finished
  f.plays[0].resolve()
  assert.equal(await first.completion, 'stale')
  assert.equal(f.owner.playing, false)
  assert.equal(f.media.paused, true)
  assert.equal(f.context.state, 'suspended')
  f.owner.setActive(true)
  assert.equal(f.owner.playing, false, 'returning does not autoplay')
  const next = f.owner.start(f.context)
  f.resumes[1].resolve()
  f.plays[1].resolve()
  assert.equal(await next.completion, 'playing')
  assert.equal(f.context.state, 'running')
})

test('selection/removal cancellation makes pending startup inert before loading a replacement', async () => {
  const f = fixture()
  const previous = f.owner.start(f.context)
  f.owner.cancel() // The same synchronous invalidation used by choose/remove.
  const pauses = f.media.pauses
  f.resumes[0].resolve()
  await f.resumes[0].finished
  f.suspends[0].resolve()
  f.plays[0].resolve()
  assert.equal(await previous.completion, 'stale')
  assert.equal(f.media.pauses, pauses)
  assert.equal(f.media.paused, true)
  assert.equal(f.owner.isCurrent(previous.request), false)
})

test('unmount cancels pending startup even after the React media ref has detached', async () => {
  const f = fixture()
  const pending = f.owner.start(f.context)
  f.owner.unmount()
  const pauses = f.media.pauses
  f.resumes[0].resolve()
  await f.resumes[0].finished
  f.suspends[0].resolve()
  await f.suspends[0].finished
  f.plays[0].resolve()
  assert.equal(await pending.completion, 'stale')
  assert.equal(f.media.pauses, pauses)
  assert.equal(f.media.paused, true)
  assert.equal(f.context.state, 'suspended')
  assert.equal(f.owner.playing, false)
})

test('a pending suspend cannot win over a subsequent Play intent', async () => {
  const f = fixture()
  const first = f.owner.start(f.context)
  f.resumes[0].resolve()
  f.plays[0].resolve()
  await first.completion
  f.owner.setActive(false)
  f.owner.setActive(true)
  const next = f.owner.start(f.context)
  f.resumes[1].resolve()
  f.plays[1].resolve()
  assert.equal(await next.completion, 'playing')
  f.suspends[0].resolve()
  await f.suspends[0].finished
  assert.equal(f.resumes.length, 3, 'current owner restores context after an older suspend')
  f.resumes[2].resolve()
  await f.resumes[2].finished
  assert.equal(f.context.state, 'running')
  assert.equal(f.media.paused, false)
  assert.equal(f.owner.playing, true)
})

test('late rejection of an obsolete media start cannot stop newer playback', async () => {
  const f = fixture()
  const first = f.owner.start(f.context)
  f.owner.cancel()
  const next = f.owner.start(f.context)
  f.resumes[0].resolve()
  f.plays[1].resolve()
  await next.completion
  const pauses = f.media.pauses
  f.plays[0].reject(new Error('old play aborted'))
  assert.equal(await first.completion, 'stale')
  assert.equal(f.media.pauses, pauses)
  assert.equal(f.owner.playing, true)
})

test('resume rejection stops only its current startup and remains retryable', async () => {
  const f = fixture()
  const first = f.owner.start(f.context)
  f.resumes[0].reject(new Error('resume denied'))
  assert.equal(await first.completion, 'failed')
  assert.equal(f.media.paused, true)
  assert.equal(f.owner.playing, false)
  f.plays[0].reject(new Error('media aborted after failure'))
  const next = f.owner.start(f.context)
  f.resumes[1].resolve()
  f.plays[1].resolve()
  assert.equal(await next.completion, 'playing')
})

test('failed media startup still suspends a resume that completes afterward', async () => {
  const f = fixture()
  const pending = f.owner.start(f.context)
  f.plays[0].reject(new Error('unsupported media'))
  assert.equal(await pending.completion, 'failed')
  assert.equal(f.media.paused, true)
  f.resumes[0].resolve()
  await f.resumes[0].finished
  assert.equal(f.suspends.length, 1)
  f.suspends[0].resolve()
  await f.suspends[0].finished
  assert.equal(f.context.state, 'suspended')
  assert.equal(f.owner.playing, false)
})

test('suspend rejection is handled without retry loops or restarting inactive media', async () => {
  const f = fixture()
  const first = f.owner.start(f.context)
  f.resumes[0].resolve()
  f.plays[0].resolve()
  await first.completion
  f.owner.setActive(false)
  f.suspends[0].reject(new Error('suspend denied'))
  await assert.rejects(f.suspends[0].finished)
  assert.equal(f.errors(), 1)
  assert.equal(f.owner.playing, false)
  assert.equal(f.media.paused, true)
  assert.equal(f.suspends.length, 1)
  f.owner.setActive(false)
  f.suspends[1].resolve()
  await f.suspends[1].finished
  assert.equal(f.context.state, 'suspended')
})

test('synchronous media failure still handles a later resume rejection', async () => {
  const f = fixture()
  f.media.play = () => { throw new Error('media unavailable') }
  const pending = f.owner.start(f.context)
  assert.equal(await pending.completion, 'failed')
  f.resumes[0].reject(new Error('resume unavailable'))
  await assert.rejects(f.resumes[0].finished)
  assert.equal(f.owner.playing, false)
})

test('playback-only fallback and effect replay preserve latest intent', async () => {
  const f = fixture()
  const first = f.owner.start(null)
  f.owner.unmount()
  f.owner.mount(f.media, true)
  const next = f.owner.start(null)
  f.plays[1].resolve()
  assert.equal(await next.completion, 'playing')
  const pauses = f.media.pauses
  f.plays[0].resolve()
  assert.equal(await first.completion, 'stale')
  assert.equal(f.media.pauses, pauses)
  assert.equal(f.owner.playing, true)
})
