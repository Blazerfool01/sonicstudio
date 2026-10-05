import test from 'node:test'
import assert from 'node:assert/strict'
import { createProject, createProjectTrack, addProjectTrack, attachIngredient, removeProjectTrack, editProjectTrack, parseProjects, writeProjects } from '../src/lib/studioProject.ts'
import { createComparison, addComparison, editComparison, deleteComparison, comparisonsUsingTrack, OBSERVATION_FIELDS } from '../src/lib/trackComparison.ts'
import { provenanceDifferences } from '../src/lib/provenanceDifference.ts'
import { createTrackBrief } from '../src/lib/creationBrief.ts'
import { defaultVocalSelections } from '../src/lib/voiceDna.ts'
const now = '2026-10-05T12:00:00Z'
function project() {
 let p = createProject('Experiment', 'project', now)
 p = attachIngredient(p, 'genre', { label: 'Blend', sourceId: 'genre', genres: [{ genreId: 'dark-rnb', weight: 60 }, { genreId: 'hardwave', weight: 40 }] }, now)
 p = attachIngredient(p, 'vocal', { label: 'Singer', sourceId: 'voice', identityDescription: 'Warm', selections: { ...defaultVocalSelections } }, now)
 p = attachIngredient(p, 'mood', { label: 'Mood', sourceId: 'mood', selections: [{ moodId: 'serene', weight: 50 }, { moodId: 'dreamlike', weight: 50 }] }, now)
 p = addProjectTrack(p, createProjectTrack(p, 'A', 'a', now))
 p = addProjectTrack(p, createProjectTrack(p, 'B', 'b', now))
 return addProjectTrack(p, createProjectTrack(p, 'C', 'c', now))
}
const paired = () => { const p = project(); return addComparison(p, createComparison(p, 'a', 'b', 'experiment', now)) }
function reopen(p) { let raw; writeProjects({ setItem(_, value) { raw = value } }, [p], p.id); return parseProjects(raw).projects[0] }
const dimension = (p, b, kind) => provenanceDifferences(p.tracks[0].creationSnapshot, b).find(d => d.dimension === kind)

