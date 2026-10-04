import test from 'node:test'
import assert from 'node:assert/strict'
import { AudioAnalyzer, ANALYSIS_FFT_SIZE } from '../src/lib/audioAnalysis.ts'

test('analysis graph routes one media source to the destination and releases its resources', async () => {
  const original = globalThis.AudioContext
  const links = []
  let sourceCreations = 0
  let sourceDisconnected = false
  let analyserDisconnected = false
  let closed = false
  const destination = {}
  const analyser = {
    fftSize: 0,
    frequencyBinCount: 1024,
    connect(target) { links.push(['analyser', target]) },
    disconnect() { analyserDisconnected = true },
  }
  const source = {
    connect(target) { links.push(['source', target]) },
    disconnect() { sourceDisconnected = true },
  }
  globalThis.AudioContext = class {
    state = 'suspended'
    destination = destination
    createMediaElementSource() { sourceCreations++; return source }
    createAnalyser() { return analyser }
    async resume() { this.state = 'running' }
    async close() { this.state = 'closed'; closed = true }
  }
  try {
    const graph = new AudioAnalyzer({})
    assert.equal(sourceCreations, 1)
    assert.deepEqual(links, [['source', analyser], ['analyser', destination]])
    assert.equal(analyser.fftSize, ANALYSIS_FFT_SIZE)
    assert.equal(graph.waveform.length, 2048)
    assert.equal(graph.spectrum.length, 1024)
    await graph.resume()
    assert.equal(graph.context.state, 'running')
    graph.close()
    await Promise.resolve()
    assert.equal(sourceDisconnected, true)
    assert.equal(analyserDisconnected, true)
    assert.equal(closed, true)
  } finally {
    if (original === undefined) delete globalThis.AudioContext
    else globalThis.AudioContext = original
  }
})
