type ModuleKind = 'genre' | 'vocal' | 'mood' | 'visualiser'
type ModuleAction = (kind: 'genre' | 'vocal' | 'mood') => void

const MODULES: { kind: ModuleKind; title: string; description: string }[] = [
  { kind: 'genre', title: 'Genre Mixer', description: 'Blend styles and create your unique sound.' },
  { kind: 'vocal', title: 'Vocal Persona', description: 'Design and refine your vocal identity.' },
  { kind: 'mood', title: 'Mood Mapper', description: 'Set the emotional mood and atmosphere.' },
  { kind: 'visualiser', title: 'Visualiser', description: 'See your sound come to life.' },
]

function ModuleIcon({ kind }: { kind: ModuleKind }) {
  if (kind === 'genre') return <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M5 22v5m5-12v19m6-26v34m6-23v15m6-21v27m6-17v8m6-13v17m5-11v5"/></svg>
  if (kind === 'vocal') return <svg viewBox="0 0 48 48" aria-hidden="true"><rect x="19" y="5" width="10" height="25" rx="5"/><path d="M13 23v3a11 11 0 0 0 22 0v-3M24 37v6m-7 0h14"/></svg>
  if (kind === 'mood') return <svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="20" cy="24" r="12"/><circle cx="29" cy="24" r="12"/></svg>
  return <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M5 29v-9m7 16V12m7 25V6m7 31V17m7 20V9m7 28V15m6 22V22"/></svg>
}

export default function ReferenceStudioModules({ onOpen, onOpenVisualiser }: {
  onOpen: ModuleAction
  onOpenVisualiser: () => void
}) {
  return <section className="reference-dashboard-modules" aria-label="Creative modules">
    {MODULES.map(module => <button
      type="button"
      key={module.kind}
      className={`dashboard-card reference-module-card reference-module-${module.kind}`}
      onClick={() => module.kind === 'visualiser' ? onOpenVisualiser() : onOpen(module.kind)}
      aria-label={`${module.title}. ${module.description}`}
    >
      <span className="reference-module-icon"><ModuleIcon kind={module.kind}/></span>
      <strong>{module.title}</strong>
      <span className="reference-module-description">{module.description}</span>
      <span className="reference-module-action" aria-hidden="true">→</span>
    </button>)}
  </section>
}
