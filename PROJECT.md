# Sonic Studio — Project Status

**Status:** Persona Identity v0.7 verified · **Current milestone:** Persona Identity v0.7 · **Last reviewed:** 2026-10-04
**Source of intent:** [Sonic Studio — Blueprint](https://app.notion.com/p/Sonic-Studio-Blueprint-3ef6c060aacf8152a6fcf5564b5aa69b#0891614faacc4a5491dec934fcfeff2e)  
**Status authority:** The GitHub `main` branch is the canonical committed project record. This file records implemented state and verification within that repository; the Notion blueprint defines product intent. Reconcile any scope change here before work begins.

**Latest change record:** [CHANGELOG.md](CHANGELOG.md)

## Goal

Build four independently useful music tools, then connect them in v2.0 into one creation and listening workflow. Genre Mixer creates weighted musical recipes; Vocal Persona Lab creates reusable singers independent of genre; Mood Mapper turns a visual position into musical direction; Visualiser plays local audio with responsive visuals. v2.0 brings those tools together with track comparison. A stage advances only after its stated proof works, not when its UI merely exists.

## Current milestone — Persona Identity v0.7

**Goal:** Save a named Vocal Persona locally and reopen its exact identity and Voice DNA after an application reload.

**Existing state:** Vocal Persona Builder v0.6 derives deterministic Voice DNA independently of Genre Mixer. The v0.7 foundation added a UUID, name, identity description, and snapshot of selections and DNA.

**Allowed scope:** A separate versioned localStorage persona library, safe reading of stored records, and reopening into the builder. Defer duplication, branching, genre pairing, prompt output, compatibility logic, import/export, and deletion.

**Acceptance tests:**

* [x] Ember saves locally with a stable UUID, identity metadata, selected vocal traits, and exact numeric and descriptive Voice DNA.
* [x] After application reload, the library contains Ember and opening her restores the builder controls and saved Voice DNA.
* [x] Editing the builder after opening does not alter the saved Ember record.
* [x] Empty, malformed, unsupported, duplicate, and invalid persona records are handled safely; Genre Mixer uses a separate key and still responds to weighting changes.
* [x] `npm test` passes 24 tests and `npm run build` passes; running-browser create/reload/reopen/edit checks pass.

**Gate:** v0.7 verified. The next planned stage is v0.8 Trait Relationships.

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
|v0.8|Trait Relationships|Contradictory traits produce guidance instead of incoherent prompts.|
|v0.9|Vocal Prompt Output|Build contrasting singers, compare them, and preserve identity across experiments.|
|v1.0|Mood Plane|Dark–Bright and Calm–Intense position persists and reproduces numeric values.|
|v1.1|Mood Dimensions|Opposite regions produce clearly different mood profiles.|
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

For each future milestone, update the status at the top, check off acceptance tests only after verification, and add one history row with the date, result, commands or manual checks, and any known gaps. Use the next stage's goal, existing state, allowed scope, and acceptance tests as the coding handoff.

## Parking lot

No unrelated issues or deferred proposals recorded yet.

