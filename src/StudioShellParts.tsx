import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import type { StudioProject } from './lib/studioProject.ts'
import { getMood } from './data/moods.ts'
import type { StudioRoute, ProjectTab } from './StudioRouter.tsx'
import { projectTabUrl } from './StudioRouter.tsx'

export function StudioTopBar({ active, projects, onSwitchProject, onToggleContext }: {
  active: StudioProject | null
  projects: StudioProject[]
  onSwitchProject: (id: string | null) => void
  onToggleContext: () => void
}) {
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const matches = projects.filter(project => {
    if (!query.trim()) return true
    const terms = [project.name, project.genre?.label, project.vocal?.label,
      ...(project.mood?.selections.map(selection => getMood(selection.moodId)?.name ?? '') ?? []),
      ...project.tracks.map(track => track.title)]
    return terms.join(' ').toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())
  }).slice(0, 6)
  function chooseProject(project: StudioProject) {
    onSwitchProject(project.id)
    setQuery('')
    setSearchOpen(false)
  }
  function handleSearchKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') setSearchOpen(false)
    if (event.key === 'Enter' && matches[0]) {
      event.preventDefault()
      chooseProject(matches[0])
    }
  }
  return <header className="studio-topbar">
    <button type="button" className="studio-topbar-menu" aria-label="Toggle context panel" title="Toggle context panel" onClick={onToggleContext}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
    </button>
    <div className="studio-project-search" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setSearchOpen(false) }}>
      <svg className="studio-search-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.3"/><path d="m15.5 15.5 4.2 4.2"/></svg>
      <input id="studio-project-search" type="search" role="combobox" aria-label="Search projects and presets" aria-expanded={searchOpen} aria-controls="studio-project-search-results" aria-autocomplete="list" placeholder="Search projects, presets..." value={query} onChange={event => { setQuery(event.target.value); setSearchOpen(true) }} onFocus={() => setSearchOpen(true)} onKeyDown={handleSearchKey}/>
      {searchOpen && matches.length > 0 && <ul id="studio-project-search-results" className="studio-project-search-results" role="listbox">
        {matches.map(project => <li key={project.id} role="presentation"><button type="button" role="option" aria-selected={project.id === active?.id} onClick={() => chooseProject(project)}><span>{project.name}</span><small>{project.genre?.label ?? 'Local project'}</small></button></li>)}
      </ul>}
      {searchOpen && query && matches.length === 0 && <div className="studio-project-search-empty" role="status">No matching projects or captured sources</div>}
    </div>
    <div className="studio-topbar-utilities" aria-label="Studio utilities">
      <span className="studio-topbar-glyph" role="img" aria-label="Notifications"><svg viewBox="0 0 24 24"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg></span>
      <span className="studio-topbar-glyph" role="img" aria-label="Appearance"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg></span>
      <span className="studio-topbar-avatar" role="img" aria-label="Studio profile"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.4"/><path d="M5.5 20c.8-3.3 3-5 6.5-5s5.7 1.7 6.5 5"/></svg></span>
    </div>
  </header>
}

export type StudioStatus = { tone: 'ready' | 'empty' | 'error'; label: string; detail?: string }
export function studioStatus(active: StudioProject | null | undefined, message: string): StudioStatus {
  if (message.includes('unavailable')) return { tone: 'error', label: 'Storage unavailable', detail: message }
  if (!active) return { tone: 'empty', label: 'No project open' }
  if (!active.tracks.length) return { tone: 'empty', label: 'No tracks yet' }
  return { tone: 'ready', label: 'All work stays on this device' }
}

type NavItem = { icon: string; label: string; active: boolean; href?: string; onClick?: () => void }
const navPaths: Record<string,string> = {
  Home:'M3 11 12 3 21 11 M5 10v11h5v-7h4v7h5V10',
  'Genre Mixer':'M5 3v18 M12 3v18 M19 3v18 M2 8h6 M9 16h6 M16 10h6',
  'Vocal Persona':'M9 5a3 3 0 0 1 6 0v7a3 3 0 0 1-6 0Z M5 10v2a7 7 0 0 0 14 0v-2 M12 19v3 M8 22h8',
  'Mood Mapper':'M12 21 3 12C-2 4 8 0 12 7 16 0 26 4 21 12Z',
  Visualiser:'M3 10v5 M7 5v15 M12 2v20 M17 7v10 M21 10v5',
  Export:'M12 3v12 M7 10l5 5 5-5 M4 17v4h16v-4',
  Library:'M3 4h18v16H3Z M7 8h10 M7 12h10 M7 16h6',
  Projects:'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  Settings:'M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4m0-12.8L17 7M7 17l-1.4 1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  Help:'M9.6 9a2.6 2.6 0 1 1 4.5 1.8c-1.4 1.2-2.1 1.7-2.1 3.2m0 3v.1M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z',
}

