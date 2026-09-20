import { useState } from "react"
import { useApp } from "@/context/app-context"
import { bandLabel } from "@/lib/voice"
import { useCountUp, useMounted } from "@/lib/hooks"
import { cn } from "@/lib/utils"

const C = 150
const OUTER = { r: 122, w: 18 }
const INNER = { r: 92, w: 12 }
const circ = (r) => 2 * Math.PI * r

export default function ScoreGauge({ score, ats, projected }) {
  const { voice } = useApp()
  const mounted = useMounted(120)
  const [focus, setFocus] = useState("match") // match | ats
  const value = useCountUp(focus === "match" ? score : ats)
  const oc = circ(OUTER.r), ic = circ(INNER.r)
  const showProjection = projected > score

  const legend = [
    { id: "match", label: "Overall match", value: score, dot: "bg-accent" },
    { id: "ats", label: "ATS pass probability", value: ats, dot: "bg-accent-2" },
  ]

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 300 300" className="w-full max-w-[320px]" role="img" aria-label={`Overall match ${score} percent, ATS pass probability ${ats} percent`}>
        <defs>
          <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" style={{ stopColor: "rgb(var(--accent))" }} />
            <stop offset="100%" style={{ stopColor: "rgb(var(--accent-2))" }} />
          </linearGradient>
          <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6" /></filter>
        </defs>

        {/* tick marks that light up as the score sweeps past them */}
        {Array.from({ length: 60 }, (_, i) => {
          const lit = mounted && (i / 60) * 100 < score
          const long = i % 5 === 0
          return (
            <line key={i} x1={C} y1={long ? 4 : 7} x2={C} y2={12} transform={`rotate(${i * 6} ${C} ${C})`}
              strokeWidth={long ? 2.2 : 1.4} strokeLinecap="round"
              className={cn("transition-colors duration-500", lit ? "stroke-accent" : "stroke-line")}
              style={{ transitionDelay: `${i * 14}ms` }} />
          )
        })}

        {/* outer ring — overall match */}
        <g className={cn("cursor-pointer transition-opacity duration-300", focus === "ats" && "opacity-40")} onMouseEnter={() => setFocus("match")} onClick={() => setFocus("match")}>
          <circle cx={C} cy={C} r={OUTER.r} fill="none" strokeWidth={OUTER.w} className="stroke-line" opacity="0.7" />
          {showProjection && (
            <circle cx={C} cy={C} r={OUTER.r} fill="none" strokeWidth={OUTER.w} strokeLinecap="round" transform={`rotate(-90 ${C} ${C})`}
              strokeDasharray={`${mounted ? (projected / 100) * oc : 0} ${oc}`} className="stroke-accent-2 transition-[stroke-dasharray] duration-700 ease-out" opacity="0.32" />
          )}
          <circle cx={C} cy={C} r={OUTER.r} fill="none" strokeWidth={OUTER.w} strokeLinecap="round" transform={`rotate(-90 ${C} ${C})`}
            stroke="url(#gaugeGrad)" strokeDasharray={`${mounted ? (score / 100) * oc : 0} ${oc}`} className="transition-[stroke-dasharray] duration-[1400ms] ease-out" />
          <circle cx={C} cy={C} r={OUTER.r} fill="none" strokeWidth={OUTER.w} strokeLinecap="round" transform={`rotate(-90 ${C} ${C})`}
            stroke="url(#gaugeGrad)" filter="url(#gaugeGlow)" opacity="0.45"
            strokeDasharray={`${mounted ? (score / 100) * oc : 0} ${oc}`} className="transition-[stroke-dasharray] duration-[1400ms] ease-out" />
        </g>

        {/* inner ring — ATS pass probability */}
        <g className={cn("cursor-pointer transition-opacity duration-300", focus === "match" && "opacity-60")} onMouseEnter={() => setFocus("ats")} onClick={() => setFocus("ats")}>
          <circle cx={C} cy={C} r={INNER.r} fill="none" strokeWidth={INNER.w} className="stroke-line" opacity="0.6" />
          <circle cx={C} cy={C} r={INNER.r} fill="none" strokeWidth={INNER.w} strokeLinecap="round" transform={`rotate(-90 ${C} ${C})`}
            strokeDasharray={`${mounted ? (ats / 100) * ic : 0} ${ic}`} className="stroke-accent-2 transition-[stroke-dasharray] duration-[1600ms] ease-out" style={{ transitionDelay: "250ms" }} />
        </g>

        <text x={C} y={C + 4} textAnchor="middle" className="fill-fg" fontSize="58" fontWeight="800" style={{ fontVariantNumeric: "tabular-nums" }}>
          {value}<tspan fontSize="24" fontWeight="700" className="fill-muted">%</tspan>
        </text>
        <text x={C} y={C + 30} textAnchor="middle" className="fill-muted" fontSize="12.5" fontWeight="600">
          {focus === "match" ? bandLabel(voice, score) : "ATS pass probability"}
        </text>
      </svg>

      <div className="mt-1 flex flex-wrap justify-center gap-2" role="group" aria-label="Gauge legend">
        {legend.map((l) => (
          <button key={l.id} onMouseEnter={() => setFocus(l.id)} onFocus={() => setFocus(l.id)} onClick={() => setFocus(l.id)}
            className={cn("flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition", focus === l.id ? "border-accent/50 bg-accent/10" : "border-line hover:border-accent/30")}>
            <span className={cn("h-2.5 w-2.5 rounded-full", l.dot)} /> {l.label} <span className="tabular-nums">{l.value}%</span>
          </button>
        ))}
      </div>

      {showProjection && (
        <p className="animate-pop-in mt-3 rounded-full bg-accent-2/15 px-3 py-1 text-xs font-semibold text-accent-2">
          Projected with your plan: {projected}%
        </p>
      )}
    </div>
  )
}
