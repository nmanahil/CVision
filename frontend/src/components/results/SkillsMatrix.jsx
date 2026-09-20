import { useState } from "react"
import { BadgeCheck, Clock, Quote } from "lucide-react"
import { URGENCY, spotlight } from "@/lib/ui"
import { cn } from "@/lib/utils"

export default function SkillsMatrix({ matched, gaps }) {
  const [filter, setFilter] = useState("all")
  const visibleGaps = filter === "all" ? gaps : gaps.filter((g) => g.urgency === filter)

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* verified matches */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-semibold"><BadgeCheck size={18} className="text-good" /> Verified matches</h3>
          <span className="chip bg-good/15 text-good">{matched.length}</span>
        </div>
        <div className="space-y-2.5">
          {matched.length === 0 && <p className="rounded-xl border border-dashed border-line p-4 text-sm text-muted">No required skills were clearly demonstrated in the CV.</p>}
          {matched.map((m, i) => (
            <div key={m.skill} className="card spotlight lift animate-fade-up !rounded-2xl p-3.5" style={{ animationDelay: `${i * 60}ms` }} onMouseMove={spotlight}>
              <div className="flex items-center gap-2">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-good/20 text-good"><BadgeCheck size={13} /></span>
                <span className="text-sm font-semibold">{m.skill}</span>
              </div>
              {m.evidence ? (
                <p className="mt-2 flex gap-2 rounded-lg bg-surface-2 p-2.5 text-xs italic leading-relaxed text-muted">
                  <Quote size={13} className="mt-0.5 shrink-0 text-accent" />“{m.evidence}”
                </p>
              ) : (
                <p className="mt-1.5 pl-7 text-xs text-muted">Referenced in your CV (no exact excerpt available).</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* gaps */}
      <section>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 font-semibold"><span className="grid h-[18px] w-[18px] place-items-center rounded-full bg-bad/20 text-[11px] font-bold text-bad">!</span> Skill gaps</h3>
          <div className="flex gap-1 rounded-xl bg-surface-2 p-1 text-xs font-semibold" role="tablist" aria-label="Filter gaps by urgency">
            {["all", "high", "medium", "low"].map((f) => (
              <button key={f} role="tab" aria-selected={filter === f} onClick={() => setFilter(f)}
                className={cn("rounded-lg px-2.5 py-1 capitalize transition", filter === f ? "bg-surface shadow-sm" : "text-muted hover:text-fg")}>{f}</button>
            ))}
          </div>
        </div>
        <div className="space-y-2.5">
          {visibleGaps.length === 0 && <p className="rounded-xl border border-dashed border-line p-4 text-sm text-muted">{gaps.length === 0 ? "No gaps found — nicely aligned with this role." : "No gaps at this urgency."}</p>}
          {visibleGaps.map((g, i) => (
            <div key={g.skill} className="card spotlight lift animate-fade-up !rounded-2xl p-3.5" style={{ animationDelay: `${i * 60}ms` }} onMouseMove={spotlight}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold">{g.skill}</span>
                <span className={cn("chip border capitalize", URGENCY[g.urgency])}>{g.urgency} urgency</span>
                {g.time_to_acquire && <span className="chip bg-surface-2 text-muted"><Clock size={12} /> ~{g.time_to_acquire}</span>}
              </div>
              {g.why_it_matters && <p className="mt-1.5 text-xs leading-relaxed text-muted">{g.why_it_matters}</p>}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
