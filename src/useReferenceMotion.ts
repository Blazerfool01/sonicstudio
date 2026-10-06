import { useEffect, useRef, useState } from 'react'
import type { PointerEvent, SyntheticEvent } from 'react'
import { flushSync } from 'react-dom'
import type { IngredientKind } from './lib/experimentActions.ts'

const EASING = 'cubic-bezier(.22, 1, .36, 1)'
const canAnimate = () => !document.hidden && !matchMedia('(prefers-reduced-motion: reduce)').matches

/** Presentation only: callers still own every navigation and project mutation. */
export default function useReferenceMotion() {
  const root = useRef<HTMLDivElement>(null)
  const animations = useRef<Animation[]>([])
  const sceneAnimations = useRef<Animation[]>([])
  const transition = useRef<ViewTransition | null>(null)
  const pendingFrame = useRef(0)
  const navigationVersion = useRef(0)
  const [focusShift, updateFocusShift] = useState(false)
  const [layoutMotion, setLayoutMotion] = useState<'focus' | 'collapse' | 'canvas'>('focus')
  function setFocusShift(value: boolean) { setLayoutMotion('focus'); updateFocusShift(value) }
  const [follow, setFollow] = useState<{ kind: IngredientKind; sequence: number } | null>(null)

  function animate(element: Element | null | undefined, frames: Keyframe[], duration: number, delay = 0, scene = false) {
    if (!element || !canAnimate()) return
    const animation = element.animate(frames, { duration, delay, easing: EASING })
    const owner = scene ? sceneAnimations : animations
    owner.current.push(animation)
    void animation.finished.catch(() => {}).finally(() => {
      owner.current = owner.current.filter(item => item !== animation)
    })
  }

  function echo(kind?: IngredientKind, transfer = false) {
    if (kind) setFollow(current => ({ kind, sequence: (current?.sequence ?? 0) + 1 }))
    cancelAnimationFrame(pendingFrame.current)
    pendingFrame.current = requestAnimationFrame(() => {
      const shell = root.current
      if (!shell || !canAnimate()) return
      animations.current.forEach(animation => animation.cancel())
      const highlight: Keyframe[] = [
        { boxShadow: 'inset 0 0 0 1px transparent' },
        { boxShadow: 'inset 0 0 16px #895dff40, inset 0 0 0 1px #58dfff88', offset: .35 },
        { boxShadow: 'inset 0 0 0 1px transparent' },
      ]
      const nav = shell.querySelector('.studio-sidebar [aria-current="page"]')
      const centre = kind ? shell.querySelector(`#studio-tool-${kind}`) : shell.querySelector('.workflow-content')
      const rail = kind ? shell.querySelector(`[data-motion-guidance="${kind}"]`) : shell.querySelector('.motion-rail-content')
      animate(nav, highlight, 300)
      animate(centre, highlight, 350, 75)
      animate(rail, highlight, 350, 150)
      if (kind) animate(rail, [{ transform: 'translateY(16px)', opacity: .45 }, { transform: 'translateY(0)', opacity: 1 }], 350)
      if (transfer) {
        // Anchor the trace to the actual selection and its guidance, not a fixed
        // screenshot coordinate (which would point at the wrong sidebar item).
        const svg = shell.querySelector<SVGSVGElement>('.motion-energy')
        const layout = shell.querySelector('.studio-shell-layout')?.getBoundingClientRect()
        const sourcePanel = shell.querySelector('.motion-navigation')
        const targetPanel = shell.querySelector('.motion-rail')
        const source = (sourcePanel?.getAttribute('data-collapsed') === 'true' ? sourcePanel : nav)?.getBoundingClientRect()
        const target = (targetPanel?.getAttribute('data-collapsed') === 'true' ? targetPanel : rail?.querySelector('h4') ?? rail)?.getBoundingClientRect()
        if (svg && layout && source && target) {
          const startX = source.left + source.width / 2 - layout.left
          const endX = target.left + target.width / 2 - layout.left
          const startY = source.top + Math.min(source.height / 2, 100) - layout.top
          const endY = target.top + Math.min(target.height / 2, 100) - layout.top
          const top = Math.min(startY, endY) - 40
          const height = Math.abs(endY - startY) + 100
          const middleX = (startX + endX) / 2
          const middleY = (startY + endY) / 2 - top + 25
          svg.style.top = `${top}px`; svg.style.left = '0'; svg.style.width = '100%'; svg.style.height = `${height}px`
          svg.setAttribute('viewBox', `0 0 ${layout.width} ${height}`)
          svg.querySelector('path')?.setAttribute('d', `M ${startX} ${startY - top} C ${startX + 100} ${startY - top - 25}, ${middleX - 100} ${middleY}, ${middleX} ${middleY} S ${endX - 100} ${endY - top}, ${endX} ${endY - top}`)
        }
        animate(shell.querySelector('.motion-energy path'), [
          { strokeDashoffset: 1, opacity: 0 }, { opacity: .85, offset: .1 },
          { strokeDashoffset: 0, opacity: .85, offset: .95 },
          { strokeDashoffset: 0, opacity: 0 },
        ], 550)
        shell.querySelectorAll('.motion-divider').forEach(edge => animate(edge, [
          { boxShadow: '0 0 0 transparent' }, { boxShadow: '0 0 14px 2px #9a5cff', offset: .35 }, { boxShadow: '0 0 0 transparent' },
        ], 700))
      }
    })
  }

  function changeScene(action: () => void, canvas = false) {
    setLayoutMotion(canvas ? 'canvas' : 'focus')
    const version = ++navigationVersion.current
    cancelAnimationFrame(pendingFrame.current)
    animations.current.forEach(animation => animation.cancel())
    sceneAnimations.current.forEach(animation => animation.cancel())
    transition.current?.skipTransition()
    if (!canAnimate()) { action(); return }
    if (document.startViewTransition) {
      const next = document.startViewTransition(() => {
        if (version === navigationVersion.current) flushSync(action)
      })
      transition.current = next
      void next.ready.catch(() => {})
      void next.finished.catch(() => {}).finally(() => { if (transition.current === next) transition.current = null })
    } else {
      // Older browsers retain both directions without duplicating React/media trees.
      const main = root.current?.querySelector('.workflow-content')
      const exit = main?.animate([{ transform: 'translateX(0)', opacity: 1 }, { transform: 'translateX(-16px)', opacity: 0 }], { duration: 175, easing: EASING })
      if (!exit) { action(); return }
      sceneAnimations.current.push(exit)
      void exit.finished.catch(() => {}).then(() => {
        if (version !== navigationVersion.current) return
        flushSync(action)
        animate(main, [{ transform: 'translateX(16px)', opacity: 0 }, { transform: 'translateX(0)', opacity: 1 }], 175, 0, true)
      }).finally(() => { sceneAnimations.current = sceneAnimations.current.filter(item => item !== exit) })
    }
  }

  function selectFromEditor(event: SyntheticEvent, kind: IngredientKind) {
    const target = event.target
    if (!(target instanceof Element)) return
    if (event.type === 'change' && target.matches('select, input[type="range"], input[type="radio"], input[type="checkbox"]')) echo(kind)
    if (event.type === 'click' && target.closest('.genre-option, .source-card, .vocal-choice, .vocal-option, .mood-option')) echo(kind)
  }

  function magnetic(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse' || !canAnimate() || !matchMedia('(min-width: 1280px) and (hover: hover) and (pointer: fine)').matches) return
    const shell = root.current
    if (!shell) return
    shell.querySelectorAll<HTMLElement>('.motion-divider').forEach(edge => {
      const distance = event.clientX - edge.getBoundingClientRect().left
      const near = Math.abs(distance) < 24
      edge.style.setProperty('--magnetic-offset', near ? `${Math.sign(distance) * 3}px` : '0px')
      edge.dataset.near = String(near)
    })
  }
  function resetMagnetic() {
    root.current?.querySelectorAll<HTMLElement>('.motion-divider').forEach(edge => {
      edge.style.setProperty('--magnetic-offset', '0px'); edge.dataset.near = 'false'
    })
  }

  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const stop = () => {
      if (!media.matches && !document.hidden) return
      animations.current.forEach(animation => animation.cancel())
      sceneAnimations.current.forEach(animation => animation.cancel())
      transition.current?.skipTransition()
    }
    media.addEventListener('change', stop)
    document.addEventListener('visibilitychange', stop)
    return () => {
      navigationVersion.current++
      cancelAnimationFrame(pendingFrame.current)
      animations.current.forEach(animation => animation.cancel())
      sceneAnimations.current.forEach(animation => animation.cancel())
      transition.current?.skipTransition()
      media.removeEventListener('change', stop)
      document.removeEventListener('visibilitychange', stop)
    }
  }, [])
  return { root, focusShift, setFocusShift, layoutMotion, setLayoutMotion, follow, echo, changeScene, magnetic, resetMagnetic, selectFromEditor }
}
