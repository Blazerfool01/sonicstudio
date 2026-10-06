# Changelog

## `example-dash` Home composition (`2.0.0`, 2026-10-06)

- Reworked Home into the supplied hero, four-destination card row, top-bar search, primary navigation and four-tab context rail. Tuned the project thumbnail, rail spacing and desktop viewport fit in `referenceDashboard.css`; refined the decorative hero terrain in `StudioOverview.tsx`.
- Kept project names, tempo, moods, captured modules, navigation, editors, persistence, audio and timeline tied to their existing owners. Reference-only `Neon Skies` / `F minor` values were not written into the active `Midnight Echoes` project.
- Verified the 1280 × 594 production preview, main routes and rail/panel controls; `npm test` passes 253/253, TypeScript/Vite build passes (128 modules), and `git diff --check` passes. Layout review is complete; literal sample-content parity remains open. Evidence and limits: `docs/MOTION_REFERENCE_VERIFICATION.md`.

## Supplied reference motion system (`2.0.0`, 2026-10-06)

- Mapped all 15 supplied images to existing shell/state owners before implementation, including 11 interaction requirements. Added `useReferenceMotion.ts`, `MotionSidePanel.tsx` and final scoped `referenceMotion.css`; connected existing navigation/capture callbacks and ContextRail guidance blocks.
- Implemented 200/min-720/310 px desktop geometry, 16 px focus transfer, 350 ms centre camera pan and rail follow, 250 ms side depth, 120 ms magnetic edges, 400 ms collapse/reveal, 500 ms selection echo/full-focus expansion, 550 ms energy bridge and 700 ms one-shot edge pulse using cubic-bezier(.22,1,.36,1). Retained 48 px icon strips and existing mounted editors/player. Native view snapshots and sequential fallback never duplicate React or media owners.
- Kept draft selections separate from explicit project capture; preserved domain models, saved schemas and audio/timeline ownership. Added reduced-motion/hidden/unmount cleanup, obsolete-navigation cancellation and inert collapsed content. Contained retreating panel content and the mobile workflow strip after responsive checks identified overflow.
- Verified 253/253 tests, production TypeScript/Vite build, 23 reference checks, 9 edge/fallback checks, 28 responsive and 14 reduced-motion screen checks, live MP3 playback/navigation pause, keyboard access, and visual review of rendered desktop/mobile/full-focus/transfer frames. Detailed evidence and limits: `docs/MOTION_REFERENCE_VERIFICATION.md`. No commit, push or deployment.

## Dashboard full asset collection (`2.0.0`, 2026-10-06)

- User accepted the two-asset pilot and authorized the remaining 19 references. Added scoped navigation/stepper, button/switch, chart, hero, visualiser artwork and timeline feedback in `dashboardAssetCollection.css`; kept live project values and existing owners.
- Added dismissible success/info/error notifications and spinner/bar/skeleton feedback only while a real metadata clipboard request is pending. Successful notifications expire after six seconds with hover/focus pause; errors persist. Superseded requests cannot publish stale feedback, and returning to a view does not replay an old notification.
- Verified TypeScript/Vite production build, 253/253 tests, desktop screenshots, preview modes, active navigation/stepper, clip hover, pending-copy success/error/cancellation, toast timing, Home reload, 390/320 px no-overflow and reduced motion. Evidence: `docs/ASSET_COLLECTION_VERIFICATION.md`. Full collection visual review pending; no audio rendering, commit, push or deployment.

## Dashboard two-asset pilot (`2.0.0`, 2026-10-06)

- Piloted `slider_controls.png` and `module-card_hover.png` through scoped Home CSS: brighter purple/cyan captured-value meter handles, source-card lift/border glow, slight thumbnail zoom and decorative hover particles. Existing values, editor handoffs and persistence unchanged.
- Vite production build passes (123 modules). Browser verifies 5 px hover lift, animated particles, unchanged Vocal values, reduced-motion suppression, 390 px no-overflow and no page errors. No domain tests added or rerun for this CSS-only pilot. Captures: `docs/verification/asset-pilot/`.
- Visual review pending; the other 19 assets are not started. No commit, push or deployment.

## Fidelity Pass 2 — user-approved live-data styling (`2.0.0`, 2026-10-06)

