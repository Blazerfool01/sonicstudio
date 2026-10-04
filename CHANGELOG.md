# Changelog

## v1.7.1 — Playback Stabilisation (2026-10-04)

- Added a small playback-intent owner and synchronous cancellation wiring in `Visualiser.tsx`. Stale startup completions cannot pause newer playback or publish UI state; context operations reconcile current intent after late resume/suspend completion. Pending startup remains cancellable, paused/inactive playback suspends the reused graph, and unmount still closes it with StrictMode-safe deferred disposal. Media events and the existing RAF guard consult current intent.
- Guarded browser storage-property acquisition for Genre, Persona, vocal-experiment, and Mood preset initialization. Live tools remain usable if storage is denied; existing write failure feedback and malformed-data/schema handling remain intact. Updated package/lockfile and visible version labels to 1.7.1.
- Added 13 deterministic lifecycle/storage regressions using controlled promises and throwing storage getters. `npm test`: 104 passing; TypeScript/Vite build and `git diff --check`: passing. Edge verified rapid playback, held startup across navigation/return, track switch/removal, real React unmount, graph reuse (one context/source), one Visualiser RAF, URL cleanup, all three visual modes, seeking/end, reduced motion, and session controls/save failures with storage denied. Temporary browser instrumentation and generated PCM Files stayed outside the repository; native OS file-picker automation was unavailable. No v1.9 or v2.0 implementation.

## v1.7 — Visual Modes (2026-10-04)

- Added one responsive Canvas output with Spectrum, Waveform, and Radial modes, driven by the existing AudioAnalyzer buffers. Mode changes do not recreate audio nodes or add animation loops; reduced-motion mode lowers canvas refresh frequency, and the existing diagnostic meters remain available.
- Added pure tests for logarithmic spectrum aggregation, waveform coordinates, radial angle/radius mapping, silence, invalid values, and mode labels. `npm test` passes 91 tests, `npm run build` passes TypeScript and Vite, and `git diff --check` passes.
- Browser-verified generated PCM WAV silence, 80 Hz bass, 6 kHz treble, and a broad-spectrum composite; checked all modes during playback, track switching, seek, pause/resume, end, selected-track removal, and Visualiser return. Responsive checks at 320/390 px had no overflow; DPR 2 used a 2× bitmap; reduced-motion mode preserved playback. Console/page errors were empty. The composite is a controlled signal proxy rather than an external music recording.

## v1.6 — Audio Analysis (2026-10-04)

- Added `src/lib/audioAnalysis.ts`: one lazily created media-element source → analyser → destination graph, 2048-point FFT, reusable 2048-sample Float32 waveform and 1024-bin Uint8 spectrum, RMS amplitude, and Hz-derived low/mid/high energy in the 0–1 range.
- Added plain live meters to the Visualiser. One requestAnimationFrame loop reads buffers during playback and publishes only four values to React about every 65 ms. Pause, end, selection, removal, and leaving the view stop/idle the loop and zero readings. The context is suspended when leaving; graph nodes/context close on unmount with a deferred cleanup to preserve React StrictMode effect replay.
- Browser-verified silence (all 0), quiet 80 Hz (amplitude ~0.085, low ~0.429), loud 80 Hz (~0.53, low ~0.59), and 6 kHz (~0.53, high ~0.10, low 0), plus play/pause, seek, track switching, removal, graph reuse (one creation), 2048/1024 buffers, and return after context suspension. Added four pure calculation tests and a graph wiring/cleanup test; `npm test` passes 86 and `npm run build` passes. No v1.7 visual modes were added.

## v1.5 — Local Audio (2026-10-04)

