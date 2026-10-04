# Sonic Studio — Project Status

**Status:** Mood Space Foundation v1.0 verified · **Current milestone:** v1.1 mood refinement next · **Last reviewed:** 2026-10-04
**Source of intent:** [Sonic Studio — Blueprint](https://app.notion.com/p/Sonic-Studio-Blueprint-3ef6c060aacf8152a6fcf5564b5aa69b#0891614faacc4a5491dec934fcfeff2e)  
**Status authority:** The GitHub `main` branch is the canonical committed project record. This file records implemented state and verification within that repository; the Notion blueprint defines product intent. Reconcile any scope change here before work begins.

**Latest change record:** [CHANGELOG.md](CHANGELOG.md)

## Goal

Build four independently useful music tools, then connect them in v2.0 into one creation and listening workflow. Genre Mixer creates weighted musical recipes; Vocal Persona Lab creates reusable singers independent of genre; Mood Mapper turns weighted emotional choices into a seven-dimensional fingerprint; Visualiser plays local audio with responsive visuals. v2.0 brings those tools together with track comparison. A stage advances only after its stated proof works, not when its UI merely exists.

## Current milestone — Mood Space Foundation v1.0

**Goal:** Describe emotional identity independently through up to three weighted moods and seven derived dimensions.

**Verified state:** Fourteen curated moods each define Valence, Energy, Tension, Intimacy, Weight, Motion, and Atmosphere on a 0–100 scale. The new Mood Mapper view holds selected IDs and integer weights in local session state, derives Mood DNA and its dominant mood with pure functions, and shows a deterministic description and labelled Emotional Fingerprint. Genre Mixer and Vocal Persona do not enter the calculation; their saved formats are unchanged.

**Gate:** Select moods → adjust weights → see Mood DNA, all seven opposing labels, dominant mood, and summary update immediately. `npm test` passes 44 tests and `npm run build` passes. Browser interaction verified: two moods and weight change updated dominant mood and all seven values; a third selection disabled remaining choices; navigation to Vocal Persona worked. v1.1 can refine the emotional vocabulary and interpretation.

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
|v1.1|Mood Refinement|Refine the curated vocabulary and emotional interpretation based on v1.0 use, while keeping the seven-dimension source model.|
|v1.2|Musical Translation|Mood adds production guidance without overwriting Genre Mixer.|
|v1.4|Mood Presets|Saved presets reproduce recognisable musical guidance.|
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

For each future milestone, update the status at the top, check off acceptance tests only after verification, and add one history row with the date, result, commands or manual checks, and any known gaps. Use the next stage's goal, existing state, allowed scope, and acceptance tests as the coding handoff.

## Parking lot

No unrelated issues or deferred proposals recorded yet.

