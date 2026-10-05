import test from 'node:test'
import assert from 'node:assert/strict'
import { TrackSeek, clampPlaybackPosition } from '../src/lib/trackSeek.ts'
test('switch position stays section-relative and clamps just inside shorter duration', () => { assert.equal(clampPlaybackPosition(72, 180), 72); assert.equal(clampPlaybackPosition(72, 30), 29.95); assert.equal(clampPlaybackPosition(0, 30), 0) })
test('invalid negative or unknown time/duration fails safely', () => { for (const p of [-1, NaN, Infinity]) assert.equal(clampPlaybackPosition(p, 20), 0); for (const d of [0, -1, NaN, Infinity]) assert.equal(clampPlaybackPosition(12, d), 0); assert.equal(clampPlaybackPosition(10, 0.01), 0) })
test('metadata applies the newest target seek exactly once', () => { const seek = new TrackSeek(); seek.queue('a', 10); seek.queue('b', 20); assert.equal(seek.take('a', 100), null); assert.equal(seek.take('b', 15), 14.95); assert.equal(seek.take('b', 15), null) })
test('unknown duration waits for usable metadata without consuming the position', () => { const seek = new TrackSeek(); seek.queue('a', 72); assert.equal(seek.take('a', NaN), null); assert.equal(seek.take('a', 180), 72) })
test('pause navigation removal and manual seek cancellation clear deferred position', () => { const seek = new TrackSeek(); seek.queue('a', 72); seek.clear(); assert.equal(seek.take('a', 180), null) })
test('rapid switches retain desired position while next source metadata is pending', () => { const seek = new TrackSeek(); seek.queue('b', 72); assert.equal(seek.position('b', 0), 72); seek.queue('a', seek.position('b', 0)); assert.equal(seek.take('a', 180), 72); assert.equal(seek.position('a', 75), 75) })
