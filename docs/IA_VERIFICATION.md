# Phase I-A — Reference Fidelity verification

Date: 2026-10-06 (Europe/London). Package version: 2.0.0.

## Baseline and scope

Clean baseline: `17b933115a70c84c33a40a2d8b1357bc944937ec` — Implement UI/UX Overhaul phases G and H. Preflight read PROJECT, CHANGELOG, DECISIONS, ROADMAP, AGENTS and the Astraea philosophy; baseline suite passed 251 tests, build and diff check. No reset, commit, push or deployment.

Reference: user-supplied `C:/Users/Pc/Downloads/ChatGPT Image Oct 6, 2026, 12_03_14 AM.png`, the approved Neon Music Production Dashboard. The later animation boards were not used. Static layout and presentation only; no library/model/persistence/audio/render-loop changes, new dependencies or generated raster requirement.

## Before / after composition

The baseline had an application-wide header above the sidebar, a 236 px appended rail, generous outer gutters, a tall workflow box, oversized tool introductions, and text-heavy identity cards. Those differences were addressed in framing/proportion/hierarchy order.

At 1664 × 920 CSS px the shell measures 200 px sidebar, 60 px header and 310 px rail; the workspace is 1093 px with the browser's 15 px vertical scrollbar. The header spans only workspace/context columns. At 1280 px the sidebar/rail become 190/290 px. The rail moves below the workspace only below 1100 px. Narrow layouts retain internal workflow/Timeline scrolling and all product actions.

Create puts a 144 px hero, compact numbered workflow, captured identity cards and wide listening entry in the main frame. Cards use real Genre weights, captured Vocal controls and existing derived Mood DNA. Native disclosures retain provenance/removal, notes and the full brief. Empty ingredients stay empty. Decorative curves are static artwork; their caption explicitly directs users to Visualiser for live analysis.

Visualise presents its existing canvas above compact playback/session controls with one shared panel border. Visual Personality and diagnostics remain available. Tracks presents Timeline before the detailed track list and collapses only its explanatory sequencing prose. Compare preserves A/B handoffs, all factual provenance and observations. Export retains deterministic metadata/text actions and truthful format boundaries. The Context Rail keeps its own four section buttons and current-versus-historical projection.

`fidelity.css` consolidates background/surface/raised levels, borders, primary/muted text, violet/blue/cyan/magenta accents and an 11 px card radius without replacing existing engine-specific visuals. The font stack remains unchanged. No new animation or transition system.

## Automated gate

- `npm test`: 251 pass, zero failures/skips. Existing tests were not changed or weakened. No screenshot infrastructure added.
- `npm run build`: TypeScript and Vite production build pass.
- `git diff --check`: pass.
- Source diff leaves `src/lib`, persistence keys/schemas, PlaybackIntent, SessionAudio, audio analysis, Visualiser and its renderer untouched. Timeline source edit only wraps explanatory copy in native details.

## Live workflows

In-app browser on the local app, development StrictMode; screenshots at 1664 × 920. Test project: I-A reference acceptance. Temporary project/storage changes are restored after verification.

