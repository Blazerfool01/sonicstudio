## Project Reporting & Continuity

Project documentation is part of completing a milestone, not optional cleanup.

### Source of truth

Use the repository as the authoritative record of implemented project state.

- `PROJECT.md` records the current version, active milestone, current capabilities, next objective, and latest verification state.
- `CHANGELOG.md` records completed changes chronologically.
- `docs/DECISIONS.md` records meaningful architectural, product, UX, or behavioural decisions and why they were made.
- `docs/ROADMAP.md` records planned stages and future direction. Planned work must not be described as implemented work.

Do not duplicate the same information across files unnecessarily. Each file should answer a different question:

- `PROJECT.md` — Where are we now?
- `CHANGELOG.md` — What changed?
- `docs/DECISIONS.md` — Why did we choose this?
- `docs/ROADMAP.md` — Where are we going?

### Before starting work

1. Read `PROJECT.md`.
2. Read the relevant portion of `docs/ROADMAP.md` if the task affects a planned milestone.
3. Check recent `CHANGELOG.md` entries when prior implementation context matters.
4. Check `docs/DECISIONS.md` before changing established architecture or behaviour.

Do not reverse an existing recorded decision silently. If a decision needs to change, record the new decision and explain what supersedes the previous one.

### After meaningful work

When a milestone, feature, fix, refactor, or meaningful behavioural change is completed:

1. Update `PROJECT.md` if the current project state, capability, version, milestone, or verification status changed.
2. Append a concise entry to `CHANGELOG.md`.
3. Update `docs/DECISIONS.md` only when the work introduces or changes a meaningful architectural, product, UX, data-model, or behavioural decision.
4. Update `docs/ROADMAP.md` only when the planned direction itself changes.
5. Record relevant verification, including tests, builds, and browser checks.

Documentation updates should be included in the same work as the implementation they describe.

### Change records

Changelog entries should normally include:

- version or milestone
- date
- what was added, changed, fixed, or removed
- important files or systems affected
- verification performed

Keep entries concise. The changelog should summarize the change rather than reproduce implementation details available from Git.

Never rewrite historical changelog entries merely to match the current implementation.

### Decisions

Create a decision record when future work would benefit from knowing *why* something works the way it does.

A decision should contain:

- the decision
- reasoning
- relevant alternatives when useful
- consequences or constraints for future work

Do not create decision records for trivial implementation details.

### Completion report

At the end of a task, report:

- milestone/version reached
- what changed
- verification performed and results
- documentation updated
- unresolved issues or intentionally deferred work
- recommended next milestone

Keep the report concise because the repository documentation contains the durable project history.