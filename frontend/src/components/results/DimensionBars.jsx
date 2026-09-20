import { useState } from "react"
import { Briefcase, ChevronDown, GraduationCap, Layers, Target } from "lucide-react"
import { scoreTone, toneBg, toneText } from "@/lib/ui"
import { useCountUp, useMounted } from "@/lib/hooks"
import { cn } from "@/lib/utils"

const DIMS = [
  { key: "technical_skills", label: "Technical skills", icon: Layers },
  { key: "experience_depth", label: "Experience depth", icon: Briefcase },
  { key: "education", label: "Education & credentials", icon: GraduationCap },
  { key: "role_alignment", label: "Role alignment", icon: Target },
]

function Row({ dim, data, weight, index }) {
  const mounted = useMounted(150 + index * 110)
  const [open, setOpen] = useState(false)
  const shown = useCountUp(mounted ? data.score : 0, 1000)
  const tone = scoreTone(data.score)
  const Icon = dim.icon
  return (
    <div className="rounded-2xl border border-transparent p-3 transition hover:border-line hover:bg-surface-2/60">
      <button className="w-full text-left" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <div className="mb-2 flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent"><Icon size={18} /></span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{dim.label}</p>
            <p className="text-xs text-muted">Weight {Math.round(weight * 100)}% of overall score</p>
          </div>
          <span className={cn("text-xl font-bold tabular-nums", toneText[tone])}>{shown}<span className="text-xs text-muted">%</span></span>
          <ChevronDown size={16} className={cn("text-muted transition-transform", open && "rotate-180")} />
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-line/70">
          <div className={cn("h-full rounded-full transition-[width] duration-1000 ease-out", toneBg[tone])} style={{ width: mounted ? `${data.score}%` : "0%" }} />
        </div>
      </button>
      {open && <p className="animate-fade-up mt-3 pl-12 text-sm leading-relaxed text-muted">{data.rationale || "No additional detail."}</p>}
    </div>
  )
}

export default function DimensionBars({ dimensions, weights }) {
  return (
    <div className="space-y-1">
      {DIMS.map((d, i) => <Row key={d.key} dim={d} data={dimensions[d.key]} weight={weights?.[d.key] ?? 0.25} index={i} />)}
    </div>
  )
}