test('Stage 2 project migration keeps tracks and defaults comparisons to empty', () => {
 const p = project(); delete p.comparisons
 const read = reopen(p); assert.deepEqual(read.comparisons, []); assert.deepEqual(read.tracks, p.tracks)
})
test('new projects initialise a separate empty comparison list', () => { assert.deepEqual(createProject('P', 'p', now).comparisons, []); assert.notEqual(createProject('P', 'p', now).comparisons, createProject('P', 'q', now).comparisons) })
test('comparison requires two existing distinct tracks in its owning project', () => {
 const p = project(); const c = createComparison(p, 'a', 'b', 'cmp', now)
 assert.equal(c.trackAId, 'a'); assert.equal(c.trackBId, 'b'); assert.equal(c.preferredTrackId, null)
 for (const [a, b] of [['a', 'a'], ['a', 'missing'], ['missing', 'b'], ['', 'b']]) assert.throws(() => createComparison(p, a, b, 'cmp', now))
 assert.throws(() => createComparison({ ...p, tracks: [] }, 'a', 'b', 'cmp', now))
})
test('all six observations conclusion and timestamps persist in owning project envelope', () => {
 const p = paired(); const observations = Object.fromEntries(OBSERVATION_FIELDS.map(f => [f, `${f} observation`]))
 const saved = editComparison(p, 'experiment', { observations, preferredTrackId: 'b', conclusion: 'Keep version B for its atmosphere' }, '2026-10-05T13:00:00Z')
 assert.deepEqual(reopen(saved).comparisons, saved.comparisons); assert.equal(saved.comparisons[0].createdAt, now); assert.equal(saved.comparisons[0].updatedAt, '2026-10-05T13:00:00Z')
 observations.atmosphere = 'later draft'; assert.notEqual(saved.comparisons[0].observations.atmosphere, observations.atmosphere)
})
for (const preferredTrackId of ['a', 'b', null]) test(`preference accepts ${preferredTrackId ?? 'undecided'} without forcing a winner`, () => {
 const p = paired(); const changed = editComparison(p, 'experiment', { ...p.comparisons[0], preferredTrackId }, now)
 assert.equal(reopen(changed).comparisons[0].preferredTrackId, preferredTrackId)
})
test('preference outside pairing is rejected even for another existing track', () => {
 const p = paired(); for (const id of ['c', 'missing', '']) assert.throws(() => editComparison(p, 'experiment', { ...p.comparisons[0], preferredTrackId: id }, now))
 assert.equal(p.comparisons[0].preferredTrackId, null)
})
test('current Genre Vocal Mood replacements cannot rewrite comparison or historical briefs', () => {
 let p = paired(); const c = structuredClone(p.comparisons[0]); const brief = createTrackBrief(p.tracks[0].creationSnapshot)
 p = attachIngredient(p, 'genre', { ...p.genre, genres: [{ genreId: 'ambient', weight: 50 }, { genreId: 'hardwave', weight: 50 }] }, now)
 p = attachIngredient(p, 'vocal', { ...p.vocal, label: 'New', selections: { ...p.vocal.selections, power: 99 } }, now)
 p = attachIngredient(p, 'mood', { ...p.mood, selections: [{ moodId: 'aggressive', weight: 100 }] }, now)
 assert.deepEqual(p.comparisons[0], c); assert.deepEqual(createTrackBrief(p.tracks[0].creationSnapshot), brief)
})
test('track metadata edits preserve pairing observations and creation identity', () => {
 const p = paired(); const edited = editProjectTrack(p, 'a', { title: 'New title', version: 'Master candidate', notes: 'new' }, now)
 assert.deepEqual(edited.comparisons, p.comparisons); assert.deepEqual(edited.tracks[0].creationSnapshot, p.tracks[0].creationSnapshot)
})
test('Genre difference detects source change separately from weight-only change', () => {
 const p = project(); let b = structuredClone(p.tracks[0].creationSnapshot)
 b.genre.genres = [{ genreId: 'ambient', weight: 60 }, { genreId: 'hardwave', weight: 40 }]
 assert.ok(dimension(p, b, 'genre').changes.includes('sources')); assert.match(dimension(p, b, 'genre').after, /Ambient/)
 b = structuredClone(p.tracks[0].creationSnapshot); b.genre.genres[0].weight = 40; b.genre.genres[1].weight = 60
 assert.deepEqual(dimension(p, b, 'genre').changes, ['weights']); assert.match(dimension(p, b, 'genre').after, /40%/)
})
test('Vocal difference identifies origin label saved ID selections and description', () => {
 const p = project(); const b = structuredClone(p.tracks[0].creationSnapshot)
 b.vocal.label = 'New singer'; b.vocal.sourceId = 'new-id'
 assert.deepEqual(dimension(p, b, 'vocal').changes, ['origin'])
 b.vocal.selections.power = 99; b.vocal.identityDescription = 'Forceful'
 assert.deepEqual(dimension(p, b, 'vocal').changes, ['origin', 'selections', 'description']); assert.match(dimension(p, b, 'vocal').after, /Power 99/)
})
test('Vocal equality is independent of object property order', () => {
 const p = project(); const b = structuredClone(p.tracks[0].creationSnapshot); b.vocal.selections = Object.fromEntries(Object.entries(b.vocal.selections).reverse())
 assert.ok(dimension(p, b, 'vocal').unchanged)
})
test('Mood difference distinguishes source and weight changes', () => {
 const p = project(); let b = structuredClone(p.tracks[0].creationSnapshot); b.mood.selections[1].moodId = 'aggressive'
 assert.ok(dimension(p, b, 'mood').changes.includes('sources')); assert.match(dimension(p, b, 'mood').after, /Aggressive/)
 b = structuredClone(p.tracks[0].creationSnapshot); b.mood.selections[0].weight = 90; assert.deepEqual(dimension(p, b, 'mood').changes, ['weights'])
})
test('identical dimensions explicitly report unchanged and differences make no quality judgment', () => {
 const p = project(); const a = p.tracks[0].creationSnapshot; const before = structuredClone(a)
 const differences = provenanceDifferences(a, structuredClone(a)); assert.equal(differences.length, 3)
 for (const d of differences) { assert.equal(d.unchanged, true); assert.deepEqual(d.changes, []); assert.equal(d.before, d.after); assert.ok(!('score' in d)); assert.ok(!('preferred' in d)) }
 assert.deepEqual(a, before)
})
test('missing captured ingredients are factual differences and double-null is unchanged', () => {
 const p = project(); const a = p.tracks[0].creationSnapshot; const empty = { genre: null, vocal: null, mood: null }
 for (const d of provenanceDifferences(a, empty)) { assert.deepEqual(d.changes, ['presence']); assert.equal(d.after, 'Not captured') }
 assert.ok(provenanceDifferences(empty, empty).every(d => d.unchanged))
})
test('malformed comparison records do not hide valid siblings or tracks', () => {
 const p = paired(); const c = p.comparisons[0]
 for (const bad of [{ ...c, schemaVersion: 2 }, { ...c, trackBId: 'a' }, { ...c, trackAId: 'missing' }, { ...c, preferredTrackId: 'c' }, { ...c, observations: { ...c.observations, mix: 42 } }, { ...c, createdAt: 'invalid' }, { ...c, conclusion: 'x'.repeat(4001) }]) {
  const mixed = { ...p, comparisons: [{ ...bad, id: 'bad' }, c] }; assert.deepEqual(reopen(mixed).comparisons, [c]); assert.deepEqual(reopen(mixed).tracks, p.tracks)
 }
})
test('comparison writer strips unknown top-level and observation fields', () => {
 const p = paired(); p.comparisons[0].blobUrl = 'sentinel'; p.comparisons[0].observations.unrecognised = 'sentinel'
 assert.ok(!JSON.stringify(reopen(p)).includes('sentinel')); assert.deepEqual(Object.keys(reopen(p).comparisons[0].observations), [...OBSERVATION_FIELDS])
})
test('duplicate comparison IDs are isolated and duplicate creation fails', () => {
 const p = paired(); assert.throws(() => addComparison(p, p.comparisons[0])); p.comparisons.push(p.comparisons[0]); assert.equal(reopen(p).comparisons.length, 1)
})
test('deleting an unreferenced track leaves comparisons intact', () => {
 const p = paired(); const removed = removeProjectTrack(p, 'c', now); assert.deepEqual(removed.comparisons, p.comparisons); assert.equal(removed.tracks.length, 2)
})
test('referenced removal is blocked until explicit confirmation then cascades only dependencies', () => {
 let p = paired(); p = addComparison(p, createComparison(p, 'b', 'c', 'retained', now)); assert.equal(comparisonsUsingTrack(p, 'a').length, 1)
 assert.throws(() => removeProjectTrack(p, 'a', now), /Confirm deletion/); assert.equal(p.tracks.length, 3); assert.equal(p.comparisons.length, 2)
 const removed = removeProjectTrack(p, 'a', now, true); assert.equal(removed.tracks.length, 2); assert.deepEqual(removed.comparisons, [p.comparisons[1]]); assert.deepEqual(reopen(removed).comparisons, removed.comparisons)
})
test('parser rejects dangling comparison references rather than substituting a neighbour', () => {
 const p = paired(); p.tracks = p.tracks.filter(t => t.id !== 'a'); assert.deepEqual(reopen(p).comparisons, []); assert.deepEqual(reopen(p).tracks, p.tracks)
})
test('comparison deletion leaves both tracks source identities and session metadata untouched', () => {
 const p = paired(); const removed = deleteComparison(p, 'experiment', now); assert.deepEqual(removed.tracks, p.tracks); assert.equal(removed.comparisons.length, 0); assert.deepEqual(removed.genre, p.genre)
})
test('edit keeps pairing immutable even when extra pair fields are passed at runtime', () => {
 const p = paired(); const edited = editComparison(p, 'experiment', { ...p.comparisons[0], trackAId: 'c', observations: { ...p.comparisons[0].observations, mix: 'dry' } }, now)
 assert.equal(edited.comparisons[0].trackAId, 'a'); assert.equal(edited.comparisons[0].trackBId, 'b'); assert.throws(() => editComparison(p, 'missing', p.comparisons[0], now))
})
test('storage denial is reported without mutating the in-memory saved comparison', () => {
 const p = paired(); assert.throws(() => writeProjects({ setItem() { throw new Error('denied') } }, [p], p.id), /denied/); assert.equal(p.comparisons.length, 1)
})
