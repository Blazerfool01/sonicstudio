import { DEFAULT_PERSONALITY } from './visualPersonality.ts'
import type { VisualPersonality } from './visualPersonality.ts'

export type VisualMode = 'spectrum' | 'waveform' | 'radial'

export const VISUAL_MODES: ReadonlyArray<{ id: VisualMode, label: string }> = [
  { id: 'spectrum', label: 'Spectrum' },
  { id: 'waveform', label: 'Waveform' },
  { id: 'radial', label: 'Radial' },
]

export const SPECTRUM_BAR_COUNT = 48
export const RADIAL_BAR_COUNT = 80
const spectrumBands = new Float32Array(SPECTRUM_BAR_COUNT)
const radialBands = new Float32Array(RADIAL_BAR_COUNT)

function clamp01(value: number): number {
  return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0
}

/** Map the analyser's byte spectrum into logarithmic frequency bands. */
function fillSpectrumBands(
  spectrum: ArrayLike<number>,
  sampleRate: number,
  fftSize: number,
  result: Float32Array,
): void {
  const bandCount = result.length
  if (!spectrum.length || sampleRate <= 0 || fftSize <= 0 || bandCount <= 0) {
    result.fill(0)
    return
  }
  const highestBin = spectrum.length - 1
  const maxHz = Math.min(sampleRate / 2, highestBin * sampleRate / fftSize)
  const minHz = Math.min(20, maxHz)
  if (maxHz <= 0 || minHz <= 0) {
    result.fill(0)
    return
  }

  const ratio = maxHz / minHz
  result.fill(0)
  for (let band = 0; band < bandCount; band++) {
    const lowHz = minHz * Math.pow(ratio, band / bandCount)
    const highHz = minHz * Math.pow(ratio, (band + 1) / bandCount)
    const first = Math.max(1, Math.ceil(lowHz * fftSize / sampleRate))
    const last = Math.min(highestBin, Math.floor(highHz * fftSize / sampleRate))
    if (first <= last) {
      let peak = 0
      for (let bin = first; bin <= last; bin++) peak = Math.max(peak, clamp01(spectrum[bin] / 255))
      result[band] = peak
    } else {
      const nearest = Math.max(1, Math.min(highestBin, Math.round(Math.sqrt(lowHz * highHz) * fftSize / sampleRate)))
      result[band] = clamp01(spectrum[nearest] / 255)
    }
  }
}

export function aggregateSpectrum(
  spectrum: ArrayLike<number>,
  sampleRate: number,
  fftSize: number,
  bandCount = SPECTRUM_BAR_COUNT,
): number[] {
  if (!spectrum.length || sampleRate <= 0 || fftSize <= 0 || bandCount <= 0) return []
  const result = new Float32Array(bandCount)
  fillSpectrumBands(spectrum, sampleRate, fftSize, result)
  return Array.from(result)
}

/** Convert a time-domain sample into a centred canvas Y coordinate. */
export function waveformY(sample: number, height: number): number {
  const normalized = Number.isFinite(sample) ? Math.max(-1, Math.min(1, sample)) : 0
  return height / 2 - normalized * height * 0.43
}

export function radialAngle(index: number, count: number): number {
  return count > 0 ? -Math.PI / 2 + index / count * Math.PI * 2 : -Math.PI / 2
}

export function radialRadius(magnitude: number, innerRadius: number, outerRadius: number): number {
  const inner = Math.max(0, Number.isFinite(innerRadius) ? innerRadius : 0)
  const outer = Math.max(inner, Number.isFinite(outerRadius) ? outerRadius : inner)
  return inner + clamp01(magnitude) * (outer - inner)
}

const LINE = 'rgba(191, 214, 150, 0.22)'

function prepare(ctx: CanvasRenderingContext2D, width: number, height: number, personality: Readonly<VisualPersonality>) {
  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = personality.background
  ctx.fillRect(0, 0, width, height)
  ctx.strokeStyle = 'rgba(218, 232, 196, 0.07)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, height / 2 + 0.5)
  ctx.lineTo(width, height / 2 + 0.5)
  ctx.stroke()
}

