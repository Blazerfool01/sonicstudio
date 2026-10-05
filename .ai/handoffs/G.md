# Phase G — Export handoff

Final status: integrated and accepted locally after coordinator browser verification and independent source audit. Browser acceptance was pending at worker handoff; the closeout below supersedes that status. Baseline `41cd61c987019a45c13caa398ff2a237de2e2c23`; no commit, push or deployment.

## Delivered

- `src/ExportPanel.tsx`: fifth-step dedicated export surface, format radios, validation, copy/download, selectable preview, actionable success/error feedback and explicit audio exclusion.
- `src/lib/projectExport.ts`: pure validation, deterministic Creation Brief and versioned JSON package, safe filenames, clipboard/download helpers.
- `src/export.css`: isolated responsive presentation; no shared shell/style ownership changes.
- `docs/PROJECT_EXPORT.md`: schema v1, exact field boundary, determinism, notes and browser-action semantics.
- `tests/projectExport.test.mjs`: 16 focused contract tests.

## Integration API

Default `ExportPanel({ project: StudioProject | null })`; mount with a project-ID key in the existing fifth workflow step. No mutation callback, audio owner or Phase H dependency. Coordinator owns workflow selection, shell and shared styles.

Pure API: `validateProjectExport(project, format)` returns allowed/notices with blocker/warning/info levels; `createProjectExport(project, format)` returns content/filename/MIME type or a clear validation error. Formats are `brief` and `json`.

## Contract

No project and unsupported options block. No ingredients block the brief but permit warned metadata export. Partial briefs and no results warn. Audio availability never blocks export. Invalid saved package records block rather than silently dropping records.

Text retains the existing current-project musical prompt and appends separately headed saved project notes. JSON uses `format: sonic-studio.project-export`, `schemaVersion: 1`, `audioIncluded: false` and an explicit project projection. Current identity and each historical track creation snapshot stay separate. Timeline, comparisons/observations and saved notes are included. Existing nested domain cleaners whitelist all fields, including track.file metadata and observation fields.

Stable field/array order and preserved stored timestamps determine output; no generated timestamp. Files, Blob bytes, object URLs, session IDs, analyser/playback/playhead data, temporary selection and editor drafts are excluded. Source project data is never mutated. Storage format stays unchanged.

Clipboard denial leaves a manual-copy preview fallback and download option. Download feedback truthfully says requested, because browsers do not acknowledge save completion or silently blocked downloads. Temporary download anchors/URLs are cleaned up on failure as well as success.

## Verification (2026-10-05)

- Focused G tests: 16/16 passed.
- Shared `npm test`: 232/232 passed (216 baseline + 16 G tests; H tests not yet added at this run).
- Shared `npm run build`: passed, 104 modules transformed.
- `git diff --check`: passed; only repository CRLF conversion notices appeared.
- Tests cover null/empty/partial/full identity, stable text/JSON, current/historical identity, notes, arrangement/comparisons, nested exclusion, frozen source immutability, malformed options, safe filenames, clipboard denial/retry and download failure resource cleanup.

Browser matrix remains coordinator-owned: no/partial/full project, tracks/timeline/comparison, actual copy/download and downloaded-file inspection, reload equivalence, denial recovery, no playback/domain mutation, 1280/390/320 responsiveness, empty new warning/error logs. Do not call Phase G accepted until that matrix passes.

## Deferred / hotspots

Audio rendering, mixdown, encoding, provider upload/cloud export and import/recovery remain unimplemented. No Phase I work. G/H overlap is confined to coordinator workflow navigation and current-versus-historical presentation; Export reads the active project only and has no H dependency.

## Coordinator closeout — 2026-10-05

Subsequent authorization: user approved the reviewed G/H checkpoint commit/push on 2026-10-05. The statements below preserve pre-authorization verification history. No deployment or Phase I.

Checkpoint re-review passed: fresh independent audit clean; 251 tests passed with one worker and sequential production build passed. See docs/GH_VERIFICATION.md for the memory-constrained rerun and retained browser evidence. Ready for commit/push authorization; no commit/push performed.

G/H integrated locally on canonical 41cd61c, package 2.0.0. Full gate: 251 tests, production build and diff check passed. Both browser checklists passed using the in-app browser and Chrome; detailed evidence/environment limits and fixture restoration are in docs/GH_VERIFICATION.md. Actual downloaded text/JSON were inspected on disk. Independent source audit is clean after correcting new-track selection timing, snapshot title focus and historical Save-as-new source precedence. Final project/changelog/decisions/roadmap/schema records updated. No commit, push, deployment or Phase I.
