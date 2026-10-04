# Decisions

## 2026-10-04 — Local track metadata and playback have separate owners

v1.5 keeps imported track identity, filename, display name, MIME type, and size in a pure session-only library. An ID-to-object-URL map owns temporary file handles, while a single HTML audio element and component state own selection playback, current time, duration, seeking, and errors. Selecting another track pauses and unloads the previous source before loading the new one; removing a track revokes its URL, and unmount revokes any remaining URLs. The browser handles decoding and codec support. This avoids storing playback state in track records and leaves a clear later boundary for Web Audio analysis without adding analyser nodes in v1.5. Files are neither uploaded nor persisted.

## 2026-10-04 — Mood presets persist source selections only

v1.3 uses a dedicated `sonic-studio.mood-presets` key with a version 1 envelope, separate from Genre Mixer and Vocal Persona storage. A preset records identity, name, timestamps, and one to three cloned mood ID/integer-weight pairs. Reopening feeds those pairs through the existing Mood DNA, relationship, interpretation, and production engines rather than storing derived text or classifications. The reader rejects malformed envelopes, skips invalid or duplicate entries, and strips unexpected fields; one damaged record cannot hide valid neighbors. Live edits remain unsaved until an explicit update, which preserves the preset ID, while save-as creates a new ID. This keeps mood presets reproducible and allows future guidance changes without migrating saved prose.

## 2026-10-04 — Production guidance is a separate live view of Mood DNA

v1.2.2 places the existing translator below relationship guidance. The two sections have distinct jobs: relationships explain how source moods meet; translation suggests musical consequences of their weighted Mood DNA. Priorities get visual emphasis, while the seven domains use compact rows with every signal's source values. Multi-dimension signals receive a readable combined-direction label rather than an internal rule ID. The UI does not rewrite engine prose or persist derived output. This keeps the selection and weight source model intact and prevents the averaged production direction from pretending to identify a secondary source mood.

## 2026-10-04 — Musical translation reads Mood DNA only

v1.2.1 treats the seven 0–100 Mood DNA dimensions as the translator's complete input. Five centralized regions (0–14, 15–39, 40–60, 61–85, 86–100) select reusable domain guidance; interaction conditions use explicit 30/70 cutoffs. Each domain signal, priority, and overall direction retains the source dimension values that justify it. Priority strength is distance from 50, with stable dimension order breaking ties. Seven small interaction rules add coexistence strategies for combinations that individual axes would not express, including controlled unease and energy without drive. The translator never inspects named moods, source weights, or another tool. Consequently, a weighted mean can hide opposing source moods: translation must not claim to recover that lost detail; Mood Mapper's separate relationship interpretation can carry it in a future combined view.

## 2026-10-04 — Mood guidance stays a live view over source selections

v1.1.3 places relationship guidance below the Emotional Fingerprint and derives it from the same session-only mood IDs and weights as Mood DNA. The UI displays the existing interpreter's headline, summary, roles, supports, tensions, resolutions, and strategy without generating new prose or saving it. One mood receives only single-character guidance, and empty state receives no relationship section. Distinct but neutral visual treatments make relationship categories scannable without ranking conflict as failure. The underlying model and other tools remain unchanged; future composition must continue to treat the selected moods and weights as authoritative.

## 2026-10-04 — Mood interpretation remains derived from the unchanged analysis

v1.1.2 accepts current selections and their v1.1.1 relationship report, validates that the pair IDs and weights match, and derives Mood DNA only to describe the combined emotional character. It ranks strong shared dimensions and opposing dimensions by pair impact, returns up to three of each, and assigns the largest weight the dominant role; a mood below 40% of that weight is an accent, with input order breaking ties. Pair ratios at or above 75% use balanced resolution guidance; otherwise the stronger mood's endpoint leads. The seven dimension rules are reusable data, not named-pair overrides. Underlying raw conflict remains described when a lighter secondary influence softens the effective classification. The output is never stored and does not change Mood DNA, relationship rules, or any other tool. v1.1.3 can present this output in the existing Mood Mapper view.

## 2026-10-04 — Mood relationships are observational and influence-aware

v1.1.1 classifies pairs from their seven curated 0–100 profiles rather than named-pair rules. A clear endpoint region is 0–40 or 60–100. Mean absolute distance at or below 0.19 with no opposition is reinforcing; opposing-distance tension at or above 0.16 is contrasting; tension at or above 0.42 plus mean distance at or above 0.50 is conflicting; the rest is complementary. Equal influence retains raw tension, while unequal influence scales it by twice the smaller weight divided by the pair total. For three moods, each pair is retained and the aggregate tension scales each pair by twice its smaller weight divided by the total selected weight, preventing two weak secondary moods from dominating the blend. Ties and axis rankings preserve dimension order. The module does not mutate selections, profiles, Mood DNA, or other tools. The classifications are descriptive; no mood combination becomes invalid. v1.1.2 can add prose and resolutions from these structured results.

## 2026-10-04 — Weighted moods replace the planned two-axis Mood Plane for v1.0

The user-defined v1.0 scope supersedes the roadmap's Dark–Bright/Calm–Intense persisted plane. Fourteen curated moods have stable IDs and seven values on the existing 0–100 scale. The independent Mood Mapper keeps one to three selected IDs with 1–100 integer influence weights in view-local session state. Mood DNA uses a normalized weighted mean rounded to an integer; the largest weight determines the dominant mood, with selection order breaking ties. The brief did not require saving mood selections, so persistence and a storage schema are deferred. Description is derived from the strongest dimension endpoints and is never authoritative state. This avoids changing saved Sound DNA or Voice DNA and leaves composition for a later milestone.

