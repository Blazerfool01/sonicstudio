import test from 'node:test'
import assert from 'node:assert/strict'
import {
  createProject, createProjectTrack, addProjectTrack, removeProjectTrack, parseProjects, writeProjects,
} from '../src/lib/studioProject.ts'
import {
  addTimelineClip, activeTimelineClipAt, eligibleTimelineClips, moveTimelineClip,
  nextEligibleTimelineClip, orderedTimelineClips, parseTimeline, reconcileTimelineSelection,
  removeTimelineClip, setTimelineClipFlag, timelineClipEnd, trimTimelineClip,
} from '../src/lib/studioTimeline.ts'

const now = '2026-10-05T12:00:00.000Z'
function fixture() {
  let project = createProject('Timeline project', 'project', now)
  project = addProjectTrack(project, createProjectTrack(project, 'A', 'a', now))
  project = addProjectTrack(project, createProjectTrack(project, 'B', 'b', now))
  project = addProjectTrack(project, createProjectTrack(project, 'C', 'c', now))
  return project
}
const trackIds = ['a', 'b', 'c']
const clip = (id, trackId, start, sourceOut = null, flags = {}) => ({ schemaVersion: 1, id, trackId, start, sourceIn: 0, sourceOut, muted: false, solo: false, ...flags })

test('timeline clips require a real project track and strip unknown fields', () => {
  const project = fixture()
  const updated = addTimelineClip(project, 'a', { start: 12, sourceIn: 3 }, 'clip-a', now)
  assert.deepEqual(updated.timeline, [{ ...clip('clip-a', 'a', 12), sourceIn: 3 }])
  assert.equal(updated.updatedAt, now)
  assert.throws(() => addTimelineClip(project, 'missing', {}, 'bad', now), /existing project track/)
  assert.throws(() => addTimelineClip(updated, 'a', {}, 'clip-a', now), /already exists/)
  assert.deepEqual(parseTimeline([{ ...clip('ok', 'a', 0), extra: 'stripped' }], trackIds), [clip('ok', 'a', 0)])
})

test('timeline ordering and equal-position playback resolution are deterministic', () => {
  const clips = [clip('late', 'c', 8), clip('row-b', 'b', 0), clip('early', 'a', 0)]
  assert.deepEqual(orderedTimelineClips(clips, trackIds).map(item => item.id), ['early', 'row-b', 'late'])
  assert.equal(activeTimelineClipAt(clips, trackIds, 0)?.id, 'early')
  assert.equal(activeTimelineClipAt(clips, trackIds, 7)?.id, 'early')
  assert.equal(activeTimelineClipAt(clips, trackIds, 8)?.id, 'late')
  assert.equal(nextEligibleTimelineClip(clips, trackIds, 0)?.id, 'late')
  assert.equal(activeTimelineClipAt([clip('a', 'a', 0), clip('A', 'a', 0)], trackIds, 0)?.id, 'A')
})

test('position changes arrangement metadata and rejects invalid positions', () => {
  const clips = [clip('a', 'a', 0, 30)]
  assert.equal(moveTimelineClip(clips, 'a', 15, trackIds)[0].start, 15)
  assert.throws(() => moveTimelineClip(clips, 'a', -1, trackIds), /position/)
  assert.throws(() => moveTimelineClip(clips, 'missing', 1, trackIds), /no longer exists/)
  assert.equal(clips[0].start, 0)
})

test('source bounds clamp to known duration and impossible trims are rejected', () => {
  const clips = [clip('a', 'a', 0)]
  const trimmed = trimTimelineClip(clips, 'a', 8, 140, 100, trackIds)[0]
  assert.equal(trimmed.sourceIn, 8)
  assert.equal(trimmed.sourceOut, 100)
  assert.equal(trimTimelineClip(clips, 'a', 2, null, 100, trackIds)[0].sourceOut, null)
  assert.throws(() => trimTimelineClip(clips, 'a', 8, 8, 100, trackIds), /later than/)
  assert.throws(() => trimTimelineClip(clips, 'a', 100, null, 100, trackIds), /no playable/)
  assert.throws(() => trimTimelineClip(clips, 'a', 0, 10, 0, trackIds), /unavailable/)
})

