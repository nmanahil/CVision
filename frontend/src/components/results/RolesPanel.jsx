import { useEffect, useState } from "react"
import { Briefcase } from "lucide-react"
import { api } from "@/lib/api"
import { scoreTone, spotlight, toneText } from "@/lib/ui"
import { useApp } from "@/context/app-context"
import { cn } from "@/lib/utils"

export default function RolesPanel() {
  const { copy } = useApp()
  const [roles, setRoles] = useState(null)
  const [error, setError] = useState("")
  useEffect(() => {
    api.recommendJobs().then((d) => setRoles(d.recommendations || [])).catch((e) => setError(e.message))
  }, [])

  return (
    <div>
      <h3 className="flex items-center gap-2 font-semibold"><Briefcase size={18} className="text-accent" /> {copy.roles.title}</h3>
      <p className="mb-4 text-xs text-muted">{copy.roles.sub}</p>
      {error && <p className="text-sm text-bad">{error}</p>}
      {!roles && !error && <div className="grid gap-3 md:grid-cols-2">{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}</div>}
      <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
        {roles?.map((r, i) => (
          <div key={r.title} className="card spotlight lift animate-fade-up !rounded-2xl p-4" style={{ animationDelay: `${i * 60}ms` }} onMouseMove={spotlight}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{r.title}</p>
                <p className="mt-0.5 text-xs text-muted">{r.description}</p>
              </div>
              <span className={cn("text-2xl font-bold tabular-nums", toneText[scoreTone(r.match_percentage)])}>{r.match_percentage}%</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {r.matched_skills.slice(0, 6).map((s) => <span key={s} className="chip bg-good/15 text-good">{s}</span>)}
              {r.missing_skills.slice(0, 4).map((s) => <span key={s} className="chip bg-bad/15 text-bad">{s}</span>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
