# SonicStudio UI/UX Overhaul — Phase G: Export

You are implementing **Phase G — Export** in parallel with a separate **Phase H — Power Layer** worker.

Canonical baseline:

`41cd61c987019a45c13caa398ff2a237de2e2c23`

Baseline gate:

- 216 tests passing
- `npm run build` passes
- `git diff --check` passes
- Phases A–F implemented
- Product navigation remains Create → Tracks → Compare → Visualise
- Creative workflow remains Genre Mixer → Vocal Persona → Mood Mapper → Visualiser → Export
- Timeline remains a separate arrangement region inside Tracks

Read `AGENTS.md`, `PROJECT.md`, `CHANGELOG.md`, `docs/DECISIONS.md`, and `docs/ROADMAP.md` before implementation.

## Goal

Give SonicStudio a truthful, deterministic way for a finished project to **leave the Studio without manual reconstruction**.

Phase G owns:

- pre-export validation
- structured Creation Brief export
- project metadata/provenance export
- copy/download controls
- appropriate format/settings UI
- clear distinction between external-generation exports and local project exports
- useful success/error feedback

It does NOT own experiment duplication/reopen/shortcut behaviour. That belongs to Phase H.

## Supported outputs

Implement only outputs SonicStudio actually supports.

Recommended minimum:

### Creation Brief / generation prompt

Export the deterministic current-project Creation Brief as plain text.

Support:

- Copy
- Download `.txt`

Clearly describe this as suitable for external generation workflows such as Suno/Udio/etc., but do not integrate with or require any provider.

### Project package

Export a structured JSON representation of the current SonicStudio project.

It may include:

- project identity
- Genre snapshot
- Vocal snapshot
- Mood snapshot
- project notes
- ProjectTrack metadata and immutable creation snapshots
- Timeline arrangement metadata
- saved comparisons and observations

It MUST NOT include:

- File objects
- Blob data
- object URLs
- session-local audio IDs
- analyser data
- playback state
- current playhead
- temporary UI selection
- hidden editor drafts

Do not claim the JSON package contains playable audio.

## Determinism

Given the same saved project state and same export options, export content should be stable.

Avoid volatile fields such as a fresh `generatedAt` timestamp inside the deterministic payload unless explicitly separated from the project data.

Preserve authoritative stored timestamps where they already exist.

Use stable serialization where useful.

Do not regenerate historical provenance from current project identity.

ProjectTrack creation snapshots remain authoritative.

## Validation

Create a pure/testable export-validation layer.

Validation should distinguish:

- blockers
- warnings
- informational notices

Examples:

- no active project → blocker
- no creative ingredients → warning/blocker depending output
- partial Genre/Vocal/Mood → warning for prompt export, not necessarily JSON
- no tracks → valid project metadata export but warn that no results exist
- session audio unavailable → must NOT block metadata/brief export
- missing audio bytes → clearly state audio is not included
- malformed/unsupported export option → visible error

Do not invent requirements merely to make the validation screen look busy.

## Export format boundary

Create a separate **export format/schema** rather than pretending the browser-storage envelope itself is a public interchange format.

The export schema should be:

- versioned
- pure
- deterministic
- documented
- derived from authoritative project state

Do not change `sonic-studio.projects.v1` merely to support exporting.

This phase exports data; it does NOT implement import/recovery unless required by an existing approved contract.

## UI

Create a dedicated Export surface suitable for the existing fifth creative workflow step.

Prefer isolated files such as:

- `src/ExportPanel.tsx`
- `src/lib/projectExport.ts`
- `src/export.css`
- `tests/projectExport.test.mjs`

Exact filenames are flexible.

The Export panel should show:

- what will be exported
- validation state
- format choice
- copy/download action
- audio-not-included notice where relevant
- success/error state

Do not redesign the whole shell.

## Parallel ownership

The coordinator owns shared integration files:

- `StudioShell.tsx`
- `StudioShellParts.tsx`
- shared `studio.css`

Do not edit those unless explicitly assigned.

Instead provide the narrow integration API needed to:

1. make the existing Export workflow step actionable
2. mount the Export panel in the existing workspace

Phase H must not become a dependency of Export.

Exports should work whether or not any Phase H convenience features exist.

## Rendering

Do NOT implement audio rendering merely because the blueprint mentions render preparation.

SonicStudio currently has no approved offline multi-clip rendering engine.

Do not create one in Phase G.

If the UI refers to rendering, it must truthfully describe unsupported/local preparation rather than pretending a rendered audio file can be produced.

No:

- offline mixdown engine
- multi-source renderer
- mastering/transcoding
- WAV/MP3 encoder
- provider upload
- cloud export

## Locked invariants

Preserve:

- `sonic-studio.projects.v1`
- immutable ProjectTrack creation snapshots
- separate current/historical identity
- single Visualiser playback owner
- one audio element/context/source/analyser
- session-only audio bytes
- provider-independent workflow

Export must be read-only with respect to project/domain state.

Clicking Export must never modify:

- current Genre/Vocal/Mood
- historical track identity
- comparisons
- timeline arrangement
- presets/personas
- selected track

## Automated verification

Add focused tests covering at least:

- empty/no-project validation
- partial project
- complete project
- stable Creation Brief output
- deterministic JSON output
- current identity
- historical track provenance preserved
- Timeline metadata included
- comparison observations included
- notes included correctly
- no session/audio/runtime fields leak into JSON
- no mutation of source project
- malformed export option fails cleanly
- filenames/sanitization if downloads use project names

Run:

`npm test`

`npm run build`

`git diff --check`

The existing 216 tests must remain green.

## Browser verification

Verify:

1. no-project Export state
2. partial project
3. full Genre/Vocal/Mood project
4. project with tracks
5. project with Timeline
6. project with comparison
7. copy Creation Brief
8. download text
9. download JSON
10. inspect downloaded JSON for forbidden runtime/audio data
11. reload and export again
12. deterministic content remains equivalent
13. denied clipboard/download handling is recoverable
14. Export does not affect playback/project state
15. responsive 1280 / 390 / 320
16. no new console warnings/errors

## Acceptance gate

Phase G passes when:

- pre-export validation is truthful
- structured Creation Brief exports
- project JSON exports
- outputs are deterministic from saved state
- historical provenance is preserved
- no audio/session/runtime data leaks
- missing audio is explained rather than hidden
- provider workflows remain optional/external
- no unsupported audio-render claim exists
- existing project state is never mutated
- tests/build/diff-check/browser gate pass
- Phase H was not implemented

## Documentation

Follow `AGENTS.md`.

Update the Phase G handoff.

The coordinator will own final shared project/changelog/decision integration.

Also correct any stale E/F “local/uncommitted” status wording encountered during the final integration record.

## Completion report

Report:

1. export formats
2. validation rules
3. export schema/version
4. deterministic-output strategy
5. fields explicitly excluded
6. UI files
7. tests
8. build/diff check
9. browser verification
10. integration API requested from coordinator
11. deferred rendering/import capabilities
12. whether Phase G passes
13. likely G/H integration hotspots

Do not begin Phase I.