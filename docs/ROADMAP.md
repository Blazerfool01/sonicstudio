# Roadmap

The current implemented state and gate results live in `PROJECT.md`. Planned work follows the independent-tool sequence in its roadmap table.

## Completed — Post-v2 UI/UX Overhaul Phases E/F

Phases E — Lightweight Timeline and F — Context Rail are integrated and coordinator-accepted in canonical `main` commit `752fadb535a72d1cb55d73cc7c55c63666c8724b`. E stores arrangement clips additively on the existing project envelope and sequences existing tracks through the single existing playback owner. F projects current or historical Studio context from its established owners. The Timeline occupies a workspace region within Tracks; the four product destinations and five creative steps remain as approved in Phase B. Verified local review corrections restore that placement and require explicit track-deletion confirmation for dependent clips and comparisons; they remain uncommitted. Their verification is recorded in `PROJECT.md`. Phase G remains deferred and requires its own scope review.

## Completed — Vocal Persona Builder v0.6

The builder and contrasting Voice DNA are verified in the running browser. Vocal identity stays separate from genre and mood data.

## Completed — Persona Identity v0.7

Personas can be saved locally and reopened with stable ID, metadata, selections, and captured Voice DNA. Genre remains outside the persona object.

## Completed — Trait Relationships v0.8

1. **v0.8.1 Relationship Model — verified.** Curated pure data and functions classify selected vocal combinations without changing the persona's source identity or Voice DNA.
2. **v0.8.2 Modifier Logic — verified.** Pairwise resolutions feed a separate pure interpretation that combines traits into one vocal strategy without changing saved Voice DNA.
3. **v0.8.3 Guidance Output — verified.** The Vocal Persona view now shows support, creative tension, dominance, strategy, and resolution live and for reopened saved selections.
4. **v0.8.4 Contradiction Proof — verified.** The high-breath/high-power/high-rasp intimate voice and two other multi-tension builds produce coherent, deterministic strategies and practical resolutions; saved Persona and Genre Mixer regression checks pass.

## Completed — Vocal Prompt Output v0.9

Live and saved voices generate concise and detailed generator-neutral prompts from Voice DNA and contextual interpretation. Saved singers can be compared side by side; external experiment references store the Persona ID separately from the Persona.

## Completed — Mood Space Foundation v1.0

The revised v1.0 scope uses up to three weighted curated moods and seven derived dimensions in an independent Mood Mapper. Selection and weights are session state; Mood DNA and description derive live. This supersedes the earlier two-axis persisted Mood Plane plan at the user's request.

## Completed — Mood Relationship Engine v1.1.1

A pure analyser compares each selected pair across the existing seven dimensions and accounts for their weights. A three-mood result retains all three pairs and reports an overall character. No relationship prose or UI was added.

## Completed — Relationship Interpretation v1.1.2

A pure interpreter now turns the unchanged v1.1.1 analysis into a whole-blend summary, mood roles, supporting qualities, creative tensions, and dimension-specific resolutions. It remains derived output with no UI or persistence.

## Completed — Mood Mapper Guidance View v1.1.3

The existing relationship interpretation is now visible beneath the Emotional Fingerprint and updates with mood selections and influence. Browser checks covered single, two-mood, weighted, and three-mood blends without changing the source model.

## Completed — Mood-to-Music Translation Engine v1.2.1

The pure translator produces seven musical domains, source-traceable priorities, and a concise production direction from Mood DNA. Genre Mixer retains Sound DNA ownership; no UI or cross-tool composition was added.

## Completed — Production Guidance View v1.2.2

The Mood Mapper now shows live production direction, ranked priorities, seven musical domains, and source traceability beneath the unchanged relationship interpretation. Weighted source opposition remains in the relationship section because translation cannot reconstruct it from normalized Mood DNA.

## Completed — Mood Presets v1.3 (original blueprint v1.4 scope)

Source mood selections and exact weights now persist as reusable presets. Reopening regenerates Mood DNA, relationship guidance, and production guidance. Save-as, explicit update, targeted delete, and corrupt-record handling are verified.

This completes the Mood Mapper block through the blueprint's original v1.4 stage. The implementation shipped as v1.3; no separate v1.4 implementation milestone is planned.

## Completed — Local Audio v1.5

The independent Visualiser now loads and controls multiple local tracks in one browser session. Import, switching, progress, duration, seeking, error feedback, and temporary URL cleanup are verified. Composition, song arcs, and section moods remain later work.

## Completed — Audio Analysis v1.6

The existing player now exposes reusable live waveform and spectrum buffers, RMS amplitude, and low/mid/high energy with plain diagnostic meters. Controlled browser WAV signals distinguished silence, quiet bass, louder bass, and bright treble; playback and graph reuse remained stable.

## Completed — Visual Modes v1.7

Spectrum bars, waveform, and radial views render from the shared v1.6 analysis data. Browser checks covered silence, 80 Hz bass, 6 kHz treble, a broad-spectrum composite, mode/track changes, seek, pause/resume, end, selected-track removal, returning to the Visualiser, responsive widths, DPR 2, and reduced motion. Automated tests and build pass. Project-aware and personality-driven styling remains in v1.9.

## v2.0 integration stages

1. **Stage 1 — Compose: implemented and locally verified.** Local projects capture immutable source ingredients through explicit actions and regenerate a deterministic Creation Brief. Verification and limitations live in `PROJECT.md`.
2. **Stage 2 — project tracks: implemented and locally verified.** Multiple persisted track records retain historical creation identity, metadata, version/source/notes and regenerated briefs. Session audio attachment/reattachment and captured-Mood playback reuse existing Visualiser ownership. Source URLs and provider generation APIs remain deferred. See `PROJECT.md` for proof and limitations.
3. **Stage 3 — A/B Compare: implemented and locally verified.** Project-contained comparisons record human observations, optional preference and conclusion between two distinct historical tracks. Factual provenance differences and single-player same-second switching preserve captured Mood and existing audio ownership; dependency removal is explicit. See `PROJECT.md` for proof and limitations.
4. **Stage 4 — Studio Release: implemented and locally verified as v2.0.** Create / Tracks / Compare / Visualise now unify the existing owners through StudioShell; full release acceptance passes. See `PROJECT.md` and `docs/RELEASE_VERIFICATION.md` for evidence and limitations. New provider/cloud/audio-processing/scoring capabilities require separate post-v2 scope.

The four independent tools retain their completed gates and ownership throughout integration. See `PROJECT.md` for their verification history.
