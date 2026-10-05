# Phase E/F Coordinator

## Purpose

Coordinate the post-v2 UI/UX Overhaul Phases E (Lightweight Timeline) and F (Context Rail) as separately owned parallel phases. The coordinator owns shared-shell integration and the combined release gate. Neither phase may implement the other's feature.

## Baseline and source of truth

- Repository baseline: `3b69b6de5fcedd399a037adde058767196481f8e` on canonical `main`.
- Product baseline remains SonicStudio `2.0.0`; Phases A-D are integrated.
- Recheck `git status`, `HEAD`, and the actual test count before implementation. Briefs cite 197 passing tests; use the live result if it differs.
- `.ai/phases/E.md` and `.ai/phases/F.md` are the complete worker contracts. `PROJECT.md`, `CHANGELOG.md`, `docs/DECISIONS.md`, and `docs/ROADMAP.md` remain the durable project records.

## Roles and file ownership

- **Phase E worker:** timeline model, timeline UI component(s), focused timeline tests, and only the narrow audio/project-model changes needed for its own contract. Do not implement the Context Rail.
- **Phase F worker:** pure context projection, Context Rail component(s), focused context tests, and its own styles. Do not implement timeline behavior.
- **Coordinator:** owns `StudioShell.tsx`, `StudioShellParts.tsx`, shared `studio.css`, cross-phase wiring, final project documentation, integration review, and combined verification. Workers must not edit those shared integration files.
- The two workers share this checkout. Keep their implementation files and tests disjoint. A worker must report any required shared-file change as a handoff request, with the exact API and reason, rather than editing it.

## Stable cross-phase contract

- Existing owners remain authoritative: StudioProject, ProjectTrack, Phase A project-scoped selection, Genre/Vocal/Mood engines and stores, Visualiser audio lifecycle, session audio, and PlaybackIntent.
- Phase E may expose a minimal read-only timeline status/selection projection only if Phase F needs it. Phase F consumes it through a narrow prop after coordinator review; it must not own or persist timeline state.
- Phase E must not depend on the rail. Phase F must not infer selection from playback or mutate timeline state.
- Historical identity and guidance come from a selected track's immutable `creationSnapshot`; current identity comes from the active project. These contexts must remain clearly distinct.
- The timeline must continue to use one media element, one AudioContext, one media source, one analyser graph, and the existing Visualiser RAF owner. Never add simultaneous playback.
- Keep `sonic-studio.projects.v1` authoritative and backwards compatible. Do not create context, preset, notes, or playback stores.

## Sequence

1. Confirm the clean baseline and run the baseline verification once.
2. Dispatch E and F independently using their phase contracts and disjoint file ownership.
3. Review each worker's code and `.ai/handoffs/<phase>.md`; verify the handoff claims against source and results.
4. Resolve shared API requests and integrate through coordinator-owned shell files only after the worker changes are reviewable. Do not auto-merge branches or accept unreviewed shared-file edits.
5. Run the combined automated gate (`npm test`, `npm run build`, `git diff --check`) and browser acceptance for both phases, including audio lifecycle, history/provenance, responsive widths, and console checks.
6. Update project records with the actual integrated state and exact verification. Add a decision record only for a meaningful ownership/behavior decision.
7. Stop after E/F. Do not begin Phase G, commit, push, deploy, or claim either phase complete unless its full acceptance gate is satisfied.

## Coordinator closeout — 2026-10-05

E/F are integrated and accepted in canonical `main` commit `752fadb535a72d1cb55d73cc7c55c63666c8724b`. The original combined gate passed 216 tests, production build, and diff check. Browser acceptance covered sequencing, source bounds, mute/solo, handoff/navigation pause, current-versus-historical context, separate note persistence, reload/audio reattachment truth, one media element, 1280/390/320 px layouts, and empty browser warning/error logs. See `.ai/handoffs/E.md`, `.ai/handoffs/F.md`, and `PROJECT.md` for evidence. The coordinator's later P2 review corrections are tracked below and remain uncommitted until separately authorized.

## Coordinator P2 review follow-up — 2026-10-05

Restored the approved four product destinations and five creative steps; Timeline now occupies a separate arrangement region inside the Tracks workspace. Track removal now counts and names dependent timeline clips alongside saved comparisons, and `removeProjectTrack` rejects an unconfirmed cascade for either dependency. These changes are verified local review corrections atop canonical `752fadb535a72d1cb55d73cc7c55c63666c8724b`; they remain uncommitted. Final results are recorded in `PROJECT.md` and `CHANGELOG.md`.

## Handoff format

Each worker completes its phase handoff file with status, baseline and commit if any, exact changed files, tests/build/diff-check, browser evidence, integration requests, decisions needed, deferred behavior, and remaining acceptance gaps. A handoff is not completion evidence until the coordinator has reviewed it and confirmed the gate.
