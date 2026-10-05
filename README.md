# Sonic Studio

SonicStudio v2.0 is a local-first music creation and listening studio. Create a musical identity with Genre Mixer, Vocal Persona and Mood Mapper, export a deterministic Creation Brief, keep historical track versions, compare them with saved observations, and listen through the reactive Visualiser. Projects and independent libraries persist in your browser; audio stays in the session and needs reattachment after reload. No provider API, account or backend is required.

## Run

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite. `npm test` checks the domain, storage and playback rules; `npm run build` checks TypeScript and creates a production build. See [PROJECT.md](PROJECT.md) for the goal, current status, and milestone history.

Genre metadata is in `src/data/genres.json`; musical roles and their relative strengths are in `src/data/characteristics.json`. Compatibility approaches and layers are in `src/data/compatibility.json`, with explicit opposing approaches in `src/data/oppositions.json`. Saved mixes live in this browser's local storage. See [CHANGELOG.md](CHANGELOG.md) for verification and [docs/DECISIONS.md](docs/DECISIONS.md) for data-model rationale.
