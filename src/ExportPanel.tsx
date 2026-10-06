import { useEffect, useRef, useState } from 'react'
import type { StudioProject } from './lib/studioProject.ts'
import { copyExport, createProjectExport, downloadExport, validateProjectExport } from './lib/projectExport.ts'
import type { ExportArtifact, ExportFormat } from './lib/projectExport.ts'
import StatusNotice from './StatusNotice.tsx'
import './export.css'

export default function ExportPanel({ project }: { project: StudioProject | null }) {
  const [format, setFormat] = useState<ExportFormat>('brief')
  const [feedback, setFeedback] = useState<{ error: boolean; text: string } | null>(null)
  const operation = useRef(0)
  useEffect(() => { operation.current++; setFeedback(null); return () => { operation.current++ } }, [project, format])
  const validation = validateProjectExport(project, format)
  let artifact: ExportArtifact | null = null
  if (validation.allowed) artifact = createProjectExport(project, format)
  async function copy() {
    if (!artifact) return
    const request = ++operation.current
    try {
      await copyExport(artifact, navigator.clipboard)
      if (request === operation.current) setFeedback({ error: false, text: 'Export copied to clipboard.' })
    } catch {
      if (request === operation.current) setFeedback({ error: true, text: 'Clipboard unavailable or permission denied. Select the export preview and copy manually, or download it.' })
    }
  }
  function download() {
    if (!artifact) return
    operation.current++
    try {
      downloadExport(artifact)
      setFeedback({ error: false, text: `Download requested: ${artifact.filename}. If your browser blocks it, allow downloads or copy the preview.` })
    } catch { setFeedback({ error: true, text: 'Download could not start. Try again or copy the export preview instead.' }) }
  }
  return <section className="export-panel" aria-labelledby="export-title">
    <div className="export-heading"><span className="eyebrow">FINISH & TAKE IT WITH YOU</span><h2 id="export-title">Export</h2><p>Take your current project identity and saved work beyond the Studio.</p></div>
    <fieldset className="export-formats"><legend>Export format</legend>
      <label><input type="radio" name="export-format" checked={format === 'brief'} onChange={() => setFormat('brief')}/><span><strong>Creation Brief · .txt</strong><small>Current musical guidance and separate project notes for external generation workflows such as Suno or Udio. No provider connection required.</small></span></label>
      <label><input type="radio" name="export-format" checked={format === 'json'} onChange={() => setFormat('json')}/><span><strong>Project package · .json</strong><small>Current identity, notes, saved track provenance, Timeline arrangement and comparison observations. Metadata only; no playable audio.</small></span></label>
    </fieldset>
    <div className="export-validation" data-export-ready={validation.allowed} aria-label="Export validation"><h3>{validation.allowed ? 'Ready to export' : 'Before you export'}</h3><ul>{validation.notices.map(notice => <li key={notice.code} className={`export-notice export-${notice.level}`}><strong>{notice.level === 'blocker' ? 'Required' : notice.level === 'warning' ? 'Note' : 'About this export'}:</strong> {notice.message}</li>)}</ul></div>
    <div className="export-actions"><button disabled={!artifact} onClick={copy}>Copy {format === 'brief' ? 'Creation Brief' : 'JSON'}</button><button className="action-primary" disabled={!artifact} onClick={download}>Download {format === 'brief' ? '.txt' : '.json'}</button></div>
    {feedback && <StatusNotice key={operation.current} className="export-feedback" tone={feedback.error ? 'error' : 'success'}>{feedback.text}</StatusNotice>}
    {artifact && <label className="export-preview">Export preview · {artifact.filename}<textarea readOnly aria-label="Export preview" value={artifact.content} rows={14}/></label>}
    <p className="export-boundary">Only saved project fields are exported. Unsaved editor drafts are excluded. Audio rendering and project import are not available.</p>
  </section>
}
