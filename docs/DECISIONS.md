# Decisions

## 2026-10-06 — Browser URL owns primary workspace navigation

Use a small History API router without adding a dependency. `/` and invalid paths resolve to `/dashboard`; the six top-level workspaces are Dashboard, Genre Mixer, Vocal Persona, Mood Mapper, Visualiser and Project. Project subviews use the `tab` query parameter so Overview, Tracks, Compare and Export remain one management workspace. Sidebar active state is derived from the URL, and normal browser history remains authoritative.

`StudioProvider` owns the existing shared project controller and transient cross-route state; it does not add persistence or a second project copy. `StudioLayout` owns persistent chrome, and route content composes the established feature components. Editor selections and drafts remain session-only.

The Visualiser component remains mounted as a session owner because its existing cleanup releases browser `File` URLs and its media element. It therefore keeps one hidden audio element and the in-memory track library across soft navigation, but renders the full Visualiser workspace only on `/visualiser` and Project Compare. This satisfies the Dashboard boundary without duplicating or rewriting playback, analyzer, canvas or project logic. A hard browser reload still clears session audio as before.

## 2026-10-06 — `example-dash.png` specifies the complete Home composition

The user's latest instruction makes `Images-dashboard/assets/example-dash.png` the Home visual and interaction reference, including the hero, four destination cards, navigation, top bar, and four-tab context rail. This expands the earlier motion note that treated it as panel relationships only. Project names, tempo, moods, and active ingredients still come from the canonical active project; unavailable fields stay unavailable. This preserves the existing live-data decision and project/editor/audio owners while making the screenshot's layout and styling authoritative.

## 2026-10-06 — Supplied motion sheets govern shell choreography

The user explicitly authorized the motion references in `Images-dashboard/assets` as requirements. Their 200 / flexible-min-720 / 310 px desktop relationship, 16 px focus transfer, panel collapse/reveal and directional exit/entry supersede the earlier I-C restrictions against width interpolation and exit choreography. At widths below 1280 px, retain the existing stacked layout rather than shrinking the reference desktop minimum or hiding controls.

`useReferenceMotion` and `MotionSidePanel` own only transient presentation: collapsed/expanded sides, focus transfer, the selected guidance target and cancellable one-shot animations. No package, schema, domain or media owner is introduced. Native View Transitions capture only the centre's pixels, not another React tree; browsers without that API use sequential 175 ms exit/entry on the same element. Rapid requests discard obsolete navigation callbacks. Selection echoes and fallback navigation use separate animation lifetimes so feedback cannot cancel the incoming scene. Reduced motion bypasses optional choreography; hidden-document/unmount cleanup stops owned effects.

Rail follow reorders the existing Genre/Vocal/Mood guidance blocks while keeping the rail and note state. Guidance continues to describe captured project or selected historical identity; editing a draft does not capture it. The 550 ms bridge and 700 ms shared-edge pulses occur only after the existing explicit ingredient capture callback. The default desktop rail and navigation can become 48 px ambient strips; inert content cannot trap keyboard focus, and strip hover/click restores access. Visualise uses these same panels and the same mounted analyser/player/canvas. No continuous JavaScript animation loop or resizing feature is added.

## 2026-10-06 — Component assets describe treatments on real states

The user accepted the two-reference pilot and authorized the other 19 assets together. Cropped and duplicate panels are component specifications, not separate screens or new business state. Reuse the original high-resolution hero/wave artwork and preserve live Genre/Vocal/Mood values. TSX computes chart geometry; CSS animates toward those actual values. Preview artwork motion remains decorative; Live Preview retains the existing analyzer and player.

Loading treatments appear only during the existing pending clipboard operation, without invented progress percentages or audio-render claims. Toast visibility/timers are presentation state; callers own the operation/message. Success/info expire after six seconds, pausing on hover/focus; errors/warnings require dismissal or a subsequent operation. Returning to a destination does not replay old events. Metadata export keeps its existing accessible inline feedback. No saved schema or media ownership changes.

## 2026-10-06 — User resolves Home fidelity versus live-data conflict

The user chose **“Live project values on Home; match reference styling only.”** This supersedes the earlier Home reference-preset decision. Home must project actual captured Genre weights, computed BlendProgress relationships, Vocal values and all seven Mood DNA dimensions. It must not restore Electronic/R&B/Cinematic, 92%, five illustrative vocal values or six reference mood labels as pretend project data.

Reference parity applies to layout, density, source thumbnails, wave artwork, rail height, borders, cyan/violet glow and controls. Source count and chart labels/geometry follow the real model. Both active chats should preserve this resolution. The existing canonical editor, persistence and audio owners remain unchanged.

## 2026-10-06 — Isolate the active Home reference presentation

The current fidelity task explicitly requires three reference sources and 92% compatibility on Home. `ReferenceStudioModules.tsx` therefore owns that display preset, with an info control exposing the actual captured sources and computed BlendProgress. This supersedes the concurrent chart change's removal of that preset from Home for this reference task; the standalone Genre Mixer and Mood Mapper retain their calculated charts. The preset is identified as artwork/reference data, never a computed result.

`ReferenceContextRail.tsx` preserves functional section tabs and existing save/editor callbacks while projecting Project Info, derived Guidance, Mix Notes and WAV settings together. Separate presentation components and final reference styles prevent concurrent captured-source styling from replacing the requested geometry. Domain, persistence and audio ownership remain with the existing project systems. Full visual acceptance is still pending.

## 2026-10-06 — Blend Progress and Mood Mapper stay derived from canonical project inputs

