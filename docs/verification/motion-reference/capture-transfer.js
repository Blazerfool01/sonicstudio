(async () => {
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms))
  const nav = [...document.querySelectorAll('.studio-sidebar button')].find(button => button.textContent.trim() === 'Genre Mixer')
  nav.click(); await wait(1000)
  window.scrollTo(0,0)
  document.querySelector('#studio-tool-genre .project-use').click()
  const end = performance.now() + 2000
  while (!document.getAnimations().some(a => a.effect.getTiming().duration === 550) && performance.now() < end) await wait(16)
  const effects = document.getAnimations().filter(a => [300,350,550,700].includes(a.effect.getTiming().duration))
  effects.forEach(animation => { animation.pause(); animation.currentTime = 220 })
  await wait(50)
  return effects.map(a => ({ duration: a.effect.getTiming().duration, currentTime: a.currentTime }))
})()