- Created a test project through real controls, explicitly attached Genre 60/40, Vocal power 51 and Dreamlike influence 50 through existing editors. Populated overview displayed those values and seven actual Mood dimensions. Detailed Genre/Vocal/Mood editors remained mounted and usable.
- Snapshot Historical A and explicit duplicate Historical B produced separate records; duplicate initially had no audio, clips or comparison links. Track selection and historical rail context remained separate from playback identity.
- Attached a generated local 12-second PCM WAV through existing file chooser controls. Timeline A was trimmed to 0–8 seconds; positioning, playhead, mute/unmute and solo/unsolo worked. Added B at 8 seconds for a two-clip arrangement. Timeline playback advanced; navigation paused it. The sequencing engine was not changed.
- Compare selected track seeded A; selecting distinct B created a real saved comparison. Conclusion saved. Attach/reattach handoff focused the exact track file input. Attached B, exercised Play A / Switch / Pause, and opened historical A/B in Visualise with the Compare return path.
- Visualise played real attached audio with advancing time and nonzero diagnostics. Spectrum/Waveform/Radial controls worked. Observed one audio element, one canvas, and `data-graph-creations=1` across navigation and switching; at DPR 1 the 1063 × 280 CSS canvas had a 1063 × 280 backing bitmap. This slice does not reverify native OS DPR transitions or broader codec coverage; those accepted results remain in earlier verification records.
- Changed current Genre to 65/35. Reopen Genre from Historical A loaded captured 60/40 without updating current identity. Vocal and Mood historical reopens showed Historical A, exact captured values and explicit Use/Replace messaging. Rail simultaneously distinguished current 65/35 from historical 60/40.
- Alt+Shift+S focused Snapshot title. Alt+Shift+C invoked the selected-track Compare seed; cancellation left no new comparison. Existing editable/native shortcut guards remain covered by the unchanged suite.
- All four rail sections remained functional. Current project note and Historical B track note saved separately; guidance retained historical provenance and did not incorporate annotations.
- Export text copy contained the real project brief. JSON clipboard parsed as `sonic-studio.project-export`, schema 1, audioIncluded=false, two histories, one clip and one saved comparison at export time. Both downloads were requested; the browser download event did not expose a path, but actual files were located and inspected in Downloads: text 3147 bytes; JSON 5316 bytes. JSON preserved current Genre weight 65 versus historical 60 and excluded audio. A second Timeline clip was added afterward, so final screenshots correctly show two clips while the earlier export contains one.
- Project switching, empty ingredient state and no active project reviewed. Reload preserved the fixture's saved identities, annotations, two clips and comparison while clearing session audio as designed.
- Keyboard sample tabbed through Export and rail until focus left the document: no sampled target was hidden/zero-height; nine sampled controls had a solid visible focus outline. Native `hidden` and closed `details` keep concealed controls out of normal Tab order. This is a regression smoke, not I-B's full interaction audit.
- Final warning/error logs empty. Tool locator/time-out errors were automation errors, not browser console errors.

## Responsive smoke

Each width used height 900. All four destinations plus Genre, Vocal, Mood and Export were opened through real buttons; Visualiser was also reached through the workflow. Native scrolling kept actions reachable.

| Requested width | Document client width | Maximum document scroll width | Result |
| --- | --- | --- | --- |
| 1280 | 1265 | 1265 | No page overflow in all eight states |
| 390 | 375 | 375 | No page overflow in all eight states |
| 320 | 305 | 305 | No page overflow in all eight states |

Scrollbar consumes 15 CSS px. The five-step strip and Timeline retain deliberate internal horizontal scrolling. This is reachability/regression coverage, not full I-D redesign.

## Direct visual review evidence

Representative states reviewed against the supplied reference's region balance and content hierarchy:

- [Populated Create and current-project rail](verification/phase-ia/create-desktop.jpg)
- [Detailed Genre historical editor](verification/phase-ia/genre-editor-desktop.jpg)
- [Populated Tracks, two clips and historical rail](verification/phase-ia/tracks-desktop.jpg)
- [Saved A/B Compare](verification/phase-ia/compare-desktop.jpg)
- [Attached-audio Visualise](verification/phase-ia/visualise-desktop.jpg)
- [Valid Export](verification/phase-ia/export-desktop.jpg)
- [Empty ingredients](verification/phase-ia/empty-project-desktop.jpg)
- [No active project](verification/phase-ia/no-project-desktop.jpg)
- [320 px Create](verification/phase-ia/create-320.jpg)

The major framing, compact hero/workflow/cards, wide listening emphasis and integrated rail pass local structural comparison. Product architecture deliberately keeps live analysis in listening destinations and Timeline in Tracks; this is not pixel-identical reproduction of every tool in one screenshot.

Remaining visual differences: static vector artwork replaces the concept portrait/photos; two supported Genre sources replace its three-source example; seven actual Mood axes replace its aspirational chart; the locked canvas renderer retains its accepted green signal palette; longer real provenance/observations remain below the first viewport. None is represented as unsupported functionality.

Omitted: outdated sidebar destinations, search, BPM/time-signature analysis, account/settings/notifications, AI Guidance/Tools, Sound Library/templates/cloud saves, 3D/particle modes, audio rendering/sample-rate/stems/normalization and collaboration. Real deterministic guidance and text/JSON exports remain available.

**Result: Phase I-A local Reference Fidelity gate PASS.** User visual acceptance and commit approval remain separate. Full Phase I is incomplete; I-B, I-C and I-D have not begun.
