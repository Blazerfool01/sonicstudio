# Decisions

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
