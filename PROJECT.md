# Sonic Studio — Project Status

**Status:** SonicStudio v2.0 remains the released baseline (`2.0.0`); Phase A/B shell acceptance is verified and committed locally on `main`, not pushed to canonical GitHub `main` · **Next objective:** begin Phase C — Creative Modules after this commit review; full reference fidelity remains later-phase work · **Last reviewed:** 2026-10-05
**Source of intent:** [Sonic Studio — Blueprint](https://app.notion.com/p/Sonic-Studio-Blueprint-3ef6c060aacf8152a6fcf5564b5aa69b#0891614faacc4a5491dec934fcfeff2e)  
**Status authority:** The GitHub `main` branch is the canonical committed project record. This file records implemented state and verification within that repository; the Notion blueprint defines product intent. Reconcile any scope change here before work begins.

**Latest change record:** [CHANGELOG.md](CHANGELOG.md)

## Goal

Build four independently useful music tools, then connect them in v2.0 into one creation and listening workflow. Genre Mixer creates weighted musical recipes; Vocal Persona Lab creates reusable singers independent of genre; Mood Mapper turns weighted emotional choices into a seven-dimensional fingerprint; Visualiser plays local audio with responsive visuals. v2.0 brings those tools together with track comparison. A stage advances only after its stated proof works, not when its UI merely exists.

## Current release — SonicStudio v2.0

**Workflow:** Create → Tracks → Compare → Visualise. Create contains Identity & Brief plus the existing Genre Mixer, Vocal Persona and Mood Mapper editors. Tracks manages historical results and session attachments. Compare manages project-contained listening experiments and offers explicit A/B handoffs into Visualise, with a session-only return path. All destinations show the active project, counts and ingredient completeness. Missing ingredients stay missing; standalone tools and local Visualise import remain available without a project.

**Architecture:** `App` mounts `StudioShell`. `useStudioProjects` controls the existing local project envelope. The shell coordinates workflow state, explicit ingredient actions, session track/source associations and historical handoffs. Existing editors retain domain ownership; StudioProject owns current identity, ProjectTrack owns immutable creation identity, TrackComparison owns saved human observations, and Visualiser owns media, analysis and rendering. Editors and the Visualiser remain mounted across navigation; track/comparison drafts remain mounted for their active project. Changing projects pauses playback and clears the historical listening handoff.

**Audio and persistence:** Compare and Visualise are the two listening destinations; moving to Create or Tracks pauses through PlaybackIntent. Compare presents the existing player compactly, so same-second switching, seek and duration clamping remain available without a second audio system. Historical personality requires an explicit track handoff; selecting standalone session audio clears that context. SessionAudio remains the sole URL owner, shared-source associations remain session-only, and no audio bytes, routes or return history enter localStorage. `sonic-studio.projects.v1` and all independent library keys/schemas are unchanged. Stage 1/2/3 projects reopen without migration or reset.

**Release gate:** 187 tests pass (179 existing plus 8 targeted navigation/handoff/compatibility tests); TypeScript/Vite production build and `git diff --check` pass. Production-preview Edge acceptance starts without a project, captures Genre/Vocal/Mood identity A, copies the combined brief, proves tool edits cannot mutate it, imports Track A, explicitly evolves all ingredients to B, imports Track B and proves both historical identities. It saves all six observations, A/B/null/final B preference and conclusion, switches repeatedly near the same second, clamps against the shorter duration, opens B in Visualise, exercises all modes/seek/pause/resume and returns to the same comparison draft. Reload retains current identity, notes, both histories and comparison fields while truthfully requiring audio reattachment. Reattachment restores playback without changing provenance. Cancelled/confirmed dependent removal retains/removes the expected comparison; unrelated records survive.

**Regression and lifecycle proof:** Recipe/persona/mood libraries save, reopen and survive reload; project rename/create/delete/open and comparison delete retain unrelated data. Shared session sources allocate no duplicate URL; removing the final link and standalone removal revoke each URL exactly once (3 created / 3 distinct revoked). One HTML audio element, one AudioContext/media source and maximum one Visualiser RAF remain across navigation, switching and reattachment. Held AudioContext resume cannot restart playback after editing navigation; paused state reaches zero RAF. Development StrictMode separately passed ingredient removal/reattachment, mismatched-file rejection and deliberate Replace Audio without changing provenance; repeated navigation retained one live resize observer/listener and exact cleanup. Keyboard navigation, reduced motion, denied-storage composition/Classic playback, responsive surfaces at 1280/390/320 px, screenshot review and empty console warning/error logs pass. The detailed local evidence is in `docs/RELEASE_VERIFICATION.md`.

**Known limitations / deferred:** Audio is session-only and metadata matching is not cryptographic file identity. Brief prose regenerates from the current engines/catalogue. Comparison position is elapsed seconds, not aligned musical sections or normalized loudness; very short remaining sections can end immediately. Device/codec/long-duration coverage remains limited to prior MP3 proof and controlled WAV release checks. Cross-tab merge and export recovery remain absent. Provider APIs, automatic generation, accounts/backend/cloud sync, remote audio, mastering/transcoding, scoring/AI judging, ABX and dual playback remain post-v2 possibilities requiring separate scope. No push or deployment is included.

## Post-v2 UI/UX Overhaul — Phase A: Interaction Core

**Status:** Complete; internal interaction milestone, package version remains `2.0.0`.

**Interaction contract:** Generic project-track selection is session-only and scoped to the active project ID. It is separate from Compare's A/B selection, standalone session audio selection, and historical `openedTrackId` listening context. Invalid or deleted selections clear safely. Major destination changes focus the destination heading; explicit Compare attachment handoffs retain `focusTrack()` behavior and focus that track's file control. Hidden destinations continue to use the native `hidden` state.

**Edit, feedback and keyboard semantics:** Project/track metadata changes persist immediately and report storage denial as session-only with reload-loss messaging. Track metadata and Compare observation forms expose explicit local dirty state; saved presets keep their existing domain-specific rules. Reusable `StatusNotice` covers success, warning, error and empty feedback with polite live status or assertive error semantics. No global shortcuts exist; any future handler must ignore editable targets and leave native editing shortcuts intact. Normal Tab and button semantics remain native.

**Undo boundary:** No global Studio mutation is undoable in Phase A. Browser fields retain native undo/redo, and destructive persisted changes keep explicit confirmation. A future Studio undo proposal should be limited to explicitly reversible session actions or concrete timeline edits and must not include domain persistence by default.

**Verification:** `npm test` passes 192 tests (187 existing + 5 interaction tests); `npm run build` passes. Browser verification covers navigation/focus, switching between two projects, track selection/deletion, Compare handoff/playback, native field undo, and 1280/390/320 px overflow checks. Chrome project-storage write denial was injected during a temporary project create/delete; both operations stayed in memory and displayed the session-only/reload-loss message. Storage behavior was restored and no project remains. Automated storage tests cover denied storage-property access. Browser console warning/error logs were empty. Full reference fidelity belongs to later milestones.

**Next milestone:** Phase A/B acceptance is complete in the integrated shell. Phase C begins after commit review; Phase D and the one-to-one reference-fidelity gate remain later work.

## Post-v2 UI/UX Overhaul — Phase B: Shell

**Status:** Integrated and committed locally on `main` on 2026-10-05; not pushed to canonical GitHub `main`. Package version remains `2.0.0`.

**Shell structure:** Added a persistent top bar with the existing active-project controller, persistent Create / Tracks / Compare / Visualise navigation, a separate Genre Mixer / Vocal Persona / Mood Mapper / Visualiser / Export workflow stepper, a stable central workspace, and a right context-rail layout slot. Export remains deferred; the context rail contains only structural placeholder copy. Project navigation remains session state and does not add a storage key or alter `sonic-studio.projects.v1`.

**Boundaries:** Studio shell parts present navigation intent and read project context. Genre, Vocal, Mood, project, comparison, session-audio and Visualiser owners remain unchanged. Phase A selection state is wired through its session-only, project-scoped helpers. Phase B stays in modular shell components and layout styles.

**Verification:** `npm test` passes 192 tests; `npm run build` and `git diff --check` pass. The integrated app was reviewed in the user's Edge tab at its available desktop viewport. Create, Tracks, Compare and Visualise rendered; the active project remained `Compose acceptance renamed`; and the creative workflow stepper stayed visible on Tracks and Compare, including its selected step on Visualise. Standalone audio verification selected `test-song.mp3`, confirmed playback advanced to 0:12 with non-zero analyser readings, paused playback, and removed the temporary session entries. In Chrome, standalone `test-song.mp3` loaded and briefly played with non-zero analyser readings; the file stayed session-only and was paused. Responsive checks at 390×844, 320×800 and 1672×941 CSS pixels passed with no page-wide horizontal overflow. Chrome warning/error logs were empty. Chrome project-storage write denial was injected during a temporary project create/delete; the app displayed the session-only/reload-loss message, no project remained, and normal storage behavior was restored. The empty-project shell and populated Visualise view were reviewed against the approved reference and Notion workflow. Phase B's foundation hierarchy and selected-step visibility are verified; the one-to-one reference composition is a later-phase fidelity gate, not a Phase B blocker.

**Integration result:** `StudioShell.tsx` and `studio.css` combine the Phase A interaction behavior with Phase B presentation; `StudioComposer.tsx` no longer duplicates project switching, which lives in the persistent top bar. The verified integration is committed locally; no push or deployment was performed.

## Previous milestone — v2.0 Stage 3: A/B Compare

**Goal:** Turn two historical project results into a deliberate saved experiment without adding a competing playback owner.

**Implemented state:** Each project contains versioned `TrackComparison` records referencing distinct existing track A/B IDs, six structured observations (vocal identity, atmosphere, arrangement, mix, improved, regressed), optional preferred A/B ID or null, a conclusion/free note, and timestamps. The current Studio composition surface supports create/open, explicit save/update, preference/clear, confirmed deletion, Play A / Play B / Switch / Pause, an active-side indicator, per-side audio availability and attachment-control links. Audio availability does not prevent comparison creation or note-taking. Track management remains available; no final navigation or independent-tool redesign is introduced.

**Persistence / references:** Schema 1 evolves additively within `sonic-studio.projects.v1`; Stage 2 projects without comparisons reopen with `comparisons: []`, and each comparison declares its own schema version 1. Parsing validates all text fields, distinct local track references and A/B/null preference; malformed, duplicate, unsupported or dangling comparisons are skipped independently. Unknown comparison/observation fields are stripped. Pairing and creation timestamp stay immutable on observation updates. Removing a referenced track is blocked at the model boundary until comparison deletion is explicitly authorized; the existing track confirmation names the dependency count and confirms the cascade. Unrelated comparisons survive, and comparison deletion never removes either track. Project deletion still removes the entire contained graph.

**Factual provenance:** `provenanceDifference.ts` compares the two track creation snapshots rather than the project's current identity. It distinguishes captured ingredient presence, ordered Genre/Mood source changes, weight-only changes, origin labels/source IDs, and Vocal selection/description changes. It reports unchanged dimensions explicitly, with A/B source summaries and numerical Vocal controls. It never scores quality or infers a preferred version. Large historical Creation Briefs remain in their existing collapsible track view. Current-project edits and track metadata edits do not rewrite observations or historical source identity; title/version/source labels shown in Compare follow the referenced track's current descriptive metadata.

**Playback ownership / position:** Compact comparison controls call generic play/pause methods on the existing Visualiser bridge. App selects the historical record and session source together; Visualiser still owns one audio element, one analyser graph, PlaybackIntent and one guarded RAF. Switching synchronously unloads/loads that element in the user gesture, then starts the existing intent owner; React's selection effect recognizes an already-loaded source and cannot cancel its new startup. `TrackSeek` owns only a pending local-source position, retains the desired second during rapid metadata-pending switches, waits for a finite duration and applies once, clamped between zero and 50 ms before the next track's end. Pause/navigation/removal/unmount/manual seek cancel pending handoffs. Normal same-side Play resumes current position; an ended same-side source follows browser restart behavior. A very short remaining section may naturally end immediately after a clamped switch. This is approximate clock-position comparison, not waveform alignment or loudness matching.

**Visual personality / audio:** Each Play/Switch explicitly restores that side's captured Mood through the established historical path, including Classic for no captured Mood. Current project Mood remains independent. Session source associations and URL ownership remain unchanged: comparisons create no audio URLs or graph, and reload needs normal reattachment. A comparison never contains File/URL/audio analysis state.

**Gate:** `npm test`: 179 passing (148 existing + 25 comparison/provenance/reference tests + 6 seek tests); TypeScript/Vite build and `git diff --check`: passing. Production-preview headless Edge created distinct A/B historical tracks, prevented A/A, displayed Genre/Vocal/Mood differences, played both actual WAV sources, preserved a 4-second switch and clamped a 15-second position against a 10-second track. Repeated switching and a deliberately held AudioContext resume across rapid switches/navigation/return retained one media element, one context/source and a maximum of one outstanding Visualiser RAF, with zero RAF on pause. Both side names and all six mapped personality axes matched captured Serene/Aggressive profiles after current project replacement with a third Genre/Vocal/Mood identity. Six observations, conclusion and A/B/null preferences saved; current-identity and track metadata edits left comparisons/briefs unchanged. Reload retained comparison data and truthfully disabled unavailable playback; attachment-control focus and reattachment restored audio without changing observations. Comparison deletion retained both tracks; cancelled/confirmed dependency removal respectively retained or removed the dependent comparison without dangling references. Throwing-storage acquisition still supported temporary no-audio observations and Classic playback with reload-loss feedback. Layout/screenshots at 1280/390/320 px passed with no horizontal overflow, and final console warning/error logs were empty. Browser fixtures, generated WAVs and screenshots remain outside deliverables.

**Known limitations / deferred:** Browser-local comparison history has no cross-tab merge, export recovery or byte-level audio identity; audio bytes remain session-only. A comparison references track records and does not freeze their editable title/version or subsequently replaced audio bytes; new musical results should be new track records. Positions compare elapsed seconds rather than aligned musical sections; encoded-format/device coverage remains the prior limitation. Historical prose still uses the current catalogue/engine. Synchronized dual playback, ABX, automatic loudness matching, scores/AI judging, similarity analysis, provider/cloud/backend services, export/sharing, mastering and transcoding are outside Stage 3. Stage 4 final navigation and release polish have not begun. No GitHub publication is included in this task.

## Previous milestone — v2.0 Stage 2: Project Tracks

**Goal:** Keep each musical result's creation identity while the project evolves, and play session audio through the existing Visualiser.

**Implemented state:** Projects contain multiple versioned `ProjectTrack` records with stable ID, title, separate free-text version, controlled source (`local`, `generated`, `downloaded`, `recorded`, `external`), optional source detail, notes, timestamps, nullable filename/type/size metadata, and cloned Genre/Vocal/Mood `creationSnapshot`. Add, edit, confirmed removal, attach/detach, reattach, deliberate Replace Audio, historical identity inspection and copyable regenerated track Creation Brief are available in the active project. Current project identity and track creation identity are explicitly distinguished; an earlier identity is expected provenance. Existing imported Visualiser files can be reused without creating another object URL.

**Persistence / migration:** The existing schema 1 project envelope/key is extended additively. Stage 1 records without tracks open with `tracks: []`; each new track declares `schemaVersion: 1`. Invalid/duplicate tracks are skipped within their parent without hiding valid siblings. Writers strip unknown fields throughout the track, file and identity structures. No File, Blob, object URL, rendered brief or playback state is persisted. Storage denial keeps track management and audio usable in memory with a reload-loss warning.

**Audio ownership:** App keeps only session project-track-ID → local-track-ID associations. Visualiser's imperative audio bridge imports, selects and removes sources in its existing library. `SessionAudio` owns the local-track-ID → object-URL map and revokes URLs once on last linked attachment release, replacement, local removal or unmount. Reusing a session file shares its source; removing one project link retains another linked record's source. After reload records retain metadata/provenance and explicitly report audio unavailable. Reattachment requires matching filename/type/size; Replace Audio deliberately accepts different metadata without changing creation identity. The existing single audio element, PlaybackIntent, analyser graph, canvas RAF, seek/navigation and reduced-motion machinery retain ownership.

**Visualiser integration:** Explicit Open in Visualiser selects attached audio and the chosen historical track. Its captured Mood feeds the existing Mood DNA → VisualPersonality boundary, even when another record shares the same audio source; no captured Mood gives Classic. Opening restores the captured personality after a previous preview selection. Playback never updates current project ingredients or track snapshots. Independent Visualiser audio still uses its current-Mood/Classic/previews flow.

**Gate:** `npm test`: 148 passing (128 existing + 20 Stage 2 tests); TypeScript/Vite build and `git diff --check`: passing. Headless Edge on the development server and final production preview exercised real UI actions for project A/A/A capture, Track A metadata edits/audio playback, explicit project replacement to B/B/B, immutable Track A/historical brief, Track B capture, alternating captured Serene/Aggressive playback, all three visual modes, independent-track preview retention and unchanged stored identity after playback. Shared-source records used distinct historical Mood identities without additional URLs; removing the shared record preserved Track A. Reload retained both records, cleared live audio, rejected mismatched reattachment, and allowed matching reattachment and explicit replacement. Track A deletion retained Track B and all current project ingredients. A throwing localStorage getter still allowed temporary track creation, Classic playback and visible reload-loss feedback. URL instrumentation after reload counted two creations/two distinct revocations and one context/one media source across playback/replacement/removal. Responsive screenshots and overflow checks covered 1280/390/320 px. Final application warning/error logs were empty; an inline favicon resolves the observed missing-icon 404. Verification scripts, generated 20-second WAV signals and screenshots stayed outside the repository.

**Limitations / deferred:** Audio bytes are session-only; metadata matching is a practical check rather than cryptographic file identity. Codec/device/long-duration coverage remains limited; Stage 2 browser proof used generated WAVs, with prior real MP3 validation retained below. Brief wording derives from the current catalogue/engine release, so exact source identity is preserved rather than archived historical prose. Session URLs are shared only while the source exists; removing audio in Visualiser marks linked project records unavailable. Cross-tab synchronization, recovery/export, source URLs, provider integrations, backends, cloud stores, IndexedDB, analysis/transcoding/mastering and waveform caches remain outside this stage. A/B comparison, scoring, observations, winner selection and final Create / Tracks / Compare / Visualise navigation have not begun. No GitHub publication is included in this local task.

## Previous milestone — v2.0 Stage 1: Compose

**Goal:** Capture a stable musical identity from the independent tools and regenerate one coherent Creation Brief after reopening.

**Implemented state:** `src/lib/studioProject.ts` defines a version 1 project with stable ID, name, notes, created/updated timestamps, and nullable Genre/Vocal/Mood source snapshots. Genre captures ordered catalogue IDs and exact weights; Vocal captures copied selections, saved-persona ID/name/description when opened (or an explicitly labelled current builder); Mood captures one to three weighted source IDs. Origin labels and optional source IDs explain provenance without live references. Tool edits remain local; only explicit use/replace actions update the project. A compact composition surface supports create/open, explicit rename, notes, ingredient removal, confirmed deletion, source summaries, and a collapsible Creation Brief.

**Persistence:** Dedicated `sonic-studio.projects.v1` key with `{ schemaVersion: 1, projects, activeId }`; every project also declares schema version 1. Unsupported envelopes fail closed; invalid/duplicate records are skipped independently; unknown fields are stripped. Existing preset/persona/experiment keys and schemas are unchanged. Denied storage still allows session-only composition and visibly warns that reload will lose changes.

**Creation Brief:** Pure `creationBrief.ts` rebuilds identity summary, structured Genre/Vocal/Mood sections, and a copyable combined prompt. Genre owns tempo, instruments, harmonic centre and source roles; Mood biases position within Genre's tempo range and modifies dynamics, low-end emphasis, density, space, texture and arrangement. Vocal selections regenerate the existing performance guidance; mood phrasing explicitly preserves singer register, texture, delivery, power and effects. Notes remain separate from the generated prompt. Partial and empty projects are supported.

**Gate:** `npm test` passes 128 tests (112 existing plus 16 project/composition regressions); TypeScript/Vite build and `git diff --check` pass. Edge acceptance created/named a project, entered notes, attached Genre + saved Vocal + current Mood, and showed all three sources. Editing each originating tool kept the captured brief identical until explicit replacement; replacements in all three tools changed the captured identity. Rename, open/reload equivalence, empty-project deletion with a valid neighbour retained, and exact clipboard readback passed. Recipe, Persona and Mood preset libraries survived reload. A temporary StrictMode fixture with a throwing localStorage getter mounted and composed all ingredients with session-only feedback; generated 20-second 110 Hz WAV playback, Spectrum/Waveform/Radial, pause and navigation/return worked, including the current-mood visual personality. A user-selected 4.60 MB `test-song.mp3` also imported in Edge as `audio/mpeg` (4:51); playback advanced to 2:07, all three visual modes responded, and pause/resume held the canvas and restarted analysis. Responsive review covered 1280/390/320 px with no horizontal overflow; final application warning/error logs were empty in the controlled fixture. The temporary fixture is removed from deliverables. Browser clipboard reads were compared after their async completion, using exact textContent rather than rendered-text normalization.

**Limitations / deferred:** Source snapshots are independent of later tool edits, but catalogue/engine changes in a future release can change regenerated wording; no old-engine migration or catalogue archive is introduced. Vocal project guidance regenerates from copied selections rather than storing captured Voice DNA prose; saved Persona behaviour remains unchanged. Browser-local storage is device/origin specific, with no cross-tab synchronization or recovery after confirmed deletion. One external MP3 has now been checked alongside generated WAV signals; broader codec, device, and long-duration coverage remains open. Full v2.0 remains incomplete: Tracks/audio attachment/history, source URLs, generation records, A/B comparison, Compare/final navigation, APIs, cloud/backend/accounts, and visual preset persistence are deferred. Stage 1 does not publish to GitHub.

## Previous milestone — Reactive Personality v1.9

**Goal:** Keep live audio primary while a declarative visual personality makes the existing three modes respond to chosen musical characteristics.

**Implemented state:** `visualPersonality.ts` derives a small typed renderer configuration from existing 0–100 Mood DNA. Energy controls expansion (0.55–1.70×); tension controls line weight (0.65–1.75×) and spectral detail (45–100%); atmosphere controls waveform glow (2–18); motion controls the visual bass/treble response time (220–0 ms); weight controls bass-driven expansion (0–70%); valence controls signal/fill hue (15–170°). Non-finite/missing axes use neutral 50; finite extremes clamp to 0–100. With no source or Classic selected, the original colours, geometry, glow, and immediate response remain the default. Intimacy is not mapped; Genre and Vocal identity are unchanged.

Mood Mapper retains all source selections and publishes only its current derived fingerprint through a minimal read-only App handoff. Visualiser chooses Current mood, Classic, or two existing catalogue previews (Dreamlike/Aggressive); previews do not edit the blend. Its compact diagnostic shows source axes and resulting dimensions. The renderer knows only `VisualPersonality`, raw buffers, and visual bass/high envelopes. The existing RAF owns time-based response in a ref; silence immediately clears those envelopes. Spectral detail never creates energy in a silent bin. Audio analysis, PlaybackIntent, graph/URL ownership, session tracks, and persistence schemas are unchanged.

**Gate:** 112 tests pass (104 existing plus eight personality regressions), TypeScript/Vite build passes, and `git diff --check` passes. Controlled Edge review used generated 180-second PCM WAV Files through the existing importer in a temporary external StrictMode fixture. With the identical three-tone composite, Dreamlike (0.85× expansion, 0.87× line weight, 185 ms response) and Aggressive (1.67×, 1.60×, 9 ms) visibly changed Spectrum height, Waveform displacement/stroke/glow, and Radial expansion. Personality switching kept the selected object URL and advancing playback time; one context, one media source, and a maximum of one outstanding Visualiser RAF remained throughout. With Dreamlike fixed, 80 Hz bass and 6 kHz treble gave different frequency positions/shapes and waveform density; the composite is a controlled proxy, not an external music recording. Pause held the measured frame with RAF zero; navigation suspended the context and return resumed the same track/graph. Reduced-motion preference remained active with drawing at or below eight updates per second. Current Mood read the selected Dreamlike fingerprint and a Dreamlike 1 / Aggressive 50 blend (Energy 96, Tension 85, Atmosphere 21, Motion 94, Weight 93, Valence 20). A held resume released after navigation settled suspended with zero RAFs; returning reused the same graph. Real unmount closed the context, left zero RAFs, and revoked all three URLs. Responsive review at 1280/390/320 px and console checks passed. Native picker automation remained unavailable; no browser permission change was needed.

**Limitations / deferred:** Motion smooths visual modulation envelopes rather than changing analyser smoothing or adding autonomous animation. Colour is descriptive, not a claim of perceptual mood calibration. Genre-to-personality mappings, visual editing/persistence, project entities, captured experiments, A/B comparison, and combined creation briefs are deferred to v2.0 scope decisions. DPR-only display-change handling remains deferred. No v2.0 implementation was started; these changes are local and publication is outside this task.

## Previous milestone — Playback Stabilisation v1.7.1

**Goal:** Prevent obsolete playback startup from overriding current intent, reconcile navigation with pending Web Audio operations, and keep the studio usable when browser storage access is denied. Preserve the v1.7 architecture and scope.

**Implemented state:** A small `PlaybackIntent` owner coordinates request tokens, pending Play cancellation, and context activity. Obsolete media-start continuations return without changing playback or UI. Context settlements independently reconcile current intent, including a resume completing after navigation and a suspend completing after a newer Play. Pause, selection, selected removal, navigation, and unmount invalidate startup synchronously; queued media events observe the current media state and intent. Paused/inactive playback now suspends the same graph; canvas pause behaviour remains unchanged. Graph creation/disposal, URL ownership, buffers, rendering, and the guarded RAF remain in their existing owners. A shared browser-storage acquisition guard protects Genre, Persona, vocal-experiment, and Mood preset initialization without changing schemas or persistence writers.

**Gate:** `npm test` passes 104 tests (91 existing plus 13 lifecycle/storage regressions); `npm run build` passes TypeScript and Vite; `git diff --check` passes. In Edge, a temporary external verification fixture loaded the actual App under StrictMode, generated three PCM WAV File objects through the existing importer, and exposed real context/source/RAF/URL counts. Repeated rapid playback and immediate double-click cancellation passed. Holding startup while pausing/replaying, navigating/returning, switching tracks, and removing the selected track left the latest intent authoritative. Navigation settled to suspended after held resume release; return resumed analysis. React unmount during held startup closed the context, revoked all URLs, and left zero RAFs. One context/source graph remained reused throughout; the maximum outstanding Visualiser RAF was one. Spectrum, Waveform, Radial, seek-to-end/backward seek, idle metrics, and reduced-motion preference changes worked. A throwing storage property still allowed mounting and live Genre/Vocal/Mood edits; save attempts failed gracefully. Browser warning/error logs were empty. Native file-picker automation was unavailable without an extension permission change, so browser import verification used in-browser generated Files rather than the OS picker. No v1.9/v2.0 behaviour was added; publication to GitHub is outside this local milestone task.

## Previous milestone — Visual Modes v1.7

**Goal:** Render spectrum bars, waveform, and radial spectrum from the existing v1.6 analysis buffers without taking ownership of audio processing.

**Implemented state:** One canvas and the existing Visualiser animation loop render all three modes from the same reusable Float32 waveform and Uint8 spectrum buffers. React stores the selected mode and publishes only four diagnostic readings about every 65 ms. Spectrum uses 48 logarithmic bands, waveform maps samples directly to a centred line, and radial uses 80 clockwise spectral bands. ResizeObserver updates the canvas backing dimensions for device-pixel ratio changes. Mode switches keep the player, analyser graph, track, and progress intact. Pause retains the last frame; track changes, end, and decode errors return the canvas to an idle line. Reduced-motion preference lowers drawing to at most eight updates per second.

**Gate:** In Edge, generated local PCM WAVs verified silence (all meters 0.000), 80 Hz bass (amplitude 0.384, low 0.556, mid 0.001, high 0.000), 6 kHz treble (amplitude 0.389, low/mid 0.000, high 0.094), and a three-tone 110/440/3,200 Hz composite (amplitude 0.189, low 0.480, mid 0.158, high 0.065). The composite is a controlled broad-spectrum proxy; no external user music file was tested. Spectrum, waveform, and radial were visually reviewed while the composite played. Mode switching and switching tracks during playback kept playback live and the graph count at one. Forward seek, backward seek, pause/resume with zeroed meters, natural end, selected-track removal with fallback, and leaving/returning to Visualiser worked. At 320 px and 390 px there was no horizontal overflow; at DPR 2, the 262×238 CSS canvas used a 524×476 backing bitmap. Reduced-motion preference was observed while playback remained functional. Browser console/page errors were empty. `npm test` passes 91 tests; `npm run build` passes TypeScript and Vite; `git diff --check` passes. WAV was used; decoding other accepted formats remains browser-dependent.

## Previous milestone — Audio Analysis v1.6

**Goal:** Read truthful waveform, spectrum, RMS amplitude, and low/mid/high frequency energy from the v1.5 local player, without building visual modes.

**Verified state:** A lazily created Web Audio graph routes the one HTML audio element through one analyser to the destination. It keeps reusable Float32 time-domain and Uint8 frequency buffers outside React; a single animation loop updates only four diagnostic meter values at roughly 15 Hz. Selection and switching retain one graph, while pause/end/removal zero the meters. Leaving the Visualiser pauses playback and suspends the context; actual unmount cancels frames, disconnects nodes, and closes the context. The v1.5 file metadata and URL lifecycle remain separate.

**Gate:** Four browser-imported 20-second WAV signals were checked. Silence read 0.000 on every meter. Quiet 80 Hz audio read about 0.085 amplitude / 0.429 low; louder 80 Hz about 0.53 / 0.59 low. A 6 kHz signal settled near 0.53 amplitude / 0.10 high, with low at zero. Play/pause, seeking forward and backward, end, switching during playback, active-track removal, and leaving/returning kept the graph count at one and zeroed idle meters. Waveform length was 2048 and spectrum length 1024. `npm test` passed 86 tests and `npm run build` passed (TypeScript and Vite). Manual signal proof used WAV; encoded-format decoder support remains browser-dependent. Physical speaker audibility was not captured by an external recorder, although playback ran and the graph connects to the destination.

## Previous milestone — Local Audio v1.5

**Goal:** Import multiple local audio files and reliably select, play, pause, seek, and switch tracks in a session-only Visualiser player.

**Verified state:** The independent Visualiser shows filename, type, size, selection, progress, and duration for the active track. A pure track library owns metadata and selection; one HTML audio element owns playback and timing. Object URLs are kept separately and revoked on removal or unmount. Files are never uploaded or permanently stored. Unsupported/empty files are skipped, and unreadable audio reports a playback error.

**Gate:** Browser-imported three WAV tracks with distinct 8/6/4-second durations; played, paused, sought while playing and paused, switched during playback, played each track, and removed a playing track with a paused fallback and reset timing. Invalid text was skipped; corrupt MP3 reported an error without crashing; reload cleared the session. `npm test` passes 81 tests and `npm run build` passes (TypeScript and Vite). Browser codec support varies; MP3, OGG, M4A/AAC are accepted when the browser reports support, but only WAV was manually played in this gate.

## Previous milestone — Mood Presets v1.3

**Goal:** Reopen reusable emotional setups from saved source moods and exact weights, regenerating every Mood Mapper output.

**Verified state:** A separate versioned local store holds preset ID, name, one to three mood IDs and integer weights, and timestamps. The Mood Mapper can save as new, open, explicitly update, and delete presets. Live edits show an unsaved indicator and leave the saved record unchanged until Update. Presets contain no Mood DNA, relationship result, interpretation, or production translation.

**Gate:** Browser-created Serene 70, Melancholic/Vulnerable 50/50, Serene/Menacing 50/50 and 90/10, and Serene/Dreamlike/Menacing 50/30/10. After a page reload, opening each reproduced the exact Fingerprint, relationship guidance, and production section text. Explicit update survived another reload; save-as and targeted delete left the original and live state intact. Malformed JSON did not crash the app; a mixed store retained its valid preset while skipping an invalid one. The preset panel had no horizontal overflow at 1280/900/390/320 px. `npm test` passes 77 tests and `npm run build` passes. Genre Mixer and Vocal Persona storage formats are unchanged.

**Blueprint mapping:** Implementation v1.3 fulfils the original blueprint's v1.4 Mood Presets stage. The Mood Mapper block is complete through that scope; no separate v1.4 implementation milestone is pending.

## Previous gate — Production Guidance View v1.2.2

**Goal:** Show live musical directions from Mood DNA in the independent Mood Mapper, beneath relationship guidance.

**Verified state:** The production section displays the translator's overall direction, up to three ranked priorities, all seven musical domains, compact dimension/value sources for every signal, and a label for combined directions. It is absent with no mood and updates from selections and weights without persistence. Relationship guidance remains separate and unchanged.

**Gate:** Browser review covered Serene, Aggressive, Dreamlike, Brooding/Haunting, Serene/Menacing at 50/50 and 90/10, and Dreamlike/Restless, plus selection cap, removal, reset, and responsive widths 1280/900/390/320 without overflow. A temporary browser harness verified rendered high-Energy/low-Motion guidance, then was removed; the catalogue has no selectable profile with that combination. `npm test` passes 71 tests and `npm run build` passes. No Sound DNA, Voice DNA, or storage changes.

## Previous gate — Mood-to-Music Translation Engine v1.2.1

**Goal:** Translate Mood DNA into deterministic, traceable musical production directions without changing genre or vocal identity.

**Verified state:** A pure translator maps the seven Mood DNA values into harmony, rhythm, dynamics, density, space, texture, and arrangement. Centralized five-region thresholds, seven interaction rules, per-domain signals, source values, ranked priorities, and a concise direction live in new data and library modules. It reads only Mood DNA dimensions and changes no source state, existing calculation, storage format, React view, Genre Mixer, or Vocal Persona.

**Gate:** Serene, Aggressive, Dreamlike, Brooding/Haunting, Serene/Menacing at 50/50 and 90/10, and Dreamlike/Restless were reviewed. Neutral values avoid strong claims; opposite dimensions retain separate signals. `npm test` passes 68 tests, including all Mood DNA, relationship, Genre Mixer, and Vocal Persona suites; `npm run build` passes. Weighted Mood DNA cannot reveal secondary source opposition once normalized; the existing relationship interpretation remains the source for that nuance in a later view.

## Previous gate — Mood Mapper Guidance View v1.1.3

The live relationship guidance, browser interaction, and responsive checks remain verified and unchanged; see the v1.1.3 changelog entry.

## Previous gate — Relationship Interpretation v1.1.2

The pure interpretation and eight-pair review remain verified and unchanged; see the v1.1.2 changelog entry.

## Previous gate — Mood Relationship Engine v1.1.1

The seven-axis observational relationship analysis remains verified and unchanged; see the v1.1.1 changelog entry.

## Previous gate — Mood Space Foundation v1.0

The independent 14-mood catalogue, weighted selection, seven-dimensional Mood DNA, and Emotional Fingerprint remain verified; see the v1.0 changelog entry.

## Previous gate — Vocal Prompt Output v0.9

The v0.9 prompt and saved-persona comparison gate remains verified; see its changelog entry and milestone history.

## Previous gate — Trait Relationships v0.8

**Goal:** Make vocal traits modify one another's interpretation, then explain the resulting voice coherently, including deliberately contradictory builds. All four v0.8 steps are verified.

**Existing state:** v0.7 stores reusable Persona records with stable selections and captured Voice DNA, independently of Genre Mixer. v0.8.1–v0.8.2 add a pure relationship report, resolutions, and whole-voice interpretation. v0.8.3 displays this guidance live and when reopening saved Personas; saved Voice DNA remains unchanged.

**Completed step — v0.8.4 Contradiction Proof:** The intimate, raspy, reverberant high-breath/high-power/high-warmth/high-rasp voice and two additional multi-tension voices have coherent, deterministic guidance. Persona storage, captured Voice DNA, and Genre Mixer remain independent.

**v0.8 gates:**

* [x] **v0.8.1 Relationship Model:** Curated pure data/functions classify reinforcing, complementary, contrasting, and conflicting relationships. Three distinct voices produce distinct reports, including explicit conflicts. `npm test` passed 27 tests and `npm run build` passed; selections and Voice DNA stayed unchanged.
* [x] **v0.8.2 pairwise resolution increment:** All six contrasting/conflicting rules return curated coexistence guidance. Airy/dry, assertive/low-power, and high-breath/high-power resolutions differ and repeat deterministically; `npm test` passes 29 tests and `npm run build` passes.
* [x] **v0.8.2 Modifier Logic:** A pure derived interpretation combines the relationship report into one strategy. High breathiness with high power becomes force softened by audible breath; a multi-tension voice links power, breath, rasp, warmth, and reverb without copying rule texts. `npm test` passes 32 tests and `npm run build` passes.
* [x] **v0.8.3 Guidance Output:** The Vocal Persona view shows dominant quality, performance strategy, supporting relationships, and creative tensions with resolutions. Browser checks covered airy/warm/intimate, forceful/raspy/assertive, and contradictory voices; saving, editing, reloading, and reopening preserved saved identity and guidance, and Genre Mixer weighting still worked. `npm test` passes 32 tests and `npm run build` passes.
* [x] **v0.8.4 Contradiction Proof:** Three awkward builds yield coherent dominant qualities, one strategy each, and practical tension resolutions. `npm test` passes 33 tests and `npm run build` passes. Browser review confirms the primary stress voice, saved Persona identity/DNA across edits and reload, and responsive Genre Mixer weighting.

**Gate:** v0.8.1–v0.8.4 are verified. v0.9 Vocal Prompt Output is next; no v0.9 implementation is included here.

## Roadmap and gates

|Version|Stage|Completion proof|
|-|-|-|
|v0.1|Genre Mixer: two-genre Mix + first Sound DNA|Create, edit, reset, and recreate a valid two-genre mix with deterministic merged traits.|
|v0.2|Musical DNA refinement|Structured musical roles, weighted lead/support relationships, and three human sanity mixes.|
|v0.3|Compatibility Logic|Seven deterministic relationship explanations, weighted dispute control, practical resolution, and review of contrasting and easy pairs.|
|v0.4|Saved Mixes|Save and reopen distinct mixes with exact source state; update, duplicate, delete, and tolerate invalid local data.|
|v0.5|Exportable Recipe|Reproduce structured prompts from saved mixes and copy/export them.|
|v0.6|Vocal Persona Builder|Two voices remain distinct with the same genre setting.|
|v0.7|Persona Identity|Reuse one saved persona across genres without changing its core identity.|
|v0.8|Trait Relationships|Curated relationships modify interpretation, explain dominance and resolution, and make awkward combinations coherent. Complete v0.8.1–v0.8.4 before advancing.|
|v0.9|Vocal Prompt Output|Build contrasting singers, compare them, and preserve identity across experiments.|
|v1.0|Mood Space Foundation|Up to three weighted curated moods deterministically produce seven-dimension Mood DNA and a summary in an independent view.|
|v1.1.1|Mood Relationship Engine|Pure dimension-by-dimension and influence-aware pair analysis; three-mood aggregate retains all pairs without changing Mood DNA.|
|v1.1.2|Relationship Interpretation|Derive whole-blend summaries, mood roles, shared qualities, creative tensions, and practical resolutions from the unchanged relationship analysis.|
|v1.1.3|Mood Mapper Guidance View|Present the derived relationship interpretation in Mood Mapper without changing source selections or Mood DNA.|
|v1.2|Musical Translation|Mood adds production guidance without overwriting Genre Mixer.|
|v1.2.1|Mood-to-Music Translation Engine|Pure Mood DNA translation yields traceable domains, priorities, and concise direction without UI or cross-tool integration.|
|v1.2.2|Production Guidance View|Present live musical directions in Mood Mapper while preserving Mood DNA and relationship guidance.|
|v1.3|Mood Presets|Persist source mood selections and weights as reusable presets, then regenerate Mood DNA, relationship guidance, and production guidance when reopened.|
|v1.5|Local Audio|Load and reliably control multiple local tracks.|
|v1.6|Audio Analysis|Debug meters distinguish silence, bass-heavy, and bright passages.|
|v1.7|Visual Modes|Bars, waveform, and radial modes share analysis without interrupting playback.|
|v1.9|Reactive Personality|Visuals respond to audio and selected project characteristics.|
|v2.0|Integrated Studio|From an empty project, compose an identity, optionally export it, import two tracks, compare them, and visualise the chosen track within that project.|

Complete each block independently before starting the next. v2.0 is integration rather than a new feature expansion.

## Product and technical boundaries

* Local-first data. No accounts before v2.0; no cloud sync during independent-tool stages; no backend unless local persistence proves insufficient.
* No required AI API or Suno integration. External generation remains optional; the studio must work with local files alone.
* Keep genre, vocal identity, and mood as distinct data until composition. Keep imported-track metadata separate from the audio engine, and visual rendering separate from audio analysis.
* Suggested starting stack from the blueprint: React, Vite, TypeScript, `localStorage`, Web Audio API, and small structured JSON libraries. This is a baseline, not an installed stack.
* Prioritise working behaviour over UI polish. Record unrelated ideas for a later milestone.

## Milestone history

|Date|Milestone|Status|Evidence / decision|
|-|-|-|-|
|2026-10-04|Planning|Complete|Blueprint reviewed; staged roadmap and guardrails recorded in this file.|
|2026-10-04|Genre Mixer v0.1|Verified|Twelve data profiles and all 66 pairs tested; `npm test` passed 3 tests; `npm run build` passed; browser source selection, 80/20 weighting, second-source change, and reset updated the displayed DNA.|
|2026-10-04|Genre Mixer v0.2|Verified|Structured characteristics for 12 genres; five tests pass across 66 pairs at three weights; build passes; three sanity mixes reviewed in code output and running UI.|
|2026-10-04|Genre Mixer v0.3|Verified|Twelve tests pass; all 66 pairs classified at 20/50/80; build passes; four review cases checked in code output and browser. Details in `docs/v0.3-change-record.md`.|
|2026-10-04|Genre Mixer v0.4|Verified|Fifteen tests pass; build passes; browser save/refresh/reopen/update/duplicate/delete flow checked with two mixes. Malformed/old data parser tests pass.|
|2026-10-04|Genre Mixer v0.5|Verified|Seventeen tests pass, including recipes for 66 pairs at three weights; build passes; browser verified two saved recipes, refresh/reopen, update/delete, regenerated text, and both clipboard outputs.|
|2026-10-04|Vocal Persona Builder v0.6|Verified|Twenty tests and build pass. Connected Edge browser confirms opposite Voice DNA descriptions and navigation retains in-progress state for both tools. Narrow viewport was not checked.|
|2026-10-04|Persona Identity v0.7 foundation|Verified; full gate open|Twenty-two tests and build pass. Browser creation of Ember captured exact airy/warm DNA with UUID; changing live controls left the record intact. Genre Mixer view checked. Persistence intentionally deferred.|
|2026-10-04|Persona Identity v0.7|Verified|Twenty-four tests and build pass. Browser save/reload/reopen of Ember preserved ID, metadata, traits, and numeric DNA; builder edits left the saved record unchanged. Genre Mixer weighting still updated its output.|
|2026-10-04|Trait Relationships v0.8.1|Verified; full v0.8 gate open|Twenty-seven tests and build pass. Three contrasting selection sets yielded reinforcing, complementary, contrasting, and conflicting reports; source selections and Voice DNA stayed unchanged. The earlier v0.8 completion claim covered only this first step.|
|2026-10-04|v0.8.2 pairwise resolution increment|Verified; full v0.8.2 gate open|Twenty-nine tests and build pass. Six tension rules now yield deterministic coexistence guidance, including distinct airy/dry, assertive/low-power, and high-breath/high-power resolutions. Voice DNA and saved records remain unchanged.|
|2026-10-04|v0.8.2 Modifier Logic|Verified; full v0.8 gate open|Thirty-two tests and build pass. Pure derived strategy combines high breath with high power; multi-tension voice produces linked guidance rather than copied rule texts. Voice DNA and Persona records remain unchanged; no UI output added.|
|2026-10-04|v0.8.3 Guidance Output|Verified; full v0.8 gate open|Thirty-two tests and build pass. Browser shows distinct guidance for three voices and a usable two-conflict resolution. Saved Persona create/edit/reload/reopen retains exact DNA and derives guidance from saved selections; Genre Mixer weighting still responds. Visual review confirms warm creative-tension styling.|
|2026-10-04|v0.8.4 Contradiction Proof|Verified; full v0.8 gate complete|Thirty-three tests and build pass. Primary six-quality stress voice and two other multi-tension voices have deterministic guidance; browser confirms the primary strategy and tension cards. Saved Persona ID, identity, selections, and captured DNA survive edits and reload; Genre Mixer output responds to 60/40→75/25 weighting.|
|2026-10-04|v0.9 Vocal Prompt Output|Verified|Thirty-eight tests and build pass. Browser creation of opposite Air and Stone Personas shows distinct concise/detailed prompts and an eight-trait comparison; both copy controls report success. Reload and reopen reproduce Stone's prompt and saved identity; experiment reference persists with Stone's ID. Genre Mixer weighting still updates DNA and recipe.|

|2026-10-04|v1.0 Mood Space Foundation|Verified|Fourteen moods, three weighted selections, seven-dimension Mood DNA and deterministic summary. `npm test` passes 44 tests and `npm run build` passes. Genre and Vocal regression suites pass.|

|2026-10-04|v1.1.1 Mood Relationship Engine|Verified|Pure seven-axis pair and weighted three-mood analysis; eight review combinations inspected. `npm test` passes 51 tests and `npm run build` passes. Mood DNA remains unchanged.|

|2026-10-04|v1.1.2 Relationship Interpretation|Verified|Eight pairs and two weight balances plus a three-mood stress blend reviewed. `npm test` passes 59 tests and `npm run build` passes. No UI or source-model changes.|
|2026-10-04|v1.1.3 Mood Mapper Guidance View|Verified|Live guidance reviewed across single, reinforcing, complementary, contrasting, conflicting, weighted, three-mood, and editorial stress cases. Browser interaction and four viewport widths checked; 59 tests and production build pass.|
|2026-10-04|v1.2.1 Mood-to-Music Translation Engine|Verified|Seven-domain pure translation and seven interaction rules reviewed across seven representative profiles; 68 tests and production build pass. No UI, existing engine, or storage changes.|
|2026-10-04|v1.2.2 Production Guidance View|Verified|Mood Mapper presents live direction, ranked priorities, seven domains, and per-signal sources beneath relationship guidance. Seven live profiles, a rendered synthetic contradiction, and 1280/900/390/320 px checks pass; 71 tests and production build pass.|
|2026-10-04|v1.3 Mood Presets|Verified|Five presets reproduced source weights and all derived Mood Mapper sections after reload. Update, save-as, delete, malformed storage, and 1280/900/390/320 px checks pass; 77 tests and production build pass.|

For each future milestone, update the status at the top, check off acceptance tests only after verification, and add one history row with the date, result, commands or manual checks, and any known gaps. Use the next stage's goal, existing state, allowed scope, and acceptance tests as the coding handoff.

## Parking lot

Stage 4 should define final Create / Tracks / Compare / Visualise navigation and release acceptance while retaining the single playback owner and local data model. Position switching is clock-based, so waveform/section alignment and loudness matching remain separate future scope decisions.