Blend Progress displays the existing lead Genre's weight in its ring and the four relationship counts from `analyzeCompatibility`. It is a source-share visualization, not an overall compatibility score. Home renders the active project's Genre pair by default; no reference-preset 92% value or substitute sources are presented as project data. Mood Radar uses the existing seven-axis `MoodDna` result in the Home summary and Mood Mapper, with the mapper's numeric rows remaining visible. An empty mapper draft stays empty rather than receiving a decorative profile. SVG geometry stays in TSX; CSS owns chart color, glow and scoped motion. These chart animations keep the existing reduced-motion and hidden-view behavior. No project state, saved schema, audio, timeline or navigation owner changes. This supersedes the Fidelity Pass 2 reference-preset display decision below for Blend and Mood data.

## 2026-10-06 — Fidelity Pass 2 distinguishes reference display presets from captured identity

The user's explicit second fidelity pass requires the target's three-source Electronic/R&B/Cinematic composition and 92% High Compatibility label. This supersedes the previous Target Parity decision's restriction on displaying those values. They now belong to an identified reference display preset, isolated in `ReferenceStudioModules.tsx`; they do not overwrite captured two-source Genre identity or pretend to come from the compatibility analyzer. The info control switches between the reference preset and captured sources with computed BlendProgress. Concurrently introduced computed BlendProgress and MoodRadar components remain intact in their native workflows.

Visualiser style tabs select artwork previews, including the target's exact wave artwork; Live Preview retains the existing analyzer. WAV/sample-rate/Stems/Normalize controls configure a visual request preview. Generate / Render reports the renderer's absence instead of downloading metadata under an audio label or claiming an audio result. Save remains canonical project persistence. Connecting a real audio renderer is a separate implementation scope with signal/output verification.

Dashboard Mute/Solo edits the existing Timeline clips and persists through the existing project updater. It introduces no second Timeline, player, source-audio store or gain control. The adjacent thin track meter is decorative clip-presence framing, not a volume slider.

## 2026-10-06 — Target Parity opens a real starter and projects the arrangement on Home

The explicit Target Parity request supersedes the earlier no-project startup composition for the initial Studio view. Startup selects an existing Midnight Echoes record, otherwise creates a valid starter in the existing project controller; it preserves all other saved projects. The starter stays session-only until an ordinary Save/update persists it. Reload deliberately returns to Midnight Echoes while the selector can still open other projects.

Home now uses an equal three-column creative grid and a compact projection of persisted track/clip metadata, with direct handoffs to the existing Timeline editor in Tracks. This extends the earlier decision to locate the editable Timeline in Tracks; there is no second arrangement or playback owner. Context sections appear together on Home, while established context workflows remain available in other destinations.

Supplied target artwork is reused for hero/thumbnail decoration. Native two-source Genre, four-dimensional Voice, seven-axis Mood and metadata-only Export contracts remain unchanged; inventing a 92% compatibility score, additional persisted dimensions, playable stems or WAV rendering was rejected. Visualiser artwork is explicitly labeled and points to existing live analysis. Exact feature parity requires separately authorized domain work.

## 2026-10-06 — Motion is a final presentation layer over existing states

Phase I-C adds a dedicated CSS layer after fidelity, interaction and empty-state CSS. Shared duration/easing tokens animate only existing endpoints; layout dimensions, audio clocks and canvas modes never interpolate. The hero is the single continuous decorative surface; other artwork stays static. Native hidden surfaces cancel animations. Reduced motion removes optional effects and focus/disabled feedback stays immediate. Pointer lifts/scales require hover and a fine pointer.

Rail section and Export-operation keys replay short presentation entry using existing owners. Rail drafts remain above the keyed panel and Export feedback remains local, truthful and guarded by its existing operation ref. No global motion state, animation framework, decorative JS loop or new persisted state is justified. Workspace transitions have entry only, without exit choreography or duplicate mounting. Future motion work must preserve these limits and distinguish a download request from confirmation that a file was saved. This extends, rather than supersedes, the I-B endpoint convention.

## 2026-10-06 — Interaction states consume existing owners and keep separate meanings

Phase I-B defines static endpoints in one final interaction-state CSS layer using shared tokens. Hover signals interactivity through a cool surface/border; selection persists as violet fill/edge; keyboard location gets an independent offset cyan-white ring; cyan playback can coexist with violet selection. Historical framing and explicit labels remain separate from current identity. Dirty styling applies only to existing local drafts, never to immediately persisted project fields. Destructive emphasis is reserved for actual confirmation context. StatusNotice remains the shared semantic feedback component; Export reuses it instead of introducing toast/status infrastructure.

These meanings must survive simultaneous hover, focus, selection, mute/solo, disabled and playback states. Native pseudo-classes, existing ARIA/classes and presentation attributes derived from existing component state are sufficient; new persisted/control stores, custom native-control replacements and per-component palettes were rejected. Phase I-C may animate these endpoints only under separate scope, and must preserve focus visibility, disabled precedence, textual historical/preference/availability distinctions and existing audio/state ownership. This extends I-A presentation without reversing its composition or earlier domain decisions.

## 2026-10-05 — Export is a separate deterministic interchange projection

Phase G introduces sonic-studio.project-export schema 1 rather than exposing the browser-storage envelope. Explicit nested cleaners project current identity and historical saved records; stored timestamps stay authoritative and no generation timestamp enters the payload. JSON contains metadata, never playable audio or runtime/draft state. Brief notes are a separately labeled appendix and never alter musical guidance. Empty metadata is useful; a brief needs at least one ingredient, and partial choices are warnings. A browser download is only acknowledged as requested because the browser does not confirm saving to the app. Rendering and import are excluded. This supersedes the earlier deferral of exporting while retaining the existing storage and notes/guidance boundaries.

