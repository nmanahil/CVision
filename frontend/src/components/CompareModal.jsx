import { useState } from "react"
import { Loader2, Plus, X } from "lucide-react"
import { Overlay } from "@/components/ui/kit"
import { scoreTone, toneText, toneBg } from "@/lib/ui"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"

const blank = () => ({ label: "", description: "" })

export default function CompareModal({ open, onClose }) {
  const [jobs, setJobs] = useState([blank(), blank()])
  const [results, setResults] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  const update = (i, k, v) => setJobs((js) => js.map((j, idx) => (idx === i ? { ...j, [k]: v } : j)))
  const ready = jobs.filter((j) => j.description.trim()).length >= 2

  async function run() {
    setBusy(true); setError("")
    try { setResults((await api.compareJobs(jobs.filter((j) => j.description.trim()))).comparisons) }
    catch (e) { setError(e.message) } finally { setBusy(false) }
  }

  return (
    <Overlay open={open} onClose={onClose} title="Compare jobs" width="max-w-2xl">
      <div className="space-y-4 p-5">
        <p className="text-sm text-muted">Paste two or more job descriptions to see which one your CV fits best (quick keyword comparison).</p>
        {jobs.map((j, i) => (
          <div key={i} className="space-y-2 rounded-2xl border border-line bg-surface-2/50 p-3">
            <div className="flex items-center gap-2">
              <input className="field !py-2 text-sm" placeholder={`Job ${i + 1} label, e.g. "Acme — Backend"`} value={j.label} onChange={(e) => update(i, "label", e.target.value)} />
              {jobs.length > 2 && <button onClick={() => setJobs((js) => js.filter((_, x) => x !== i))} className="rounded-lg p-2 text-muted hover:bg-bad/10 hover:text-bad" aria-label={`Remove job ${i + 1}`}><X size={16} /></button>}
            </div>
            <textarea className="field thin-scroll min-h-[90px] resize-y text-sm" placeholder="Paste the job description…" value={j.description} onChange={(e) => update(i, "description", e.target.value)} />
          </div>
        ))}
        <div className="flex gap-2">
          <button onClick={() => setJobs((js) => [...js, blank()])} className="btn btn-ghost" disabled={jobs.length >= 5}><Plus size={15} /> Add job</button>
          <button onClick={run} disabled={!ready || busy} className="btn btn-primary flex-1">{busy && <Loader2 size={15} className="animate-spin" />} Compare</button>
        </div>
        {error && <p className="text-sm text-bad">{error}</p>}
        {results && (
          <div className="space-y-2.5 border-t border-line pt-4">
            {[...results].sort((a, b) => b.match_percentage - a.match_percentage).map((r, i) => {
              const tone = scoreTone(r.match_percentage)
              return (
                <div key={i} className="animate-fade-up rounded-2xl border border-line p-3.5" style={{ animationDelay: `${i * 70}ms` }}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-semibold">{i === 0 && <span className="mr-2 chip bg-good/15 text-good">Best fit</span>}{r.label}</p>
                    <span className={cn("text-lg font-bold tabular-nums", toneText[tone])}>{r.match_percentage}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-line"><div className={cn("h-full rounded-full transition-all duration-700", toneBg[tone])} style={{ width: `${r.match_percentage}%` }} /></div>
                  {r.missing_skills.length > 0 && <p className="mt-2 text-xs text-muted">Missing: {r.missing_skills.slice(0, 6).join(", ")}{r.missing_skills.length > 6 ? "…" : ""}</p>}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Overlay>
  )
}
