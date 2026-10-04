import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRecipe } from '../src/lib/recipe.ts'
import { makeMix, parseSavedMixes, sourceOf } from '../src/lib/savedMixes.ts'
import { mergeGenres } from '../src/lib/merge.ts'
import { analyzeCompatibility } from '../src/lib/compatibility.ts'

const readJson = name => JSON.parse(readFileSync(new URL(`../src/data/${name}`, import.meta.url), 'utf8'))
const traits = readJson('characteristics.json')
const facets = readJson('compatibility.json')
const genres = readJson('genres.json').map(genre => ({ ...genre, characteristics: traits[genre.id], compatibility: facets[genre.id] }))
const byId = id => genres.find(genre => genre.id === id)

test('all 66 pairs at 20/50/80 produce deterministic, source-led recipes', () => {
  let count = 0
  for (let i = 0; i < genres.length; i++) for (let j = i + 1; j < genres.length; j++) for (const weight of [20, 50, 80]) {
    const first = genres[i], second = genres[j]
    const recipe = createRecipe(first, second, weight)
    const dna = mergeGenres(first, second, weight)
    const compatibility = analyzeCompatibility(first, second, weight)
    assert.deepEqual(recipe, createRecipe(first, second, weight))
    for (const output of [recipe.short, recipe.detailed]) {
      assert.ok(output.includes(`${first.name} ${weight}% / ${second.name} ${100 - weight}%`))
      assert.ok(output.includes(`${dna.tempo[0]}–${dna.tempo[1]} BPM`))
      assert.doesNotMatch(output, /suno|openai|api key/i)
    }
    for (const item of compatibility.dimensions) {
      assert.ok(recipe.detailed.includes(item.explanation))
      if (item.resolution) assert.ok(recipe.detailed.includes(item.resolution))
    }
    count++
  }
  assert.equal(count, 198)
})

test('reopening saved source recreates the same recipe without storing generated text', () => {
  const source = { firstId: 'dark-rnb', secondId: 'hardwave', weight: 35 }
  const saved = makeMix('Night recipe', source, 'recipe-id')
  assert.deepEqual(Object.keys(saved).sort(), ['createdAt', 'genres', 'id', 'name', 'schemaVersion', 'updatedAt'])
  const reopened = parseSavedMixes(JSON.stringify([saved]), genres.map(genre => genre.id))[0]
  const loaded = sourceOf(reopened)
  assert.deepEqual(loaded, source)
  assert.deepEqual(createRecipe(byId(loaded.firstId), byId(loaded.secondId), loaded.weight), createRecipe(byId(source.firstId), byId(source.secondId), source.weight))
})
