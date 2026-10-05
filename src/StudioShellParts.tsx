import type { CreateTool, StudioView } from './lib/studioNavigation.ts'
import type { StudioProject } from './lib/studioProject.ts'
import { STUDIO_VIEWS } from './lib/studioNavigation.ts'

export function StudioTopBar({ active, projects, onSwitchProject }: {
  active: StudioProject | null
  projects: StudioProject[]
  onSwitchProject: (id: string | null) => void
}) {
  return <header className="studio-topbar">
    <div className="studio-brand"><span className="studio-brand-mark" aria-hidden="true">S</span><span>SONIC<span className="studio-brand-accent">STUDIO</span></span></div>
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
    <p className="studio-sidebar-label">WORKSPACE</p>
    {STUDIO_VIEWS.map((item, index) => <button type="button" key={item.id} aria-current={view === item.id ? 'page' : undefined} className={view === item.id ? 'active' : ''} onClick={() => onNavigate(item.id)}>
      <span className={`studio-nav-icon studio-nav-icon-${item.id}`} aria-hidden="true">{['◈', '▤', '◫', '◉'][index]}</span><span>{item.label}</span><span className="studio-nav-index">0{index + 1}</span>
    </button>)}
    <div className="studio-sidebar-foot"><span className="studio-sidebar-pulse"/> All work stays on this device</div>
  </nav>
}

export function StudioWorkflowStepper({ view, tool, onOpenTool, onNavigate }: {
  view: StudioView
  tool: CreateTool
  onOpenTool: (tool: 'genre' | 'vocal' | 'mood') => void
  onNavigate: (view: StudioView) => void
}) {
  const steps: { label: string; action?: () => void; active: boolean; deferred?: boolean }[] = [
    { label: 'Genre Mixer', action: () => onOpenTool('genre'), active: view !== 'visualise' && tool === 'genre' },
    { label: 'Vocal Persona', action: () => onOpenTool('vocal'), active: view !== 'visualise' && tool === 'vocal' },
    { label: 'Mood Mapper', action: () => onOpenTool('mood'), active: view !== 'visualise' && tool === 'mood' },
    { label: 'Visualiser', action: () => onNavigate('visualise'), active: view === 'visualise' },
    { label: 'Export', active: false, deferred: true },
  ]
  return <nav className="studio-stepper" aria-label="Creative workflow">
    <div className="studio-stepper-heading"><span>CREATIVE WORKFLOW</span><span className="studio-stepper-current">{steps.find(step => step.active)?.label ?? 'Identity & Brief'}</span></div>
    <ol>{steps.map((step, index) => <li key={step.label} className={`${step.active ? 'active' : ''}${step.deferred ? ' deferred' : ''}`}>
      <button type="button" aria-current={step.active ? 'step' : undefined} aria-disabled={step.deferred || undefined} title={step.deferred ? 'Export is planned for a later phase' : undefined} onClick={step.action}>
        <span className="studio-step-number">{step.deferred ? '↗' : `0${index + 1}`}</span><span>{step.label}</span>{step.active && <span className="studio-step-active-mark" aria-hidden="true"/>}
      </button>
    </li>)}</ol>
  </nav>
}