## 2026-10-04 — Vocal prompts and experiment references remain derived and separate

v0.9 builds generator-neutral prompt text from the active Voice DNA and the existing whole-voice interpretation. Saved Personas supply their captured DNA and selections, so reopening recreates the prompt without storing a prompt copy or changing the Persona schema. Comparison reads two saved records and highlights differing source traits. An external experiment reference stores only its own label, optional note, and Persona ID under a separate versioned local key; it never embeds or edits the Persona. This keeps vocal identity reusable and leaves genre composition for a later stage.

## 2026-10-04 — Show vocal conflicts as creative tension

v0.8.3 presents the pure interpretation below the existing Voice DNA and derives it from saved selections when a Persona is reopened. Reinforcing and complementary relationships appear as support; contrasting and conflicting relationships appear as creative tensions with performance resolutions. Warm neutral styling avoids presenting contradictions as invalid input. No interpretation fields enter saved Persona records or captured Voice DNA, so edits to guidance cannot silently rewrite identity.

## 2026-10-04 — Whole-voice interpretation stays derived

v0.8.2 combines the current selections and curated relationship report into a separate pure interpretation. It returns one linked performance strategy plus structured dominant, supporting, and tension information. The strategy uses rule matches to shape phrasing, dynamics, tone, and effect placement instead of concatenating the pairwise explanations or resolutions. Keeping it outside saved Voice DNA preserves existing Persona snapshots and leaves later UI guidance free to change without a storage migration.

## 2026-10-04 — Tension rules carry curated coexistence guidance

Contrasting and conflicting vocal rules require a distinct `resolution` alongside their explanation. The explanation identifies why the traits pull apart; the resolution names a dominant quality or assigns each quality a place in the performance. Reinforcing and complementary results use `null` because they need no tension resolution. This keeps guidance deterministic and derived from selections without changing Voice DNA or saved Persona records. A later v0.8.2 step must combine pairwise guidance into a coherent interpretation of the whole voice.

## 2026-10-04 — v0.8 requires contextual interpretation and contradiction proof

The pure relationship analyzer is v0.8.1, not the complete Trait Relationships milestone. v0.8 also requires modifier logic, plain-English dominance and resolution guidance, and proof that awkward combinations form a coherent vocal strategy. This corrects the prior completion claim without changing the v0.8.1 design: its report remains derived and does not mutate Persona storage or captured Voice DNA. v0.9 begins only after all four v0.8 steps are verified.

## 2026-10-04 — Vocal relationships are derived guidance

v0.8.1 evaluates a finite curated rule list against existing selections and returns relationship kind, participating fields, and explanation. Numeric bands use the same 0–33, 34–66, and 67–100 boundaries as Voice DNA wording. Unlisted combinations make no claim. The report is computed on demand and is absent from Persona storage and Voice DNA, so future guidance changes cannot mutate a saved identity. This step adds no prompt output or UI.

## 2026-10-04 — Versioned persona storage preserves the captured DNA

v0.7 stores full Persona records under `sonic-studio.saved-personas`, separate from Genre Mixer's `sonic-studio.saved-mixes`. A `schemaVersion: 1` envelope identifies the stored collection. The reader skips malformed or invalid records and duplicate IDs. Reopening uses the saved selections for builder controls and displays the saved Voice DNA snapshot exactly; a later builder edit returns to live derived DNA without changing the stored record. This preserves a persona's identity even if curated wording changes in a later version.

## 2026-10-04 — Created personas capture a Voice DNA snapshot

The first Persona Identity step creates a session-only record with a UUID, identity metadata, source selections, and the exact Voice DNA at creation. The record does not follow subsequent builder edits. Capturing both selections and DNA keeps the current identity inspectable and gives later persistence work an explicit source and output to reconcile. No local storage schema is introduced in this step; the full v0.7 reuse gate remains open.

## 2026-10-04 — Voice DNA derives from independent vocal selections

The v0.6 builder keeps register, texture, delivery, effect, and four 0–100 dimensions in view-local state. Curated trait descriptions and deterministic dimension bands produce a structured Voice DNA object. This keeps vocal identity independent of genre and avoids storing derived wording. There is no persistence or composition contract yet; later milestones can add those without changing the Genre Mixer source model.

## 2026-10-04 — Recipes reuse versioned saved sources

v0.5 uses the v0.4 local records as named recipes. The short and detailed text is derived each time from those source genres and weights using the current Sound DNA and compatibility engine. Keeping `schemaVersion: 1` preserves existing saved mixes and avoids stale prompt copies. Future data changes may alter regenerated wording while leaving the saved musical identity intact.

## 2026-10-04 — Saved source state is authoritative

Store the ordered genre IDs and exact integer weights in each versioned saved mix. Sound DNA and compatibility are derived from the current genre data whenever a mix opens. This prevents stale generated descriptions from disagreeing with the source selection. A future change to genre data may change derived output for an older preset; the saved source remains intact.

## 2026-10-04 — Skip unsupported local records

The v0.4 reader accepts only complete `schemaVersion: 1` records with known, distinct genres and valid 10–90 weights in increments of five. Malformed JSON, older schemas, and invalid entries are ignored without stopping the mixer. Migration can be added when a documented prior schema exists.
