(() => {
  const box = selector => document.querySelector(selector).getBoundingClientRect().toJSON()
  const genreCards = [...document.querySelectorAll('.fidelity-sound-card .dashboard-genre')]
  const tabs = [...document.querySelectorAll('.dashboard-mode-tabs [role=tab]')]
  const timeline = box('.dashboard-timeline')
  const rail = box('.dashboard-rail')
  return {
    viewport: { width: innerWidth, height: innerHeight },
    grid: getComputedStyle(document.querySelector('.workflow-content')).display,
    modules: [...document.querySelectorAll('.dashboard-modules>article')].map(e => ({ title: e.querySelector('h2').textContent, box: e.getBoundingClientRect().toJSON() })),
    genres: genreCards.map(e => ({ label: e.querySelector('strong').textContent, weight: e.querySelector('.genre-weight small').textContent, box: e.getBoundingClientRect().toJSON() })),
    singleGenreRow: genreCards.length === 3 && genreCards.every(e => e.getBoundingClientRect().y === genreCards[0].getBoundingClientRect().y),
    compatibility: document.querySelector('.blend-details').innerText,
    dualSinePreview: Boolean(document.querySelector('.sound-card .reference-wave image')),
    tabs: tabs.map(e => ({ name: e.textContent, selected: e.getAttribute('aria-selected') })),
    visualiser: box('.dashboard-visualiser'),
    waveform: Boolean(document.querySelector('.dashboard-visualiser .reference-wave image')),
    tracks: [...document.querySelectorAll('.dashboard-track-label')].map(e => e.innerText.replace('▣', '').trim()),
    clips: document.querySelectorAll('.dashboard-track-clips button').length,
    timeline,
    rail,
    railBottomMatchesTimeline: Math.abs(rail.bottom - timeline.bottom) < 1,
    audioExportFormat: document.querySelector('[aria-label="Audio export format"]').value,
    sampleRate: [...document.querySelectorAll('.dashboard-export select')][1].value,
    switches: [...document.querySelectorAll('.neon-switch')].map(e => ({ name: e.getAttribute('aria-label'), checked: e.getAttribute('aria-checked') })),
    cta: document.querySelector('.dashboard-primary').textContent,
    border: getComputedStyle(document.querySelector('.dashboard-card')).border,
    activeTabBackground: getComputedStyle(document.querySelector('.dashboard-mode-tabs .selected')).backgroundImage,
    audioOwners: document.querySelectorAll('audio').length,
    canvases: document.querySelectorAll('canvas').length,
    visibleForms: [...document.querySelectorAll('form')].filter(e => e.getBoundingClientRect().height > 0).length,
    horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
  }
})()
