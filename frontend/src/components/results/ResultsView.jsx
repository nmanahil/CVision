import { useMemo, useState } from "react"
import { AlertTriangle, Briefcase, FileDown, GitCompare, Loader2, LogIn, Plus, RefreshCw, ShieldCheck, Target, Rocket, Cpu } from "lucide-react"
import ScoreGauge from "./ScoreGauge"
import DimensionBars from "./DimensionBars"
import SkillsMatrix from "./SkillsMatrix"
import AuditPanel from "./AuditPanel"
import UpskillPanel from "./UpskillPanel"
import RolesPanel from "./RolesPanel"
import { useApp } from "@/context/app-context"
import { prettyModel } from "@/lib/hooks"
import { cn } from "@/lib/utils"

const TAB_ICONS = { overview: Target, audit: ShieldCheck, upskill: Rocket, roles: Briefcase }

export default function ResultsView({ result, aiError, retrying, saved, onRetry, onNewScan, onExport, onCompare, onSignIn }) {
  const { copy, user } = useApp()
  const { analysis } = result
  const [tab, setTab] = useState("overview")
  const [plan, setPlan] = useState(() => new Set())

  const projected = useMemo(() => {
    const gain = [...plan].reduce((sum, i) => sum + (analysis.courses[i]?.match_boost || 0), 0)
    return Math.min(98, analysis.overall_score + gain)
  }, [plan, analysis])

  const togglePlan = (i) => setPlan((p) => { const n = new Set(p); n.has(i) ? n.delete(i) : n.add(i); return n })
  const tabs = Object.keys(copy.tabs)
  const title = [analysis.job_title, analysis.company].filter(Boolean).join(" · ") || "Match report"

  return (
    <div className="animate-fade-up space-y-5">
      {/* header */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 basis-full sm:flex-1 sm:basis-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Match report</p>
          <h1 className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl">{title}</h1>
        </div>
        {analysis.model && <span className="chip border-line bg-surface-2 text-muted" title="Model that produced this analysis"><Cpu size={12} /> {prettyModel(analysis.model)}</span>}
        <button onClick={onCompare} className="btn btn-ghost"><GitCompare size={16} /> <span className="hidden sm:inline">Compare jobs</span></button>
        <button onClick={onExport} className="btn btn-ghost" disabled={!analysis.ai}><FileDown size={16} /> <span className="hidden sm:inline">Export .md</span></button>
        <button onClick={onNewScan} className="btn btn-primary"><Plus size={16} /> New scan</button>
      </div>

      {!analysis.ai && (
        <div className="animate-pop-in flex flex-wrap items-center gap-3 rounded-2xl border border-warn/40 bg-warn/10 p-4" role="alert">
          <AlertTriangle size={20} className="shrink-0 text-warn" />
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-semibold">Showing a basic keyword result</p>
            <p className="text-muted">{aiError || "The AI analysis is unavailable right now."}</p>
          </div>
          <button onClick={onRetry} disabled={retrying} className="btn btn-ghost">
            {retrying ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />} {retrying ? copy.toast.retry : "Retry AI analysis"}
          </button>
        </div>
      )}

      {analysis.ai && !user && (
        <button onClick={onSignIn} className="flex w-full items-center gap-2 rounded-2xl border border-accent/30 bg-accent/10 px-4 py-2.5 text-left text-sm transition hover:bg-accent/15">
          <LogIn size={15} className="text-accent" /> <span className="text-muted">{copy.signInNudge}</span>
        </button>
      )}
      {saved && <p className="text-xs text-good">✓ {copy.toast.saved}</p>}

      {/* tabs */}
      <div className="thin-scroll overflow-x-auto">
        <div className="relative inline-grid min-w-[540px] grid-cols-4 rounded-2xl border border-line bg-surface-2/70 p-1 sm:min-w-[560px]" role="tablist">
          <span className="absolute inset-y-1 left-1 w-[calc(25%-4px)] rounded-xl bg-surface shadow-card transition-transform duration-300 ease-out" style={{ transform: `translateX(calc(${tabs.indexOf(tab)} * 100%))` }} aria-hidden />
          {tabs.map((id) => {
            const Icon = TAB_ICONS[id]
            return (
              <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
                className={cn("relative z-10 flex items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors", tab === id ? "text-fg" : "text-muted hover:text-fg")}>
                <Icon size={16} className={tab === id ? "text-accent" : ""} /><span>{copy.tabs[id]}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div key={tab} className="animate-fade-up">
        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,380px)_1fr]">
              <div className="card flex flex-col items-center justify-center p-5">
                <ScoreGauge score={analysis.overall_score} ats={analysis.ats_pass_probability} projected={projected} />
              </div>
              <div className="card p-4 sm:p-5">
                {analysis.verdict && <p className="mb-3 rounded-2xl bg-accent/10 p-3.5 text-sm leading-relaxed">{analysis.verdict}</p>}
                <h3 className="mb-1 px-1 text-sm font-semibold text-muted">4-dimension breakdown</h3>
                <DimensionBars dimensions={analysis.dimensions} weights={analysis.dimension_weights} />
              </div>
            </div>
            <div className="card p-4 sm:p-5">
              <SkillsMatrix matched={analysis.matched_skills} gaps={analysis.skill_gaps} />
            </div>
          </div>
        )}
        {tab === "audit" && <AuditPanel analysis={analysis} />}
        {tab === "upskill" && <UpskillPanel analysis={analysis} plan={plan} onToggle={togglePlan} projected={projected} />}
        {tab === "roles" && <RolesPanel />}
      </div>
    </div>
  )
}
