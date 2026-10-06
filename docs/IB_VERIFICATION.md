# Phase I-B — Interaction States verification

Date: 2026-10-06 (Europe/London). Package: 2.0.0. Local gate: PASS. Uncommitted; no push or deployment. Full Phase I remains incomplete.

## Baseline and inventory

Preflight `git status --short` was empty. Actual committed accepted I-A baseline: `51fd9f55acb0fa8c73246ba7bb03c7b708d50fee`. Its commit message and I-A records retained their earlier uncommitted wording; the clean commit is the starting authority, not that historical wording. Read AGENTS, Astraea SOUL, PROJECT, CHANGELOG, DECISIONS, ROADMAP, I-A handoff and IA_VERIFICATION before edits. Baseline suite: 251 pass. Existing I-A verification records supply the accepted composition and prior A–H regression evidence.

Inspected all four destinations, five workflow steps, identity cards, Genre/Vocal/Mood choices and libraries, project/track controls, Timeline, Visualiser controls, Compare, rail, Export, power/historical controls and StatusNotice. Main gaps: green/amber domain states differed from I-A's palette; several hover rules competed with selection; disabled controls used inconsistent opacity/cursors; draft labels lacked common treatment; Timeline important declarations prevented coherent selection/mute/solo styling; playback was insufficiently distinct from selection; Export feedback bypassed StatusNotice; pointer focus could retain older keyboard outlines.

References: accepted I-A Create evidence and composition first, original Neon Dashboard language as recorded by I-A, then the two supplied animation boards for static endpoints only. Their motion and aspirational controls were not implemented.

## Vocabulary and implementation

`src/interactionStates.css`, imported after fidelity.css, centralizes hover surface/border, selected surface/border, focus ring, pressed surface, disabled opacity, success/info/warning/error/destructive accents, playback accent and draft accent. Defaults retain I-A navy surfaces and violet/blue/cyan emphasis. No new keyframes, animation/transition/transform declarations, dependencies, interaction stores or persistence fields.

- Hover: restrained navy surface and cool border. Current/selected: persistent violet fill and inset accent edge, retained when hovered. Existing ARIA/current/selected state supplies the owner. Native `:active` supplies a darker press and cyan inset edge, including on a selected control.
- Keyboard: dedicated 2 px cyan-white outline with 3 px offset. Cards expose focus-within emphasis while their focused child retains its own ring. The visually hidden import input highlights its visible label. Legacy pointer-only project-card/Mood-name outlines are suppressed only when focus-visible is false; focus management is unchanged.
- Buttons: explicit primary classes on capture/duplicate, track/comparison saves, playback and Export download; existing project-use actions share that primary treatment. Utility/open/reopen/reset actions remain quiet or secondary. Only actual destructive confirmation buttons/groups receive destructive emphasis. Remove clip remains an existing immediate action, without inventing a confirmation flow.
- Native inputs/selects/files/ranges/checkboxes/radios remain native. Filled text/select values get a restrained underline; required invalid input has an error border/edge. Read-only preview is dashed. Native select open state uses a blue border where supported. Sliders use violet accents and a clear static thumb; existing Genre split/seek progress owners remain unchanged. Disabled controls retain readable text, .72 opacity, restrained border, no selection/hover shadow and not-allowed cursor.
- Genre/Vocal/Mood selections, opened saved sources, rail sections and export-format choices share selection vocabulary. Missing ingredient cards are dashed and explicitly labeled; captured provenance stays separate from missing state. Disclosure open state uses blue text and underline, preserving native markers/keyboard behavior.
- Local track/Compare/rail/Genre/Mood draft labels expose existing dirty/saved state via data attributes. Saved labels use muted text; dirty drafts use violet. Immediately persisted project notes are not described as unsaved. There is no global dirty state.
- Timeline exposes existing attachment, eligible audible clip and playback state. Selected clip/project row are violet; mute is dashed with `MUTED` text, solo has blue lower edge and `SOLO`, unattached audio says `NO AUDIO`, and audible playback gets cyan lower edge/playhead. Legacy important color declarations were removed from timeline.css while geometry declarations stayed intact. No sequencing/trim/drag behavior changed.
- Compare retains A/B labels and existing audio-side ownership; explicit playing/paused labels and cyan lower edge show playback. The preferred side is labeled only from the user's existing local preference value; no winner is inferred. Saved/dirty observations remain distinct. Seed/cancel feedback is informational, rather than success-styled.
- Historical notices/rail history use blue framing and their existing explicit historical text; current project context remains labeled. No hydration behavior changed. Export validation uses its existing blocker/warning/info classification; ready heading is success-colored. Export completion/error now reuse StatusNotice with existing local feedback/error state and polite/assertive semantics. Existing generic domain messages stay neutral informational; their text remains authoritative.
- Native hidden behavior remains explicit. No model/lib, storage key/schema, renderer, analysis, PlaybackIntent, SessionAudio or shortcut handler changed. Visualiser source edit is a presentation attribute/class on its existing playback button only.

