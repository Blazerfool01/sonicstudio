# Phase G/H verification — 2026-10-05

Baseline: clean `HEAD = origin/main = 41cd61c987019a45c13caa398ff2a237de2e2c23`; package `2.0.0`, 216 baseline tests/build/diff check passed. Two disjoint workers implemented G/H; coordinator integrated shared shell files and a separate read-only auditor reviewed source.

## Automated gate

- `npm test`: 251 passed, zero failures (216 baseline + 16 G + 19 H).
- `npm run build`: TypeScript and Vite production build passed.
- `git diff --check`: passed. Configured line-ending normalization warnings are not whitespace failures.
- Source audit: no remaining actionable findings. Corrected stale project validation when selecting newly created tracks, snapshot title focus versus navigation focus, and Genre/Mood save-as source precedence.

## Checkpoint authorization review — 2026-10-05

Subsequent authorization: user approved committing and pushing this reviewed checkpoint on 2026-10-05. Gate statements below record the pre-authorization review. No production source changed afterward.

- Fresh independent read-only audit of all G/H source, tests, contracts, handoffs and documentation: no actionable findings. No production source changed during checkpoint review, so the integrated browser evidence below remains applicable.
- A simultaneous fresh `npm test` / build attempt exhausted Windows available memory (`VirtualAlloc` / Node allocation errors). After stopping the coordinator's dev server, the complete suite ran with `node --test --test-concurrency=1 tests/*.test.mjs`: 251 passed, zero failures/skips. Sequential `npm run build` passed (106 modules). No test or application configuration was changed to obtain this result.
- Remote `main` remains `41cd61c987019a45c13caa398ff2a237de2e2c23`. Checkpoint is ready for commit/push authorization; no commit, push, deployment or Phase I work performed.

## Live Export gate

Codex in-app browser and connected Chrome exercised the local Vite app.

- No active project blocks both formats with an actionable explanation. Empty current identity blocks a musical brief but permits metadata. Partial Genre-only/no-track identity permits a brief with partial/no-result warnings. Full current identity exports with missing session audio explained.
- Text copy and JSON copy reported success; clipboard contents matched the preview after completion. Injected clipboard rejection displayed manual-copy/download recovery. Injection was cleared on reload.
- Actual files were saved in Chrome to Downloads: `G H acceptance-creation-brief.txt` (3173 bytes) and `G H acceptance-project.json`. Read both from disk. JSON declares schema 1 and audioIncluded=false and contains four saved tracks, one Timeline clip and two comparisons; current/historical identity and saved notes/observations remained distinct. No object URLs/session IDs/playback/analyser/playhead/drafts were found in the payload; focused tests inject forbidden fields into every nested boundary.
- JSON preview before/after reload was exactly equal. Stored timestamps are preserved; no generated timestamp is added. Both outputs derive from the existing saved state; no provider is required.
- Injected object-URL allocation failure produced a recoverable download error. Copy remained available and succeeded after the injection was removed. Ordinary downloads were separately verified on disk. Silent browser blocking cannot be acknowledged by the app: feedback truthfully says requested, with copy/manual recovery.
- Copying export with a paused attached track left both persisted project content and media time/paused state unchanged. Navigation into Export uses the established Create pause rule.

## Live Power Layer gate

- Captured Snapshot C with explicit title/version. It immediately became the selected project track and enabled Compare selected track. Later explicit Genre weight 60→90, Vocal power 80→100 and Mood influence 75→50 changes left its capture at 60/80/75.
- Duplicated Historical A. New ID/timestamps and old captured settings remained independent; source was unchanged. Repeated duplication after attaching a WAV still produced no file metadata/audio; no Timeline/comparison links were copied. Notes default off is covered by focused tests alongside explicit opt-in.
- Compare-this-track seeded A and cleared B/saved-comparison selection. Choosing the same side was unavailable; a distinct B was required. Cancel left the persisted envelope byte-equivalent; explicit create/save persisted the conclusion through the existing comparison owner.
- All three historical editors showed Historical draft labels and captured values without changing saved project data. Vocal loaded captured power 25 and its identity description, while current power was 80. Mood loaded serene 100 while current was brooding. Genre loaded its ordered 60/40 sources. Use/Replace then explicitly changed current identity.
- Added a changed mutable Mood preset under the historical source ID (aggressive 55). Reopening still loaded serene 100 and disabled Update open preset. Original library data was restored.
- Save as new from historical Genre and Mood drafts attached the new saved-source ID on explicit Use; old ProjectTrack source IDs remained captured-mix/captured-mood.
- Empty historical ingredients disable all three reopen actions truthfully. Project switching clears request labels/Compare seeds; no-project shortcuts do not open capture controls.
- Alt+Shift+S from Create opened Tracks and retained Snapshot title focus. Alt+Shift+C from an editable title did nothing; from the visible selected-track action it seeded the exact selected track. Focused tests cover textarea/select/contenteditable ancestors, Ctrl/Meta, native undo keys, composing, repeats, defaultPrevented and AltGraph.

## Regression and environment

- Product navigation remains four destinations; creative navigation remains five steps. Timeline stayed within Tracks with its existing clip. Normal navigation, historical drafts, Compare and Export retained one HTML audio element.
- A generated 12-second local WAV attached through the existing track control and played with progressing time. Instrumentation observed one AudioContext and one media source; entering Create/Export paused it; copying did not change state or allocate another player/graph. Playback implementation was not edited.
- Export and Power controls reviewed at 1280/390/320 CSS px: no page-wide horizontal overflow. Existing creative stepper retains its internal narrow-width scrolling. Warning/error logs were empty in both browsers.
- Browser fixtures and library modifications were restored to the prior project data; temporary runtime injections disappeared on reload and viewport overrides were reset. Downloaded acceptance artifacts remain in Downloads.
- Agent-browser CLI was unavailable. In-app download event observation timed out; Chrome saved the files, verified directly on disk. Chrome file upload was blocked by its extension's existing file-access setting; the in-app file chooser attached the WAV successfully. No permissions changed.

G and H pass the local integrated acceptance gate. No commit, push, deployment or Phase I work is included. Browser/codec coverage is limited to these controlled local checks; prior release evidence remains in RELEASE_VERIFICATION.md.
