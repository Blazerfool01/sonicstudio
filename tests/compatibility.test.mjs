import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { analyzeCompatibility } from '../src/lib/compatibility.ts'
import { mergeGenres } from '../src/lib/merge.ts'

const readJson = name => JSON.parse(readFileSync(new URL(`../src/data/${name}`, import.meta.url), 'utf8'))
const traits = readJson('characteristics.json')
const facets = readJson('compatibility.json')
const oppositions = readJson('oppositions.json')
const genres = readJson('genres.json').map(genre => ({
  ...genre, characteristics: traits[genre.id], compatibility: facets[genre.id],
}))
const byId = id => genres.find(genre => genre.id === id)
const dimensions = ['rhythm','bass','harmony','instrumentation','texture','production','intensity']
const kinds = ['reinforcing','complementary','contrasting','conflicting']
const find = (report, dimension) => report.dimensions.find(item => item.dimension === dimension)

test('all twelve profiles declare complete compatibility facets', () => {
  assert.deepEqual(Object.keys(facets).sort(), genres.map(genre => genre.id).sort())
  for (const genre of genres) for (const dimension of dimensions) {
    const facet = genre.compatibility[dimension]
    assert.ok(facet?.approach, `${genre.id}/${dimension} has an approach`)
    assert.ok(['front','mid','bed','whole'].includes(facet.layer))
    assert.ok(Number.isInteger(facet.force) && facet.force >= 0 && facet.force <= 100)
  }
  for (const dimension of dimensions) {
    const approaches = new Set(genres.map(genre => genre.compatibility[dimension].approach))
    for (const [one,two] of oppositions[dimension]) {
      assert.ok(approaches.has(one) && approaches.has(two), `${dimension} opposition refers to known approaches`)
      assert.notEqual(one,two)
    }
  }
})

test('all 66 pairs receive seven deterministic explained classifications at three weights', () => {
  let pairs = 0
  const seenKinds = new Set()
  for (let a = 0; a < genres.length; a++) for (let b = a + 1; b < genres.length; b++) {
    for (const weight of [20,50,80]) {
      const report = analyzeCompatibility(genres[a], genres[b], weight)
      assert.deepEqual(report, analyzeCompatibility(genres[a], genres[b], weight))
      assert.deepEqual(report.dimensions.map(item => item.dimension), dimensions)
      assert.equal(Object.values(report.counts).reduce((sum,count) => sum + count, 0), 7)
      for (const item of report.dimensions) {
        assert.ok(kinds.includes(item.kind))
        assert.ok(item.explanation.includes(genres[a].name) && item.explanation.includes(genres[b].name))
        assert.equal(item.leadGenre, mergeGenres(genres[a], genres[b], weight)[item.dimension].anchorGenre)
        assert.equal(Boolean(item.resolution), ['contrasting','conflicting'].includes(item.kind))
        seenKinds.add(item.kind)
      }
    }
    pairs++
  }
  assert.equal(pairs, 66)
  assert.deepEqual([...seenKinds].sort(), [...kinds].sort())
})

test('Dark R&B and Hardwave explain dominance, competition, and resolution by weight', () => {
  const dark = byId('dark-rnb')
  const wave = byId('hardwave')
  const darkLed = analyzeCompatibility(dark, wave, 80)
  const balanced = analyzeCompatibility(dark, wave, 50)
  const waveLed = analyzeCompatibility(dark, wave, 20)
  assert.equal(find(darkLed,'harmony').kind, 'reinforcing')
  assert.equal(find(darkLed,'production').kind, 'contrasting')
  assert.equal(find(darkLed,'production').leadGenre, 'Dark R&B')
  assert.equal(find(balanced,'production').kind, 'conflicting')
  assert.match(find(balanced,'production').explanation, /disputed role/)
  assert.match(find(balanced,'production').resolution, /from Hardwave as the main role/)
  assert.equal(find(waveLed,'production').kind, 'contrasting')
  assert.equal(find(waveLed,'production').leadGenre, 'Hardwave')
  assert.notEqual(find(darkLed,'production').explanation, find(waveLed,'production').explanation)
})

test('Ambient and Drum & Bass separate environment from rhythmic foreground', () => {
  const report = analyzeCompatibility(byId('ambient'), byId('drum-bass'), 50)
  assert.equal(find(report,'rhythm').kind, 'contrasting')
  assert.equal(find(report,'rhythm').leadGenre, 'Drum & Bass')
  assert.match(find(report,'rhythm').resolution, /slow swells between rhythmic phrases/)
  assert.equal(find(report,'production').kind, 'complementary')
  assert.match(find(report,'production').explanation, /background bed/)
  assert.equal(report.counts.conflicting, 0)
})

test('Synthwave and Hardwave show clear reinforcement', () => {
  const report = analyzeCompatibility(byId('synthwave'), byId('hardwave'), 50)
  assert.ok(report.counts.reinforcing >= 4)
  assert.equal(report.counts.conflicting, 0)
  assert.equal(find(report,'harmony').kind, 'reinforcing')
  assert.equal(find(report,'production').kind, 'reinforcing')
  assert.match(find(report,'production').explanation, /both favour a wide, reverberant mix/)
})

test('an explicit production opposition is detected even with equal force', () => {
  const house = byId('house')
  const synthwave = byId('synthwave')
  assert.equal(house.compatibility.production.force, synthwave.compatibility.production.force)
  const balanced = analyzeCompatibility(house,synthwave,50)
  assert.equal(find(balanced,'production').kind, 'conflicting')
  assert.ok(find(balanced,'production').resolution)
  assert.equal(find(analyzeCompatibility(house,synthwave,80),'production').kind, 'contrasting')
})

test('analysis preserves the v0.2 Sound DNA and rejects invalid selections', () => {
  const dark = byId('dark-rnb')
  const wave = byId('hardwave')
  const before = mergeGenres(dark,wave,80)
  analyzeCompatibility(dark,wave,80)
  assert.deepEqual(mergeGenres(dark,wave,80), before)
  assert.throws(() => analyzeCompatibility(dark,dark,50))
  assert.throws(() => analyzeCompatibility(dark,wave,0))
})
