import { useState } from "react"
import confetti from "canvas-confetti"
import { BookOpen, Check, Clock, ExternalLink, Flag, GraduationCap, Plus, Rocket, TrendingUp } from "lucide-react"
import { spotlight } from "@/lib/ui"
import { useApp } from "@/context/app-context"
import { cn } from "@/lib/utils"

const PROVIDER_DOT = {
  Coursera: "bg-blue-500", Udemy: "bg-purple-500", "Official Docs": "bg-emerald-500",
  edX: "bg-rose-500", "LinkedIn Learning": "bg-sky-500", freeCodeCamp: "bg-green-600",
}
const LEVEL = { Beginner: 1, Intermediate: 2, Advanced: 3 }

function Roadmap({ steps }) {
  const { toast } = useApp()
  const [done, setDone] = useState(() => new Set())
  function toggle(i) {
    const next = new Set(done)
    next.has(i) ? next.delete(i) : next.add(i)
    setDone(next)
    if (next.size === steps.length) {
      confetti({ particleCount: 110, spread: 75, origin: { y: 0.7 } })
      toast("Roadmap complete — go apply! 🎉")
    }
  }
  if (!steps.length) return null
  return (
    <section>
      <h3 className="mb-3 flex items-center gap-2 font-semibold"><Rocket size={18} className="text-accent" /> Your 3-step roadmap</h3>
      <ol className="relative space-y-3">
        <span className="absolute bottom-6 left-[19px] top-6 w-px bg-gradient-to-b from-accent via-accent-2 to-transparent" aria-hidden />
        {steps.map((s, i) => {
          const checked = done.has(i)
          return (
            <li key={s.title} className="relative animate-fade-up pl-12" style={{ animationDelay: `${i * 90}ms` }}>
              <button
                onClick={() => toggle(i)}
                className={cn("absolute left-0 top-3 grid h-10 w-10 place-items-center rounded-full border-2 text-sm font-bold transition-all duration-300",
                  checked ? "scale-105 border-good bg-good text-white" : "border-accent bg-surface text-accent hover:scale-110")}
                aria-pressed={checked} aria-label={`Mark step ${i + 1} ${checked ? "not done" : "done"}`}
              >
                {checked ? <Check size={18} strokeWidth={3} /> : i + 1}
              </button>
              <div className={cn("card !rounded-2xl p-4 transition-opacity", checked && "opacity-60")}>
                <div className="flex flex-wrap items-center gap-2">
                  <p className={cn("font-semibold", checked && "line-through")}>{s.title}</p>
                  {s.timeframe && <span className="chip bg-accent/15 text-accent"><Clock size={12} /> {s.timeframe}</span>}
                </div>
                <p className="mt-1 text-sm leading-relaxed text-muted">{s.description}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

function Courses({ courses, plan, onToggle }) {
  if (!courses.length) return null
  return (
    <section>
      <h3 className="mb-1 flex items-center gap-2 font-semibold"><BookOpen size={18} className="text-accent-2" /> Recommended courses</h3>
      <p className="mb-3 text-xs text-muted">Add courses to your plan to see your projected match rise. Links open a search for the course.</p>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
        {courses.map((c, i) => {
          const inPlan = plan.has(i)
          return (
            <div key={c.title} className={cn("card spotlight lift animate-fade-up flex flex-col !rounded-2xl p-4", inPlan && "!border-accent-2/60")} style={{ animationDelay: `${i * 70}ms` }} onMouseMove={spotlight}>
              <div className="flex items-start justify-between gap-2">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-muted"><span className={cn("h-2 w-2 rounded-full", PROVIDER_DOT[c.provider] || "bg-accent")} />{c.provider}</span>
                <span className="chip bg-good/15 text-good"><TrendingUp size={12} /> +{c.match_boost}% match</span>
              </div>
              <a href={c.url} target="_blank" rel="noopener noreferrer" className="group mt-2 flex items-start gap-1.5 font-semibold leading-snug hover:text-accent">
                {c.title}<ExternalLink size={13} className="mt-1 shrink-0 opacity-0 transition group-hover:opacity-100" />
              </a>
              {c.skill && <p className="mt-1 text-xs text-muted">Closes gap: <span className="font-medium text-fg">{c.skill}</span></p>}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
                {c.duration && <span className="flex items-center gap-1"><Clock size={12} /> {c.duration}</span>}
                <span className="flex items-center gap-1.5" title={c.level}>
                  {[1, 2, 3].map((n) => <span key={n} className={cn("h-1.5 w-3.5 rounded-full", n <= LEVEL[c.level] ? "bg-accent" : "bg-line")} />)} {c.level}
                </span>
              </div>
              <button onClick={() => onToggle(i)} className={cn("btn mt-4 w-full !py-2 text-xs", inPlan ? "btn-primary" : "btn-ghost")} aria-pressed={inPlan}>
                {inPlan ? <><Check size={14} /> In your plan</> : <><Plus size={14} /> Add to plan</>}
              </button>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default function UpskillPanel({ analysis, plan, onToggle, projected }) {
  const gain = projected - analysis.overall_score
  return (
    <div className="space-y-6">
      <div className="card flex flex-wrap items-center gap-x-6 gap-y-3 !rounded-2xl p-4">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent-2/15 text-accent-2"><Flag size={20} /></span>
        <div className="min-w-[10rem] flex-1">
          <p className="text-sm font-semibold">Projected match</p>
          <p className="text-xs text-muted">Estimated if you complete the selected courses</p>
        </div>
        <div className="flex items-center gap-3 text-2xl font-bold tabular-nums">
          <span className="text-muted">{analysis.overall_score}%</span>
          <span className="text-base text-muted">→</span>
          <span className={cn(gain > 0 ? "text-gradient" : "text-muted")}>{projected}%</span>
          {gain > 0 && <span className="chip animate-pop-in bg-good/15 text-good">+{gain}</span>}
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <Roadmap steps={analysis.roadmap} />
        <Courses courses={analysis.courses} plan={plan} onToggle={onToggle} />
      </div>
      {!analysis.roadmap.length && !analysis.courses.length && (
        <p className="flex items-center gap-2 rounded-xl border border-dashed border-line p-6 text-sm text-muted"><GraduationCap size={18} /> Run the AI analysis to get a personalised roadmap and course list.</p>
      )}
    </div>
  )
}
