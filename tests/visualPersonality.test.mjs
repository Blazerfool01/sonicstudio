import test from 'node:test'
import assert from 'node:assert/strict'
import { combineVisualCharacteristics, DEFAULT_PERSONALITY, deriveVisualPersonality, genreVisualCharacteristics, responseStep } from '../src/lib/visualPersonality.ts'
import { canvasBitmapSize, drawVisualFrame, visualMagnitude, VISUAL_MODES } from '../src/lib/visualModes.ts'
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

test('Genre snapshots map through a single weighted, renderer-neutral characteristic vector', () => {
  const house = genreVisualCharacteristics({ genres: [{ genreId: 'house', weight: 100 }] })
  assert.equal(house.energy, 72)
  assert.equal(house.valence, 72)
  assert.equal(house.motion, 56)
  assert.equal(house.weight, 82)
  assert.deepEqual(Object.keys(house).sort(), ['atmosphere', 'energy', 'motion', 'tension', 'valence', 'weight'])
  assert.ok(Object.values(house).every(value => Number.isInteger(value) && value >= 0 && value <= 100))
  assert.deepEqual(genreVisualCharacteristics({ genres: [{ genreId: 'unknown', weight: 100 }] }), null)
  const blend = genreVisualCharacteristics({ genres: [{ genreId: 'ambient', weight: 75 }, { genreId: 'drum-bass', weight: 25 }] })
  assert.ok(blend.energy < genreVisualCharacteristics({ genres: [{ genreId: 'drum-bass', weight: 100 }] }).energy)
  assert.deepEqual(blend, genreVisualCharacteristics({ genres: [{ genreId: 'drum-bass', weight: 25 }, { genreId: 'ambient', weight: 75 }] }))
})

test('Mood and Genre feed one declarative configuration without mutating either source', () => {
  const genre = genreVisualCharacteristics({ genres: [{ genreId: 'house', weight: 100 }] })
  const mood = Object.freeze({ energy: 20, tension: 10, atmosphere: 80, motion: 30, weight: 40, valence: 90 })
  const combined = combineVisualCharacteristics(genre, mood)
  assert.deepEqual(combined, { energy: 46, tension: Math.round((genre.tension + mood.tension) / 2), atmosphere: Math.round((genre.atmosphere + mood.atmosphere) / 2), motion: 43, weight: 61, valence: 81 })
  assert.deepEqual(mood, { energy: 20, tension: 10, atmosphere: 80, motion: 30, weight: 40, valence: 90 })
  assert.deepEqual(combineVisualCharacteristics(null, mood), mood)
})

test('canvas bitmap sizing stays finite and follows DPR including zero-size and invalid inputs', () => {
  assert.deepEqual(canvasBitmapSize(320.5, 200.25, 2), { width: 641, height: 401, scale: 2 })
  assert.deepEqual(canvasBitmapSize(0, -2, 3), { width: 1, height: 1, scale: 3 })
  assert.deepEqual(canvasBitmapSize(Infinity, NaN, 0), { width: 1, height: 1, scale: 1 })
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
