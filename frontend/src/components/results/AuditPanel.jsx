import { useEffect, useState } from "react"
import { AlertTriangle, ArrowRight, Bot, CheckCircle2, ChevronDown, Loader2, RotateCcw, ShieldCheck, Sparkles, XCircle } from "lucide-react"
import CopyButton from "@/components/CopyButton"
import { SEVERITY, spotlight } from "@/lib/ui"
import { cn } from "@/lib/utils"

function WeakPoints({ items }) {
  const [openIdx, setOpenIdx] = useState(0)
  const counts = items.reduce((m, w) => ({ ...m, [w.severity]: (m[w.severity] || 0) + 1 }), {})
  return (
    <section>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h3 className="flex items-center gap-2 font-semibold"><AlertTriangle size={18} className="text-warn" /> Weak points</h3>
        {["critical", "major", "minor"].filter((s) => counts[s]).map((s) => (
          <span key={s} className={cn("chip border capitalize", SEVERITY[s])}>{counts[s]} {s}</span>
        ))}
      </div>
      {items.length === 0 && <p className="rounded-xl border border-dashed border-line p-4 text-sm text-muted">No significant weak points found.</p>}
      <div className="space-y-2.5">
        {items.map((w, i) => {
          const open = openIdx === i
          return (
            <div key={`${w.title}-${i}`} className={cn("card animate-fade-up !rounded-2xl transition-colors", open && "border-accent/40")} style={{ animationDelay: `${i * 60}ms` }}>
              <button className="flex w-full items-center gap-3 p-3.5 text-left" onClick={() => setOpenIdx(open ? -1 : i)} aria-expanded={open}>
                <span className={cn("chip border capitalize", SEVERITY[w.severity])}>{w.severity}</span>
                <span className="flex-1 text-sm font-semibold">{w.title}</span>
                <ChevronDown size={16} className={cn("shrink-0 text-muted transition-transform duration-300", open && "rotate-180")} />
              </button>
              <div className={cn("grid transition-all duration-300", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                <div className="overflow-hidden">
                  <p className="px-3.5 pb-3.5 text-sm leading-relaxed text-muted">{w.diagnosis}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function Rewrites({ items }) {
  if (!items.length) return null
  return (
    <section>
      <h3 className="mb-1 flex items-center gap-2 font-semibold"><Sparkles size={18} className="text-accent" /> Bullet rewrites</h3>
      <p className="mb-3 text-xs text-muted">Rewritten with Google’s XYZ formula: <em>Accomplished [X] as measured by [Y], by doing [Z]</em>. Replace [brackets] with your real numbers.</p>
      <div className="space-y-3">
        {items.map((r, i) => (
          <div key={i} className="card spotlight animate-fade-up !rounded-2xl p-4" style={{ animationDelay: `${i * 70}ms` }} onMouseMove={spotlight}>
            <p className="text-[11px] font-bold uppercase tracking-wider text-bad/90">Before</p>
            <p className="mt-1 text-sm text-muted line-through decoration-bad/40">{r.original}</p>
            <div className="my-3 flex items-center gap-2 text-muted"><span className="h-px flex-1 bg-line" /><ArrowRight size={14} className="rotate-90" /><span className="h-px flex-1 bg-line" /></div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-good">After</p>
            <p className="mt-1 text-sm font-medium leading-relaxed">{r.improved}</p>
            <div className="mt-3 flex items-end justify-between gap-3">
              {r.reason ? <p className="text-xs text-muted">{r.reason}</p> : <span />}
              <CopyButton text={r.improved} label="Copy" className="shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

const STATUS = {
  pass: { icon: CheckCircle2, cls: "text-good", chip: "bg-good/15 text-good", label: "PASS" },
  flag: { icon: AlertTriangle, cls: "text-warn", chip: "bg-warn/15 text-warn", label: "FLAG" },
  fail: { icon: XCircle, cls: "text-bad", chip: "bg-bad/15 text-bad", label: "FAIL" },
}

function AtsScan({ checks, ats }) {
  const [run, setRun] = useState(0)
  if (!checks.length) return null
  return <AtsScanRun key={run} checks={checks} ats={ats} onRerun={() => setRun((r) => r + 1)} />
}

function AtsScanRun({ checks, ats, onRerun }) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s >= checks.length ? s : s + 1)), 650)
    return () => clearInterval(id)
  }, [checks.length])

  const finished = step >= checks.length
  const flags = checks.filter((c) => c.status !== "pass").length

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold"><Bot size={18} className="text-accent-2" /> ATS bot screen</h3>
        <button onClick={onRerun} className="btn btn-ghost !px-2.5 !py-1.5 text-xs"><RotateCcw size={13} /> Re-run scan</button>
      </div>
      <div className="card relative overflow-hidden !rounded-2xl">
        {!finished && <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 animate-scan bg-gradient-to-b from-transparent via-accent-2/25 to-transparent" style={{ animationDuration: `${checks.length * 0.65}s` }} />}
        <ul className="divide-y divide-line">
          {checks.map((c, i) => {
            const S = STATUS[c.status] || STATUS.flag
            const revealed = i < step
            const scanning = i === step && !finished
            const Icon = S.icon
            return (
              <li key={c.check} className={cn("flex items-start gap-3 p-3.5 transition-all duration-500", revealed ? "opacity-100" : "opacity-40")}>
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center">
                  {revealed ? <Icon size={20} className={cn("animate-pop-in", S.cls)} /> : scanning ? <Loader2 size={18} className="animate-spin text-accent-2" /> : <span className="h-2 w-2 rounded-full bg-line" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{c.check}</p>
                    {revealed && <span className={cn("chip animate-pop-in !px-2 !py-0.5 text-[10px]", S.chip)}>{S.label}</span>}
                  </div>
                  {revealed && <p className="animate-fade-up mt-0.5 text-xs leading-relaxed text-muted">{c.detail}</p>}
                </div>
              </li>
            )
          })}
        </ul>
        <div className={cn("flex items-center gap-3 border-t border-line p-3.5 transition-all duration-500", finished ? "bg-surface-2/60" : "opacity-0")}>
          <ShieldCheck size={20} className={ats >= 70 ? "text-good" : ats >= 45 ? "text-warn" : "text-bad"} />
          <p className="text-sm"><span className="font-semibold">{ats >= 70 ? "Likely to pass" : ats >= 45 ? "May be filtered" : "Likely to be filtered"}</span> <span className="text-muted">— {ats}% pass probability{flags ? `, ${flags} item${flags > 1 ? "s" : ""} to fix` : ""}.</span></p>
        </div>
      </div>
    </section>
  )
}

export default function AuditPanel({ analysis }) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <div className="space-y-6">
        <WeakPoints items={analysis.weak_points} />
        <AtsScan checks={analysis.ats_checks} ats={analysis.ats_pass_probability} />
      </div>
      <Rewrites items={analysis.bullet_rewrites} />
    </div>
  )
}