- User resolved the shared Home conflict: live project values take precedence; match reference styling only. Earlier three-source/92% preset acceptance is superseded. Both project-derived charts remain authoritative.
- Refined Home styling with saturated cyan/violet selected tabs, keyboard-focus card glow, two-source thumbnail geometry beside calculated BlendProgress, vocal meter handles and stronger filled Mood Radar glow. No domain values or chart paths changed.
- Verified fresh 253/253 tests, TypeScript/Vite build (122 modules), final 1672 × 941 production capture, four preview modes, settings, Save/reload, mute persistence, empty browser error report and 390/320 px no-overflow checks. Evidence: `docs/LIVE_FIDELITY_PASS_2_VERIFICATION.md`. Revised fidelity scope complete. No commit, push, deployment or audio rendering.

## Fidelity Pass 2 — isolated presentation checkpoint (`2.0.0`, 2026-10-06)

- Isolated the requested Home reference presentation in `ReferenceStudioModules.tsx`, `ReferenceContextRail.tsx` and `referencePreset.css`. Captured-source BlendProgress and MoodRadar remain available; the info control switches Sound DNA between the reference preset and computed project data. This Home preset supersedes the default-view removal noted in the concurrent chart entry below for the active reference task.
- Final build: TypeScript/Vite pass (122 modules); existing full-suite run: 253/253 pass. Fresh desktop capture proves three thumbnail cards in one row, four visualiser modes, four tracks/eight clips and a context rail ending at the timeline baseline. Source switching, rail tabs, settings switches, mute/reload and 390/320 px no-overflow checks pass.
- Full 100/100 visual acceptance remains open: live Vocal Persona and Mood Mapper graphics differ from the target. No commit, push, deployment or audio rendering.

## Blend Progress and Mood Mapper (#7 / #8, `2.0.0`, 2026-10-06)

- Added shared `BlendProgress` and `MoodRadar` charts to Genre Mixer, Mood Mapper and the Home creative cards. The ring uses the real lead-source weight and existing relationship counts; the Mood radar and seven numeric values use existing Mood DNA calculations. Removed the dashboard's hardcoded 92% compatibility display and decorative three-source data from its default view.
- Kept SVG geometry in TSX and chart styling/motion in CSS. Scoped glow/breathing effects honor reduced motion; project persistence, shell navigation and audio/timeline ownership are unchanged.
- Verified `npm run build`, `git diff --check`, production-browser dashboard geometry/data and a Mood Mapper profile against its seven displayed values. Browser console errors: none. No tests were run for this request.

## Fidelity Pass 2 — Reference graphics and lower dashboard (`2.0.0`, 2026-10-06)

- Rebuilt Sound DNA as the requested three-thumbnail reference preset, 92% compatibility block, bullet metrics and dual sine-wave preview. Isolated the display in `ReferenceStudioModules.tsx`, retaining native captured identity and concurrently added computed chart components.
- Added four selectable Visualiser artwork previews, the reference dual-glow waveform, clip waveform marks and existing-model Mute/Solo actions. Extended the rail to the timeline baseline with WAV/sample-rate controls, Stems/Normalize switches, Generate / Render and Save Project. Render feedback explicitly identifies the unconnected renderer.
- `fidelityPass2.css` restores subtle purple borders, cyan hover glow and saturated active/primary gradients. Desktop geometry and all named elements captured and audited at 1672 × 941; controls/save/reload and 390/320 px no-overflow checks verified. TypeScript/Vite production build passes; full-suite result is in `docs/FIDELITY_PASS_2_VERIFICATION.md`.
- Local/uncommitted; no push/deployment. Real WAV generation/rendering remains outside this visual pass.

## Target Parity — Active Studio Dashboard (`2.0.0`, 2026-10-06)

- Replaced the empty Create overview with Midnight Echoes startup, a CSS Grid dashboard, three equal creative cards, full-width Visualiser artwork and a four-lane/eight-clip arrangement projection. Persistent Project Info, derived Guidance, Notes and real Export Settings now appear together.
- Added `StudioDashboard.tsx`, `dashboard.css`, canonical starter records and supplied reference artwork. Existing saved projects, editor callbacks, Timeline model, single media owner and TXT/JSON export contracts retained. Home now returns to the overview; project setup forms stay outside it.
- Verified 253 tests, production build, diff check and production-browser capture at 1672 × 941. All three 361 × 306 px cards and lower timeline fit in view. Module/clip/live-preview handoffs, Save/reload, 390/320 px no-overflow checks and clean console verified. Evidence: `docs/TARGET_PARITY_VERIFICATION.md`.
- Local and uncommitted. Exact pixel/feature parity, playable starter audio and broader accessibility/device validation remain deferred; no push or deployment.

