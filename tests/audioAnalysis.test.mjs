import test from 'node:test'
import assert from 'node:assert/strict'
import { ANALYSIS_FFT_SIZE, FREQUENCY_BANDS, bandEnergy, binFrequency, deriveSignalMetrics, rmsAmplitude } from '../src/lib/audioAnalysis.ts'

test('RMS amplitude handles silence, quiet signals, empty buffers and clamps outliers', () => {
  assert.equal(rmsAmplitude([]), 0)
  assert.equal(rmsAmplitude(new Float32Array(8)), 0)
  assert.ok(Math.abs(rmsAmplitude([0.5, -0.5, 0.5, -0.5]) - 0.5) < 1e-9)
  assert.equal(rmsAmplitude([2, -2]), 1)
  assert.equal(rmsAmplitude([NaN, Infinity]), 0)
})

test('frequency bins use actual sample rate and FFT size', () => {
  assert.equal(ANALYSIS_FFT_SIZE, 2048)
  assert.equal(binFrequency(100, 48000, 2048), 2343.75)
  assert.equal(binFrequency(100, 0, 2048), 0)
  assert.deepEqual(FREQUENCY_BANDS, { low: [20, 250], mid: [250, 2000], high: [2000, 10000] })
})

test('low, mid and high bands respond to the corresponding frequency bins', () => {
  const spectrum = new Uint8Array(1024)
  spectrum[4] = 255 // 93.75 Hz at 48 kHz / 2048
  let result = deriveSignalMetrics([0, 0], spectrum, 48000, 2048)
  assert.ok(result.low > 0)
  assert.equal(result.mid, 0)
  assert.equal(result.high, 0)
  spectrum.fill(0)
  spectrum[43] = 255 // 1007.8 Hz
  result = deriveSignalMetrics([0.25, -0.25], spectrum, 48000, 2048)
  assert.equal(result.low, 0)
  assert.ok(result.mid > 0)
  assert.equal(result.high, 0)
  assert.equal(result.amplitude, 0.25)
  spectrum.fill(0)
  spectrum[213] = 255 // 4992 Hz
  result = deriveSignalMetrics([0, 0], spectrum, 48000, 2048)
  assert.equal(result.low, 0)
  assert.equal(result.mid, 0)
  assert.ok(result.high > 0)
})

test('band energy handles empty/invalid ranges and normalises to 0–1', () => {
  assert.equal(bandEnergy([], 48000, 2048, 20, 250), 0)
  assert.equal(bandEnergy([255], 0, 2048, 20, 250), 0)
  assert.equal(bandEnergy([255], 48000, 2048, 250, 20), 0)
  assert.equal(bandEnergy([999], 48000, 2048, 0, 10), 1)
  assert.deepEqual(deriveSignalMetrics([], [], 48000, 2048), { amplitude: 0, low: 0, mid: 0, high: 0 })
})
