import test from 'node:test'
import assert from 'node:assert/strict'
import { deriveMoodDna } from '../src/lib/moodDna.ts'
import { productionGuidanceForMoodDna } from '../src/lib/moodProductionGuidance.ts'
import { analyzeMoodRelationships } from '../src/lib/moodRelationships.ts'
import { interpretMoodRelationships } from '../src/lib/moodRelationshipInterpretation.ts'

const from = (...items) => deriveMoodDna(items.map(([moodId, weight]) => ({ moodId, weight })))

test('production view has no data without Mood DNA and translates one mood', () => {
  assert.equal(productionGuidanceForMoodDna(null), null)
  const result = productionGuidanceForMoodDna(from(['serene', 50]))
  assert.ok(result.overallDirection)
  assert.equal(Object.keys(result.domains).length, 7)
  assert.ok(result.priorities.length > 0)
})

test('live weight changes update guidance while retaining source traceability', () => {
  const equal = productionGuidanceForMoodDna(from(['serene', 50], ['menacing', 50]))
  const unevenDna = from(['serene', 90], ['menacing', 10])
  const uneven = productionGuidanceForMoodDna(unevenDna)
  assert.notEqual(equal.overallDirection, uneven.overallDirection)
  for (const direction of Object.values(uneven.domains)) for (const signal of direction.signals) {
    assert.ok(signal.sources.length > 0)
    for (const source of signal.sources) assert.equal(source.value, unevenDna.dimensions[source.dimension])
  }
})

test('combined signals remain visible with all sources and relationship guidance stays independent', () => {
  const selections = [{ moodId: 'dreamlike', weight: 50 }, { moodId: 'restless', weight: 50 }]
  const relationship = analyzeMoodRelationships(selections)
  const interpretation = interpretMoodRelationships(relationship, selections)
  const result = productionGuidanceForMoodDna(deriveMoodDna(selections))
  const pulse = result.domains.rhythm.signals.find(signal => signal.trait === 'measured pulse beneath ambience')
  assert.deepEqual(pulse.sources.map(source => source.dimension), ['atmosphere', 'motion'])
  assert.deepEqual(interpretMoodRelationships(relationship, selections), interpretation)
  assert.ok(interpretation.tensions.some(item => item.dimension === 'motion'))
})
