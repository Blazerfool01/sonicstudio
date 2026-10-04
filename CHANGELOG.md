# Changelog

## v0.7 — Saved Persona library (2026-10-04)

- Added a separate versioned `localStorage` library in `src/lib/savedPersonas.ts`. Invalid stored entries are skipped without affecting valid personas or Genre Mixer records.
- Added save and reopen controls to the Vocal Persona view. Reopening restores the source selections and displays the saved Voice DNA snapshot; later builder edits leave the library record unchanged.
- Verified: `npm test` (24 passing), `npm run build` (passing), and browser create/reload/reopen/edit flow for Ember. Genre Mixer weighting and output remained functional.

## v0.7 foundation — Persona identity record (2026-10-04)

- Added `VocalPersona` and a creation function in `src/lib/vocalPersona.ts`. Each record has a UUID, trimmed name and short identity description, source selections, and a snapshot of Voice DNA.
- Added a session-only creation form and created-persona list to `src/VocalPersonaBuilder.tsx`; changing the builder does not alter a created record.
- Verified: `npm test` (22 passing), `npm run build` (passing), and browser creation and snapshot check. Genre Mixer remained available. Persistence and reopening remain for the full v0.7 gate.

## v0.6 — Vocal Persona Builder (2026-10-04)

- Added curated vocal trait data, an independent in-memory builder view, and deterministic structured Voice DNA in `src/data/vocalTraits.ts`, `src/VocalPersonaBuilder.tsx`, and `src/lib/voiceDna.ts`.
- Added navigation between the Vocal Persona Builder and the unchanged Genre Mixer. Vocal selections do not enter genre recipes or local storage.
- Kept both views mounted while switching so unsaved Genre Mixer and Vocal Persona selections remain intact during the local session.
- Verified: `npm test` (20 passing, including contrasting voice cases and Genre Mixer regression coverage); `npm run build` (passing). In the connected Edge browser, opposite vocal configurations produced distinct live Voice DNA and switching tools retained in-progress selections. Narrow viewport was not checked.

## v0.5 — Exportable Recipe (2026-10-04)

- Added deterministic short and detailed generator-neutral recipes in `src/lib/recipe.ts`, with copy controls in `src/App.tsx`.
- Reused versioned local source records as named recipes; reopening restores the mixer and regenerates both outputs. Existing v0.4 records remain compatible.
- Added recipe coverage in `tests/recipe.test.mjs` and responsive presentation in `src/style.css`.
- Verified: `npm test` (17 passing), `npm run build` (passing), browser save/refresh/reopen/update/delete and both clipboard outputs.

## v0.4 — Saved Mixes (2026-10-04)

- Added named local mixes with reopen, update, duplicate, and delete controls in `src/App.tsx`.
- Added versioned source-only records and safe validation in `src/lib/savedMixes.ts`. Invalid and older records are skipped; derived DNA and compatibility are recalculated on open.
- Added persistence tests in `tests/savedMixes.test.mjs` and responsive styles in `src/style.css`.
- Verified: `npm test` (15 passing), `npm run build` (passing), browser save/refresh/reopen/update/duplicate/delete flow with two distinct mixes.

## v0.3 — Compatibility Logic (2026-10-04)

- Added seven-dimension compatibility profiles, explicit opposing approaches, and deterministic reinforcing/complementary/contrasting/conflicting explanations in `src/data/` and `src/lib/compatibility.ts`.
- Added weighted role and resolution guidance to the mixer interface without changing Sound DNA.
- Verified: `npm test` (12 passing), `npm run build` (passing), browser review of contrasting and easy pairs. Details: `docs/v0.3-change-record.md`.

## v0.2 — Musical DNA refinement (2026-10-04)

- Added structured musical roles for all twelve genres in `src/data/characteristics.json` and weighted lead/support relationships in `src/lib/merge.ts`.
- Reviewed three contrasting mixes in `docs/sanity-mixes.md`.
- Verified: `npm test` (5 passing across all 66 pairs at three weights), `npm run build` (passing), and running-browser review of the three mixes.

## v0.1 — Two-genre mixer (2026-10-04)

- Added twelve curated genre profiles, two selectable source slots, a weight control, reset, and deterministic first Sound DNA output in `src/`.
- Verified: `npm test` (3 passing across all 66 pairs), `npm run build` (passing), and browser selection, weighting, source change, and reset checks.

The v0.1–v0.3 entries were added retrospectively from `PROJECT.md` and their review records. Git began with one v0.5 project snapshot; these entries document earlier milestones without implying separate historical code commits.
