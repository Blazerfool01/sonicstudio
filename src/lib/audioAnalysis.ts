export const ANALYSIS_FFT_SIZE = 2048

// Fixed frequency regions keep diagnostics comparable across browser sample rates.
export const FREQUENCY_BANDS = {
  low: [20, 250],
  mid: [250, 2000],
  high: [2000, 10000],
} as const

export interface SignalMetrics {
  amplitude: number
  low: number
  mid: number
  high: number
}

export const SILENT_METRICS: SignalMetrics = { amplitude: 0, low: 0, mid: 0, high: 0 }

function clamp01(value: number): number {
  return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0
}

export function rmsAmplitude(samples: ArrayLike<number>): number {
  if (!samples.length) return 0
  let sum = 0
  for (let index = 0; index < samples.length; index++) {
    const value = Number.isFinite(samples[index]) ? samples[index] : 0
    sum += value * value
  }
  return clamp01(Math.sqrt(sum / samples.length))
}

export function binFrequency(index: number, sampleRate: number, fftSize: number): number {
  return index >= 0 && sampleRate > 0 && fftSize > 0 ? index * sampleRate / fftSize : 0
}

// Byte magnitudes are 0–255 after the analyser's documented dB conversion.
// RMS across an actual Hz region preserves peaks without depending on FFT length.
export function bandEnergy(spectrum: ArrayLike<number>, sampleRate: number, fftSize: number, lowHz: number, highHz: number): number {
  if (!spectrum.length || sampleRate <= 0 || fftSize <= 0 || highHz <= lowHz) return 0
  const first = Math.max(0, Math.ceil(lowHz * fftSize / sampleRate))
  const last = Math.min(spectrum.length - 1, Math.floor(highHz * fftSize / sampleRate))
  if (first > last) return 0
  let sum = 0
  for (let index = first; index <= last; index++) {
    const magnitude = clamp01(spectrum[index] / 255)
    sum += magnitude * magnitude
  }
  return clamp01(Math.sqrt(sum / (last - first + 1)))
}

export function deriveSignalMetrics(waveform: ArrayLike<number>, spectrum: ArrayLike<number>, sampleRate: number, fftSize: number): SignalMetrics {
  return {
    amplitude: rmsAmplitude(waveform),
    low: bandEnergy(spectrum, sampleRate, fftSize, ...FREQUENCY_BANDS.low),
    mid: bandEnergy(spectrum, sampleRate, fftSize, ...FREQUENCY_BANDS.mid),
    high: bandEnergy(spectrum, sampleRate, fftSize, ...FREQUENCY_BANDS.high),
  }
}

// The two buffers are reused in place. A future renderer can read them without
// pushing thousands of samples through React on every animation frame.
export class AudioAnalyzer {
  readonly context: AudioContext
  readonly source: MediaElementAudioSourceNode
  readonly analyser: AnalyserNode
  readonly waveform: Float32Array<ArrayBuffer>
  readonly spectrum: Uint8Array<ArrayBuffer>

  constructor(audio: HTMLAudioElement) {
    this.context = new AudioContext()
    try {
      this.source = this.context.createMediaElementSource(audio)
      this.analyser = this.context.createAnalyser()
      this.analyser.fftSize = ANALYSIS_FFT_SIZE
      this.analyser.smoothingTimeConstant = 0.55
      this.analyser.minDecibels = -90
      this.analyser.maxDecibels = -10
      this.source.connect(this.analyser)
      this.analyser.connect(this.context.destination)
      this.waveform = new Float32Array(this.analyser.fftSize)
      this.spectrum = new Uint8Array(this.analyser.frequencyBinCount)
    } catch (error) {
      void this.context.close()
      throw error
    }
  }

  resume(): Promise<void> {
    return this.context.state === 'running' ? Promise.resolve() : this.context.resume()
  }

  read(): SignalMetrics {
    this.analyser.getFloatTimeDomainData(this.waveform)
    this.analyser.getByteFrequencyData(this.spectrum)
    return deriveSignalMetrics(this.waveform, this.spectrum, this.context.sampleRate, this.analyser.fftSize)
  }

  close(): void {
    this.source.disconnect()
    this.analyser.disconnect()
    if (this.context.state !== 'closed') void this.context.close()
  }
}
