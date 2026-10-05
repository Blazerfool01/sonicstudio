# SonicStudio UI/UX Overhaul — Phase H: Power Layer

You are implementing **Phase H — Power Layer** in parallel with a separate **Phase G — Export** worker.

Canonical baseline:

`41cd61c987019a45c13caa398ff2a237de2e2c23`

Baseline gate:

- 216 tests passing
- build passes
- diff check passes
- Phases A–F implemented and accepted

Read `AGENTS.md`, `PROJECT.md`, `CHANGELOG.md`, `docs/DECISIONS.md`, and `docs/ROADMAP.md` before coding.

## Goal

Make repeated SonicStudio experiments faster **using state and provenance SonicStudio already understands**.

Phase H should improve:

- snapshot/duplicate experiment workflows
- Tracks → Compare handoff
- preservation of experiment settings
- reopening settings that produced historical tracks
- a small number of high-value shortcuts

It must not make creative choices for the user.

It must not introduce a new “experiment database”.

## Principle

Power features are shortcuts over existing authoritative actions.

They do not create new owners.

Reuse:

- StudioProject for current identity
- ProjectTrack for historical experiment provenance
- TrackComparison for comparisons
- Phase A selection
- existing Genre/Vocal/Mood editors
- existing navigation
- existing playback owner

## Snapshot current experiment

Provide a faster explicit way to capture the **current project identity as a new ProjectTrack**.

Reuse the same immutable creation-snapshot semantics already used by normal track creation.

The user must still be able to control identifying metadata such as title/version.

Do not silently create snapshots merely because the user edits Genre/Vocal/Mood.

No automatic background history.

## Duplicate historical experiment

Support explicitly duplicating an existing ProjectTrack into a new experimental track record.

The duplicate must:

- receive a new ID
- receive new timestamps
- copy the source track's immutable `creationSnapshot`
- remain independent afterward
- not copy session audio attachment automatically
- not copy comparison membership
- not copy Timeline clips
- not mutate the source track

The copied creation snapshot itself is sufficient to trace settings.

Do not add a second Experiment entity solely to represent duplication lineage unless the existing architecture proves that is necessary.

If notes/metadata copying is supported, make the behaviour explicit.

## Quick Tracks → Compare

Provide a fast explicit handoff such as:

`Compare this track…`

The handoff should:

- use the existing project-scoped track
- navigate to Compare
- seed one side of the comparison UI/session draft
- require the user to choose the other distinct track
- NOT create/save a TrackComparison until the existing explicit save/create action occurs

Do not mutate either source track.

Do not automatically decide a winner.

Do not infer which second track is “best”.

## Reopen settings that produced a track

This is the most important ownership rule in Phase H.

Historical settings MUST come from:

`ProjectTrack.creationSnapshot`

They must NOT be reconstructed by reopening today's mutable saved preset/persona solely from `sourceId`.

A saved preset may have changed since the track was created.

Therefore quick-reopen should load the **historical captured values**.

Recommended behaviour:

`Reopen Genre settings`
`Reopen Vocal settings`
`Reopen Mood settings`

should:

1. navigate to the appropriate existing editor
2. load the captured historical settings as an explicit **historical draft**
3. label that state clearly
4. NOT change StudioProject automatically
5. NOT overwrite the original saved preset/persona
6. require the existing explicit Use/Replace action before current project identity changes

If an ingredient was not captured, the action should be unavailable with a truthful explanation.

If exact historical hydration cannot safely fit an editor in this phase, implement the pure handoff contract and defer that editor rather than silently substituting current saved-source data.

## Saved-source provenance

Preserve recorded source labels/IDs for explanation.

But source IDs are provenance hints, not permission to fetch mutable present-day values and call them historical settings.

Historical snapshot values win.

## Editor integration

Prefer narrow, explicit one-shot load requests or props rather than moving editor state into StudioShell.

For example, an editor may accept a historical draft request containing:

- request ID
- captured selections
- source label
- source ID for display only

The editor remains owner of its draft.

Do not create one mega global creative state.

## Shortcuts

Add only a **small number** of high-value shortcuts for actions that already have visible UI equivalents.

Requirements:

