# SonicStudio UI/UX Overhaul — Phase F: Context Rail

You are implementing **Phase F — Context Rail** of the post-v2 SonicStudio UI/UX overhaul.

You are working in parallel with a separate **Phase E — Timeline** agent.

Do not implement Phase E.

## Canonical Baseline

Repository:

`Blazerfool01/sonicstudio`

Baseline:

`3b69b6de5fcedd399a037adde058767196481f8e`

Current verified state:

- SonicStudio 2.0.0 baseline
- UI/UX Overhaul Phases A–D integrated
- 197 tests passing
- Phase B already provides a structural right-side context-rail slot
- Phase A provides explicit project-scoped selected-track state
- Phase C establishes current vs historical provenance
- Phase D establishes current/historical visual identity mapping

Before coding:

1. Read `AGENTS.md`.
2. Read `PROJECT.md`.
3. Read relevant `CHANGELOG.md`.
4. Read `docs/DECISIONS.md`.
5. Read `docs/ROADMAP.md`.
6. Inspect the existing context-rail placeholder and Phase A interaction contract.
7. Inspect existing Genre, Vocal and Mood guidance engines before creating any derived copy.

---

# Goal

Turn the existing structural right rail into a useful contextual workspace.

The rail should help the user understand:

- what project is active
- what track/context is selected
- the project's current creative identity
- historical identity when inspecting a saved track
- relevant creative guidance
- preset/source provenance
- notes

The rail must follow existing Studio state.

It must NOT become another source of truth.

---

# Core Principle

**Read from established owners. Dispatch explicit intent back to established owners.**

Do not duplicate:

- StudioProject state
- project-track selection
- timeline state
- Genre selections
- Vocal selections
- Mood selections
- Visualiser state
- preset stores
- notes persistence
- playback state

The context rail is a projection/controller, not a new domain model.

---

# Context Modes

The rail should adapt to current context.

At minimum distinguish clearly between:

## Current Project Context

Use the active StudioProject.

Show current Genre/Vocal/Mood identity and current project metadata.

## Selected Historical Track Context

When an established selected project-track exists, clearly label information derived from its immutable `creationSnapshot`.

Do not present historical Genre/Vocal/Mood as the current project identity.

Do not let simply selecting a historical track replace current project ingredients.

## Empty Context

No active project / no relevant selection should have a purposeful empty state rather than misleading placeholder data.

---

# Rail Sections

The approved scope requires:

- Project
- Guidance
- Presets / Sources
- Notes

You may use tabs, sections or another compact rail pattern consistent with the approved reference.

Do not build an oversized second workspace.

---

# Project Overview

Show concise useful context such as:

- project name
- ingredient completeness
- track count
- comparison count
- current Genre identity
- current Vocal identity
- current Mood identity

When a historical track is selected, show:

- track title/version/source
- clear `Historical creation identity` treatment
- captured Genre/Vocal/Mood source summary
- provenance distinction from current project

Do not duplicate the full existing Creation Brief unless the rail needs a compact summary.

Large detail should remain in its existing destination.

---

# Guidance

Reuse existing deterministic guidance engines.

Do NOT create a new AI/guidance engine.

Possible sources include existing:

- Sound DNA / Genre compatibility
- Vocal interpretation
- Mood relationship guidance
- Mood production guidance
- Creation Brief composition

For current project context:

derive from current captured project ingredients.

For historical context:

derive from the selected track's saved creation snapshot.

Do not derive historical guidance from today's active project.

Do not store generated guidance prose merely for the rail.

Guidance must remain derived.

---

# Presets / Sources

Do not create another preset database.

Surface useful provenance from the existing stores and snapshots.

Examples:

- Genre saved mix origin
- Vocal Persona origin
- Mood preset origin
- current builder/live origin where source ID is null

Where an existing tool supports reopening a saved source, a rail action may navigate to or invoke the established owner through a narrow callback.

Do NOT directly mutate those stores from the rail.

Do not fabricate a saved preset when a snapshot came from live state.

Missing source IDs must remain visibly source-less/current rather than guessed.

---

# Notes

Support notes without creating another notes store.

Existing project notes and project-track notes remain authoritative.

The rail may expose editing if useful, but it must reuse existing update boundaries and Phase A's truthful dirty/saved semantics.

Important:

- project notes are not guidance
- track notes are not project notes
- historical provenance is not editable through notes
- changing a note must not alter Genre/Vocal/Mood identity
- changing a note must not regenerate historical provenance
- notes must not overwrite generated guidance

If both project and selected-track notes exist, label their scope clearly.

---

# Selection Contract

Consume the established Phase A selected-track contract.

Do not create:

`contextSelectedTrackId`

or another competing generic selection owner.

If Phase E exposes timeline clip selection during integration, consume it only through a narrow agreed projection.

Do not make Context Rail responsible for timeline selection.

Do not infer project-track selection from whatever audio happens to be playing.

Playback context and generic selection remain separate unless an explicit established handoff links them.

---

