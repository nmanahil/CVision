import { useState } from "react"
import { AlertTriangle, ArrowLeft, Briefcase, Cpu, GraduationCap, Layers, Loader2, Plus, Target, Trophy, X } from "lucide-react"
import { Overlay } from "@/components/ui/kit"
import { URGENCY, scoreTone, toneBg, toneText } from "@/lib/ui"
import CopyButton from "@/components/CopyButton"
import { api } from "@/lib/api"
import { prettyModel, useMounted } from "@/lib/hooks"
import { cn } from "@/lib/utils"

const blank = () => ({ label: "", description: "" })
const DIMS = [
  { key: "technical_skills", label: "Skills", icon: Layers },
  { key: "experience_depth", label: "Experience", icon: Briefcase },
  { key: "education", label: "Education", icon: GraduationCap },
  { key: "role_alignment", label: "Role fit", icon: Target },
]

function ResultCard({ r, winner, index, aiMode }) {
  const mounted = useMounted(150 + index * 120)
  const tone = scoreTone(r.overall_score)
  const subtitle = [r.job_title, r.company].filter(Boolean).join(" · ")
  return (
    <div className={cn("animate-fade-up rounded-2xl border p-4 transition", winner ? "border-accent/60 bg-accent/[0.06] shadow-glow" : "border-line bg-surface")} style={{ animationDelay: `${index * 90}ms` }}>
      <div className="flex items-start gap-3">
        <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-bold", winner ? "bg-gradient-to-br from-accent to-accent-2 text-white" : "bg-surface-2 text-muted")}>
          {winner ? <Trophy size={17} /> : `#${r.rank}`}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold leading-snug">{r.label}</p>
          {subtitle && subtitle.toLowerCase() !== r.label.toLowerCase() && <p className="text-xs text-muted">{subtitle}</p>}
        </div>
        <div className="text-right">
          <p className={cn("text-2xl font-bold tabular-nums leading-none", toneText[tone])}>{r.overall_score}%</p>
          {aiMode && <p className="mt-1 text-[11px] text-muted">ATS {r.ats_pass_probability}%</p>}
        </div>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-line/70">
        <div className={cn("h-full rounded-full transition-[width] duration-1000 ease-out", toneBg[tone])} style={{ width: mounted ? `${r.overall_score}%` : "0%" }} />
      </div>

      {aiMode && (
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
          {DIMS.map((dim) => {
            const { key, label } = dim
            const DimIcon = dim.icon
            const v = r.dimensions[key].score
            return (
              <div key={key} title={r.dimensions[key].rationale}>
                <p className="flex items-center gap-1 text-[11px] text-muted"><DimIcon size={11} />{label} <span className={cn("ml-auto font-semibold tabular-nums", toneText[scoreTone(v)])}>{v}</span></p>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-line/70"><div className={cn("h-full rounded-full transition-[width] duration-1000 ease-out", toneBg[scoreTone(v)])} style={{ width: mounted ? `${v}%` : "0%" }} /></div>
              </div>
            )
          })}
        </div>
      )}

      {(r.matched_skills.length > 0 || r.gaps.length > 0) && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {r.matched_skills.map((s) => <span key={s} className="chip bg-good/15 text-good">{s}</span>)}
          {r.gaps.map((g) => <span key={g.skill} className={cn("chip border", URGENCY[g.urgency] || URGENCY.medium)} title={`${g.urgency} urgency gap`}>{g.skill}</span>)}
        </div>
      )}

      {aiMode && (r.strengths || r.risks) && (
        <div className="mt-3 space-y-1.5 text-xs leading-relaxed">
          {r.strengths && <p><span className="font-semibold text-good">Why you fit: </span><span className="text-muted">{r.strengths}</span></p>}
          {r.risks && <p><span className="font-semibold text-warn">Biggest risk: </span><span className="text-muted">{r.risks}</span></p>}
        </div>
      )}
    </div>
  )
}

function summaryText(result) {
  const lines = ["CVision job comparison"]
  result.comparisons.forEach((c) => lines.push(`#${c.rank} ${c.label} — ${c.overall_score}% match${c.gaps.length ? ` (gaps: ${c.gaps.slice(0, 4).map((g) => g.skill).join(", ")})` : ""}`))
  return lines.join("\n")
}

