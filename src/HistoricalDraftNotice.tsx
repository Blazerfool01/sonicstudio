import type { HistoricalDraftRequest } from './lib/experimentActions.ts'
import './powerActions.css'
export default function HistoricalDraftNotice({ request, edited }: { request: HistoricalDraftRequest | null; edited: boolean }) {
  if (!request) return null
  return <aside className="historical-draft-notice" role="status"><strong>{edited ? 'Edited historical draft' : 'Historical draft'} · {request.trackTitle}</strong><p>Captured {request.kind} settings from {request.captured.label}{request.captured.sourceId ? ` · source ID ${request.captured.sourceId}` : ''}. {edited ? 'Controls have changed since capture.' : 'Exact captured values are loaded.'} Current project identity stays unchanged until Use / Replace. Saved sources stay unchanged.</p></aside>
}
