import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { mergeGenres } from '../src/lib/merge.ts'

const readJson = (name) => JSON.parse(readFileSync(new URL(`../src/data/${name}`, import.meta.url), 'utf8'))
const characteristics = readJson('characteristics.json')
const genres = readJson('genres.json').map(genre => ({ ...genre, characteristics: characteristics[genre.id] }))
const byId = (id) => genres.find(genre => genre.id === id)
const dimensions = ['rhythm','bass','harmony','instrumentation','texture','production','intensity']

test('twelve unique profiles have complete structured musical roles', () => {
  assert.equal(genres.length, 12)
  assert.equal(new Set(genres.map(genre => genre.id)).size, 12)
  assert.deepEqual(Object.keys(characteristics).sort(), genres.map(genre => genre.id).sort())
  for (const genre of genres) {
    assert.ok(genre.tempo[0] <= genre.tempo[1])
    assert.ok(genre.energy >= 0 && genre.energy <= 100)
    assert.ok(genre.darkness >= 0 && genre.darkness <= 100)
    for (const key of dimensions) {
      const role = genre.characteristics[key]
      assert.ok(role.anchor && role.accent, `${genre.id} ${key} has text`)
      assert.ok(role.strength >= 0 && role.strength <= 100, `${genre.id} ${key} has valid strength`)
    }
  }
})

test('all 66 pairs are complete and deterministic at representative weights', () => {
  let count = 0
  for (let a = 0; a < genres.length; a++) for (let b = a + 1; b < genres.length; b++) {
    for (const weight of [20,50,80]) {
      const dna = mergeGenres(genres[a], genres[b], weight)
      assert.deepEqual(dna, mergeGenres(genres[a], genres[b], weight))
      assert.ok(dna.tempo[0] <= dna.tempo[1])
      assert.ok([genres[a].name,genres[b].name].includes(dna.tempoSource))
      for (const key of dimensions) {
        assert.ok(dna[key].text.includes(dna[key].anchorGenre))
        assert.ok(dna[key].text.includes(dna[key].supportGenre))
        assert.notEqual(dna[key].anchorGenre, dna[key].supportGenre)
      }
    }
    count++
  }
  assert.equal(count, 66)
})

test('weight changes the musical lead, not only the numeric meters', () => {
  const dark = byId('dark-rnb')
  const wave = byId('hardwave')
  const darkLed = mergeGenres(dark,wave,80)
  const waveLed = mergeGenres(dark,wave,20)
  assert.equal(darkLed.rhythm.anchorGenre, 'Dark R&B')
  assert.equal(darkLed.texture.anchorGenre, 'Dark R&B')
  assert.equal(waveLed.rhythm.anchorGenre, 'Hardwave')
  assert.equal(waveLed.production.anchorGenre, 'Hardwave')
  assert.match(darkLed.harmony.text, /minor-key chords with soulful extensions/)
  assert.match(waveLed.harmony.text, /warm suspended voicings/)
  assert.notDeepEqual(darkLed, waveLed)
})

test('Ambient and Drum & Bass share roles coherently at equal weight', () => {
  const ambient = byId('ambient')
  const dnb = byId('drum-bass')
  const dna = mergeGenres(ambient,dnb,50)
  assert.equal(dna.rhythm.anchorGenre, 'Drum & Bass')
  assert.equal(dna.tempoSource, 'Drum & Bass')
  assert.ok(dna.tempo[0] >= 140)
  assert.equal(dna.texture.anchorGenre, 'Ambient')
  assert.equal(dna.production.anchorGenre, 'Ambient')
  assert.match(dna.rhythm.text, /fast, rolling breakbeats/)
  assert.match(dna.production.text, /diffuse, long-reverb environment/)
})

test('equal weights are order-invariant and invalid selections are rejected', () => {
  const [a,b] = [byId('ambient'),byId('drum-bass')]
  assert.deepEqual(mergeGenres(a,b,50), mergeGenres(b,a,50))
  assert.throws(() => mergeGenres(a,a,50))
  assert.throws(() => mergeGenres(a,b,0))
  assert.throws(() => mergeGenres(a,b,100))
})