Export occupies the existing fifth creative step under Create, leaving four product destinations and Timeline inside Tracks. Navigation follows the existing playback pause rule; export copy/download themselves are read-only.

## 2026-10-05 — Power actions reuse track snapshots and editor-owned historical drafts

Phase H creates no Experiment store. Snapshot/duplicate are explicit validated ProjectTrack actions. Duplication preserves exact captured identity and source metadata with new ID/timestamps, optional saved notes, no file metadata/audio or comparison/Timeline membership. Compare seeding remains session-only and does not create a comparison.

Historical requests clone creationSnapshot values once, with request/project IDs and source labels for explanation. Existing editors retain drafts and detach selected mutable library records; source IDs never fetch today's values as history. Explicit Use/Replace is required for project changes. Edited drafts detach captured source provenance; successful Save as new establishes a new source, preserving original libraries and track history. This avoids moving creative state into the shell or overwriting saved sources. Selection of a newly created track validates the resulting project rather than the previous React render.

Alt+Shift+S opens the visible snapshot form and Alt+Shift+C invokes visible Compare selected track. The handler ignores editable contexts, native editing combinations, composition, repeated/prevented events and AltGraph; it installs/cleans one listener. Snapshot focus takes precedence over destination-heading focus. No global undo, command palette, implicit snapshot history or automatic creative decision is introduced.

## 2026-10-05 — Timeline remains an arrangement region within Tracks

Keep the Phase B product navigation at Create → Tracks → Compare → Visualise and its creative stepper at Genre Mixer → Vocal Persona → Mood Mapper → Visualiser → Export. Phase E's Timeline is a separate arrangement region in the Tracks workspace, not a fifth product destination or another creative step. This preserves the approved distinction between the Studio destination and the creative dimension being edited. It supersedes the temporary Phase E integration placement recorded in the timeline decision below while retaining that decision's project storage, single-player, overlap, trim, mute, and solo rules. Timeline sequencing runs while the Tracks workspace region is visible; entering Tracks pauses pre-existing playback, and leaving Tracks stops sequencing.

Deleting a project track that has saved comparisons or timeline clips requires explicit confirmation. The confirmation names and counts both kinds of dependent records before the existing cascade removes them; the project model also rejects an unconfirmed cascade.

## 2026-10-05 — Timeline arrangements share the project envelope and one playback owner

Phase E stores timeline clips as an additive field on `StudioProject` under the existing `sonic-studio.projects.v1` key. Older projects load with an empty timeline. Clips reference existing project tracks and hold arrangement/source-bound metadata only; clip selection, playhead and audio attachments remain session state. This keeps project arrangements durable without adding a second persistence or media owner.

The timeline sequences eligible clips through the existing Visualiser bridge and single audio element. Muted clips are excluded; when any clips are soloed, only unmuted solo clips are eligible. At each arrangement time, the latest eligible start wins, with project row and then ordinal lexical clip ID as deterministic tie-breaks. Overlaps are never mixed: a later clip shadows an earlier one for its full eligible interval, and the earlier clip does not resume when the later clip ends. If no eligible clip remains, playback stops cleanly. **Historical integration placement (superseded by the decision above):** Timeline was temporarily treated as a listening destination; it is now a workspace region within Tracks. Project storage and single-player behavior remain in effect.

## 2026-10-05 — Visual Personality derives from Genre and Mood without changing source ownership

Phase D adds a read-only Genre adapter at the existing six-axis Visual Personality boundary: energy maps directly; tension uses `intensity.strength`; atmosphere uses `production.strength`; motion maps the midpoint of the Genre BPM range from 50–180 BPM into 0–100; weight uses `bass.strength`; and valence is `100 - darkness`. When both saved Genre and Mood sources exist, corresponding axes use an equal-weight mean; a lone source passes through unchanged. Mood intimacy remains unused because Visual Personality has six axes. These mappings make previously deferred Genre identity visible without moving source ownership into the renderer or changing any persistence contract. Current identity comes from active project state; historical identity comes only from the explicitly opened track's immutable creation snapshot. This supersedes the 2026-10-04 v1.9 decision that deferred Genre and used Mood only.

## 2026-10-05 — Studio destinations and creative steps are separate navigation layers

Phase B keeps Create / Tracks / Compare / Visualise in a persistent product sidebar and presents Genre Mixer / Vocal Persona / Mood Mapper / Visualiser / Export in a distinct creative workflow stepper. The sidebar answers which Studio destination is open; the stepper selects a creative editor or listening stage. Both dispatch through the existing StudioShell state, so this separation adds no route or navigation persistence schema. Project switching reuses `useStudioProjects` through the existing project list; it does not create another project owner. Export is deferred, and the right context rail is a structural slot only until its separately scoped phase.

The shell is decomposed into presentational parts around the existing domain editors, project records, comparison flow and single Visualiser mount. This keeps future interaction changes narrow and lets later context/export work attach to stable workspace regions without moving Genre, Vocal, Mood, project, track, comparison or playback state into a new store. Phase A and B remain a parallel integration boundary; `StudioShell.tsx` and `studio.css` need a deliberate rebase/review before canonical adoption.

## 2026-10-05 — Phase A/B integration retains their separate state and presentation owners

The parallel Phase B shell is integrated locally around the Phase A interaction contract. The shell components own presentation and navigation intent; project-scoped track selection remains ephemeral in `studioInteraction.ts`, while project data, editors, comparison and Visualiser retain their existing owners. The creative stepper remains visible on Tracks and Compare and retains the selected creative step, so the product destination and creative step remain distinguishable together. `StudioShell.tsx` and `studio.css` are the combined integration points. This supersedes the earlier note that a rebase was still required; the local integration remains uncommitted pending Edge reference acceptance.