export default function CompareModal({ open, onClose }) {
  const [jobs, setJobs] = useState([blank(), blank()])
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  const update = (i, k, v) => setJobs((js) => js.map((j, idx) => (idx === i ? { ...j, [k]: v } : j)))
  const filled = jobs.filter((j) => j.description.trim())
  const ready = filled.length >= 2

  async function run() {
    setBusy(true); setError("")
    try { setResult(await api.compareJobs(filled)) }
    catch (e) { setError(e.message) }
    finally { setBusy(false) }
  }

  const winner = result?.comparisons[0]
  const second = result?.comparisons[1]

  return (
    <Overlay open={open} onClose={onClose} title={result ? "Which job fits you best?" : "Compare jobs"} width="max-w-3xl">
      {!result ? (
        <div className="space-y-4 p-5">
          <p className="text-sm text-muted">Add 2–5 jobs. Gemini scores your CV against each one with the same criteria and tells you which is the strongest match. Paste the description text, or a job link (some sites block link reading).</p>
          {jobs.map((j, i) => (
            <div key={i} className="space-y-2 rounded-2xl border border-line bg-surface-2/50 p-3">
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent/15 text-xs font-bold text-accent">{i + 1}</span>
                <input className="field !py-2 text-sm" placeholder='Label, e.g. "Acme — Backend Dev" (optional)' value={j.label} onChange={(e) => update(i, "label", e.target.value)} disabled={busy} />
                {jobs.length > 2 && <button onClick={() => setJobs((js) => js.filter((_, x) => x !== i))} className="rounded-lg p-2 text-muted hover:bg-bad/10 hover:text-bad" aria-label={`Remove job ${i + 1}`} disabled={busy}><X size={16} /></button>}
              </div>
              <textarea className="field thin-scroll min-h-[96px] resize-y text-sm" placeholder="Paste the job description (or a link)…" value={j.description} onChange={(e) => update(i, "description", e.target.value)} disabled={busy} />
            </div>
          ))}
          {error && <p className="animate-pop-in rounded-lg border border-bad/30 bg-bad/10 px-3 py-2 text-sm text-bad" role="alert">{error}</p>}
          <div className="flex gap-2">
            <button onClick={() => setJobs((js) => [...js, blank()])} className="btn btn-ghost" disabled={jobs.length >= 5 || busy}><Plus size={15} /> Add job</button>
            <button onClick={run} disabled={!ready || busy} className="btn btn-primary flex-1">
              {busy ? <><Loader2 size={15} className="animate-spin" /> Comparing {filled.length} jobs… (up to a minute)</> : "Find my best match"}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 p-5">
          {!result.ai && (
            <div className="flex items-start gap-2 rounded-xl border border-warn/40 bg-warn/10 p-3 text-sm" role="alert">
              <AlertTriangle size={17} className="mt-0.5 shrink-0 text-warn" />
              <p><span className="font-semibold">Basic keyword comparison.</span> <span className="text-muted">{result.ai_error || "AI is unavailable right now."} Try again for the full analysis.</span></p>
            </div>
          )}

          <div className="rounded-2xl bg-gradient-to-br from-accent/15 to-accent-2/15 p-4">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent"><Trophy size={14} /> Best fit for you</p>
            <p className="mt-1 text-xl font-bold leading-snug">{winner.label} <span className="text-gradient">· {winner.overall_score}%</span></p>
            <p className="mt-1 text-sm text-muted">
              {second && (result.close_call
                ? `A close call — only ${result.margin} point${result.margin === 1 ? "" : "s"} ahead of “${second.label}”. Compare the details below before choosing.`
                : `${result.margin} points ahead of “${second.label}”.`)}
            </p>
          </div>

          <div className="space-y-3">
            {result.comparisons.map((r, i) => <ResultCard key={r.index} r={r} winner={i === 0} index={i} aiMode={result.ai} />)}
          </div>

          {result.key_differences.length > 0 && (
            <div className="rounded-2xl border border-line bg-surface-2/50 p-4">
              <p className="mb-2 text-sm font-semibold">How the jobs differ</p>
              <ul className="ml-4 list-disc space-y-1.5 text-sm text-muted marker:text-accent">{result.key_differences.map((d) => <li key={d}>{d}</li>)}</ul>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => setResult(null)} className="btn btn-ghost"><ArrowLeft size={15} /> Edit jobs</button>
            <CopyButton text={summaryText(result)} label="Copy summary" className="!px-3 !py-2.5" />
            {result.model && <span className="chip ml-auto border-line bg-surface-2 text-muted"><Cpu size={12} /> {prettyModel(result.model)}</span>}
          </div>
        </div>
      )}
    </Overlay>
  )
}