- no unmodified single-letter shortcuts
- ignore `input`, `textarea`, `select`, and `contenteditable`
- preserve native undo/redo and browser editing shortcuts
- document exact mapping
- show discoverable UI hints/tooltips where appropriate
- shortcuts dispatch existing actions; they do not create parallel logic

If a proposed shortcut conflicts with common browser/OS behaviour, choose another or defer it.

Do not build a command palette.

## Parallel Phase G boundary

Phase G owns Export.

Do not implement:

- export validation
- JSON export
- file download
- prompt export
- render preparation

H may add a shortcut to the existing Export UI only after Phase G integration if the coordinator decides it is useful.

Do not depend on Phase G for core H acceptance.

## Suggested isolated files

Prefer disjoint implementation such as:

- `src/lib/experimentActions.ts`
- `src/PowerActions.tsx`
- `tests/experimentActions.test.mjs`

and narrow changes to specific Genre/Vocal/Mood editor APIs if needed for historical-draft hydration.

Shared shell integration belongs to the coordinator.

Workers should avoid editing:

- `StudioShell.tsx`
- `StudioShellParts.tsx`
- shared `studio.css`

Report the required integration callbacks instead.

## Locked invariants

Do not change:

- `sonic-studio.projects.v1` unless a genuinely additive existing-model change is required
- ProjectTrack immutable creation provenance
- TrackComparison ownership
- Phase A project-scoped selection
- Timeline arrangement ownership
- Context Rail projection ownership
- Visualiser playback ownership

No:

- AI scoring
- automatic winner selection
- recommended “best” settings
- automatic project replacement
- implicit preset updates
- hidden snapshot creation
- second experiment/persistence store

## Automated verification

Add focused tests covering at least:

- snapshot current project → new track with copied identity
- later project edits do not mutate snapshot
- duplicate track gets new identity/timestamps while preserving creationSnapshot values
- duplicate does not copy audio/session state
- duplicate does not alter source track
- duplicate creates no comparison/timeline membership
- Compare seed references a valid distinct project track
- Compare seed remains session-only
- historical reopen uses `creationSnapshot`
- historical reopen does not resolve mutable source preset values
- missing historical ingredient disables/fails truthfully
- historical draft load does not mutate StudioProject
- shortcut eligibility ignores editable targets
- source data remains unchanged

Run:

`npm test`

`npm run build`

`git diff --check`

Baseline: 216 tests.

## Browser verification

Verify:

1. snapshot current project
2. mutate current Genre/Vocal/Mood afterward
3. snapshot stays historical
4. duplicate an older track
5. source track remains unchanged
6. duplicate has no audio until explicitly attached
7. duplicate has no comparison/timeline links
8. Compare-this-track handoff
9. choose second track
10. cancellation does not persist a comparison
11. save comparison through existing flow
12. reopen historical Genre settings
13. reopen historical Vocal settings
14. reopen historical Mood settings
15. current StudioProject remains unchanged until explicit Use/Replace
16. old source preset may change without changing historical reopen values
17. keyboard shortcuts
18. typing fields do not trigger shortcuts
19. Create/Tracks/Compare/Visualise still work
20. Timeline remains intact inside Tracks
21. 1280 / 390 / 320
22. no console warnings/errors

## Acceptance gate

Phase H passes when:

- current identity can be explicitly snapshotted quickly
- historical experiment duplication is safe
- all copied experiments retain exact source settings
- duplication never mutates its source
- Tracks → Compare handoff is fast but explicit
- Compare remains user-authored
- historical settings reopen from creation snapshots
- reopening never silently updates current project
- saved-source changes cannot rewrite historical reopen values
- useful shortcuts have visible equivalents
- shortcuts ignore editable contexts
- no new experiment/state owner exists
- tests/build/diff/browser gates pass
- Phase G was not implemented

## Documentation

Follow `AGENTS.md`.

Document any new historical-draft/editor boundary clearly.

The coordinator owns final shared project/changelog/decision updates and reconciliation with Phase G.

## Completion report

Report:

1. snapshot action
2. duplicate semantics
3. Tracks → Compare handoff
4. historical reopen behaviour
5. editor APIs added
6. shortcut mapping
7. files changed
8. tests
9. build/diff result
10. browser verification
11. ownership/provenance proof
12. coordinator integration requests
13. deferred capabilities
14. likely G/H merge hotspots
15. whether Phase H passes

Do not begin Phase I.