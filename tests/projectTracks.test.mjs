import test from 'node:test'
import assert from 'node:assert/strict'
import { createProject, attachIngredient, createProjectTrack, addProjectTrack, editProjectTrack, removeProjectTrack, parseProjects, writeProjects, sameIdentity } from '../src/lib/studioProject.ts'
import { createTrackBrief, createCreationBrief } from '../src/lib/creationBrief.ts'
import { defaultVocalSelections } from '../src/lib/voiceDna.ts'
import { SessionAudio } from '../src/lib/sessionAudio.ts'
const now = '2026-10-05T12:00:00Z'
const empty = () => createProject('Tracks', 'project', now)
const full = () => {
 let p = empty()
 p = attachIngredient(p, 'genre', { label: 'A', sourceId: null, genres: [{ genreId: 'dark-rnb', weight: 60 }, { genreId: 'hardwave', weight: 40 }] }, now)
 p = attachIngredient(p, 'vocal', { label: 'Singer A', sourceId: 'singer', identityDescription: 'A voice', selections: { ...defaultVocalSelections } }, now)
 return attachIngredient(p, 'mood', { label: 'Serene', sourceId: null, selections: [{ moodId: 'serene', weight: 100 }] }, now)
}
const withTrack = () => { const p = full(); return addProjectTrack(p, createProjectTrack(p, 'Track A', 'a', now)) }
const read = projects => parseProjects(JSON.stringify({ schemaVersion: 1, projects, activeId: 'project' })).projects