## 2026-10-05 — Studio track selection is ephemeral and separate from listening context

Generic project-track selection is a session UI concept scoped by both active project ID and track ID. It supports Studio-wide selection feedback but does not persist into `sonic-studio.projects.v1`, control playback, select a Compare side, or replace the historical Visualiser `openedTrackId` handoff. Project switching and track removal invalidate stale selection through one pure reconciliation helper. This keeps project identity, local audio selection, comparison state, and historical provenance as distinct owners.

Phase A declares no global Studio operations undoable. Native browser field undo remains available; persisted project/domain mutations and destructive confirmations retain their current semantics. A later undo layer needs a concrete reversible session action or timeline edit and an explicit declaration before it can participate.

Major workflow changes focus the destination heading (`tabIndex=-1`). A deliberate track request overrides that destination focus to focus the track's attachment control after Tracks becomes visible. There are no global shortcuts in Phase A; future handlers must exclude editable targets and native editing combinations.

## 2026-10-05 — Final workflow belongs to a Studio shell, not the domain models

v2.0 replaces the four independent global lab destinations with Create, Tracks, Compare and Visualise. App only mounts StudioShell; useStudioProjects owns the existing persistence controller. The shell coordinates the active project, secondary Create editor state, session attachments and listening/return context. Existing Genre/Vocal/Mood editors retain all engine and library ownership. Project snapshots, track history and comparison records retain their previous contracts and schemas. Routes and return context stay session-only; no new state framework or persistence migration is justified.

The editors and Visualiser remain mounted behind hidden destinations, retaining tool edits and the one player/analyser owner. Tracks and Compare remain mounted per active project so destination changes preserve editing drafts. Switching projects deliberately resets these project-specific drafts, pauses playback and clears historical listening context; it never deletes records or session attachments. The active-project name and compact counts remain visible everywhere. Project management is a compact disclosure rather than duplicated controls in every destination.

Compare and Visualise are listening surfaces for the same Visualiser. Compare displays its player/seek controls compactly and drives the established bridge; switching A/B preserves approximate elapsed seconds and the captured Mood. Create/Tracks navigation deactivates PlaybackIntent; Compare/Visualise transitions retain the same owner. An explicit Open A/B in Visualise records only a session return destination; the selected saved comparison remains mounted. A second comparison player was rejected because it would duplicate media, graph and lifecycle authority.

Historical identity requires the explicitly opened track ID to match its session attachment and the selected local source. Shared audio does not determine historical identity by itself. Choosing standalone session audio clears the handoff, so it uses current Mood/Classic/previews without inheriting a linked record's captured Mood. SessionAudio remains the object URL owner; association IDs are session-only. Project storage and independent library keys are unchanged. This supersedes Stage 1–3's temporary composer-above-labs composition, not their proven domain or playback models.

## 2026-10-05 — Comparisons reference historical tracks in their owning project

Stage 3 stores `TrackComparison` under StudioProject with its own schema version 1, stable ID, track A/B IDs, six text observations, optional preferred A/B ID, conclusion and timestamps. Two existing distinct tracks in the same project are required; null preference is fully valid. Observation edits cannot change the pairing or creation timestamp, so a new experiment between different tracks needs a new comparison. Referencing track IDs rather than duplicating source snapshots keeps each track's immutable creationSnapshot authoritative; metadata labels continue to reflect their track record. Observations are human judgments and factual provenance differences never infer quality, score or a winner.

The existing schema 1 envelope/key evolves additively, normalizing missing comparison lists to empty arrays. Invalid/unsupported/dangling records and duplicate IDs are skipped independently; unknown fields are stripped in both comparison and observation structures. This preserves existing Stage 1/2 data and avoids a competing global store or unnecessary key migration. Read/write denial retains session state with the established warning path.

Stage 3 extends the Stage 2 track-removal policy: removing a track with comparison dependencies is blocked by default in the pure model. The UI states the dependency count and requires explicit confirmation of deleting associated comparisons along with the track. Only that confirmed call authorizes the cascade; unrelated comparisons survive. Retaining orphan comparisons would require copied track identity and confusing unavailable references, so it was rejected for this scope. Parsing rejects external/damaged dangling references rather than redirecting them. Comparison deletion affects no track or session source; project deletion deletes its complete contained records. Future recovery/export or immutable comparison-label archives require separate scope.

## 2026-10-05 — Provenance differences are factual source comparisons

The pure difference helper compares only the two creation snapshots. It reports missing/present ingredients, ordered Genre and Mood sources, exact weight-only changes, source origin metadata, and each named Vocal control/identity description; equal fields explicitly report unchanged. Vocal property insertion order has no meaning. No derived Mood DNA threshold, resemblance metric, perceptual judgment or automated preference is stored or inferred. Source summaries explain the experiment while existing collapsed track briefs remain the path to full generation guidance. Future catalogue changes can affect regenerated labels/prose, not the stored source values.

## 2026-10-05 — A/B commands share one player and preserve an approximate clock position

The comparison layer lives in Studio above the track model. It commands generic play/pause on the existing Visualiser bridge; the audio owner receives only session source IDs and a position-preservation flag, never comparison records, observations or preference. App publishes the chosen historical record and source together, so its captured Mood reaches the same VisualPersonality boundary; no captured Mood gives Classic. Each comparison Play/Switch restores that historical personality after deliberate previews, without writing any source identity.