- Added the independent Visualiser player with session-only multi-file import, selection, play/pause, seeking, progress, duration, removal, and track switching. Imported metadata/selection is separated from one browser audio element and its playback state; temporary object URLs are revoked on removal and unmount.
- Added validation for common audio file extensions and browser MIME support, with clear feedback for unsupported, empty, and unreadable files. No file upload, persistence, analysis, or visual effects were added.
- Verified three WAV files with different durations in the browser: play/pause, seeking while playing and paused, switching during playback, playing each track, active-track removal and fallback, invalid text and corrupt MP3, and session reset on reload. `npm test` passes 81 tests, including four new track-library tests; `npm run build` passes TypeScript and Vite. Other tools remain available through navigation.

## v1.3 — Mood presets (2026-10-04)

- Added a dedicated `sonic-studio.mood-presets` local store with `schemaVersion: 1`. Presets keep only stable ID, name, cloned mood IDs and integer weights, and timestamps. Invalid envelopes fail closed; invalid entries are skipped while valid entries remain; extra derived fields are stripped before writing.
- Added compact Mood Mapper controls to save as new, reopen, explicitly update, and delete presets. Live edits stay separate from saved state. Reopening restores source selections and regenerates Mood DNA, relationship analysis and interpretation, and production guidance through existing engines. Other tool storage schemas are unchanged.
- Browser-verified five review presets after an actual reload with exact Fingerprint, relationship, and production text reproduction. Also checked update across reload, save-as, targeted delete, malformed and mixed storage, and 1280/900/390/320 px layout. Verified: `npm test` (77 passing, including Genre Mixer and Vocal Persona suites) and `npm run build` (passing).

## v1.2.2 — Production guidance view (2026-10-04)

- Added a live Mood Mapper production section beneath relationship guidance: overall direction, up to three ranked priorities, seven compact musical domains, dimension/value sources, and labelled combined directions. Output derives from Mood DNA and is absent with no selection; no persistence or cross-tool changes.
- Added a pure view boundary and structural tests for empty, single, weighted, source, and interaction cases. Browser-reviewed Serene, Aggressive, Dreamlike, Brooding/Haunting, Serene/Menacing at 50/50 and 90/10, and Dreamlike/Restless. At 1280, 900, 390, and 320 px the new section stacked cleanly without horizontal overflow. A temporary browser harness rendered high-Energy/low-Motion guidance, then was removed; no current mood selection reaches that region.
- Verified: `npm test` (71 passing, including Genre Mixer and Vocal Persona suites) and `npm run build` (passing).

## v1.2.1 — Mood-to-Music translation engine (2026-10-04)

- Added `src/data/moodTranslationGuidance.ts` with explicit seven-dimension mapping into harmony, rhythm, dynamics, density, space, texture, and arrangement; five named numeric regions; and seven compact multi-dimension production rules.
- Added pure `src/lib/moodTranslation.ts`: structured per-domain signals with Mood DNA source values, relative intensity, ranked priorities based on distance from neutral, and a concise overall direction. No named-mood lookup, UI, persistence, or changes to Mood DNA, relationship analysis, genre, or vocal systems.
- Reviewed Serene, Aggressive, Dreamlike, Brooding/Haunting, Serene/Menacing at 50/50 and 90/10, and Dreamlike/Restless. The equal Serene/Menacing translation keeps a stable harmonic centre with unresolved colour; 90/10 keeps a calm surface with fleeting unresolved colour. Dreamlike/Restless keeps a measured pulse under ambience. Source opposition softened by weighted averaging cannot be reconstructed from Mood DNA alone; later UI can display existing relationship interpretation alongside translation.
- Verified: `npm test` (68 passing, including prior suites) and `npm run build` (passing).

## v1.1.3 — Mood Mapper guidance view (2026-10-04)

