import type { StudioProject } from './studioProject.ts'
import { identitySnapshot, cleanProjectTrack } from './studioProject.ts'
import { cleanTimelineClip } from './studioTimeline.ts'
import { cleanComparison } from './trackComparison.ts'
import { createCreationBrief } from './creationBrief.ts'

export const PROJECT_EXPORT_FORMAT = 'sonic-studio.project-export'
export const PROJECT_EXPORT_VERSION = 1
export type ExportFormat = 'brief' | 'json'
export type ExportNotice = { level: 'blocker' | 'warning' | 'info'; code: string; message: string }
export type ExportValidation = { allowed: boolean; notices: ExportNotice[] }
export type ExportArtifact = { content: string; filename: string; mimeType: string }

/** Explicit projection: runtime fields and storage envelopes never become interchange data. */
export function projectExportPackage(project: StudioProject) {
  const tracks = project.tracks.map(cleanProjectTrack)
  const trackIds = tracks.map(track => track.id)
  return {
    format: PROJECT_EXPORT_FORMAT,
    schemaVersion: PROJECT_EXPORT_VERSION,
    audioIncluded: false,
    project: {
      id: project.id, name: project.name, notes: project.notes,
      createdAt: project.createdAt, updatedAt: project.updatedAt,
      currentIdentity: identitySnapshot(project),
      tracks,
      timeline: project.timeline.map(clip => cleanTimelineClip(clip, trackIds)),
      comparisons: project.comparisons.map(comparison => cleanComparison(comparison, tracks)),
    },
  }
}

export function validateProjectExport(project: StudioProject | null, format: unknown): ExportValidation {
  const notices: ExportNotice[] = []
  if (format !== 'brief' && format !== 'json') notices.push({ level: 'blocker', code: 'unsupported-format', message: 'Choose Creation Brief (.txt) or Project package (.json).' })
  if (!project) notices.push({ level: 'blocker', code: 'no-project', message: 'Create or open a project before exporting.' })
  if (project && (format === 'brief' || format === 'json')) {
    const attached = ['genre', 'vocal', 'mood'].filter(kind => project[kind as 'genre' | 'vocal' | 'mood'])
    if (!attached.length) notices.push({ level: format === 'brief' ? 'blocker' : 'warning', code: 'no-ingredients', message: format === 'brief' ? 'Attach at least one creative ingredient to export a Creation Brief.' : 'No creative ingredients are attached; project metadata can still be exported.' })
    else if (attached.length < 3 && format === 'brief') notices.push({ level: 'warning', code: 'partial-identity', message: 'Some creative ingredients are open. The brief explicitly leaves those choices to your generation workflow.' })
    if (!project.tracks.length) notices.push({ level: 'warning', code: 'no-results', message: 'No result tracks are saved in this project.' })
    try {
      if (format === 'brief') createCreationBrief(project)
      else projectExportPackage(project)
    } catch { notices.push({ level: 'blocker', code: 'invalid-project', message: 'Project data could not be exported. Review the saved project before trying again.' }) }
  }
  notices.push({ level: 'info', code: 'no-audio', message: 'Audio is not included. Session audio availability does not affect metadata or brief export; keep the original audio files separately.' })
  return { allowed: !notices.some(notice => notice.level === 'blocker'), notices }
}

/** Deterministic filenames without device paths, reserved names, or control characters. */
export function exportFilename(name: string, format: ExportFormat): string {
  let base = name.normalize('NFKC').replace(/[<>:"/\\|?*\u0000-\u001f\u007f]/g, '-').replace(/\s+/g, ' ').trim().replace(/[. ]+$/g, '').slice(0, 80).replace(/[. ]+$/g, '')
  if (!base) base = 'SonicStudio-project'
  if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(base)) base = `SonicStudio-${base}`
  return `${base}${format === 'brief' ? '-creation-brief.txt' : '-project.json'}`
}

export function createProjectExport(project: StudioProject | null, format: unknown): ExportArtifact {
  const validation = validateProjectExport(project, format)
  if (!validation.allowed || !project) throw new Error(validation.notices.filter(notice => notice.level === 'blocker').map(notice => notice.message).join(' '))
  const supported = format as ExportFormat
  const brief = supported === 'brief' ? createCreationBrief(project) : null
  const content = brief
    ? `SONICSTUDIO CREATION BRIEF\nProject: ${project.name}\nIdentity: ${brief.identitySummary}\n\n${brief.prompt}\n\nPROJECT NOTES — SEPARATE FROM MUSICAL GUIDANCE\n${brief.notes || '(No project notes.)'}\n`
    : `${JSON.stringify(projectExportPackage(project), null, 2)}\n`
  return { content, filename: exportFilename(project.name, supported), mimeType: supported === 'brief' ? 'text/plain;charset=utf-8' : 'application/json;charset=utf-8' }
}

export async function copyExport(artifact: ExportArtifact, clipboard: Pick<Clipboard, 'writeText'> | undefined): Promise<void> {
  if (!clipboard) throw new Error('Clipboard unavailable. Select the export preview and copy it manually.')
  await clipboard.writeText(artifact.content)
}

/** A click requests a browser download; browsers do not acknowledge whether it was saved. */
export function downloadExport(artifact: ExportArtifact): void {
  let url: string | null = null
  const link = document.createElement('a')
  try {
    url = URL.createObjectURL(new Blob([artifact.content], { type: artifact.mimeType }))
    link.href = url; link.download = artifact.filename
    document.body.append(link)
    link.click()
  } finally {
    link.remove()
    // Do not revoke before the browser has consumed the click.
    if (url) { const exportedUrl = url; setTimeout(() => URL.revokeObjectURL(exportedUrl), 1000) }
  }
}
