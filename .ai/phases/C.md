# Goal

Make the existing Genre Mixer, Vocal Persona, and Mood Mapper work as one explicit, editable project creation flow while retaining independent domain engines and storage ownership.

# Existing state

- The shell presents Create with project identity, notes, a derived Creation Brief, and the existing Genre, Vocal, and Mood editors.
- Genre, Vocal, and Mood snapshots can be explicitly attached to the current `StudioProject`; current project identity is distinct from historical `ProjectTrack.creationSnapshot` provenance.
- Genre recipes, Vocal Personas, and Mood presets retain their own domain stores. Mood presets save source mood selections and weights, and reopening derives current guidance through the existing engines.
- The project brief combines the attached snapshots and regenerates derived guidance. Missing ingredients remain open choices.

# Allowed scope

- Improve Genre Mixer, Vocal Persona, and Mood Mapper presentation and integration helpers within Create.
- Improve shared project identity and creation-brief integration.
- Make propagation of explicit ingredient actions into the current `StudioProject` visible and reliable.
- Preserve and verify saved preset reopen/update behavior for each existing tool.
- Add or update phase-specific tests.
- Record requests for shell composition, overlapping shared styles, or other coordinator-owned files in the handoff.

# Locked invariants

- Existing Genre, Vocal, and Mood engines remain independent; their domain stores remain their storage owners.
- `StudioProject` owns the current project identity. `ProjectTrack` owns its captured, immutable historical creation identity.
- Propagation into the project is explicit. Editing a tool or opening a preset does not silently overwrite project ingredients.
- One module cannot silently overwrite another module's state.
- Store authoritative source selections; regenerate derived DNA, interpretation, guidance, and brief text through existing engines.
- Do not mutate historical provenance when the current project changes.
- Do not implement Phase D.
- Timeline, Context Rail, Export, Power Layer, and Polish remain out of scope.

# Acceptance tests

- Genre, Vocal, and Mood can each be edited and explicitly attached without losing the other two project ingredients.
- Reopening and explicitly updating a saved preset restores or updates its authoritative source data; derived guidance is regenerated.
- The current project identity and Creation Brief visibly reflect explicit ingredient changes.
- Editing current project ingredients leaves existing track creation snapshots unchanged.
- Standalone tool use and existing independent stores continue to work.
- Phase-specific tests and build checks pass.

# Handoff requirements

Update `.ai/handoffs/C.md` with status, baseline, commit, verification, changed files, integration requests, cross-phase dependencies, decision records requested, and deferred issues. Stop after the Phase C exit gate; do not integrate Phase D.