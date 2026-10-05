# SonicStudio v2.0 local release verification

Date: 2026-10-05. Starting checkpoint: `a904953` (Stage 3). Scope: the user-provided Stage 4 Studio Release brief. No push or deployment.

## Automated gate

- `npm test`: 187 passing, zero failures (179 existing and 8 release tests).
- `npm run build`: TypeScript and Vite production build pass.
- `git diff --check`: pass.
- Navigation tests cover listening destinations, explicit historical handoffs/shared sources, standalone/stale-source exclusion, source/history immutability, route stripping and Stage 1/2/3 reopening. Existing independent-library/storage, model, comparison, PlaybackIntent, TrackSeek, graph and URL-owner regressions remain green.

## Actual browser acceptance

Production preview: `npm run preview -- --host 127.0.0.1 --port 4173 --strictPort`. Bundled Playwright drove headless Microsoft Edge with isolated disposable browser profiles and controlled 30-second 110 Hz / 10-second 440 Hz WAV files. The agent-browser CLI was unavailable; no new runtime dependency was installed.

- Empty start → named project with notes → explicit Genre/Vocal/Mood capture → Creation Brief and clipboard readback (Windows CRLF normalized for comparison). Subsequent source-editor changes left current identity unchanged until explicit replacement.
- Track A retained identity A; evolving all three project ingredients created identity B, captured by Track B. Metadata and notes saved independently; both historical identities stayed intact.
- Compare prevented A/A, displayed all three factual identity differences, played both attached WAVs and retained approximate four-second position over repeated switches. Switching from 15 seconds into the 10-second source clamped safely. All six observations, conclusion and A/B/null/final-B preferences saved.
- Chosen B opened in Visualise with Aggressive captured personality. Spectrum/Waveform/Radial, seek, pause/resume and comparison return passed. An unsaved comparison draft survived the handoff. Direct navigation retained the project and did not write UI history into its envelope.
- Reload retained current ingredients, notes, both histories and comparison fields. Session audio correctly became unavailable. Focused Attach/Reattach navigation reached the correct file input; matching reattachment restored historical playback without changing provenance.
- Cancelled dependent deletion retained track/comparison; confirmation removed the dependent comparison and retained unrelated results. Deleting a separate comparison retained both tracks. Project create/rename/delete/cancel/open and independent recipe/persona/mood save/open/reload passed.
- Standalone import and selection cleared historical context, retained independent Mood/Classic/preview behavior and played through the same owner. Denied localStorage supported temporary project/audio workflow and visible reload-loss feedback, with Classic for a track lacking Mood.
- Delayed AudioContext resume plus rapid A/B switches followed by editing navigation could not restart stale playback. Reduced-motion playback passed; pause/navigation reached zero Visualiser RAF.
- Instrumentation: one HTML audio element; one AudioContext; one media source; maximum one outstanding Visualiser RAF. Three URLs created, three unique URLs revoked once each after last-link release/removal. Shared-source linking created no extra URL.
- Keyboard focus and Enter activation switched the workflow destination, with one active aria-current marker. The final package and visible release version are `2.0.0`.
- Development Vite/React StrictMode on port 5184 separately verified ingredient remove/reattach, rejection of mismatched reattachment, deliberate Replace Audio with unchanged provenance, playback through repeated listening navigation, and exact URL cleanup (2 created / 2 distinct revoked). Instrumentation retained one live resize observer, one resize listener, one context/source and at most one RAF; warning/error logs were empty.
- Screenshots and overflow checks at 1280, 390 and 320 px covered all four destinations; all three Create editors were also checked at each width. Navigation, readable cards, stacked comparison fields and action controls remained usable. Console warning/error collection was empty.

Local disposable evidence: `C:/Users/Pc/.codex/temp/sonic-stage4-verify.cjs`, `C:/Users/Pc/.codex/temp/sonic-stage4/result.json` and adjacent screenshots. Supplemental development script: `C:/Users/Pc/.codex/temp/sonic-stage4-extra.cjs`. These fixtures and audio files are outside repository deliverables and are not user data.

## Practical limits

This is local browser verification, not broad native-device/codec certification. Controlled WAVs exercised release playback; prior real MP3 proof remains in the milestone history. Audio bytes are session-only; metadata matching is not byte identity. Historical prose regenerates through current catalogues/engines. Comparisons use clock seconds, with no alignment, loudness normalization, dual playback or scoring. Cross-tab merge and recovery/export remain deferred. No new cloud, provider, mastering or generation capability is included.
