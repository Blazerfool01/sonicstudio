(() => {
  const box = selector => document.querySelector(selector).getBoundingClientRect().toJSON()
  const genres = [...document.querySelectorAll('.dashboard-genres .dashboard-genre')]
  const timeline = box('.dashboard-timeline')
  const rail = box('.dashboard-rail')
  return {
    viewport: [innerWidth, innerHeight],
    modules: [...document.querySelectorAll('.dashboard-modules>article')].map(e=>({title:e.querySelector('h2').textContent,box:e.getBoundingClientRect().toJSON()})),
    sources: genres.map(e=>({name:e.querySelector('strong').textContent,weight:e.querySelector('.genre-weight small').textContent,box:e.getBoundingClientRect().toJSON()})),
    singleSourceRow: genres.every(e=>e.getBoundingClientRect().top === genres[0].getBoundingClientRect().top),
    blend: document.querySelector('.blend-progress').innerText,
    vocal: document.querySelector('.studio-vocal-summary').innerText,
    mood: document.querySelector('.mood-radar').getAttribute('aria-label'),
    moodCurve: document.querySelector('.mood-radar-shape').getAttribute('d'),
    waveform: Boolean(document.querySelector('.dashboard-visualiser .reference-wave image')),
    sinePreview: Boolean(document.querySelector('.sound-card .reference-wave image')),
    tabs:[...document.querySelectorAll('.dashboard-mode-tabs button')].map(e=>({name:e.textContent,selected:e.getAttribute('aria-selected')})),
    tracks:[...document.querySelectorAll('.dashboard-track-label')].map(e=>e.textContent),
    clips:document.querySelectorAll('.dashboard-track-clips button').length,
    timeline,rail,railBaselineMatches:Math.abs(timeline.bottom-rail.bottom)<1,
    settings:document.querySelector('.dashboard-export').innerText,
    switches:[...document.querySelectorAll('.neon-switch')].map(e=>({name:e.getAttribute('aria-label'),checked:e.getAttribute('aria-checked')})),
    border:getComputedStyle(document.querySelector('.dashboard-card')).border,
    selectedGradient:getComputedStyle(document.querySelector('.dashboard-mode-tabs .selected')).backgroundImage,
    audioOwners:document.querySelectorAll('audio').length,
    visibleForms:[...document.querySelectorAll('form')].filter(e=>e.getClientRects().length).length,
    overflow:document.documentElement.scrollWidth>innerWidth,
  }
})()