Source loading occurs synchronously in the user gesture before the existing PlaybackIntent starts media/context operations. The selection effect skips reloading a source already prepared by that command, preventing it from cancelling the new startup. A small pending `TrackSeek` handoff is local playback state: it holds the requested second until duration becomes finite, applies once on metadata/duration updates, preserves the desired second across rapid switches, and clamps to 50 ms before the next source's end. Explicit pause, navigation, selected removal, unmount, errors and manual seek invalidate pending handoffs. Context-start settlements continue to obey PlaybackIntent; no alternate graph, media element, analysis or animation loop is introduced. Existing session association/URL owners retain cleanup responsibility.

This is useful same-second switching rather than synchronized playback or waveform/section alignment. Seeking near a shorter source's end can finish immediately; a subsequent Play on the ended source restarts according to browser media behavior. Pending/unknown duration waits rather than inventing one. General equal-loudness, matching sections, dual playback, ABX and scoring were rejected as outside this stage; final navigation and release polish remain Stage 4 decisions.

## 2026-10-05 — Track history records copied source identity independently of the project

Stage 2 adds schema-version-1 ProjectTrack records beneath each StudioProject. A new result copies the project's current Genre, Vocal and Mood through the existing validated snapshot constructors. Subsequent ingredient changes, track metadata edits, removal and audio replacement cannot update that creationSnapshot. Title and free-text version are distinct; controlled source categories plus optional descriptive detail avoid vendor API coupling. Track notes remain annotations outside generated guidance. The historical brief is regenerated by the existing composition engine through a small snapshot adapter; storing large rendered output and resolving history through current project fields were rejected because they would duplicate output or rewrite provenance. Source/catalogue identities are preserved; future engine wording is still allowed to change.

Project/envelope schema 1 evolves additively under the existing `sonic-studio.projects.v1` key. Missing tracks in Stage 1 records normalize to an empty array, and track records carry their own version. A schema bump/new key is unnecessary for this backwards-compatible extension and would introduce avoidable migration/key handoff complexity. Malformed/unsupported tracks and duplicate IDs are skipped individually, retaining the parent and valid siblings. Unknown track/file/snapshot properties are stripped by the writer. Future incompatible changes still need an explicit migration strategy.

## 2026-10-05 — Project audio attaches to the existing session playback owner

App keeps project-track-ID → session-local-track-ID associations in memory; Visualiser retains the library, one HTML audio element, PlaybackIntent, one analyser graph and one canvas loop. A narrow imperative bridge exposes import/select/remove without duplicating decoding, analysis or playback. `SessionAudio` centralizes URL creation/revocation in Visualiser. Attachments referencing an existing local source share its URL; a project detach/removal releases that source only after the last project association is gone. Removing a session source directly in Visualiser leaves linked persisted records truthfully unavailable. Selected removal unloads media before URL revocation. Creating a replacement URL must succeed before the previous attachment is released; repeated release/unmount cannot revoke an already released URL.

Project storage contains metadata only: no audio bytes, File handles, URLs or playback state. Reload therefore requires reattachment. Filename, MIME type and size must match for Reattach; Replace Audio is a separate deliberate file-picker action and may update metadata, never provenance. Hashing, IndexedDB and audio-byte persistence were rejected as unnecessary for this gate. Storage failure keeps project records in session memory and the existing audio owner usable, with visible reload-loss feedback.

Opening a historical record selects its attached source and its own captured Mood through the existing VisualPersonality engine; absent Mood explicitly selects Classic. The selected historical record is tracked separately from the local audio ID because two records can share one source while having different identities. Opening restores the captured personality after a prior preview; users can still deliberately preview or choose Classic afterward. Playback must never write project ingredients or track snapshots. Independent local tracks retain the current-Mood/Classic preview behavior. A/B comparison and final navigation remain Stage 3 planning work.

## 2026-10-05 — Projects capture source identity through explicit one-way boundaries

Stage 1 adds a version 1 StudioProject and a dedicated `sonic-studio.projects.v1` versioned envelope containing projects and the active ID. Each ingredient is nullable. Ordered Genre IDs/weights, Vocal selections with optional saved-persona identity metadata, and Mood IDs/weights are cloned at capture. Project snapshots never resolve a mutable saved-source reference at brief generation time. App owns the project library and view navigation; each tool remains the sole owner of its builder and existing persistence. Explicit use/replace callbacks are the only composition boundary. Ingredient removal and project deletion affect only project records.

Automatic synchronization and moving builders into App were rejected because later edits would silently rewrite historical project identity. Source metadata explains provenance but does not create a dependency on the continued existence of the original preset/persona. Vocal selections reproduce identity through the existing engine; captured Voice DNA prose is not duplicated in project storage. This preserves current reproducibility while allowing future engine wording improvements, with the constraint that schema 1 does not archive catalogue/engine versions. Future releases must explicitly consider migration if exact historical wording is required.

Parsing rejects unsupported envelopes and skips malformed or duplicate projects independently, strips unknown fields and validates sources against current catalogues. Browser acquisition/write failures cannot crash mounting or live composition. Failed writes keep session state usable with a clear reload-loss warning. Cross-tab merging, export/archive recovery and cloud/filesystem stores are deferred. Confirmed project deletion uses an inline two-step UI: this makes the destructive choice visible in the composition surface and avoids blocking native browser dialogs.

## 2026-10-05 — Composition assigns musical responsibilities before combining prose

