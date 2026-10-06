(async () => {
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms))
  const until = async test => { const end = performance.now() + 2500; while (!test() && performance.now() < end) await wait(16) }
  const $ = selector => document.querySelector(selector)
  const nav = label => [...document.querySelectorAll('.studio-sidebar button')].find(button => button.textContent.trim() === label)
  const results = []
  const check = (name, pass, actual) => results.push({ name, pass: !!pass, actual })
  nav('Genre Mixer').click(); await wait(900)
  $('#studio-tool-genre input').focus(); await wait(450)
  check('Centre keyboard focus recedes sides to .985', getComputedStyle($('.motion-navigation')).scale === '0.985', { scale: getComputedStyle($('.motion-navigation')).scale, opacity: getComputedStyle($('.motion-navigation')).opacity })
  $('[aria-label="Collapse context panel"]').focus()
  $('[aria-label="Collapse context panel"]').click(); await wait(700)
  const expand = $('[aria-label="Expand context panel"]')
  const rect = expand.getBoundingClientRect()
  check('Collapsed rail toggle is visible and hit-testable in header', document.elementFromPoint(rect.x + rect.width/2, rect.y + rect.height/2)?.closest('button') === expand, { rect: rect.toJSON(), topmost: document.elementFromPoint(rect.x + rect.width/2, rect.y + rect.height/2)?.outerHTML })
  expand.click(); await wait(100)
  check('Restoring panel uses 400ms', getComputedStyle($('.studio-shell-layout')).transitionDuration === '0.4s', getComputedStyle($('.studio-shell-layout')).transitionDuration)
  await wait(600)
  check('Collapsed content regains access on expansion', !$('#motion-rail-content').inert, $('#motion-rail-content').inert)
  document.activeElement?.blur()
  $('.motion-rail').dispatchEvent(new PointerEvent('pointerout', { bubbles: true, pointerType: 'mouse', relatedTarget: document.body }))
  nav('Visualiser').click(); await wait(900)
  $('[aria-label="Expand navigation"]').click(); await wait(600)
  nav('Home').click(); await wait(150)
  check('Leaving full-focus uses 500ms', getComputedStyle($('.studio-shell-layout')).transitionDuration === '0.5s', getComputedStyle($('.studio-shell-layout')).transitionDuration)
  await wait(900)
  // Force the documented no-View-Transition fallback, without changing app code.
  const nativeTransition = document.startViewTransition
  document.startViewTransition = undefined
  nav('Mood Mapper').click()
  await until(() => document.getAnimations().some(a => a.effect.target === $('.workflow-content') && a.effect.getTiming().duration === 175))
  const exit = document.getAnimations().find(a => a.effect.target === $('.workflow-content') && a.effect.getTiming().duration === 175)
  check('Fallback animates outgoing centre', !!exit, exit?.effect.getKeyframes())
  await until(() => $('.studio-sidebar [aria-current]')?.textContent.trim() === 'Mood Mapper')
  const entry = document.getAnimations().find(a => a.effect.target === $('.workflow-content') && a.effect.getTiming().duration === 175)
  check('Fallback animates incoming centre without remount', !!entry && entry !== exit, entry?.effect.getKeyframes())
  await wait(50)
  check('Selection echo does not cancel fallback entry', entry?.playState === 'running' || entry?.playState === 'finished', entry?.playState)
  await wait(600)
  nav('Tracks').click(); nav('Compare').click(); nav('Home').click(); await wait(1000)
  check('Fallback rapid navigation also honours latest selection', $('.studio-shell').dataset.dashboard === 'true', $('.studio-sidebar [aria-current]')?.textContent.trim())
  document.startViewTransition = nativeTransition
  window.__motionEdgeProof = results
  return { passed: results.filter(r => r.pass).length, total: results.length, results }
})()