## UI/UX Overhaul Phase I-C — Motion System (`2.0.0`, 2026-10-06)

- Began on clean accepted `9ac4429cd2745717155284fc728180ff6b52c9cb`. Added `src/motion.css` after locked I-A/I-B/I-B.1 layers: shared timings/easings, state transitions, tiny card/button feedback, short workspace/rail/historical entrances, a single 12-second hero drift and truthful one-shot Export feedback.
- Two existing-state presentation keys replay Context Rail section and Export feedback entry. No new dependencies, state stores, effects, RAF/timer owners, persistence, renderer or Timeline timing changes. Immediate focus/disabled states, native hidden behavior, reduced-motion overrides and fine-pointer hover guards retained.
- Verified 251 unchanged tests, final production build/diff, exact desktop geometry, real audio/control/historical/shortcut/Export flows, controlled copy/download errors, rail draft retention, reload and clean console. 48 populated normal/reduced responsive checks and six empty width checks pass. Coarse-pointer styling verified; native touch gestures and actual download saving remain unverified. Evidence: docs/IC_VERIFICATION.md; handoff: .ai/handoffs/I-C.md.
- Local/uncommitted; no push/deployment. Full Phase I incomplete. I-D remains unstarted and separately authorized.

## I-B.1 — Authorized checkpoint (`2.0.0`, 2026-10-06)

- User authorized committing and pushing the verified empty-state correction to canonical `main`, including desktop before/after and narrow screenshot evidence.
- Retains the 251-test, production-build, populated-geometry and browser verification recorded in docs/IB1_VERIFICATION.md. That document embeds the final desktop image for review on GitHub. No deployment or I-C work.

## I-B.1 — Empty-state composition correction (`2.0.0`, 2026-10-06)

- Started from clean committed I-B `333ccaebcd560b171c2ffd214701b6a01e49f18f`. Polished no-project Create onboarding, Create/status hierarchy, redundant Identity & Brief treatment and vertical spacing; retained empty Context Rail workstation presence.
- Added state-scoped `src/emptyState.css` and small presentation-only shell/composer changes. Populated I-A layout, I-B interaction styles, controls, navigation, domain/storage/audio owners and animation boundaries remain locked.
- Verified 251 unchanged tests with concurrency 1, production build, diff check, exact populated geometry after reload, empty 1280/390/320 px overflow checks, input/focus states, saved-project opening and four rail sections; console clean. Details: docs/IB1_VERIFICATION.md; handoff: .ai/handoffs/I-B.1.md.
- Local and uncommitted; no push/deployment. User visual acceptance and I-C authorization remain separate.

## UI/UX Overhaul Phase I-B — Interaction States (`2.0.0`, 2026-10-06)

- Began on clean committed accepted I-A `51fd9f55acb0fa8c73246ba7bb03c7b708d50fee`. Added shared static state tokens/styles across navigation, workflow, buttons, native inputs/ranges, choices/cards, disclosures, Timeline, Visualiser, Compare, rail, Export and power/historical actions.
- Distinguished hover, persistent selection, keyboard focus, press, disabled, local dirty/saved, historical context, playback and semantic feedback. Added presentation attributes/text from existing state; Export feedback now reuses StatusNotice. Removed Timeline color precedence barriers while retaining geometry and sequencing.
- Verified 251 unchanged tests, production build and diff check; 1664 × 920 desktop states/workflows, 128 visible page-control focus samples, 24 responsive checks at 1280/390/320, one audio/canvas/graph and clean console. Actual download saving remains unverified; requested-download feedback and clipboard success/error recovery verified. Details/screenshots: docs/IB_VERIFICATION.md; handoff: .ai/handoffs/I-B.md.
- I-B is local/uncommitted. No model/schema/ownership change, new dependency or motion system. I-C/I-D and full Phase I remain incomplete; no commit, push or deployment.

