# Sonic Studio — Project Status

**Status:** v1.5 Local Audio verified; Visualiser Block 4 foundation complete · **Next milestone:** v1.6 Audio Analysis · **Last reviewed:** 2026-10-04
**Source of intent:** [Sonic Studio — Blueprint](https://app.notion.com/p/Sonic-Studio-Blueprint-3ef6c060aacf8152a6fcf5564b5aa69b#0891614faacc4a5491dec934fcfeff2e)  
**Status authority:** The GitHub `main` branch is the canonical committed project record. This file records implemented state and verification within that repository; the Notion blueprint defines product intent. Reconcile any scope change here before work begins.

**Latest change record:** [CHANGELOG.md](CHANGELOG.md)

## Goal

Build four independently useful music tools, then connect them in v2.0 into one creation and listening workflow. Genre Mixer creates weighted musical recipes; Vocal Persona Lab creates reusable singers independent of genre; Mood Mapper turns weighted emotional choices into a seven-dimensional fingerprint; Visualiser plays local audio with responsive visuals. v2.0 brings those tools together with track comparison. A stage advances only after its stated proof works, not when its UI merely exists.

## Current milestone — Local Audio v1.5

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

No unrelated issues or deferred proposals recorded yet.