test('mute skips a clip; solo limits playback to unmuted solo clips', () => {
  const clips = [clip('a', 'a', 0), clip('b', 'b', 10), clip('c', 'c', 20)]
  const muted = setTimelineClipFlag(clips, 'b', 'muted', true, trackIds)
  assert.deepEqual(eligibleTimelineClips(muted, trackIds).map(item => item.id), ['a', 'c'])
  const solo = setTimelineClipFlag(setTimelineClipFlag(clips, 'b', 'solo', true, trackIds), 'c', 'solo', true, trackIds)
  assert.deepEqual(eligibleTimelineClips(solo, trackIds).map(item => item.id), ['b', 'c'])
  const mutedSolo = setTimelineClipFlag(solo, 'b', 'muted', true, trackIds)
  assert.deepEqual(eligibleTimelineClips(mutedSolo, trackIds).map(item => item.id), ['c'])
})

test('all-muted and all-muted-solo arrangements have no eligible playback', () => {
  assert.deepEqual(eligibleTimelineClips([clip('a', 'a', 0, null, { muted: true })], trackIds), [])
  assert.equal(activeTimelineClipAt([clip('a', 'a', 0, null, { solo: true, muted: true })], trackIds, 0), null)
  assert.equal(nextEligibleTimelineClip([clip('a', 'a', 0, null, { muted: true })], trackIds, 0), null)
})

test('explicit trim end and loaded source duration bound active playback without fallback', () => {
  const clips = [clip('a', 'a', 0, 5), clip('b', 'b', 10)]
  assert.equal(activeTimelineClipAt(clips, trackIds, 4)?.id, 'a')
  assert.equal(activeTimelineClipAt(clips, trackIds, 5), null)
  assert.equal(activeTimelineClipAt(clips, trackIds, 7), null)
  assert.equal(activeTimelineClipAt(clips, trackIds, 10)?.id, 'b')
  assert.equal(activeTimelineClipAt([clip('a', 'a', 0)], trackIds, 4, { a: 4 }), null)
  const longerTrim = clip('long-trim', 'a', 0, 90)
  assert.equal(activeTimelineClipAt([longerTrim], trackIds, 60, { a: 45 }), null)
  assert.equal(timelineClipEnd(longerTrim, 45), 45)
})

test('selection invalidates after clip removal; track deletion confirms before removing dependent clips', () => {
  const project = addTimelineClip(fixture(), 'a', {}, 'clip-a', now)
  assert.equal(reconcileTimelineSelection(project.timeline, 'clip-a'), 'clip-a')
  const withoutClip = removeTimelineClip(project, 'clip-a', now)
  assert.equal(reconcileTimelineSelection(withoutClip.timeline, 'clip-a'), null)
  assert.throws(() => removeProjectTrack(project, 'a', now), /Confirm deletion of dependent comparisons and timeline clips/)
  const withoutTrack = removeProjectTrack(project, 'a', now, true)
  assert.deepEqual(withoutTrack.timeline, [])
  assert.equal(parseProjects(JSON.stringify({ schemaVersion: 1, activeId: 'project', projects: [withoutTrack] })).projects[0].timeline.length, 0)
})

test('old projects default to an empty timeline and malformed timeline clips are isolated', () => {
  const project = fixture()
  const legacy = { ...project }
  delete legacy.timeline
  assert.deepEqual(parseProjects(JSON.stringify({ schemaVersion: 1, activeId: 'project', projects: [legacy] })).projects[0].timeline, [])
  const damaged = { ...project, timeline: [clip('valid', 'a', 4), clip('dangling', 'deleted', 5), { id: 'malformed' }] }
  const parsed = parseProjects(JSON.stringify({ schemaVersion: 1, activeId: 'project', projects: [damaged] }))
  assert.equal(parsed.projects[0].name, 'Timeline project')
  assert.deepEqual(parsed.projects[0].timeline, [clip('valid', 'a', 4)])
  let stored
  writeProjects({ setItem: (_key, value) => { stored = JSON.parse(value) } }, parsed.projects, 'project')
  assert.deepEqual(stored.projects[0].timeline, [clip('valid', 'a', 4)])
})
