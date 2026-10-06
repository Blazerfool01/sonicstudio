# Reference motion system — 2026-10-06

Status: motion sheets and the Home composition are implemented and locally verified; package remains 2.0.0. One-to-one visual acceptance remains open because the screenshot's sample project values do not exist in the active project model.

## Reference mapping (inspected before implementation)

All PNGs in `Images-dashboard/assets` were visually inspected. Per the user's latest instruction, `example-dash.png` specifies the complete Home composition and its panel relationships. Existing live project values and domain owners remain authoritative; screenshot sample data is not substituted for project state.

| Reference | Requirement | Existing owner / implementation surface |
| --- | --- | --- |
| example-dash | Home hero, four creative destinations, primary navigation, top-bar search/utilities and four-tab Project / Track / Guidance / Presets rail; preserve the reference spacing and panel relationships | `StudioOverview.tsx`, `ReferenceStudioModules.tsx`, `ReferenceContextRail.tsx`, `StudioShellParts.tsx`, scoped `referenceDashboard.css`; all project fields are read from the active `StudioProject` |
| animation-principle | Purposeful, subtle, responsive, consistent, performant | Shell presentation only; no animation dependency or permanent JS loop |
| easing-timing-reference | cubic-bezier(.22,1,.36,1); 120–700 ms vocabulary | Shared reference motion tokens |
| panel-widths | 200 px navigation, flexible centre min 720 px, 310 px context | Desktop shell grid; stack context below when these dimensions cannot fit |
| focus-shift-centre | Centre expands 12–20 px, rail compresses, springs back on focus change; 350 ms | Sidebar selection, 16 px grid transfer; centre/rail interaction releases it |
| neon-energy-bridge | Thin left → centre → right line for cross-panel changes; 450–650 ms | Existing explicit ingredient capture callbacks; 550 ms SVG trace |
| context-rail-reveal | Slide from behind centre, slight blur → sharp; 400 ms | Existing rail surface and strip expansion |
| workspace-depth | Centre hover/focus recedes side panels to scale(.985), reduced opacity/glow; 250 ms | Shell hover/focus selectors, fine-pointer hover only |
| panel-edge-pulse | Shared edge briefly pulses on data transfer; 700 ms, once | Same explicit capture event; no idle looping |
| magnetic-divider | Pointer proximity shifts edge 2–3 px toward cursor and glows; 120 ms | Noninteractive edge decoration, no resize semantics |
| navigation-camera-pan | Old centre drifts left, new enters right, outer shell stationary; 300–400 ms | Existing navigation callbacks, 350 ms centre-only transition |
| rail-follow | Corresponding Mixer/Mood/Vocal block rises into view; 350 ms | Existing ContextRail guidance blocks, selection presentation prop |
| collapse-ambiant-strip | Side collapse retains glowing icon strip, hover/click expands; 400 ms | Session-only panel presentation; existing content retained |
| cross-panel-selection-echo | Faint travelling highlight across corresponding elements; 500 ms | Selected nav item, workspace section and corresponding rail guidance |
| centre-canvas-exspansion | Visualiser/full-focus expands middle, sides retreat to edges; 500 ms | Existing Visualise destination, same mounted Visualiser/audio/canvas |

## Boundaries

Working area: shell composition, presentation state, existing navigation/capture callbacks, context guidance presentation, scoped CSS and this evidence. Protected: domain models, project persistence, canonical editor state, audio/analyser/timeline owners and unrelated UI. Existing uncommitted work is preserved. The requested width/exit choreography supersedes the older I-C prohibition against those two effects. No commit, push or deployment is part of this task.

## Verification