## UI/UX Overhaul Phase I-A — Reference Fidelity (`2.0.0`, 2026-10-06)

- Started from clean accepted G/H checkpoint `17b933115a70c84c33a40a2d8b1357bc944937ec`; no reset to the earlier E/F baseline.
- Reframed the Studio around a full-height sidebar, compact workspace header and integrated desktop rail. Added a compact hero, numbered workflow strip and read-only captured Genre/Vocal/Mood visuals; kept source details, notes and brief reachable through disclosures.
- Unified static navy/cool-border card styling in `src/fidelity.css`; made the existing live canvas/player one wide panel and moved Timeline before track details within Tracks. Kept four destinations/five steps, state/schema/audio/renderer ownership and A–H behavior.
- Verified 251 tests, production build, diff check, 1664 × 920 desktop reference review, 1280/390/320 px smoke, existing workflows/shortcuts, historical reopening, single audio/canvas/graph, clean console and actual Export downloads. Details/screenshots: `docs/IA_VERIFICATION.md`; handoff: `.ai/handoffs/I-A.md`.
- Local and uncommitted. Full Phase I, I-B interaction refinement, I-C animations and I-D responsive redesign remain unstarted; no push or deployment.

## UI/UX Overhaul G/H — Authorized checkpoint (`2.0.0`, 2026-10-05)

- User authorized committing and pushing the reviewed G/H checkpoint to canonical `main`, building on `41cd61c`. Includes Export, the Power Layer, tests and project/.ai records.
- Retains the accepted 251-test, production-build, browser and clean independent-audit evidence recorded in docs/GH_VERIFICATION.md. No deployment or Phase I work.

## UI/UX Overhaul G/H — Checkpoint review (`2.0.0`, 2026-10-05)

- Fresh independent source/documentation review found no remaining blockers. G/H are ready for commit/push authorization; no production changes were needed.
- Full suite passed 251 tests with one test worker after a parallel rerun exhausted Windows memory; sequential production build passed. Existing integrated browser acceptance remains applicable. Evidence: docs/GH_VERIFICATION.md. No commit, push, deployment or Phase I.

## UI/UX Overhaul Phases G/H — Export and Power Layer (`2.0.0`, 2026-10-05)

- Added deterministic text briefs and schema-1 metadata JSON with truthful validation, copy/download recovery, separate notes, immutable provenance, Timeline and comparisons. Export excludes all audio/session/runtime/editor data; rendering/import/provider integration remain deferred.
- Added explicit track snapshots/duplicates, transient Tracks→Compare seeding, captured historical drafts in all three existing editors, and Alt+Shift+S / Alt+Shift+C shortcuts with editable/native editing guards. Preserved existing project, selection, comparison and single-player ownership.
- Coordinator integrated the shell; independent audit findings on new-track selection, title focus and new saved-source provenance were corrected and re-reviewed. Amended .ai contracts/coordinator/handoffs, project status, decisions, roadmap and schema/verification documentation.
- Verified 251 tests, production build and diff check; live no/partial/full export, actual text/JSON files, reload determinism, denial/recovery, provenance isolation, Compare save/cancel, historical reopening, shortcuts, one-player WAV playback, 1280/390/320 px and empty console logs. Details: docs/GH_VERIFICATION.md.
- E/F corrections previously described as uncommitted are already canonical in `41cd61c987019a45c13caa398ff2a237de2e2c23`. G/H remain local pending authorization; no commit, push, deployment or Phase I.

## UI/UX Overhaul Phase E/F — Canonical adoption and P2 review corrections (`2.0.0`, 2026-10-05)

- The integrated E/F implementation is on canonical GitHub `main` at `752fadb535a72d1cb55d73cc7c55c63666c8724b`, verified against `origin/main`. The earlier “Integrated locally” entry below records the pre-commit state at that point in the chronology.
- Restored the Phase B navigation contract: four product destinations and five creative workflow steps. Timeline now appears as a separate arrangement region within Tracks. Track removal explicitly names and counts dependent comparisons and timeline clips, and the project model requires confirmation before either dependency cascade.
- Follow-up verification: `npm test` — 216 passed; `npm run build` — passed; `git diff --check` — passed. Live browser review confirmed the four destinations/five steps at 320 px and checked the removal confirmation with one comparison plus one timeline clip. These follow-up corrections are local and uncommitted; no further push or deployment was made.

