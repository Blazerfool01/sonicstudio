import test from 'node:test'
import assert from 'node:assert/strict'
import { aggregateSpectrum, radialAngle, radialRadius, SPECTRUM_BAR_COUNT, VISUAL_MODES, waveformY } from '../src/lib/visualModes.ts'

function peakIndex(values) {
  return values.indexOf(Math.max(...values))
}

test('spectrum aggregation produces a compact logarithmic shape and distinguishes bass from treble', () => {
  const bass = new Uint8Array(1024)
  const bright = new Uint8Array(1024)
  bass[4] = 255 // 93.75 Hz at 48 kHz / 2048
  bright[256] = 255 // 6 kHz
  const lowShape = aggregateSpectrum(bass, 48000, 2048)
  const highShape = aggregateSpectrum(bright, 48000, 2048)
  assert.equal(lowShape.length, SPECTRUM_BAR_COUNT)
  assert.ok(peakIndex(lowShape) < peakIndex(highShape))
  assert.equal(Math.max(...lowShape), 1)
  assert.equal(Math.max(...highShape), 1)
})

test('spectrum aggregation handles silence, empty buffers, invalid setup and non-finite bins', () => {
  assert.deepEqual(aggregateSpectrum(new Uint8Array(32), 48000, 64, 4), [0, 0, 0, 0])
  assert.deepEqual(aggregateSpectrum([], 48000, 2048, 4), [])
  assert.deepEqual(aggregateSpectrum([0, 255], 0, 2048, 4), [])
  assert.deepEqual(aggregateSpectrum([0, 255], 48000, 2048, 0), [])
  const values = aggregateSpectrum([0, 255, NaN, Infinity, -10], 48000, 8, 4)
  assert.ok(values.every(value => Number.isFinite(value) && value >= 0 && value <= 1))
})

test('waveform mapping keeps silence centred and clamps invalid or outlying samples', () => {
  assert.equal(waveformY(0, 200), 100)
  assert.equal(waveformY(1, 200), 14)
  assert.equal(waveformY(-1, 200), 186)
  assert.equal(waveformY(4, 200), waveformY(1, 200))
  assert.equal(waveformY(NaN, 200), 100)
})

test('radial mapping distributes angles evenly and clamps energy into the radius range', () => {
  assert.equal(radialAngle(0, 4), -Math.PI / 2)
  assert.ok(Math.abs(radialAngle(1, 4)) < 1e-12)
  assert.equal(radialRadius(0, 20, 80), 20)
  assert.equal(radialRadius(1, 20, 80), 80)
  assert.equal(radialRadius(3, 20, 80), 80)
  assert.equal(radialRadius(NaN, 20, 80), 20)
})

test('visual modes expose the three supported labels in stable order', () => {
  assert.deepEqual(VISUAL_MODES.map(mode => mode.id), ['spectrum', 'waveform', 'radial'])
  assert.deepEqual(VISUAL_MODES.map(mode => mode.label), ['Spectrum', 'Waveform', 'Radial'])
})