test('Stage 1 records evolve safely to empty tracks in the existing storage key', () => {
 const old = empty(); delete old.tracks
 assert.deepEqual(read([old])[0].tracks, [])
 assert.equal(read([old])[0].name, old.name)
})
test('new projects initialise their own empty track array', () => { assert.deepEqual(empty().tracks, []); assert.notEqual(empty().tracks, empty().tracks) })
test('new track captures current Genre Vocal Mood without copying project annotations', () => {
 const p = full(); const t = createProjectTrack({ ...p, notes: 'private' }, 'A', 'a', now)
 assert.equal(t.schemaVersion, 1); assert.ok(sameIdentity(p, t.creationSnapshot)); assert.equal(t.notes, '')
 assert.notEqual(t.creationSnapshot.genre, p.genre); assert.notEqual(t.creationSnapshot.vocal.selections, p.vocal.selections); assert.notEqual(t.creationSnapshot.mood.selections, p.mood.selections)
})
test('track snapshot is deeply isolated even if original ingredient objects are mutated', () => {
 const p = full(); const t = createProjectTrack(p, 'A', 'a', now); const before = structuredClone(t)
 p.genre.genres[0].weight = 75; p.vocal.selections.power = 99; p.mood.selections[0].weight = 1
 assert.deepEqual(t, before)
})
test('second result captures all new ingredients while first retains A identity', () => {
 let p = withTrack(); const first = structuredClone(p.tracks[0])
 p = attachIngredient(p, 'genre', { label: 'B', sourceId: null, genres: [{ genreId: 'ambient', weight: 50 }, { genreId: 'hardwave', weight: 50 }] }, now)
 p = attachIngredient(p, 'vocal', { ...p.vocal, label: 'Singer B', selections: { ...p.vocal.selections, power: 99 } }, now)
 p = attachIngredient(p, 'mood', { label: 'Aggressive', sourceId: null, selections: [{ moodId: 'aggressive', weight: 100 }] }, now)
 p = addProjectTrack(p, createProjectTrack(p, 'B', 'b', now))
 assert.deepEqual(p.tracks[0], first); assert.ok(sameIdentity(p, p.tracks[1].creationSnapshot)); assert.ok(!sameIdentity(p, first.creationSnapshot))
 assert.deepEqual(read([p])[0].tracks, p.tracks)
})
test('title free-text version source detail and notes survive writing and reopening', () => {
 const p = editProjectTrack(withTrack(), 'a', { title: 'Master', version: 'Chorus rewrite', source: 'generated', sourceDetail: 'Suno', notes: 'first attempt' }, now)
 let raw; writeProjects({ setItem(_, value) { raw = value } }, [p], p.id)
 assert.deepEqual(parseProjects(raw).projects[0].tracks[0], p.tracks[0])
})
test('damaged tracks duplicate IDs and unknown schemas preserve valid siblings and parent', () => {
 const p = withTrack(); const t = p.tracks[0]
 p.tracks = [{ ...t, id: 'bad', creationSnapshot: {} }, { ...t, id: 'unknown', schemaVersion: 2 }, t, t]
 assert.deepEqual(read([p])[0].tracks, [t]); assert.equal(read([p])[0].name, p.name)
})
test('unknown track file and identity fields are stripped from persistence', () => {
 const p = withTrack(); p.tracks[0].unknown = 'secret'; p.tracks[0].creationSnapshot.unknown = 'secret'
 p.tracks[0].file = { filename: 'a.wav', type: 'audio/wav', size: 42, objectUrl: 'blob:secret', file: new Blob(['a']) }
 const raw = JSON.stringify(read([p])); assert.ok(!raw.includes('secret')); assert.ok(!raw.includes('objectUrl'))
 assert.deepEqual(read([p])[0].tracks[0].file, { filename: 'a.wav', type: 'audio/wav', size: 42 })
})
for (const changes of [{ source: 'suno' }, { file: { filename: 'a.wav', type: 'text/plain', size: 1 } }, { file: { filename: 'a.wav', type: 42, size: 1 } }, { file: { filename: 'a.wav', type: 'audio/wav', size: -1 } }]) {
 test(`invalid track data fails locally: ${JSON.stringify(changes)}`, () => {
  assert.throws(() => editProjectTrack(withTrack(), 'a', changes, now))
  const p = withTrack(); p.tracks.unshift({ ...p.tracks[0], ...changes, id: 'bad' }); assert.equal(read([p])[0].tracks.length, 1)
 })
}
test('removal retains all current ingredients and the neighbouring track', () => {
 const p = withTrack(); const two = addProjectTrack(p, createProjectTrack(p, 'B', 'b', now)); const removed = removeProjectTrack(two, 'a', now)
 assert.ok(sameIdentity(removed, two)); assert.deepEqual(removed.tracks, [two.tracks[1]]); assert.equal(two.tracks.length, 2)
})
test('track brief uses historical identity and stays unchanged after project edits', () => {
 const p = withTrack(); const brief = createTrackBrief(p.tracks[0].creationSnapshot)
 assert.deepEqual(brief, createCreationBrief({ ...p, notes: '' }))
 const changed = attachIngredient(p, 'mood', { label: 'Aggressive', sourceId: null, selections: [{ moodId: 'aggressive', weight: 100 }] }, now)
 assert.deepEqual(createTrackBrief(changed.tracks[0].creationSnapshot), brief); assert.notEqual(createCreationBrief(changed).prompt, brief.prompt)
})
test('metadata edits and audio replacement cannot rewrite creation identity or timestamps', () => {
 const p = withTrack(); const t = p.tracks[0]
 const edited = editProjectTrack(p, 'a', { notes: 'new', file: { filename: 'other.wav', type: '', size: 12 } }, '2026-10-05T13:00:00Z').tracks[0]
 assert.deepEqual(edited.creationSnapshot, t.creationSnapshot); assert.equal(edited.createdAt, t.createdAt); assert.notEqual(edited.updatedAt, t.updatedAt)
})
test('duplicate add fails without altering existing project', () => { const p = withTrack(); assert.throws(() => addProjectTrack(p, p.tracks[0])); assert.equal(p.tracks.length, 1) })
test('session audio owner is separate from serialised project model', () => {
 const owner = new SessionAudio(() => 'blob:session', () => {}); const p = withTrack(); owner.attach('a', new Blob(['audio']))
 assert.equal(owner.get('a'), 'blob:session'); assert.ok(!JSON.stringify(read([p])).includes('blob:')); assert.equal(new SessionAudio().get('a'), undefined)
})
test('URL replacement removal and repeated cleanup revoke each URL exactly once', () => {
 let next = 0; const revoked = []; const owner = new SessionAudio(() => `blob:${++next}`, url => revoked.push(url))
 owner.attach('a', new Blob()); owner.attach('a', new Blob()); owner.attach('b', new Blob()); owner.delete('a'); owner.delete('a'); owner.clear(); owner.clear()
 assert.deepEqual(revoked, ['blob:1', 'blob:2', 'blob:3'])
})
test('object URL failure leaves existing attachment usable', () => {
 let fail = false; const revoked = []; const owner = new SessionAudio(() => { if (fail) throw new Error('URL failed'); return 'blob:ok' }, url => revoked.push(url))
 owner.attach('a', new Blob()); fail = true; assert.throws(() => owner.attach('a', new Blob()), /URL failed/); assert.equal(owner.get('a'), 'blob:ok'); assert.deepEqual(revoked, [])
})
test('denied storage write reaches caller while source project remains usable in memory', () => {
 const p = withTrack(); assert.throws(() => writeProjects({ setItem() { throw new Error('denied') } }, [p], p.id), /denied/)
 assert.equal(p.tracks.length, 1); assert.ok(createTrackBrief(p.tracks[0].creationSnapshot).prompt.length > 100)
})
