# Phase G/H Coordinator

## Purpose and baseline

Coordinate Phase G (Export) and Phase H (Power Layer) as separately owned parallel workers, with a coordinator/reviewer and independent read-only auditor. The complete supplied contracts are `.ai/phases/G.md` and `.ai/phases/H.md`. Stop after G/H; Phase I is not authorized. No commit, push or deployment is included.

- Canonical baseline: `41cd61c987019a45c13caa398ff2a237de2e2c23`, verified equal to `HEAD` and `origin/main` on 2026-10-05.
- SonicStudio remains package version `2.0.0`; Phases A–F are implemented and accepted.
- Baseline verification: 216 tests passed; production build and `git diff --check` passed.
- E/F integrated in `752fadb535a72d1cb55d73cc7c55c63666c8724b`. Navigation/dependent-deletion corrections are committed in `41cd61c`; prior local/uncommitted wording is superseded.

## Ownership

- **G worker:** pure export validation/schema/serialization, Export panel, isolated styles/tests, schema documentation and `.ai/handoffs/G.md`. No H behavior.
- **H worker:** pure experiment actions, Power actions, narrow Tracks/Compare and historical editor APIs, isolated styles/tests and `.ai/handoffs/H.md`. No G exports.
- **Coordinator/reviewer:** `StudioShell.tsx`, `StudioShellParts.tsx`, shared `studio.css`, navigation integration, cross-phase wiring, shared project records, combined automated and browser acceptance.
- **Auditor:** independent read-only source/contract review with actionable findings.

Workers share this checkout and keep changes disjoint. Shared-file changes are handoff requests. H owns editor draft boundaries and Tracks/Compare interfaces; shared model changes require review. Focused verification is distinct from integrated acceptance.

## Locked contracts

- Product destinations: Create → Tracks → Compare → Visualise. Creative steps: Genre Mixer → Vocal Persona → Mood Mapper → Visualiser → Export. Export is a workspace surface under Create, not a fifth destination. Timeline remains inside Tracks.
- StudioProject owns current identity; ProjectTrack immutable creation identity; TrackComparison human observations. Phase A selection remains ephemeral and project-scoped.
- Editors own drafts. Historical loads are explicit one-shot requests from creationSnapshot, never mutable source-ID lookups. Reopening cannot change the project or saved source automatically.
- G is read-only. Its versioned interchange schema is separate from unchanged sonic-studio.projects.v1 storage. Exclude files/bytes/URLs/session IDs/playback/analyser/playhead/UI/editor drafts. Preserve stored timestamps and historical snapshots; no volatile generation timestamp.
- H duplicates captured identity into a new independent track without audio, comparison membership or Timeline clips. Compare seeds are transient and require explicit creation. Shortcuts dispatch visible actions and ignore editable/native editing contexts.
- Visualiser remains the only media/context/source/analyser/RAF owner; session audio owns URLs. No renderer/encoder, import/recovery, provider/cloud integration, second experiment store, AI scoring or automatic choices.
- G and H must each work independently of the other phase.

## Sequence and gate

1. Verify baseline; store supplied contracts.
2. Dispatch disjoint G/H workers and auditor.
3. Review source and handoffs; resolve findings.
4. Integrate Export and H callbacks through coordinator files.
5. Run full tests/build/diff check and both supplied browser checklists: denial/recovery, reload/determinism, provenance, single player, 1280/390/320 px and console logs.
6. Record evidence and limitations in project records and handoffs. Never claim a full pass with required acceptance gaps.

## Handoff format

Worker records status, baseline, files, integration API, focused test evidence, exclusions/decisions, remaining acceptance gaps and G/H hotspots. Coordinator closeout records combined verification and audit resolution. Prior E/F contracts/handoffs remain historical evidence.

## Coordinator closeout — 2026-10-05

Subsequent authorization: user approved the reviewed G/H checkpoint commit/push to canonical main on 2026-10-05. The review/implementation statements below record the pre-authorization gate. No deployment or Phase I is authorized.

Checkpoint re-review: independent auditor found no actionable source/documentation findings. Complete 251-test suite passed with one worker and sequential production build passed after Windows memory exhaustion in a simultaneous rerun; details in docs/GH_VERIFICATION.md. Browser evidence remains applicable to unchanged production source. Ready for commit/push authorization, with remote main still at 41cd61c. No commit/push performed.

G/H integrated locally on canonical 41cd61c, package 2.0.0. Full gate: 251 tests, production build and diff check passed. Both browser checklists passed using the in-app browser and Chrome; detailed evidence/environment limits and fixture restoration are in docs/GH_VERIFICATION.md. Actual downloaded text/JSON were inspected on disk. Independent source audit is clean after correcting new-track selection timing, snapshot title focus and historical Save-as-new source precedence. Final project/changelog/decisions/roadmap/schema records updated. No commit, push, deployment or Phase I.
