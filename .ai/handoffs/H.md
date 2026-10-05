# Phase H — Power Layer handoff

Final status: integrated and accepted locally after coordinator browser verification and independent source audit. Browser acceptance was pending at worker handoff; the closeout below supersedes that status. Baseline: `41cd61c987019a45c13caa398ff2a237de2e2c23` / 216 tests.

## Delivered

- `PowerActions` provides explicit current-project snapshot capture with title/version controls and cancel. It creates a normal `ProjectTrack` through existing immutable constructors, with no audio.
- Track cards offer explicit duplicate title/version and optional saved-notes copying (off by default). Duplicate records get new IDs/timestamps, deep copied creation identity, copied source category/detail, no file metadata/audio, no timeline clips and no comparison links. Existing source records remain unchanged.
- Tracks offer Compare-this-track handoff. `CompareSeed` contains request/project/track IDs only; Compare loads A, clears B, requires a distinct B and existing Create comparison. Cancel clears the draft without persisting a comparison.
- Genre/Vocal/Mood reopen exact `creationSnapshot` values as labeled historical drafts. Missing captured ingredients have disabled actions and explanations. Source IDs appear only as provenance hints; saved libraries are never queried for historical values.
- Historical loads clear selected saved sources so saved Update cannot accidentally overwrite them. The Mood library detaches its selected preset on each load. Vocal clears opened-persona DNA, loads captured selections and identity description, and derives output through existing engines. Explicit save-as establishes the new saved source normally.
- Each editor retains draft ownership. Editing historical controls marks the draft edited and detaches the old source ID when explicitly using changed values. Use/Replace remains the only project-identity write.

## Coordinator integration APIs

- `PowerActions({project, update, onSelectTrack, snapshotRequest?: string|null})`.
- `ProjectTracks` optional `onCompareTrack(id)` and `onReopenSettings(id, kind)`.
- `onSelectTrack(id, nextProject?)` receives the new project on snapshot/duplicate creation. Use `nextProject ?? currentProject` when validating the new selection so React render timing cannot drop it.
- `ProjectCompare` optional `compareSeed: CompareSeed|null` and `onClearCompareSeed()`.
- All three editors accept optional `historicalDraft: HistoricalDraftRequest<'genre'|'vocal'|'mood'>|null` with their own specific kind. Populate via `historicalDraft(project, trackId, kind)`; it clones captured values and never mutates the project.
- Clear request state on project switches and verify project IDs before supplying requests. Shell owns navigation and shortcut dispatch.

## Exact shortcuts

- `Alt+Shift+S`: open the existing visible Snapshot current experiment form.
- `Alt+Shift+C`: invoke the existing visible Compare selected track action when a project track is selected.
- `shortcutAction(event)` rejects editable controls/contenteditable ancestors/role=textbox, Ctrl/Meta, unmodified letters, composing/repeated/prevented events and AltGraph. It does not handle undo/redo or browser editing shortcuts.

## Files owned by H

`src/lib/experimentActions.ts`, `src/PowerActions.tsx`, `src/HistoricalDraftNotice.tsx`, `src/powerActions.css`, `src/ProjectTracks.tsx`, `src/ProjectCompare.tsx`, narrow historical-request additions to `src/GenreMixer.tsx`, `src/VocalPersonaBuilder.tsx`, `src/MoodMapper.tsx`, `src/MoodPresetLibrary.tsx`, and `tests/experimentActions.test.mjs`.

Shared `StudioShell.tsx`, `StudioShellParts.tsx`, project/changelog/decision/roadmap updates belong to coordinator. H made no changes to `studioProject`, project persistence schema/key, shared CSS, G export, playback owner or Timeline owner.

## Verification

- 19 focused experiment tests pass, covering copied current identity, later changes, metadata validation, duplicate identity/timestamps/deep-copy/audio/notes/source/dependency isolation, session-only project-scoped Compare seeds, every historical ingredient and absent ingredient, immutable historical loads and shortcut eligibility.
- Full combined working-tree suite: 251 passed, zero failures (includes G's 16 tests alongside H's 19; baseline 216).
- TypeScript/Vite production build passed during integrated work; coordinator must run final build after its last browser-driven correction.
- `git diff --check` passes. Git emits configured LF/CRLF normalization warnings for coordinator files; no whitespace errors.
- Browser acceptance is coordinator-owned. Worker does not claim the browser gate or full Phase H acceptance before that evidence is recorded.

## Review corrections

- Snapshot/duplicate selection carries the newly updated project to avoid validating new IDs against stale rendered project state.
- Historical Genre save-as clears historical provenance so the newly saved recipe becomes the source of an explicit Use.
- Historical Mood save-as uses the existing callback to establish the new preset as current source, without updating the original preset.

## Deferred / hotspots

No command palette, AI judgments, implicit project replacement/history, second persistence store, export shortcut, Phase I or audio cloning. No G/H worker file conflict; shared shell integration and final documentation are coordinator merge hotspots. Historical output prose derives from current engines/catalogues as already documented, while captured selections remain authoritative.

## Coordinator closeout — 2026-10-05

Subsequent authorization: user approved the reviewed G/H checkpoint commit/push on 2026-10-05. The statements below preserve pre-authorization verification history. No deployment or Phase I.

Checkpoint re-review passed: fresh independent audit clean; 251 tests passed with one worker and sequential production build passed. See docs/GH_VERIFICATION.md for the memory-constrained rerun and retained browser evidence. Ready for commit/push authorization; no commit/push performed.

G/H integrated locally on canonical 41cd61c, package 2.0.0. Full gate: 251 tests, production build and diff check passed. Both browser checklists passed using the in-app browser and Chrome; detailed evidence/environment limits and fixture restoration are in docs/GH_VERIFICATION.md. Actual downloaded text/JSON were inspected on disk. Independent source audit is clean after correcting new-track selection timing, snapshot title focus and historical Save-as-new source precedence. Final project/changelog/decisions/roadmap/schema records updated. No commit, push, deployment or Phase I.