## UI/UX Overhaul Phase E + F — Integrated locally (`2.0.0`, 2026-10-05)

- Integrated the lightweight timeline and contextual rail into the Studio shell. Timeline arrangements persist additively on existing projects and use the existing Visualiser playback owner; the rail derives current and historical context from established project/track owners and keeps project and track notes separate.
- Added deterministic overlap resolution, clip eligibility and sequencing handoff safeguards; reconciled external track-note edits with the existing form draft so a stale hidden form cannot overwrite a rail save.
- Coordinator acceptance at this point in the chronology: `npm test` passes 216 tests; `npm run build` and `git diff --check` pass. Live browser checks cover sequencing, trim/mute/solo, navigation pause, persistence/reload, one audio element, Context Rail notes/provenance, 1280/390/320 px layouts, and empty warning/error logs. The implementation was subsequently committed and pushed in the canonical-adoption entry above; no deployment was made.

## UI/UX Overhaul Phase E/F — Parallel coordination setup (`2.0.0`, 2026-10-05)

- Added the separate Phase E Timeline and Phase F Context Rail worker contracts, coordinator ownership rules, and explicitly pending handoff records under `.ai/`.
- Recorded E/F as the next parallel, separately scoped work on the clean canonical `main` baseline. No product implementation, completion claim, commit, push, or deployment is included in this setup entry.
- Confirmed the kickoff baseline: `npm test` passes 197 tests; `npm run build` and `git diff --check` pass. Product implementation and browser acceptance remain pending; final verification will record coordinator integration evidence.

## UI/UX Overhaul Phase C + D — Integrated (`2.0.0`, 2026-10-05)

- Integrated Mood preset provenance and Genre/Mood Visual Personality mapping into StudioShell. Current identity follows the active project; historical identity follows the selected track's creation snapshot. Project switching clears transient Mood preview state.
- Reviewed saved Mood preset update/reopen, current-versus-historical Genre/Mood identity, and project-switch clearing. **DPR gate: PASS** — Windows Scale 100%→125%→100% changed Chrome DPR 1→1.25→1; resize and resolution-query change events fired, and canvas backing size changed 723×328→905×410→723×328 with clear visual sharpness. Cross-monitor movement remains untested and non-blocking because the same browser DPR-change handling path was exercised. `npm test` passes 197 tests; production build and `git diff --check` pass.
- Reviewed and accepted by the user. Committed to canonical `main` as `f97b32b`; pushed to GitHub `main`. No deployment.

## UI/UX Overhaul Phase A + B — Local commit (`2.0.0`, 2026-10-05)

- Committed the verified interaction core and shell integration to local `main` as `Integrate Phase A and B studio shell`. Phase A/B status and next milestone are recorded in `PROJECT.md`.
- No push or deployment; Phase C/D remain unstarted.

## UI/UX Overhaul Phase A + B — Storage denial acceptance (`2.0.0`, 2026-10-05)

- Temporarily blocked writes to `sonic-studio.projects.v1` in Chrome, created then removed a test-only project, and confirmed the session-only/reload-loss message appeared while denied writes left no project persisted. Restored normal storage behavior; the browser shows zero projects and the uploaded `test-song.mp3` remains paused in the session.
- Confirmed the Phase A/B visual review is a foundation check: the shell hierarchy passes its scope, while the one-to-one approved-reference composition remains later-phase work under the Notion workflow. The Phase A/B candidate is ready for commit review; no commit, push or deployment.

## UI/UX Overhaul Phase A + B — Populated Visualise review (`2.0.0`, 2026-10-05)

- The user selected `test-song.mp3` (4.60 MB) through Chrome's Visualise import. Confirmed it remained session-only, briefly played with non-zero analyser readings, then paused. With the file loaded, 390×844, 320×800 and 1672×941 CSS viewport checks showed no page-wide horizontal overflow; Chrome warning/error logs remained empty.
- Reviewed the shell and populated Visualise view against the approved reference and Notion workflow. Phase B hierarchy is navigable, but the reference's hero, multi-card creative workspace, detailed rail and timeline are not present in this shell candidate and remain later-milestone work. Browser storage-denial injection remains open; no product code, commit, push or deployment was added in this review.

