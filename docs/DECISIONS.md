# Decisions

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
