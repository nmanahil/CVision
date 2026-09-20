import { useCallback, useEffect, useState } from "react"
import { Clock, FileDown, Loader2, LogIn, Trash2 } from "lucide-react"
import { Overlay } from "@/components/ui/kit"
import { scoreTone, toneText } from "@/lib/ui"
import { api } from "@/lib/api"
import { analysisToMarkdown, downloadText, reportFilename } from "@/lib/report"
import { useApp } from "@/context/app-context"

function MiniRing({ value }) {
  const r = 17, c = 2 * Math.PI * r
  const tone = scoreTone(value)
  return (
    <svg width="46" height="46" viewBox="0 0 46 46" className="shrink-0">
      <circle cx="23" cy="23" r={r} fill="none" stroke="currentColor" strokeWidth="4" className="text-line" />
      <circle cx="23" cy="23" r={r} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"
        strokeDasharray={`${(value / 100) * c} ${c}`} transform="rotate(-90 23 23)" className={toneText[tone]} />
      <text x="23" y="27" textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor">{value}</text>
    </svg>
  )
}

export default function HistoryDrawer({ open, onClose, onLoad, onSignIn }) {
  const { user, toast, copy } = useApp()
  const [scans, setScans] = useState(null)
  const [error, setError] = useState("")
  const [busyId, setBusyId] = useState(null)

  const refresh = useCallback(async () => {
    setError("")
    try { setScans((await api.history()).scans) } catch (e) { setError(e.message) }
  }, [])

  useEffect(() => {
    if (open && user) { setScans(null); refresh() }
  }, [open, user, refresh])

  async function load(id) {
    setBusyId(id)
    try { await onLoad(id); onClose() } catch (e) { toast(e.message, "error") } finally { setBusyId(null) }
  }
  async function exportScan(id) {
    setBusyId(id)
    try {
      const d = await api.historyItem(id)
      downloadText(reportFilename(d.analysis), analysisToMarkdown(d.analysis, d.scan))
      toast(copy.toast.exported)
    } catch (e) { toast(e.message, "error") } finally { setBusyId(null) }
  }
  async function remove(id) {
    try { await api.deleteHistoryItem(id); setScans((s) => s.filter((x) => x.id !== id)) } catch (e) { toast(e.message, "error") }
  }

  return (
    <Overlay open={open} onClose={onClose} title="Scan history" side>
      {!user ? (
        <div className="grid h-full place-items-center p-8 text-center">
          <div>
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-accent/15 text-accent"><Clock size={26} /></div>
            <p className="font-semibold">Your audits, saved</p>
            <p className="mx-auto mt-1 max-w-xs text-sm text-muted">Sign in to keep every match scan, reload it in one click and export it as a Markdown report.</p>
            <button onClick={() => { onClose(); onSignIn() }} className="btn btn-primary mx-auto mt-5"><LogIn size={16} /> Sign in</button>
          </div>
        </div>
      ) : error ? (
        <p className="p-6 text-sm text-bad">{error}</p>
      ) : scans === null ? (
        <div className="space-y-3 p-5">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
      ) : scans.length === 0 ? (
        <div className="grid h-full place-items-center p-8 text-center text-sm text-muted">No scans yet — run your first match analysis and it will show up here.</div>
      ) : (
        <ul className="space-y-3 p-4">
          {scans.map((s, i) => (
            <li key={s.id} className="animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
              <div className="lift card flex items-center gap-3 !rounded-2xl p-3">
                <button onClick={() => load(s.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left" aria-label={`Load scan ${s.job_title || s.id}`}>
                  {busyId === s.id ? <Loader2 size={22} className="w-[46px] animate-spin text-accent" /> : <MiniRing value={s.overall_score} />}
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{s.job_title || "Untitled role"}</span>
                    <span className="block truncate text-xs text-muted">{[s.company, new Date(s.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })].filter(Boolean).join(" · ")}</span>
                    <span className="block text-xs text-muted">ATS {s.ats_probability}%</span>
                  </span>
                </button>
                <button onClick={() => exportScan(s.id)} className="rounded-lg p-2 text-muted transition hover:bg-accent/10 hover:text-accent" aria-label="Export Markdown report" title="Export Markdown"><FileDown size={17} /></button>
                <button onClick={() => remove(s.id)} className="rounded-lg p-2 text-muted transition hover:bg-bad/10 hover:text-bad" aria-label="Delete scan" title="Delete"><Trash2 size={17} /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Overlay>
  )
}