## UI/UX Overhaul Phase A + B — Chrome viewport acceptance (`2.0.0`, 2026-10-05)

- Verified the integrated shell at 390×844 and 320×800 CSS pixels in the user's Chrome tab. Both widths have no page-wide horizontal overflow; the creative workflow stepper is an internal horizontal scroller. Chrome page warning/error logs were empty.
- Reviewed the empty-project shell at 1280×900 against the approved reference and Notion workflow: the Phase B hierarchy is present, while the context rail remains a structural placeholder and full reference fidelity remains open for later phases. Browser storage-denial injection also remains open. No commit, push or deployment.

## UI/UX Overhaul Phase B — Shell (parallel implementation candidate, `2.0.0`, 2026-10-05)

- Added modular Studio top bar, destination sidebar, creative workflow stepper and context-rail placeholder; moved project switching to the persistent top bar and added responsive shell framing in `StudioShellParts.tsx`, `StudioShell.tsx`, `StudioComposer.tsx` and `studio.css`.
- Kept Export as a deferred destination and left context rail behavior, domain state, storage schemas and playback infrastructure with their existing owners.
- Shared working-tree verification: `npm test` (192 passing), `npm run build` and `git diff --check` pass. Browser exercised no-project/populated project, navigation, editor steps, switching and Genre attachment. Exact 390/320 px, audio-file playback and console-log acceptance remain outstanding; no approved image was available for final matching.
- Later shared-tree smoke during Phase A checked 1280/390/320 px with no page-wide overflow, MP3 attach/playback, Compare → Visualise → return, and empty browser warning/error logs. Reference-match and full Phase B sign-off remain open.
- Documented as parallel Phase B work alongside Phase A. A rebase/integration review remains necessary; no merge, commit, push or deployment.

## UI/UX Overhaul Phase A — Interaction Core (`2.0.0`, 2026-10-05)

- Added project-scoped session track selection, safe invalidation, destination-heading focus and explicit-track focus handoff without changing project storage or audio ownership.
- Added reusable accessible status feedback, explicit track-draft dirty labels, disabled-action reasons and pure keyboard-target / undo-boundary rules.
- Added five focused interaction tests. `npm test`: 192 passing; `npm run build`: passing. Browser verification covered project switching, selection/deletion, destination/track focus, Compare handoff/playback, native text undo, responsive widths and empty browser warning/error logs. Storage-denial browser injection was unavailable; automated storage-denial tests pass.
- Updated `PROJECT.md` and `docs/DECISIONS.md`. Phase B remains a separate parallel implementation candidate; package version and roadmap direction are unchanged.

## UI/UX Overhaul Phase A + B — Local integration review (`2.0.0`, 2026-10-05)

- Integrated the Phase B top bar, project switcher, destination sidebar, creative stepper, context slot, and responsive layout into the Phase A interaction shell. Connected project-scoped track selection to its existing pure interaction helpers and removed duplicate project switching from the composer.
- Verified: `npm test` (192 passing), `npm run build`, and `git diff --check` pass. Running-browser checks at 1280 × 720 covered project creation/switching, Create / Tracks / Compare / Visualise, Genre / Vocal / Mood steps, Visualiser presence, and selected-track state. Narrow-width review, console capture, audio file playback, and visual reference-match remain pending. No commit, push, or deployment.

## UI/UX Overhaul Phase B — Acceptance follow-up (`2.0.0`, 2026-10-05)

- Kept the creative workflow stepper visible while visiting Tracks and Compare, retaining the selected creative step so the user can still identify it across product destinations. This follows the Phase B acceptance rule in the Notion workflow.
- Re-ran `npm test` (192 passing), `npm run build`, and `git diff --check`. Edge acceptance remains pending: Windows Computer Use could not establish the browser URL, so the final shell state was not opened. Narrow-width, console, audio playback and reference-match checks remain unverified.

## SonicStudio v2.0 — Studio Release (`2.0.0`, 2026-10-05)

