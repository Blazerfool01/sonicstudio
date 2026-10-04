# Sonic Studio

An independent, local-first Genre Mixer. Select two of twelve curated genres and move the balance slider to generate deterministic Sound DNA and compatibility guidance. v0.5 adds short and detailed generator-neutral recipes that you can copy, name, save, reopen, update, duplicate, and delete locally.

## Run

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite. `npm test` checks the data and merge rules; `npm run build` checks TypeScript and creates a production build. See [PROJECT.md](PROJECT.md) for the goal, current status, and milestone history.

Genre metadata is in `src/data/genres.json`; musical roles and their relative strengths are in `src/data/characteristics.json`. Compatibility approaches and layers are in `src/data/compatibility.json`, with explicit opposing approaches in `src/data/oppositions.json`. Saved mixes live in this browser's local storage. See [CHANGELOG.md](CHANGELOG.md) for verification and [docs/DECISIONS.md](docs/DECISIONS.md) for data-model rationale.
