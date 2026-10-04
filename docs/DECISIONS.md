# Decisions

## 2026-10-04 — Recipes reuse versioned saved sources

v0.5 uses the v0.4 local records as named recipes. The short and detailed text is derived each time from those source genres and weights using the current Sound DNA and compatibility engine. Keeping `schemaVersion: 1` preserves existing saved mixes and avoids stale prompt copies. Future data changes may alter regenerated wording while leaving the saved musical identity intact.

## 2026-10-04 — Saved source state is authoritative

Store the ordered genre IDs and exact integer weights in each versioned saved mix. Sound DNA and compatibility are derived from the current genre data whenever a mix opens. This prevents stale generated descriptions from disagreeing with the source selection. A future change to genre data may change derived output for an older preset; the saved source remains intact.

## 2026-10-04 — Skip unsupported local records

The v0.4 reader accepts only complete `schemaVersion: 1` records with known, distinct genres and valid 10–90 weights in increments of five. Malformed JSON, older schemas, and invalid entries are ignored without stopping the mixer. Migration can be added when a documented prior schema exists.
