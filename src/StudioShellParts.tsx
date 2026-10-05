import type { CreateTool, StudioView } from './lib/studioNavigation.ts'
import type { StudioProject } from './lib/studioProject.ts'
import { STUDIO_VIEWS } from './lib/studioNavigation.ts'

export function StudioTopBar({ active, projects, onSwitchProject }: {
  active: StudioProject | null
  projects: StudioProject[]
  onSwitchProject: (id: string | null) => void
}) {
  return <header className="studio-topbar">
    <div className="studio-project-switcher">
      <label htmlFor="studio-project-switch">ACTIVE PROJECT</label>
      <select id="studio-project-switch" aria-label="Switch project" value={active?.id ?? ''} onChange={event => onSwitchProject(event.target.value || null)}>
        <option value="">No active project</option>
        {projects.map(project => <option value={project.id} key={project.id}>{project.name}</option>)}
      </select>
    </div>
    <div className="studio-global-status"><span className="studio-status-dot" aria-hidden="true"/> LOCAL STUDIO</div>
  </header>
}

export function StudioSidebar({ view, onNavigate }: { view: StudioView; onNavigate: (view: StudioView) => void }) {
  return <nav className="studio-sidebar" aria-label="Studio destinations">
    <div className="studio-brand"><svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true"><path d="M3 14v4m6-9v14m7-20v26m7-21v16m6-11v6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg><span>SonicStudio <small>v2.0</small></span></div>
    <p className="studio-sidebar-label">WORKSPACE</p>
    {STUDIO_VIEWS.map((item, index) => <button type="button" key={item.id} aria-current={view === item.id ? 'page' : undefined} className={view === item.id ? 'active' : ''} onClick={() => onNavigate(item.id)}>
      <span className={`studio-nav-icon studio-nav-icon-${item.id}`} aria-hidden="true">{['◈', '▤', '◫', '◉'][index]}</span><span>{item.label}</span><span className="studio-nav-index">0{index + 1}</span>
    </button>)}
    <div className="studio-sidebar-foot"><span className="studio-sidebar-pulse"/> All work stays on this device</div>
  </nav>
}

export function StudioWorkflowStepper({ view, tool, onOpenTool, onNavigate, onExport }: {
  view: StudioView
  tool: CreateTool
  onOpenTool: (tool: 'genre' | 'vocal' | 'mood') => void
  onNavigate: (view: StudioView) => void
  onExport: () => void
}) {
  const steps: { label: string; action?: () => void; active: boolean; deferred?: boolean }[] = [
    { label: 'Genre Mixer', action: () => onOpenTool('genre'), active: view !== 'visualise' && tool === 'genre' },
    { label: 'Vocal Persona', action: () => onOpenTool('vocal'), active: view !== 'visualise' && tool === 'vocal' },
    { label: 'Mood Mapper', action: () => onOpenTool('mood'), active: view !== 'visualise' && tool === 'mood' },
    { label: 'Visualiser', action: () => onNavigate('visualise'), active: view === 'visualise' },
    { label: 'Export', action: onExport, active: view !== 'visualise' && tool === 'export' },
  ]
  return <nav className="studio-stepper" aria-label="Creative workflow">
    <div className="studio-stepper-heading"><span>CREATIVE WORKFLOW</span><span className="studio-stepper-current">{steps.find(step => step.active)?.label ?? 'Identity & Brief'}</span></div>
    <ol>{steps.map((step, index) => <li key={step.label} className={`${step.active ? 'active' : ''}${step.deferred ? ' deferred' : ''}`}>
      <button type="button" aria-current={step.active ? 'step' : undefined} aria-disabled={step.deferred || undefined} title={step.deferred ? 'Export is planned for a later phase' : undefined} onClick={step.action}>
        <span className="studio-step-number">{index + 1}</span><span>{step.label}<small>{['Blend your sound', 'Shape your voice', 'Set the emotional direction', 'See your sound', 'Share your creation'][index]}</small></span>{step.active && <span className="studio-step-active-mark" aria-hidden="true"/>}
      </button>
    </li>)}</ol>
  </nav>
}