export function StudioSidebar({ pathname, search, status, onNavigate, onOpenSettings, onOpenHelp }: { pathname: StudioRoute; search: string; status: StudioStatus; onNavigate: (path: string) => void; onOpenSettings: () => void; onOpenHelp: () => void }) {
  const projectTab = new URLSearchParams(search).get('tab') ?? 'overview'
  const workspace: NavItem[] = [
    { icon: '⌂', label: 'Home', href: '/dashboard', active: pathname === '/dashboard' },
    { icon: '☷', label: 'Genre Mixer', href: '/genre-mixer', active: pathname === '/genre-mixer' },
    { icon: '♩', label: 'Vocal Persona', href: '/vocal-persona', active: pathname === '/vocal-persona' },
    { icon: '♡', label: 'Mood Mapper', href: '/mood-mapper', active: pathname === '/mood-mapper' },
    { icon: '▥', label: 'Visualiser', href: '/visualiser', active: pathname === '/visualiser' },
  ]
  const library: NavItem[] = [
    { icon: '▤', label: 'Library', href: projectTabUrl('tracks'), active: pathname === '/project' && projectTab === 'tracks' },
    { icon: '▦', label: 'Projects', href: '/project', active: pathname === '/project' && projectTab !== 'tracks' && projectTab !== 'export' },
    { icon: '↗', label: 'Export', href: projectTabUrl('export'), active: pathname === '/project' && projectTab === 'export' },
  ]
  const utility: NavItem[] = [
    { icon: '⚙', label: 'Settings', active: false, onClick: onOpenSettings },
    { icon: '?', label: 'Help', active: false, onClick: onOpenHelp },
  ]
  const render = (item: NavItem) => {
    const content = <><span className="studio-nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="20" height="20"><path d={navPaths[item.label]} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></span><span>{item.label}</span></>
    if (item.href) return <a key={item.label} href={item.href} aria-current={item.active ? 'page' : undefined} className={item.active ? 'active' : ''} onClick={event => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      event.preventDefault()
      onNavigate(item.href!)
    }}>{content}</a>
    return <button type="button" key={item.label} aria-current={item.active ? 'page' : undefined} className={item.active ? 'active' : ''} onClick={item.onClick}>{content}</button>
  }
  return <nav className="studio-sidebar" aria-label="Studio destinations">
    <div className="studio-brand"><svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true"><path d="M3 14v4m6-9v14m7-20v26m7-21v16m6-11v6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg><span>SonicStudio <small>v2.0</small></span></div>
    {workspace.map(render)}
    <div className="dashboard-sidebar-tools"><p className="studio-sidebar-label">LIBRARY</p>{library.map(render)}</div>
    <div className="studio-sidebar-utilities">{utility.map(render)}</div>
    <div className="studio-sidebar-foot sr-only" role="status" data-tone={status.tone} title={status.detail}><span className="studio-sidebar-pulse" aria-hidden="true"/> {status.label}</div>
  </nav>
}

export function StudioWorkflowStepper({ pathname, projectTab, onNavigate }: {
  pathname: StudioRoute
  projectTab: ProjectTab
  onNavigate: (path: string) => void
}) {
  const steps: { label: string; action?: () => void; active: boolean; deferred?: boolean }[] = [
    { label: 'Genre Mixer', action: () => onNavigate('/genre-mixer'), active: pathname === '/genre-mixer' },
    { label: 'Vocal Persona', action: () => onNavigate('/vocal-persona'), active: pathname === '/vocal-persona' },
    { label: 'Mood Mapper', action: () => onNavigate('/mood-mapper'), active: pathname === '/mood-mapper' },
    { label: 'Visualiser', action: () => onNavigate('/visualiser'), active: pathname === '/visualiser' },
    { label: 'Export', action: () => onNavigate(projectTabUrl('export')), active: pathname === '/project' && projectTab === 'export' },
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