Genre owns its existing Sound DNA roles: BPM range, rhythm, bass, instruments, harmonic centre, production character and intensity. Mood must preserve that foundation: Motion chooses lower/middle/upper tendency inside the existing BPM range, Energy treats attacks/peaks, Weight biases low-end emphasis, and Valence/Tension shade voicings without replacing the tonal centre. Mood translation crosses the boundary only for density, space, texture and arrangement; contextual interaction cues take precedence over single-axis cues in those domains. With no Genre, mood-only output explicitly leaves BPM/instruments open and can use its overall translation. No unrelated mood BPM is invented.

Vocal uses the existing pure prompt/interpretation engine on copied selections. Mood directs emotional phrasing and the arrangement around the singer while explicitly preserving captured register, texture, delivery, power and effects; it never edits those selections. Notes are user annotations outside generated guidance. Missing ingredients remain open choices rather than fabricated defaults. Determinism applies to identical snapshots with the same catalogue/engine release, not to unknown future catalogue revisions. These rules avoid competing foundation claims from a direct concatenation of the tools' full independent recipes.

## 2026-10-04 — Visual personality is a read-only, signal-dependent configuration

v1.9 introduces a generic musical-characteristics → VisualPersonality → renderer boundary. It uses the actual Mood DNA axes, rather than inventing aggression/warmth dimensions or importing Mood/Genre objects into canvas code. A read-only App projection observes Mood Mapper's current fingerprint; Mood Mapper remains the sole owner of source selections and presets. Existing Dreamlike/Aggressive catalogue previews make live controlled comparisons possible without editing or persisting mood state. Genre/Vocal mappings are unnecessary for this gate and remain deferred.

Energy changes gain, tension changes stroke/spectral detail, atmosphere changes waveform glow, motion changes bass/high envelope response time, weight changes bass expansion strength, and valence changes hue. A null source supplies the exact classic configuration. Missing/non-finite numeric axes become neutral; finite outliers clamp. One centralized spectral mapping preserves frequency position and zero bins; raw waveform retains sample frequency. Visual modulation can scale signal but cannot generate it. The configuration is derived, never stored.

Visualiser's existing RAF owns two reusable modulation envelopes and elapsed time in refs; no new loop or per-frame React personality updates are introduced. These envelopes are presentation state, separate from truthful diagnostic metrics and analyser smoothing. Response timing uses elapsed milliseconds so reduced motion does not change its nominal time scale. Pause holds the canvas, including when changing the selected personality; the new personality takes effect on resumed drawing. Mode/resize redraw remains available as in v1.7. PlaybackIntent, graph lifecycle, track URL ownership, and all persistence schemas retain their v1.7.1 responsibilities. This preserves the independent tools and gives later v2.0 composition a small configuration input rather than a project dependency.

## 2026-10-04 — Current playback intent owns async lifecycle transitions

v1.7.1 moves request validity and desired playback/context activity into a small testable `PlaybackIntent` owner. Visualiser still owns the media element, selected track, object URLs, graph creation/disposal, UI, and animation loop; `AudioAnalyzer` and renderers retain their existing responsibilities. An obsolete Play completion can only return a stale result: it cannot pause the player or update React. Context-operation settlements reconcile the latest desired state independently of the request that initiated them, so late resume cannot leave an inactive view running and late suspend cannot override a newer Play. Pending resumes are shared, failures are handled without unhandled rejection or automatic retry loops, and a pending Play can be cancelled without disabling interaction.

Pause now also requests suspension of the existing context; resume reuses the same source/graph and the last canvas frame remains held. This extends the v1.6 lifecycle decision, which suspended only on navigation, to make context activity follow playback intent. Synchronous selection/removal/navigation/unmount cancellation and current-state media-event guards protect the browser/React handoff. Recreating the graph or waiting for startup before allowing Pause would violate the existing ownership and rapid-interaction requirements, so neither was used. Browser storage acquisition is guarded at initialization; denied storage leaves live tools usable without a new store or schema.

## 2026-10-04 — Visual modes share the analyzer and one canvas loop

v1.7 keeps audio graph creation, analyser reads, reusable waveform/spectrum buffers, and diagnostic calculations in `AudioAnalyzer`. The Visualiser's existing playback RAF owner reads once and draws the selected renderer into one Canvas; mode selection lives in React and a ref lets the active loop change drawing behavior without restarting playback or creating a second loop. Spectrum maps bins into 48 logarithmic low-to-high bands; radial maps 80 such bands clockwise from the top; waveform maps each time-domain sample directly to centered Y coordinates. Fixed typed-array workspaces keep repeated spectrum aggregation allocation-free. ResizeObserver sizes the backing bitmap at the current device-pixel ratio. Pause holds the last frame; track changes, end, and decode errors clear to an idle center line. `prefers-reduced-motion` caps drawing at eight updates per second. v1.9 may influence visual presentation later, but it must continue to consume this same renderer-independent analysis layer.

## 2026-10-04 — One Web Audio graph supplies renderer-independent signal data

v1.6 creates a MediaElementAudioSourceNode only after the user's Play gesture and connects the existing HTML audio element through an AnalyserNode to the AudioContext destination. The graph belongs to the audio element and survives track switching; AudioContext resume and media play start in the same gesture. The analyser uses `fftSize=2048` for roughly 22 Hz bins at 44.1 kHz with modest per-frame work, a 0.55 smoothing constant, and a -90 to -10 dB byte-spectrum range. Reusable Float32 waveform samples and Uint8 spectrum magnitudes stay outside React. RMS of waveform samples yields 0–1 amplitude; RMS of byte magnitudes divided by 255 yields separate 0–1 readings over 20–250 Hz, 250–2,000 Hz, and 2,000–10,000 Hz, with bins selected using the actual sample rate. These are relative diagnostic levels, not calibrated loudness. One animation loop samples every frame but publishes four display values about every 65 ms. Pause/end/removal clear readings; leaving suspends the context; unmount disconnects and closes it. Cleanup is deferred one task so React StrictMode effect replay cannot close the source while retaining the same media element. Future visual modes should consume the same raw buffers and derived metrics, without owning analysis calculations.