- Connected the existing relationship analysis and interpretation to live Mood Mapper selections and weights. A new section below the Emotional Fingerprint shows a readable relationship type, whole-blend summary, mood roles, ranked shared qualities, creative tensions with practical resolutions, and creative direction. Single moods show their own character without invented pair guidance; empty selections show no relationship section.
- Added responsive guidance cards and role rows with neutral creative-tension styling. Updated the visible app version; Mood DNA, mood profiles, relationship rules, saved Sound DNA, and saved Voice DNA formats are unchanged.
- Browser-reviewed the specified single, reinforcing, complementary, contrasting, conflicting, 90/10, three-mood, and Vulnerable/Triumphant cases. Verified selection cap, remove/reset, live fingerprint, navigation, Genre Mixer and Vocal Persona controls. At 1280, 900, 390, and 320 px there was no horizontal overflow. Vulnerable/Triumphant's Motion-led direction is technically valid but editorially less distinctive than its Energy/Valence contrast; no model change made.
- Verified: `npm test` (59 passing) and `npm run build` (passing).

## v1.1.2 — Mood relationship interpretation (2026-10-04)

- Added `src/data/moodInterpretationGuidance.ts` with reusable shared-quality, emotional-effect, and balanced/low-led/high-led resolution guidance for all seven dimensions.
- Added `src/lib/moodRelationshipInterpretation.ts`, a pure derived headline, whole-blend summary, ranked supports and tensions, practical strategy, and dominant/supporting/accent roles. Raw conflict remains visible in the wording when uneven weights soften effective classification. No UI or authoritative data changes.
- Reviewed all eight named pairs, Serene/Menacing at 50/50 and 90/10, and Serene/Dreamlike/Menacing at 50/30/10. The latter retains shared suspension alongside calm/unease tension. Vulnerable/Triumphant emphasizes motion because that is its strongest opposing dimension; this is numerically sound but may feel less distinctive than its valence and energy contrast.
- Verified: `npm test` (59 passing, including Mood DNA, relationship, Genre Mixer, and Vocal Persona suites) and `npm run build` (passing).

## v1.1.1 — Mood relationship engine (2026-10-04)

- Added `src/lib/moodRelationships.ts`: pure seven-axis pair comparison, bounded distance and similarity, shared and opposed dimension details, raw relationship type, influence-aware tension/type, and an overall result retaining every pair for up to three moods. No Mood DNA or UI changes.
- Eight review pairs: Melancholic/Vulnerable and Dreamlike/Hypnotic reinforce; Romantic/Dreamlike and Triumphant/Euphoric complement; Dreamlike/Restless and Vulnerable/Triumphant contrast; Serene/Menacing and Romantic/Aggressive conflict. Triumphant/Euphoric's relatively small total distance still includes Weight and Atmosphere opposition, explaining its complementary label.
- Verified: `npm test` (51 passing, including Mood DNA, Genre Mixer, and Vocal Persona suites) and `npm run build` (passing).

## v1.0 — Mood Space Foundation (2026-10-04)

- Added 14 curated moods, each with seven 0–100 dimension values, and pure weighted Mood DNA derivation with deterministic dominant mood and short description.
- Added an independent Mood Mapper view with up to three mood selections, influence sliders, and a labelled Emotional Fingerprint. Existing Genre Mixer and Vocal Persona storage schemas and calculations remain unchanged.
- Revised the planned v1.0 scope from a persisted two-axis plane to weighted moods at the user's direction. Selections remain session-only in this version.
- Verified: `npm test` (44 passing, including existing Genre and Vocal suites) and `npm run build` (passing). Browser interaction verified for selection, weighting, three-mood cap, fingerprint, and navigation.

## v0.9 — Vocal prompt output and comparison (2026-10-04)

- Added deterministic concise and detailed vocal prompts derived from Voice DNA and contextual interpretation, with copy controls for the live or reopened voice.
- Added side-by-side comparison of two saved Personas across eight vocal traits and both prompt variants. Added a separate local experiment-reference record containing a Persona ID, label, and optional note; Persona storage remains unchanged.
- Verified: `npm test` (38 passing), `npm run build` (passing), browser creation/comparison of opposite Air and Stone singers, both copy success states, saved prompt reproduction and experiment reference after reload, and Genre Mixer weighting/output. The browser's virtual clipboard did not expose copied text for independent readback.

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