- Replaced global lab navigation with Create / Tracks / Compare / Visualise. Added secondary Create editing access, coherent project context, focused result/experiment destinations, historical listening context and comparison return navigation.
- Extracted StudioShell, the project controller and GenreMixer from App. Kept existing domain engines and mounted editors/player; removed superseded lab chrome, navigation callbacks and scroll-to-tool glue. Unified spacing, controls, focus treatment and responsive layouts.
- Preserved schema-1 projects, all independent libraries, immutable track provenance and single-player audio ownership. Explicit standalone selection clears historical context; project switching pauses and clears listening handoffs. Compare reuses the existing player and position-switch machinery.
- Verified 187 tests, TypeScript/Vite build and diff whitespace checks. Production-preview Edge covered the full evolving-identity workflow, six observations/preferences/conclusion, brief clipboard readback, all modes, reload/reattachment, library/project/comparison regressions, dependency cancellation/cascade, reduced motion and denied storage. Reviewed 1280/390/320 px; no horizontal overflow or console warnings/errors. Lifecycle instrumentation retained one element/context/source/RAF; all three URLs were revoked once.
- Updated project status, architecture decisions, completed roadmap and README; recorded release evidence and limitations. Local release commit only; no push or deployment.

## v2.0 Stage 3 — A/B Compare (`2.0.0-stage.3`, 2026-10-05)

- Added project-contained versioned comparisons with two distinct track references, six observation fields, optional A/B/null preference, conclusion and timestamps. Stage 2 projects default to an empty comparison list; validation strips unknown fields and isolates invalid, duplicate or dangling records.
- Added the current-Studio Compare section with create/open/save/update/delete, factual provenance differences, collapsible side identity, availability/attachment links and active-side playback controls. Current project edits and track metadata edits preserve historical identity and comparison observations.
- Extended the existing Visualiser bridge with generic single-player play/pause and pending position handoff; switches preserve seconds and clamp safely against duration while retaining PlaybackIntent, one graph/source and one RAF. Captured Mood/Classic follow each side; comparison state and URL ownership stay outside the audio engine.
- Extended track deletion with an explicit dependency count and confirmed comparison cascade. Unreferenced comparisons and sibling tracks remain intact; deleting a comparison never deletes tracks.
- Verified 179 tests (31 new), TypeScript/Vite build and whitespace checks. Headless Edge production acceptance covered two evolving identities, A/A prevention, source/personality/position switching, held-resume/navigation races, observations/preferences/conclusion, reload/reattachment, deletion dependencies, denied storage and 1280/390/320 px layouts. One element/context/source/RAF and empty final warning/error logs were confirmed.
- Updated project status, decisions and roadmap. Final navigation/release polish are Stage 4 scope; synchronized playback, scoring, APIs, cloud and publication remain deferred.

## v2.0 Stage 2 — Project Tracks (`2.0.0-stage.2`, 2026-10-05)

- Added versioned track metadata and deeply copied creation identity to StudioProject; schema 1 evolves additively so Stage 1 projects reopen with empty tracks. Parsing isolates malformed tracks, strips unknown fields, and preserves valid parent/sibling records.
- Added active-project track creation/editing, version/source detail/notes, confirmed removal, session audio attachment/replacement, explicit Visualiser opening and inspectable historical identity/Creation Brief. Source snapshots remain separate from current project ingredients.
- Reused Visualiser's one player/analyser through a narrow audio bridge and session ID associations. Shared imported audio creates no duplicate URL; last-link release and replacement revoke URLs once. Historical Mood selects the existing personality engine; absent captured Mood uses Classic. Files/URLs remain unpersisted and reload requires truthful reattachment.
- Added 20 focused model/persistence/URL regressions; all 148 tests, TypeScript/Vite build and diff whitespace checks pass. Headless Edge (including final production preview) verified two evolving identities, historical briefs, metadata edits, alternating Mood playback, three modes, shared-source ownership, reload/mismatch/reattach/replace, deletion preservation and denied-storage playback. Reviewed 1280/390/320 px; final warning/error logs empty. Added an inline favicon to resolve the observed browser 404.
- Updated project status, decisions and roadmap. Compare, final navigation, audio byte persistence and provider APIs remain deferred; no GitHub publication.

## v2.0 Stage 1 follow-up — Real MP3 validation (2026-10-05)

- Imported `test-song.mp3` (4.60 MB, `audio/mpeg`, 4:51) through the Visualiser and played through 2:07. Spectrum, Waveform, and Radial all responded to the real recording; pause held the last view and zeroed the meters, and resume restored analysis. The sample was manually selected in the browser after the automation connection was reset.
- Re-ran `npm test` (128 passing), `npm run build`, and `git diff --check`; all passed. No application code or audio architecture changed.

