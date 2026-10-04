# Changelog

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

Earlier milestone details remain in `PROJECT.md`, `docs/sanity-mixes.md`, and `docs/v0.3-change-record.md`.