- `npm test`: **253/253 pass**, zero failures/skips. Full output: `verification/motion-reference/test-results.txt`.
- `npm run build`: TypeScript and production Vite build pass, 129 modules. No added dependency.
- `git diff --check`: pass; Git reports only existing LF/CRLF conversion warnings.
- Production preview: `http://127.0.0.1:5186/`, isolated agent-browser Chromium session. Tests use actual rendered elements and Animation API observations; screenshots were inspected against the source sheets. Existing user browser/storage was not used for test mutations.
- `browser-check.js` / `browser-results.json`: **23/23 pass**. Actual 200/1116/310 px desktop grid at 1672 px, 16 px focus transfer/restore, 350 ms old/new camera snapshots, 550 ms bridge, two 700 ms edge pulses, 500 ms full-focus sizing, one-shot settling, corresponding guidance ordering, 48 px strips, inert/access restoration, unchanged audio/canvas identities, rapid navigation and no desktop overflow. Fractional grid samples are rounded to CSS pixels. The mouse is parked on the header while checking collapse endpoints so intentional hover expansion does not invalidate the test.
- `edge-check.js` / `edge-results.json`: **9/9 pass**. Keyboard focus depth, hit-tested rail toggle above the sticky header, 400 ms restore and 500 ms full-focus exit, plus forced no-View-Transition fallback with outgoing/incoming 175 ms halves, independent selection feedback and latest-request navigation. Start from a fresh reload for this independent test.
- `responsive-check.js` / `responsive-{1280,1024,390,320}.json`: **28/28 pass** across Home, Genre, Vocal, Mood, Tracks, Compare and Visualiser. No page overflow, no inaccessible stacked panels; exactly one audio and canvas on each screen. Workflow tabs retain local horizontal scrolling on small screens.
- `reduced-{320,desktop}.json`: **14/14 pass** across the same seven screens. Zero active animations, no page overflow, no inaccessible stacked panels. Optional effects stop while navigation and captures remain available.
- A real pointer near the navigation divider produced `matrix(1, 0, 0, 1, 3, 0)` and a visible glow, returning to zero away from the edge. No resize affordance or resizing handler was added.
- Imported repository `test-song.mp3` through the existing Visualiser file control and used the real Play button. The clock advanced to 32.58 seconds with live, nonzero analyser levels; navigation to Genre paused the same audio element. One audio and one canvas remained. `playback-live.json` and `playback-results.json` record the observations. Audible speaker output was not assessed.
- Actual keyboard Tab after clicking Collapse navigation skipped inert panel content and reached the first workflow control; keyboard evidence is in `keyboard-result.json`. React review confirmed effect cleanup, stable domain/media component identity, presentation-only state and no new dependency.

### Visual evidence and interpretation

`verification/motion-reference/desktop-final.png`, `visualiser-expanded.png`, `transfer-220ms.png` and mobile captures record the existing UI with the motion layer. The transfer image pauses the real Animation objects at 220 ms for inspection; it is not a fabricated overlay. Its endpoints are measured from the selected navigation item and corresponding guidance block, avoiding a fixed coordinate that points at the wrong item. Default widths apply at desktop; the 48 px collapsed width, 16/20/24 px motion distances where unspecified, and the 1280 px fallback breakpoint are implementation inferences. The exact supplied durations and primary easing remain explicit in source.

Reference #8 retains and reorders the existing guidance blocks within ContextRail; it does not remount the entire rail on Genre/Vocal/Mood changes. Those lines remain captured-project/historical guidance, not unsaved draft output. Full-focus mode changes shell space around the existing Visualiser; it does not introduce a new renderer or full-screen API.

### Limits and next gate

No native-device or hardware-wide 60 fps certification, exhaustive accessibility audit, audio rendering, commit, push or deployment is claimed. CSS/compositor effects and event-driven Web Animations avoid an idle JavaScript animation loop, but panel width changes necessarily perform layout. Existing unrelated artwork/chart effects remain as previously implemented. Next gate: resolve reference-only sample-data presentation and complete one-to-one visual acceptance; a checkpoint commit remains separately authorized. Broader Phase I hardening remains separate.

### Home reference composition — 2026-10-06

- Production preview `http://127.0.0.1:5186/` was visually inspected at 1280 × 594. The Home hero, four-card row, 200 / min-720 / 310 px shell and right-rail vertical relationships were tuned against `example-dash.png`; the reference-sized desktop view fits without a page scrollbar.
- Browser interaction checks verified Start Creating → Genre Mixer, the Track tab and track opening → Tracks, Guidance and Presets tabs, project search/selection, Settings disclosure, Visualiser navigation, and navigation/context-panel collapse and restore. The existing editors, project store, timeline and Visualiser remain the destinations/owners.
- The screenshot's example project is `Neon Skies` with `F minor`; the active canonical project is `Midnight Echoes`, and the current project model has no Key field. The Home shows the real project values and an unset Key. Layout parity is verified; exact sample-text parity is intentionally not claimed pending a decision about reference-only sample data.
- Latest verification: `npm test` **253/253 pass**; `npm run build` passes TypeScript and Vite (128 modules); `git diff --check` passes with existing line-ending warnings.