## 2026-10-04 — Local track metadata and playback have separate owners

v1.5 keeps imported track identity, filename, display name, MIME type, and size in a pure session-only library. An ID-to-object-URL map owns temporary file handles, while a single HTML audio element and component state own selection playback, current time, duration, seeking, and errors. Selecting another track pauses and unloads the previous source before loading the new one; removing a track revokes its URL, and unmount revokes any remaining URLs. The browser handles decoding and codec support. This avoids storing playback state in track records and leaves a clear later boundary for Web Audio analysis without adding analyser nodes in v1.5. Files are neither uploaded nor persisted.

## 2026-10-04 — Mood presets persist source selections only

v1.3 uses a dedicated `sonic-studio.mood-presets` key with a version 1 envelope, separate from Genre Mixer and Vocal Persona storage. A preset records identity, name, timestamps, and one to three cloned mood ID/integer-weight pairs. Reopening feeds those pairs through the existing Mood DNA, relationship, interpretation, and production engines rather than storing derived text or classifications. The reader rejects malformed envelopes, skips invalid or duplicate entries, and strips unexpected fields; one damaged record cannot hide valid neighbors. Live edits remain unsaved until an explicit update, which preserves the preset ID, while save-as creates a new ID. This keeps mood presets reproducible and allows future guidance changes without migrating saved prose.

## 2026-10-04 — Production guidance is a separate live view of Mood DNA

v1.2.2 places the existing translator below relationship guidance. The two sections have distinct jobs: relationships explain how source moods meet; translation suggests musical consequences of their weighted Mood DNA. Priorities get visual emphasis, while the seven domains use compact rows with every signal's source values. Multi-dimension signals receive a readable combined-direction label rather than an internal rule ID. The UI does not rewrite engine prose or persist derived output. This keeps the selection and weight source model intact and prevents the averaged production direction from pretending to identify a secondary source mood.

## 2026-10-04 — Musical translation reads Mood DNA only

v1.2.1 treats the seven 0–100 Mood DNA dimensions as the translator's complete input. Five centralized regions (0–14, 15–39, 40–60, 61–85, 86–100) select reusable domain guidance; interaction conditions use explicit 30/70 cutoffs. Each domain signal, priority, and overall direction retains the source dimension values that justify it. Priority strength is distance from 50, with stable dimension order breaking ties. Seven small interaction rules add coexistence strategies for combinations that individual axes would not express, including controlled unease and energy without drive. The translator never inspects named moods, source weights, or another tool. Consequently, a weighted mean can hide opposing source moods: translation must not claim to recover that lost detail; Mood Mapper's separate relationship interpretation can carry it in a future combined view.

## 2026-10-04 — Mood guidance stays a live view over source selections

v1.1.3 places relationship guidance below the Emotional Fingerprint and derives it from the same session-only mood IDs and weights as Mood DNA. The UI displays the existing interpreter's headline, summary, roles, supports, tensions, resolutions, and strategy without generating new prose or saving it. One mood receives only single-character guidance, and empty state receives no relationship section. Distinct but neutral visual treatments make relationship categories scannable without ranking conflict as failure. The underlying model and other tools remain unchanged; future composition must continue to treat the selected moods and weights as authoritative.

## 2026-10-04 — Mood interpretation remains derived from the unchanged analysis

v1.1.2 accepts current selections and their v1.1.1 relationship report, validates that the pair IDs and weights match, and derives Mood DNA only to describe the combined emotional character. It ranks strong shared dimensions and opposing dimensions by pair impact, returns up to three of each, and assigns the largest weight the dominant role; a mood below 40% of that weight is an accent, with input order breaking ties. Pair ratios at or above 75% use balanced resolution guidance; otherwise the stronger mood's endpoint leads. The seven dimension rules are reusable data, not named-pair overrides. Underlying raw conflict remains described when a lighter secondary influence softens the effective classification. The output is never stored and does not change Mood DNA, relationship rules, or any other tool. v1.1.3 can present this output in the existing Mood Mapper view.

## 2026-10-04 — Mood relationships are observational and influence-aware

v1.1.1 classifies pairs from their seven curated 0–100 profiles rather than named-pair rules. A clear endpoint region is 0–40 or 60–100. Mean absolute distance at or below 0.19 with no opposition is reinforcing; opposing-distance tension at or above 0.16 is contrasting; tension at or above 0.42 plus mean distance at or above 0.50 is conflicting; the rest is complementary. Equal influence retains raw tension, while unequal influence scales it by twice the smaller weight divided by the pair total. For three moods, each pair is retained and the aggregate tension scales each pair by twice its smaller weight divided by the total selected weight, preventing two weak secondary moods from dominating the blend. Ties and axis rankings preserve dimension order. The module does not mutate selections, profiles, Mood DNA, or other tools. The classifications are descriptive; no mood combination becomes invalid. v1.1.2 can add prose and resolutions from these structured results.

## 2026-10-04 — Weighted moods replace the planned two-axis Mood Plane for v1.0

