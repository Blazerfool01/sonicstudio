# Changelog

## v0.8.4 — Contradiction proof (2026-10-04)

- Stress-tested three awkward multi-tension voices in `tests/vocalInterpretation.test.mjs`, including the intimate, raspy, reverberant high-breath/high-power/high-warmth/high-rasp case. Clarified the warmth phrase in `src/lib/vocalInterpretation.ts` so its contribution to breath-softened peaks reads unambiguously.
- Verified: `npm test` (33 passing), `npm run build` (passing), browser review of the primary strategy and three practical tension resolutions, saved Persona reopen after edits and reload with unchanged ID and Voice DNA, and Genre Mixer weighting/output at 60/40 and 75/25.

## v0.8.3 — Vocal guidance in the builder (2026-10-04)

- Added a guidance section to `src/VocalPersonaBuilder.tsx` showing dominant quality, one performance strategy, supporting relationships, and creative tensions with specific resolutions. Guidance derives live from controls or reopened saved selections; neither Voice DNA nor Persona storage changes.
- Styled tension as a creative choice with warm colors, updated the visible app version label, and made the browser title apply to both tools. Genre Mixer behavior remains unchanged.
- Verified: `npm test` (32 passing), `npm run build` (passing), and connected-browser checks of airy/warm/intimate, forceful/raspy/assertive, and contradictory builds, saved Persona create/edit/reload/reopen, and Genre Mixer weighting. Visual review confirmed readable guidance and resolution cards.

## v0.8.2 — Contextual vocal interpretation (2026-10-04)

- Added `src/lib/vocalInterpretation.ts`, a pure derived interpretation that uses current selections and the relationship report to produce one linked performance strategy, dominant quality, supporting qualities, and resolved tensions.
- Verified high breathiness and high power as one modified quality, and a multi-tension voice as a coherent strategy without copying rule text. Saved Persona records, Voice DNA, Genre Mixer, persistence, and UI were unchanged.
- Verified: `npm test` (32 passing) and `npm run build` (passing).

## v0.8.2 in progress — Pairwise resolution guidance (2026-10-04)

- Added curated `resolution` text for every contrasting and conflicting vocal rule and exposed it in the pure relationship report. Reinforcing and complementary results return `null` for this field.
- Airy/dry, assertive/low-power, and high-breath/high-power now give distinct performance instructions. Saved Personas, Voice DNA, Genre Mixer, and UI behavior are unchanged.
- Verified: `npm test` (29 passing) and `npm run build` (passing). Full contextual interpretation and later v0.8 gates remain open.

## v0.8.1 — Milestone scope correction (2026-10-04)

- Corrected `PROJECT.md` and `docs/ROADMAP.md`: the relationship analyzer completes v0.8.1, while contextual modifier logic, guidance output, and contradiction proof remain in v0.8.
- The preceding v0.8 entry records the implemented analyzer and its passing tests, but its full-milestone label was premature. No application behavior changed in this correction.

## v0.8 — Vocal trait relationships (2026-10-04)

- Added curated vocal relationship rules and a pure analyzer in `src/data/vocalRelationships.ts` and `src/lib/vocalRelationships.ts`. Results identify the participating fields, classify each matched relationship, and give a short explanation.
- Kept Persona records, local storage, Voice DNA, Genre Mixer, and UI behaviour unchanged.
- Verified: `npm test` (27 passing, including three contrasting configurations and conflicts) and `npm run build` (passing).

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
