import { useEffect, useState } from "react"
import { Check, Loader2 } from "lucide-react"
import { useApp } from "@/context/app-context"
import { cn } from "@/lib/utils"

export default function AnalyzingView() {
  const { copy } = useApp()
  const [active, setActive] = useState(0)
  const last = copy.stages.length - 1

  useEffect(() => {
    const id = setInterval(() => setActive((a) => Math.min(a + 1, last)), 3200)
    return () => clearInterval(id)
  }, [last])

  return (
    <div className="animate-fade-up mx-auto grid max-w-4xl items-center gap-8 py-10 md:grid-cols-2">
      {/* document being scanned */}
      <div className="relative mx-auto w-full max-w-xs">
        <div className="card relative overflow-hidden p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="skeleton h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2"><div className="skeleton h-3 w-2/3 rounded" /><div className="skeleton h-2.5 w-1/3 rounded" /></div>
          </div>
          {[92, 100, 78, 96, 60, 88, 100, 70, 84, 55].map((w, i) => (
            <div key={i} className="skeleton mb-2.5 h-2.5 rounded" style={{ width: `${w}%`, animationDelay: `${i * 120}ms` }} />
          ))}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4 animate-scan bg-gradient-to-b from-transparent via-accent/30 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px animate-scan bg-accent shadow-[0_0_18px_4px_rgb(var(--accent)/0.6)]" style={{ animationDuration: "1.6s" }} />
        </div>
        <div className="absolute -inset-6 -z-10 animate-float rounded-full bg-accent/20 blur-3xl" />
      </div>

      <ol className="space-y-3">
        {copy.stages.map((s, i) => {
          const done = i < active, current = i === active
          return (
            <li key={s} className={cn("flex items-center gap-3 rounded-xl border p-3 transition-all duration-500", current ? "border-accent/50 bg-accent/10" : done ? "border-line bg-surface-2/60" : "border-transparent opacity-40")}>
              <span className={cn("grid h-7 w-7 place-items-center rounded-full text-xs", done ? "bg-good text-white" : current ? "bg-accent text-white" : "bg-surface-2 text-muted")}>
                {done ? <Check size={14} strokeWidth={3} /> : current ? <Loader2 size={14} className="animate-spin" /> : i + 1}
              </span>
              <span className={cn("text-sm font-medium", current && "text-accent")}>{s}</span>
            </li>
          )
        })}
        <li className="pt-2 text-center text-xs text-muted md:text-left">Gemini is doing a careful read — this usually takes 15–40 seconds.</li>
      </ol>
    </div>
  )
}
