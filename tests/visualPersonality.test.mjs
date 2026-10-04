import test from 'node:test'
import assert from 'node:assert/strict'
import { DEFAULT_PERSONALITY, deriveVisualPersonality, responseStep } from '../src/lib/visualPersonality.ts'
import { drawVisualFrame, visualMagnitude, VISUAL_MODES } from '../src/lib/visualModes.ts'
import { getMood } from '../src/data/moods.ts'

test('no characteristics preserves the stable classic configuration', () => {
  assert.equal(deriveVisualPersonality(), DEFAULT_PERSONALITY)
  assert.equal(deriveVisualPersonality(null), DEFAULT_PERSONALITY)
  assert.equal(visualMagnitude(0.4, DEFAULT_PERSONALITY, 1, 1, 0.8), 0.4)
  assert.equal(DEFAULT_PERSONALITY.responseMs, 0)
})

test('derivation is deterministic and does not mutate source characteristics', () => {
  const input = Object.freeze({ ...getMood('dreamlike').profile })
  assert.deepEqual(deriveVisualPersonality(input), deriveVisualPersonality(input))
})

test('outlying and non-finite characteristics clamp to valid finite dimensions', () => {
  const input = { energy: Infinity, tension: -100, atmosphere: 1000, motion: NaN, weight: 200, valence: -1 }
  const profile = deriveVisualPersonality(input)
  assert.equal(profile.gain, deriveVisualPersonality({ energy: 50 }).gain)
  assert.equal(profile.stroke, 0.65)
  assert.equal(profile.glow, 18)
  assert.equal(profile.bassPulse, 0.7)
  assert.equal(profile.responseMs, 110)
  assert.ok(Object.values(profile).filter(value => typeof value === 'number').every(Number.isFinite))
})

test('catalogue dreamlike and aggressive characters materially change audio expression', () => {
  const dream = deriveVisualPersonality(getMood('dreamlike').profile)
  const force = deriveVisualPersonality(getMood('aggressive').profile)
  assert.ok(force.gain > dream.gain * 1.8)
  assert.ok(force.stroke > dream.stroke * 1.6)
  assert.ok(force.responseMs < dream.responseMs / 10)
  assert.ok(dream.glow > force.glow * 2)
  assert.ok(force.bassPulse > dream.bassPulse * 4)
  assert.ok(visualMagnitude(0.3, force, 0.5, 0.2, 0.5) > visualMagnitude(0.3, dream, 0.5, 0.2, 0.5) * 1.8)
})

test('one changed source dimension affects only its documented configuration dimensions', () => {
  const baseline = deriveVisualPersonality({})
  const expected = { energy: ['gain'], tension: ['stroke', 'detail'], atmosphere: ['glow'], motion: ['responseMs'], weight: ['bassPulse'], valence: ['signal', 'fill'] }
  for (const [source, dimensions] of Object.entries(expected)) {
    const changed = deriveVisualPersonality({ [source]: 100 })
    assert.deepEqual(Object.keys(baseline).filter(key => baseline[key] !== changed[key]).sort(), dimensions.sort())
  }
})

test('time-based response is frame-rate independent and never invents signal during silence', () => {
  const whole = responseStep(0, 0.8, 100, 150)
  const half = responseStep(responseStep(0, 0.8, 50, 150), 0.8, 50, 150)
  assert.ok(Math.abs(whole - half) < 1e-12)
  assert.ok(responseStep(0, 0.8, 16, 10) > responseStep(0, 0.8, 16, 200))
  assert.equal(responseStep(1, 0, 16, 200), 0)
  assert.equal(responseStep(1, NaN, 16, 200), 0)
  for (const mood of ['dreamlike', 'aggressive']) assert.equal(visualMagnitude(0, deriveVisualPersonality(getMood(mood).profile), 1, 1, 1), 0)
})

function recordingCanvas() {
  const operations = []
  const ctx = new Proxy({}, {
    get: (_, name) => (...args) => {
      assert.ok(args.filter(value => typeof value === 'number').every(Number.isFinite), `${String(name)} contains invalid geometry`)
      operations.push([name, ...args])
    },
    set: (target, name, value) => { operations.push([name, value]); target[name] = value; return true },
  })
  return { ctx, operations }
}

test('every renderer consumes personality and remains finite at both configuration extremes', () => {
  const waveform = Float32Array.from({ length: 64 }, (_, i) => Math.sin(i) * 0.15)
  const spectrum = new Uint8Array(1024).fill(40)
  for (const mode of VISUAL_MODES) {
    const dream = recordingCanvas(), force = recordingCanvas()
    drawVisualFrame(dream.ctx, 320, 240, mode.id, waveform, spectrum, 48000, 2048, deriveVisualPersonality(getMood('dreamlike').profile), 0.3, 0.2)
    drawVisualFrame(force.ctx, 320, 240, mode.id, waveform, spectrum, 48000, 2048, deriveVisualPersonality(getMood('aggressive').profile), 0.3, 0.2)
    const geometry = operations => operations.filter(([name]) => ['fillRect', 'lineTo', 'moveTo'].includes(name))
    assert.notDeepEqual(geometry(dream.operations), geometry(force.operations), mode.id)
    for (const value of [-100, 1000]) {
      const profile = deriveVisualPersonality({ energy: value, tension: value, atmosphere: value, motion: value, weight: value, valence: value })
      drawVisualFrame(recordingCanvas().ctx, 320, 240, mode.id, [NaN, Infinity, -10, 10], [0, 255, NaN, Infinity], 48000, 2048, profile, 1, 1)
    }
  }
})

test('fixed personality keeps bass and treble in different spectral geometry', () => {
  const bass = new Uint8Array(1024), treble = new Uint8Array(1024)
  bass[4] = 150; treble[256] = 150
  const profile = deriveVisualPersonality(getMood('dreamlike').profile)
  for (const mode of ['spectrum', 'radial']) {
    const a = recordingCanvas(), b = recordingCanvas()
    drawVisualFrame(a.ctx, 320, 240, mode, [0], bass, 48000, 2048, profile, 0.4, 0)
    drawVisualFrame(b.ctx, 320, 240, mode, [0], treble, 48000, 2048, profile, 0, 0.4)
    assert.notDeepEqual(a.operations, b.operations)
  }
})
