# Project export format v1

Phase G provides read-only local exports. It does not change `sonic-studio.projects.v1` and does not implement project import or audio rendering.

## Creation Brief (.txt)

The text contains the current project name, current identity summary, the existing deterministic Creation Brief prompt, and a separately headed project notes appendix. Notes are annotations, not injected into musical guidance. Historical track identity is not substituted for current project identity. External generation providers remain optional and disconnected.

## Project package (.json)

The public export envelope is distinct from browser storage:

```json
{ "format": "sonic-studio.project-export", "schemaVersion": 1, "audioIncluded": false, "project": {} }
```

`project` contains `id`, `name`, `notes`, stored `createdAt`/`updatedAt`, `currentIdentity`, `tracks`, `timeline`, and `comparisons`.

- `currentIdentity`: captured Genre/Vocal/Mood ingredient snapshots; null ingredients remain null. Origins retain their label and source ID. Genre contains ordered genre IDs/weights; Vocal contains stored selections and identity description; Mood contains ordered mood IDs/weights.
- `tracks`: saved ProjectTrack metadata, stored timestamps, and each authoritative immutable `creationSnapshot`. `file` means filename/type/size metadata only, never file bytes.
- `timeline`: saved clip ID, track ID, start, source in/out seconds, muted and solo flags. Clip ordering and references remain intact. Source duration/playhead/eligibility are runtime information and excluded.
- `comparisons`: saved pair IDs, observation fields (`vocalIdentity`, `atmosphere`, `arrangement`, `mix`, `improved`, `regressed`), preference, conclusion and stored timestamps.

All nested fields are explicitly projected through existing domain cleaners. Unknown fields are excluded. File/Blob objects, object URLs, session audio IDs, analyser information, playback state, current playhead, temporary selections and hidden drafts are excluded. Track creation snapshots remain historical; exports never regenerate them from current project identity.

The fixed property order, authoritative array order and stored timestamps make repeated output byte-identical for equivalent saved state and the same format. There is no export-time timestamp. JSON uses two-space indentation and one final newline. Filename sanitization removes path/control characters, handles Windows reserved names and caps the project-name portion at 80 characters.

## Validation and browser actions

No active project and unsupported options block exports. An empty identity blocks a brief but permits a metadata package with a warning. Partial brief identity warns and preserves the existing explicit open choices. No saved result tracks warns; audio availability never blocks either format. Invalid package records block instead of silently dropping saved provenance.

Copy uses the browser clipboard and reports denied/unavailable access with a selectable preview fallback. Download requests a local browser save and releases its temporary object URL. Browsers do not report save completion or silently blocked downloads; the UI therefore reports “Download requested” and explains how to recover. No upload or provider action occurs.

## Integration

Mount `ExportPanel` with `{ project: StudioProject | null }` in the fifth creative workflow step. A project-ID key resets its local format/feedback state when switching projects. The panel takes no mutation callback and has no dependency on Phase H or playback ownership.