# Parallel Phase E Boundary

Another agent owns Timeline.

Phase F must not implement:

- playhead
- clips
- clip positioning
- trimming
- timeline mute/solo
- timeline playback scheduling

Try to keep Phase F concentrated in:

- new Context Rail components
- pure context projection helpers
- existing shell rail slot
- narrow callbacks

Avoid broad edits to `StudioShell.tsx`.

If Phase E later adds a new stable context field, integration can wire it after both workers finish.

---

# Loading / Empty / Error Semantics

Reuse Phase A feedback patterns.

Do not introduce a second notice system.

Use truthful states:

- no active project
- no selected track
- missing ingredient
- missing saved source
- session-only context where applicable
- storage failure when existing owner reports it

Do not show decorative loading states for synchronous derivation.

---

# Accessibility

Context rail should:

- use semantic headings/regions
- expose selected tab/section state
- remain keyboard accessible
- avoid trapping focus
- work when collapsed/responsive
- not move focus merely because project data updates

Do not create global keyboard shortcuts.

---

# Responsive Behaviour

Desktop reference places the rail persistently on the right.

At narrow widths, it may:

- collapse
- move below workspace
- use disclosure/tabs

but all context must remain reachable.

Do not cause page-wide horizontal overflow.

---

# Persistence

Prefer no new persisted state.

The rail itself should generally be view/projection state.

Do not add a context-rail localStorage key.

If tab choice/collapse state is session-only, keep it session-only.

Existing project/track notes continue through their existing project persistence path.

`sonic-studio.projects.v1` remains authoritative.

---

# Explicitly Out of Scope

Do NOT implement:

- Timeline
- clips
- new playback logic
- new audio bridge
- new Genre/Vocal/Mood engine
- AI-generated analysis
- automatic quality scoring
- automatic preferred track
- new preset store
- copied historical provenance
- cloud sync
- provider APIs
- Phase G Export
- Phase H Power Layer
- Phase I final polish

---

# Automated Verification

Add focused tests for pure context derivation.

Cover at minimum:

- empty project context
- current project context
- selected historical track context
- current vs historical identity distinction
- missing Genre/Vocal/Mood ingredients
- source ID vs live/current source
- guidance derived from correct snapshot
- notes scope
- invalid/deleted selected track fallback
- no mutation of source records

All existing tests must remain green.

Required:

`npm test`

`npm run build`

`git diff --check`

Baseline is 197 tests.

---

# Browser Verification

Verify:

1. no-project rail
2. current project rail
3. partially complete identity
4. fully complete identity
5. selected historical track
6. switch between current and historical context
7. change current project after selecting historical track
8. historical rail remains based on captured snapshot
9. project switch
10. track deletion
11. Genre saved-source provenance
12. Vocal Persona provenance
13. Mood preset provenance
14. live/source-less Mood provenance
15. project notes
16. track notes
17. guidance updates from correct owner
18. rail collapse/responsive behaviour
19. Create / Tracks / Compare / Visualise navigation
20. 1280 / 390 / 320 px smoke checks
21. no new console errors/warnings

If Phase E is not integrated yet, do not block Phase F on timeline-specific context.

Record that integration point separately.

---

# Acceptance Gate

Phase F is complete only when:

- [ ] Right rail is no longer placeholder-only.
- [ ] Active project overview is useful and concise.
- [ ] Current identity is clearly labelled.
- [ ] Historical selected-track identity is clearly distinguished.
- [ ] Rail follows established selection.
- [ ] Guidance reuses existing deterministic engines.
- [ ] Historical guidance uses captured historical sources.
- [ ] Preset/source provenance is truthful.
- [ ] Live/source-less origins remain source-less.
- [ ] Project and track notes remain separate.
- [ ] Notes cannot overwrite guidance/provenance.
- [ ] No new context/preset/notes data owner exists.
- [ ] No playback ownership was added.
- [ ] No timeline behaviour was added.
- [ ] Existing storage schemas remain compatible.
- [ ] Responsive rail remains reachable.
- [ ] Full tests pass.
- [ ] Production build passes.
- [ ] `git diff --check` passes.
- [ ] Browser verification passes.
- [ ] No new console errors/warnings.

---

# Documentation

Follow `AGENTS.md`.

Update:

- `PROJECT.md`
- `CHANGELOG.md`
- `docs/DECISIONS.md` only for meaningful ownership/UX decisions
- `docs/ROADMAP.md` only if planned direction changes

Document explicitly that Context Rail is a projection over existing owners rather than a new source of truth.

---

# Completion Report

Report:

1. rail sections implemented
2. context precedence rules
3. current-vs-historical behaviour
4. guidance sources reused
5. preset/source behaviour
6. notes behaviour
7. files changed
8. tests passing
9. build/diff-check result
10. browser verification
11. responsive verification
12. documentation updated
13. deferred behaviour
14. likely integration hotspots with Phase E
15. whether Phase F's gate is fully satisfied

Do not merge automatically.

Do not begin Phase G.