function drawSpectrum(ctx: CanvasRenderingContext2D, width: number, height: number, values: ArrayLike<number>, personality: Readonly<VisualPersonality>, pulse: number, high: number) {
  const gap = Math.max(2, Math.min(6, width / (values.length * 10)))
  const barWidth = Math.max(1, (width - gap * (values.length - 1)) / values.length)
  const maxHeight = height * 0.82
  ctx.fillStyle = personality.signal
  for (let index = 0; index < values.length; index++) {
    const value = values[index]
    const barHeight = visualMagnitude(value, personality, pulse, high, index / Math.max(1, values.length - 1)) * maxHeight
    const x = index * (barWidth + gap)
    ctx.globalAlpha = 0.54 + clamp01(value) * 0.46
    ctx.fillRect(x, height - barHeight, barWidth, barHeight)
  }
  ctx.globalAlpha = 1
}

function drawWaveform(ctx: CanvasRenderingContext2D, width: number, height: number, samples: ArrayLike<number>, personality: Readonly<VisualPersonality>, pulse: number) {
  if (!samples.length) return
  ctx.beginPath()
  for (let index = 0; index < samples.length; index++) {
    const x = samples.length === 1 ? width / 2 : index / (samples.length - 1) * width
    const y = waveformY(samples[index] * personality.gain * (1 + pulse * personality.bassPulse), height)
    if (index === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.strokeStyle = personality.signal
  ctx.lineWidth = 1.8 * personality.stroke
  ctx.shadowColor = personality.signal
  ctx.shadowBlur = personality.glow
  ctx.stroke()
  ctx.shadowBlur = 0
}

function drawRadial(ctx: CanvasRenderingContext2D, width: number, height: number, values: ArrayLike<number>, personality: Readonly<VisualPersonality>, pulse: number, high: number) {
  const cx = width / 2
  const cy = height / 2
  const inner = Math.min(width, height) * 0.1
  const outer = Math.min(width, height) * 0.44
  ctx.beginPath()
  ctx.arc(cx, cy, inner, 0, Math.PI * 2)
  ctx.strokeStyle = LINE
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.beginPath()
  for (let index = 0; index < values.length; index++) {
    const value = values[index]
    const angle = radialAngle(index, values.length)
    const radius = radialRadius(visualMagnitude(value, personality, pulse, high, index / Math.max(1, values.length - 1)), inner, outer)
    const x = cx + Math.cos(angle) * radius
    const y = cy + Math.sin(angle) * radius
    if (index === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fillStyle = personality.fill
  ctx.fill()
  ctx.strokeStyle = personality.signal
  ctx.lineWidth = 1.6 * personality.stroke
  ctx.stroke()
}

export function drawVisualFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  mode: VisualMode,
  waveform: ArrayLike<number>,
  spectrum: ArrayLike<number>,
  sampleRate: number,
  fftSize: number,
  personality: Readonly<VisualPersonality> = DEFAULT_PERSONALITY,
  bass = 0,
  high = 0,
): void {
  if (width <= 0 || height <= 0) return
  prepare(ctx, width, height, personality)
  if (mode === 'waveform') drawWaveform(ctx, width, height, waveform, personality, bass)
  else {
    if (mode === 'radial') {
      fillSpectrumBands(spectrum, sampleRate, fftSize, radialBands)
      drawRadial(ctx, width, height, radialBands, personality, bass, high)
    } else {
      fillSpectrumBands(spectrum, sampleRate, fftSize, spectrumBands)
      drawSpectrum(ctx, width, height, spectrumBands, personality, bass, high)
    }
  }
}

export function drawVisualIdle(ctx: CanvasRenderingContext2D, width: number, height: number, personality: Readonly<VisualPersonality> = DEFAULT_PERSONALITY): void {
  if (width <= 0 || height <= 0) return
  prepare(ctx, width, height, personality)
  ctx.strokeStyle = 'rgba(200, 218, 144, 0.56)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(0, height / 2)
  ctx.lineTo(width, height / 2)
  ctx.stroke()
}

/** Detail shapes spectral response; it cannot create energy in a silent bin. */
export function visualMagnitude(magnitude: number, personality: Readonly<VisualPersonality>, bass: number, high: number, position: number): number {
  const detail = 1 - clamp01(position) * (1 - personality.detail) * (1 - clamp01(high))
  return clamp01(clamp01(magnitude) * personality.gain * (1 + clamp01(bass) * personality.bassPulse) * detail)
}