## Automated gate

- `npm test`: 251 pass, 0 failures/skips. Existing tests unchanged. No artificial CSS unit tests added.
- `npm run build`: TypeScript/Vite production build pass.
- `git diff --check`: pass (Git's LF-to-CRLF informational warning is not a whitespace error).
- Source sweep: no new keyframes, animation, transition or transform declaration in the I-B layer. No changed src/lib files; no dependency/version/schema changes.

## Live desktop acceptance

Local Vite app in the in-app browser, development StrictMode, at 1664 × 920 CSS px. Review project: `I-B interaction acceptance`. The pre-existing `Phase B verification` project and its libraries were not edited. The review project remains locally available for user review; reload cleared its session audio. `interaction-tone.wav` is a generated 12-second PCM test source, not user media or fabricated telemetry.

- Current Create and hovered Tracks simultaneously measured different surfaces: selected RGB 41/32/71 with violet inset edge; hover RGB 25/38/59 with no selection edge. Current keyboard focus simultaneously retained RGB 180/245/255 solid 2 px outline. Pressing current Create measured RGB 17/27/45 with cyan inset outline. Pointer module hover and native disclosure focus coexist without movement.
- Native project select ArrowDown/Enter switched to the existing project; review project restored afterward. Genre ArrowRight changed 60 to 65; Vocal Power ArrowRight changed 50 to 51. Mood selected Dreamlike. Explicit Use actions attached each ingredient. No persistence/library defaults were invented.
- Native empty required Persona submission was blocked and focused the invalid input. Final measured error border RGB 255/173/186 alongside the distinct focus ring. Disabled Save reference measured RGB 23/32/46 surface, RGB 70/81/105 border, .72 opacity and not-allowed cursor.
- Snapshot shortcut focused Snapshot title; capture State A and explicit duplicate State B retained captured settings with no copied audio/Timeline/comparison membership. Editing track notes ignored Alt+Shift+C; invoking it outside the field seeded A in Compare and left same-track B disabled. The snapshot handler/guards remain unchanged and covered by the existing suite.
- Timeline selected State A, mute/unmute, solo/unsolo, audio attachment and real playback were exercised. Selected solo measured violet outer border/edge with blue lower edge. Audible clip and timeline state reported true while real media played. Unattached/muted and playing/solo screenshots retain text markers. Reload returned to truthful unavailable audio. No new Timeline behavior was introduced.
- Compare created a saved A/B pair, saved human B preference and conclusion, played A, switched to B and paused. Side A could be playing while B was explicitly preferred; preference did not follow playback. After switching, B playback was true with graph count still 1. Confirm comparison deletion was opened/cancelled. Track removal confirmation named one saved comparison and one timeline clip; Keep track retained all records.
- All three historical Genre/Vocal/Mood reopens showed captured State B and exact-values/explicit Use messaging; no automatic current-project mutation. Attachment handoff focused the exact Reattach local file input outside hidden views.
- All four rail sections activated. Track notes changed dirty → saved; Save disabled when unchanged. Native Ctrl+Z removed the typed test suffix. Current project notes remained immediate-persistence fields.
- Visualiser Spectrum default, Waveform via Space, Radial via Enter, Play/Pause and live time were exercised. Playback measured advancing media time. One HTML audio element, one canvas and `data-graph-creations=1` remained across playback/navigation/switching. Reload retained one element/canvas and cleared imported session tracks normally. This does not repeat native DPR/codec stress tests.
- Export reviewed ready brief/JSON, partial-project warnings and no-project blocker/disabled actions. Copy succeeded. Temporarily rejecting clipboard.writeText through development CDP produced the existing recovery text in a role=alert StatusNotice; the original function was restored. JSON clipboard parsed as sonic-studio.project-export/schema 1/audioIncluded=false. Download reported `Download requested`; the automation download event timed out and no matching file was found in Downloads. Actual saving is unverified; no saved-file success is claimed.
- Keyboard review: 132 native Tab/Shift+Tab samples, including four normal browser-chrome boundary samples. All 128 sampled page controls were visible, outside native hidden views, focus-visible and had a solid ring. Sampling covers all four destinations; this is not a complete WCAG audit or exhaustive focus traversal of every field.
- Final console warn/error collection: empty. Locator/time-out errors occurred in the automation, not in app console logs.
- Accepted static geometry remains: sidebar 200 px; workspace header 60 px; rail 310 px; hero 144 px. Structure, content ordering, four destinations/five steps and listening ownership retained.

## Responsive smoke

24 checks: all four destinations plus detailed Genre/Vocal/Mood/Export at each width. No page-level horizontal overflow. Native internal stepper/Timeline scrolling retained. Details: [responsive-smoke.json](verification/phase-ib/responsive-smoke.json).

| Width | Client / maximum scroll width | Result |
| --- | --- | --- |
| 1280 | 1265 / 1265 | Eight surfaces pass |
| 390 | 375 / 375 | Eight surfaces pass |
| 320 | 305 / 305 | Eight surfaces pass |

## State evidence

- [Current navigation + focus + hover](verification/phase-ib/create-current-focus-hover.png)
- [Module hover + child focus](verification/phase-ib/module-focus-hover.png)
- [Vocal selections + focused slider](verification/phase-ib/vocal-focus.png)
- [Invalid input](verification/phase-ib/invalid-input.png)
- [Unattached/muted selected clip](verification/phase-ib/timeline-unattached-muted.png)
- [Playing solo clip](verification/phase-ib/timeline-playing-solo.png)
- [Compare playback vs preference](verification/phase-ib/compare-playing-preference.png)
- [Compare paused selection](verification/phase-ib/compare-selected-paused.png)
- [Historical draft](verification/phase-ib/historical-draft.png)
- [Rail dirty draft](verification/phase-ib/context-notes-dirty.png), [saved notes](verification/phase-ib/context-notes-saved.png)
- [Export ready/success](verification/phase-ib/export-ready-success.png), [error](verification/phase-ib/export-error.png), [warning](verification/phase-ib/export-warning.png), [blocker](verification/phase-ib/export-blocker.png), [JSON request](verification/phase-ib/export-json-download.png)
- [Destructive confirmation](verification/phase-ib/track-destructive-dependencies.png)
- [Visualiser playing Radial](verification/phase-ib/visualise-playing-radial.png)
- [320 px overview](verification/phase-ib/create-320.png), [keyboard samples](verification/phase-ib/keyboard-samples.json)

Some screenshots were captured during the consistency sweep; final computed-style and keyboard checks above are authoritative for the corrected invalid border, neutral idle playhead, hover/disabled precedence and pointer-focus suppression.

**Result: Phase I-B local gate PASS.** No known blocking state inconsistency in reviewed workflows. Full accessibility/contrast hardening and responsive redesign remain I-D; motion remains separately authorized I-C. Download saving and exhaustive native/browser/device coverage are unverified. No commit/push/deployment; user visual acceptance remains separate.

## Screenshot output investigation — 2026-10-06

The earlier screenshot API returned processed JPEG bytes under .png filenames. A direct CDP PNG capture at the browser's native 690 x 572 size is sharp (`native-size-preview.png`), while an enlarged 1664 x 920 viewport capture remains visibly blurred even as genuine PNG. This indicates a capture/viewport-output limitation; JPEG compression is not the entire cause. The live page reports DPR 1, visual viewport scale 1, CSS zoom 1 and no shell blur filter. Replaced create-current-focus-hover.png with genuine PNG, but its enlarged-view text remains blurred. Earlier screenshot evidence is therefore limited for judging fine visual detail; DOM/computed-style, interaction and geometry checks remain separate evidence. No product CSS/code changed for this investigation. The exact scaling/capture cause is unresolved.
