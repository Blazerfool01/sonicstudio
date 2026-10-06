(async () => {
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms))
  const nav = label => [...document.querySelectorAll('.studio-sidebar button')].find(button => button.textContent.trim() === label)
  const results = []
  for (const label of ['Home','Genre Mixer','Vocal Persona','Mood Mapper','Tracks','Compare','Visualiser']) {
    nav(label).click(); await wait(900)
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    results.push({ label, width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
      overflow: document.documentElement.scrollWidth > innerWidth,
      inaccessiblePanels: innerWidth < 1280 && !!document.querySelector('.motion-side [inert]'),
      reduced, activeAnimations: reduced ? document.getAnimations().length : undefined,
      audio: document.querySelectorAll('audio').length, canvas: document.querySelectorAll('canvas').length })
  }
  nav('Home').click(); await wait(900)
  return results
})()
