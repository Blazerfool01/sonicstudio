# SonicStudio UI/UX Overhaul — Phase E: Lightweight Timeline

You are implementing **Phase E — Timeline** of the post-v2 SonicStudio UI/UX overhaul.

You are working in parallel with a separate **Phase F — Context Rail** agent.

Do not implement Phase F.

## Canonical Baseline

Repository:

`Blazerfool01/sonicstudio`

Baseline:

`3b69b6de5fcedd399a037adde058767196481f8e`

Current state:

- SonicStudio 2.0.0 remains the product baseline.
- UI/UX Overhaul Phases A–D are integrated on canonical `main`.
- Current verified gate: 197 tests passing.
- Production build and `git diff --check` pass.
- `sonic-studio.projects.v1` remains the project persistence key.
- Genre, Vocal, Mood and Visualiser retain their established ownership.
- Phase A established explicit session-only project-track selection.
- Phase B established the persistent Studio shell.
- Phase C established current/historical creative provenance.
- Phase D established declarative Genre + Mood Visual Personality.

Before coding:

1. Read `AGENTS.md`.
2. Read `PROJECT.md`.
3. Read the relevant `CHANGELOG.md`.
4. Read `docs/DECISIONS.md`.
5. Read `docs/ROADMAP.md`.
6. Inspect current `StudioShell`, Visualiser/audio bridge, project-track model and Phase A interaction helpers.

---

# Goal

Add the approved **lightweight Studio timeline**.

This is NOT a DAW.

The timeline should provide useful arrangement and playback context while preserving SonicStudio's existing single-player architecture.

Target capabilities:

- timeline ruler
- playhead
- track rows
- clip blocks
- clip selection
- basic positioning
- safe source trimming where supported
- mute
- solo
- playback-follow behaviour

The finished timeline should feel like part of the approved SonicStudio workspace without introducing multi-track mixing infrastructure.

---

# Fundamental Audio Constraint

The following invariants are non-negotiable:

- one HTML audio element
- one AudioContext
- one MediaElement source
- one analyser graph
- one active Visualiser RAF owner

The timeline MUST reuse the existing Visualiser/session-audio playback system.

Do not create:

- one audio element per clip
- one source per timeline row
- Web Audio mixing graphs
- synchronized parallel playback
- a second playback engine

If a proposed feature requires simultaneous audio streams, it is out of scope.

---

# Timeline Semantics

Design the lightest useful arrangement model compatible with one playback owner.

A recommended model is:

- clips reference existing `ProjectTrack` records
- a clip does not copy or mutate historical track provenance
- a clip may store arrangement metadata such as:
  - timeline position
  - source in-point
  - source out-point/duration
  - row
  - mute state
- selection remains session interaction state
- project-track creation snapshots remain immutable

Do not store File, Blob, object URL, analyser data or rendered waveform data in timeline records.

## Overlap

Do not silently imply multi-track mixing.

If clips would overlap in a way that requires simultaneous playback, either:

- prevent the overlap,
- clearly treat the arrangement as single-audible-source sequencing,
- or provide another deterministic behaviour that preserves the one-player rule.

Do NOT solve overlap by adding additional audio elements or Web Audio sources.

Document the chosen rule.

---

# Playback Coordination

Timeline playback must be a coordinator over the existing playback owner.

The timeline may decide:

- which clip should currently be audible
- which project track/source should be selected
- which source position should be sought
- when playback should stop or advance to the next eligible clip

The existing Visualiser/audio system remains responsible for actual media playback and analysis.

Where the existing imperative bridge needs a narrow capability such as seeking, extend that interface carefully rather than bypassing it.

Do not duplicate PlaybackIntent.

Do not bypass existing cancellation/lifecycle rules.

---

# Playhead

Provide a deterministic playhead model.

It should:

- represent arrangement time
- move while timeline playback is active
- stop when playback stops
- support user seeking
- remain synchronized with the active clip/source
- handle clip transitions
- respect pause/resume

Do not run an unrelated permanent animation loop if the existing playback lifecycle can drive it.

Avoid high-frequency React state updates where refs/requestAnimationFrame are more appropriate.

Reduced-motion behaviour must remain respected.

---

# Clip Selection

Use the established Phase A interaction contract.

Timeline clip selection must not redefine:

- active project
- generic project-track selection
- Compare A/B side selection
- local session-audio selection
- historical Visualiser context

Where useful, selecting a timeline clip may explicitly update the established generic selected-project-track ID through the existing interaction boundary.

Do not introduce a second competing selected-track concept.

---

# Positioning / Trimming

Allow basic editing only where behaviour remains deterministic.

Positioning should modify arrangement metadata, not the source track.

Trimming must represent non-destructive source bounds.

Never mutate:

- ProjectTrack creation snapshot
- actual audio bytes
- historical Genre/Vocal/Mood identity

Clamp invalid values.

Reject impossible durations cleanly.

If reliable trimming cannot be supported with the current bridge without destabilizing playback, implement safe boundaries/model support first and explicitly defer the unsupported part rather than faking it.

---

# Mute / Solo

Mute and solo belong to the timeline arrangement, not Visualiser.

They must produce deterministic eligible-playback behaviour.

Rules must be explicit and testable.

Example acceptable semantics:

- solo active → only soloed rows/clips are eligible
- otherwise muted clips/rows are skipped
- no eligible clip → playback stops cleanly

Do not implement gain mixing merely to support mute/solo.

---

# Persistence

Inspect the existing project model before deciding.

If arrangement state needs persistence:

- extend the existing project envelope additively
- keep `sonic-studio.projects.v1`
- preserve backward compatibility
- old projects must reopen with a valid empty/default timeline
- malformed timeline records must not destroy valid project data
- unknown fields should be stripped as existing parsers do

Do NOT create a second timeline localStorage database unless there is a compelling architectural reason recorded in `docs/DECISIONS.md`.

Session-only state such as selection, drag state and active playback should remain session-only.

---

# Undo Boundary

Phase A explicitly avoided global undo.

Do not introduce application-wide history.

If timeline edit actions are made undoable, scope undo strictly to concrete timeline arrangement mutations.

Do not include:

- Genre edits
- Vocal edits
- Mood edits
- project persistence generally
- TrackComparison edits

A small local timeline operation history is acceptable only if clearly justified, bounded and tested.

It is also acceptable for Phase E to leave timeline undo deferred if implementing it would over-expand scope.

Native text-field undo must remain untouched.

---

# UI

Add the timeline to the existing Studio workspace established in Phase B.

Target visual elements:

- time ruler
- playhead
- rows
- clips
- selected clip state
- mute / solo controls
- compact playback controls if required
- empty state

Follow the approved neon/dark Studio language.

Do not perform final Phase I visual polish.

Do not redesign Genre/Vocal/Mood internals.

Do not redesign the Visualiser.

---

# Parallel Phase F Boundary

Another agent owns Context Rail.

Phase F may need to read:

- selected track
- selected clip if an explicit shared projection is useful
- current project
- timeline status

Expose the narrowest stable read contract necessary.

Do not make Context Rail a dependency of timeline behaviour.

Do not put project guidance, presets or notes inside timeline components.

Try to keep Phase E work concentrated in new timeline/model files plus narrow shell integration.

---

# Explicitly Out of Scope

Do NOT implement:

- multi-track simultaneous playback
- mixer channels
- gain faders
- buses
- sends
- sidechain
- automation lanes
- piano roll
- MIDI
- VST/plugin hosting
- waveform sample editor
- destructive audio editing
- pitch/time stretching
- beat detection
- BPM warping
- waveform cache infrastructure
- cloud storage
- provider generation
- mastering
- transcoding
- Phase F Context Rail
- Phase G Export
- Phase H Power Layer
- Phase I final polish

---

# Automated Verification

Add focused tests for the pure timeline model.

At minimum cover:

- valid clip creation
- project-track reference validation
- deterministic ordering
- positioning
- trim/in-out clamping
- invalid duration rejection
- mute behaviour
- solo behaviour
- no-eligible-clip behaviour
- project deletion/track deletion interaction
- backwards-compatible project parsing if persisted
- malformed timeline isolation
- selection invalidation
- deterministic clip transition lookup

Existing tests must remain green.

Required:

`npm test`

`npm run build`

`git diff --check`

The existing 197-test baseline must not regress.

---

# Browser Verification

Verify with real attached audio where practical:

1. empty timeline
2. populate from project tracks
3. select clips
4. move clips
5. trim where implemented
6. seek playhead
7. play/pause/resume
8. transition between sequential clips
9. mute
10. solo
11. no-eligible-clip behaviour
12. change projects
13. delete a referenced track
14. navigate away/back
15. Visualiser still responds through the same analysis graph
16. Compare still works
17. historical Mood/Genre personality remains correct
18. no second audio element/context/source appears
19. 1280 / 390 / 320 px smoke checks
20. no new console warnings/errors

Use generated/simple WAV fixtures if needed, keeping fixtures outside deliverables unless existing repository conventions say otherwise.

---

# Acceptance Gate

Phase E is complete only when:

- [ ] Timeline ruler exists.
- [ ] Playhead is deterministic and synchronized.
- [ ] Project tracks can appear as timeline clips.
- [ ] Clip selection is explicit.
- [ ] Positioning works without mutating source tracks.
- [ ] Safe trimming works or unsupported trim scope is explicitly and truthfully deferred.
- [ ] Mute behaviour is deterministic.
- [ ] Solo behaviour is deterministic.
- [ ] Playback uses the existing single playback owner.
- [ ] Sequential clip transitions work where applicable.
- [ ] No simultaneous-player architecture was introduced.
- [ ] Project-track provenance remains immutable.
- [ ] Current-vs-historical visual personality remains correct.
- [ ] Persistence remains backward compatible if timeline data is persisted.
- [ ] Existing project/storage schemas are not replaced.
- [ ] Full tests pass.
- [ ] Production build passes.
- [ ] `git diff --check` passes.
- [ ] Browser verification passes.
- [ ] No new console errors/warnings.
- [ ] Phase F was not implemented.

---

# Documentation

Follow `AGENTS.md`.

Update:

- `PROJECT.md`
- `CHANGELOG.md`
- `docs/DECISIONS.md` if timeline ownership/playback/persistence decisions are introduced
- `docs/ROADMAP.md` only if planned direction changes

Record the exact single-player timeline semantics so future work cannot accidentally reinterpret this as multi-track DAW playback.

---

# Completion Report

Report:

1. timeline model introduced
2. persistence decision
3. playback coordination design
4. overlap rule
5. positioning/trimming behaviour
6. mute/solo semantics
7. files changed
8. tests passing
9. build/diff-check result
10. browser verification
11. audio lifecycle proof
12. documentation updated
13. deferred timeline capabilities
14. likely integration hotspots with Phase F
15. whether Phase E's gate is fully satisfied

Do not merge automatically.

Do not begin Phase G.