The user-defined v1.0 scope supersedes the roadmap's Dark–Bright/Calm–Intense persisted plane. Fourteen curated moods have stable IDs and seven values on the existing 0–100 scale. The independent Mood Mapper keeps one to three selected IDs with 1–100 integer influence weights in view-local session state. Mood DNA uses a normalized weighted mean rounded to an integer; the largest weight determines the dominant mood, with selection order breaking ties. The brief did not require saving mood selections, so persistence and a storage schema are deferred. Description is derived from the strongest dimension endpoints and is never authoritative state. This avoids changing saved Sound DNA or Voice DNA and leaves composition for a later milestone.

## 2026-10-04 — Vocal prompts and experiment references remain derived and separate

v0.9 builds generator-neutral prompt text from the active Voice DNA and the existing whole-voice interpretation. Saved Personas supply their captured DNA and selections, so reopening recreates the prompt without storing a prompt copy or changing the Persona schema. Comparison reads two saved records and highlights differing source traits. An external experiment reference stores only its own label, optional note, and Persona ID under a separate versioned local key; it never embeds or edits the Persona. This keeps vocal identity reusable and leaves genre composition for a later stage.

## 2026-10-04 — Show vocal conflicts as creative tension

v0.8.3 presents the pure interpretation below the existing Voice DNA and derives it from saved selections when a Persona is reopened. Reinforcing and complementary relationships appear as support; contrasting and conflicting relationships appear as creative tensions with performance resolutions. Warm neutral styling avoids presenting contradictions as invalid input. No interpretation fields enter saved Persona records or captured Voice DNA, so edits to guidance cannot silently rewrite identity.

## 2026-10-04 — Whole-voice interpretation stays derived

v0.8.2 combines the current selections and curated relationship report into a separate pure interpretation. It returns one linked performance strategy plus structured dominant, supporting, and tension information. The strategy uses rule matches to shape phrasing, dynamics, tone, and effect placement instead of concatenating the pairwise explanations or resolutions. Keeping it outside saved Voice DNA preserves existing Persona snapshots and leaves later UI guidance free to change without a storage migration.

## 2026-10-04 — Tension rules carry curated coexistence guidance

Contrasting and conflicting vocal rules require a distinct `resolution` alongside their explanation. The explanation identifies why the traits pull apart; the resolution names a dominant quality or assigns each quality a place in the performance. Reinforcing and complementary results use `null` because they need no tension resolution. This keeps guidance deterministic and derived from selections without changing Voice DNA or saved Persona records. A later v0.8.2 step must combine pairwise guidance into a coherent interpretation of the whole voice.

## 2026-10-04 — v0.8 requires contextual interpretation and contradiction proof

The pure relationship analyzer is v0.8.1, not the complete Trait Relationships milestone. v0.8 also requires modifier logic, plain-English dominance and resolution guidance, and proof that awkward combinations form a coherent vocal strategy. This corrects the prior completion claim without changing the v0.8.1 design: its report remains derived and does not mutate Persona storage or captured Voice DNA. v0.9 begins only after all four v0.8 steps are verified.

## 2026-10-04 — Vocal relationships are derived guidance

v0.8.1 evaluates a finite curated rule list against existing selections and returns relationship kind, participating fields, and explanation. Numeric bands use the same 0–33, 34–66, and 67–100 boundaries as Voice DNA wording. Unlisted combinations make no claim. The report is computed on demand and is absent from Persona storage and Voice DNA, so future guidance changes cannot mutate a saved identity. This step adds no prompt output or UI.

## 2026-10-04 — Versioned persona storage preserves the captured DNA

v0.7 stores full Persona records under `sonic-studio.saved-personas`, separate from Genre Mixer's `sonic-studio.saved-mixes`. A `schemaVersion: 1` envelope identifies the stored collection. The reader skips malformed or invalid records and duplicate IDs. Reopening uses the saved selections for builder controls and displays the saved Voice DNA snapshot exactly; a later builder edit returns to live derived DNA without changing the stored record. This preserves a persona's identity even if curated wording changes in a later version.

## 2026-10-04 — Created personas capture a Voice DNA snapshot

The first Persona Identity step creates a session-only record with a UUID, identity metadata, source selections, and the exact Voice DNA at creation. The record does not follow subsequent builder edits. Capturing both selections and DNA keeps the current identity inspectable and gives later persistence work an explicit source and output to reconcile. No local storage schema is introduced in this step; the full v0.7 reuse gate remains open.

## 2026-10-04 — Voice DNA derives from independent vocal selections

The v0.6 builder keeps register, texture, delivery, effect, and four 0–100 dimensions in view-local state. Curated trait descriptions and deterministic dimension bands produce a structured Voice DNA object. This keeps vocal identity independent of genre and avoids storing derived wording. There is no persistence or composition contract yet; later milestones can add those without changing the Genre Mixer source model.

## 2026-10-04 — Recipes reuse versioned saved sources

v0.5 uses the v0.4 local records as named recipes. The short and detailed text is derived each time from those source genres and weights using the current Sound DNA and compatibility engine. Keeping `schemaVersion: 1` preserves existing saved mixes and avoids stale prompt copies. Future data changes may alter regenerated wording while leaving the saved musical identity intact.

## 2026-10-04 — Saved source state is authoritative

Store the ordered genre IDs and exact integer weights in each versioned saved mix. Sound DNA and compatibility are derived from the current genre data whenever a mix opens. This prevents stale generated descriptions from disagreeing with the source selection. A future change to genre data may change derived output for an older preset; the saved source remains intact.

## 2026-10-04 — Skip unsupported local records

The v0.4 reader accepts only complete `schemaVersion: 1` records with known, distinct genres and valid 10–90 weights in increments of five. Malformed JSON, older schemas, and invalid entries are ignored without stopping the mixer. Migration can be added when a documented prior schema exists.