## v2.0 Stage 1 — Compose (`2.0.0-stage.1`, 2026-10-05)

- Added a versioned local StudioProject model, isolated source snapshots, and dedicated `sonic-studio.projects.v1` persistence with active-project reopen, invalid-record isolation, and storage-denial recovery.
- Added the compact Studio composition panel with project create/open/rename/notes, source summaries, removal and inline confirmed deletion. Genre Mixer, Vocal Persona and Mood Mapper expose explicit use/replace callbacks while retaining their editing/persistence ownership.
- Added deterministic Creation Brief composition with Genre foundation, independent Vocal performance, subordinate Mood production treatment, partial outputs and combined-prompt copy. Notes stay separate. Updated version labels and package metadata; JSON import attributes let Node tests reuse the real genre registry without duplicating catalogue assembly.
- Fixed an existing Genre Mixer compatibility-badge overflow at 320 px by allowing the heading row to wrap; source models and relationship behaviour are unchanged.
- Verified 128 passing tests (16 new), TypeScript/Vite build and `git diff --check`. Edge verified source-edit isolation, explicit replacement, saved-persona capture, preset survival, reload/rename/open equivalence, neighbouring project preservation on delete, exact clipboard readback, and 1280/390/320 px layout. Temporary StrictMode storage-denial/generated-WAV fixture verified session composition, playback, all three modes, live Mood personality and navigation; final application warning/error logs were empty.
- Tracks, A/B comparison, final Studio navigation and remaining v2.0 stages stay deferred. No backend/API/cloud or playback-architecture change; no GitHub publication.

## v1.9 — Reactive Personality (2026-10-04)

- Added pure `VisualPersonality` derivation from existing Mood DNA: energy → expansion, tension → stroke/detail, atmosphere → glow, motion → visual response time, weight → bass pulse, valence → palette. Classic preserves v1.7 defaults; no new saved schema or project entity.
- Spectrum, Waveform, and Radial consume the same configuration boundary. Existing raw buffers and metrics stay authoritative; one RAF updates reusable visual envelope refs. Musical configuration modifies signal expression without inventing motion during silence or changing playback/analysis ownership.
- Mood Mapper publishes its derived fingerprint through a read-only App handoff. Visualiser shows source/mapping diagnostics and allows Current mood, Classic, and contrasting read-only Dreamlike/Aggressive catalogue previews during playback. Package and visible version labels are 1.9.0.
- Verified 112 passing tests (eight new derivation/geometry/response regressions), TypeScript/Vite build, and `git diff --check`. Edge controlled comparisons showed personality differences in all three modes using the same composite audio, and distinct bass/treble output with one personality. Track, progress, one graph/source, and one RAF survived personality switching. Pause/navigation/return, reduced motion, live Mood Mapper handoff, and 1280/390/320 px layout passed; warning/error logs were empty. Generated WAV Files and browser instrumentation stayed outside the repository.
- Genre mapping, project/preset persistence, creation briefs, experiment capture, A/B comparison, and DPR-only display-change handling remain deferred. No v2.0 work or GitHub publication.

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

## UI/UX Overhaul Phase A + B — Edge acceptance follow-up (`2.0.0`, 2026-10-05)

- Reviewed the integrated shell in the user's Edge tab. Create, Tracks, Compare and Visualise rendered; the active project selector and workflow stepper remained visible, including the final stepper-persistence behavior on Tracks and Compare. Returned the app to Create without editing the existing project.
- `npm test` (192 passing), `npm run build` and `git diff --check` pass. Narrow 390/320 px review, Edge console logs, local audio selection/playback, and screenshot-to-reference review are still open. The import control received focus, but its native file chooser did not surface; no file or project data was changed. Phase A/B remain uncommitted; Phase C/D have not started.

## UI/UX Overhaul Phase B — Local playback smoke check (`2.0.0`, 2026-10-05)

- In Edge, selected `test-song.mp3` in the Visualise session, confirmed playback advanced and live analyser levels became non-zero, then paused and removed the temporary session entries. The existing active project and its records were unchanged.
- Edge's current automation path still cannot set an exact responsive viewport. 390/320 px, console-log, and screenshot-to-reference checks remain open.
