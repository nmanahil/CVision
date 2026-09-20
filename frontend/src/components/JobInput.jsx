import { FileText, Link2, Wand2 } from "lucide-react"
import { spotlight } from "@/lib/ui"
import { useApp } from "@/context/app-context"
import { cn } from "@/lib/utils"

const SAMPLE_JOB = `Senior Backend Engineer — Northwind Cloud

We are hiring a Senior Backend Engineer to design and run scalable microservices for a high-traffic platform.

Requirements:
- 5+ years of professional experience with Python or Go
- Strong knowledge of Docker and Kubernetes
- Experience with AWS (EKS, Lambda, S3) and infrastructure as code (Terraform)
- Building CI/CD pipelines
- PostgreSQL and Redis
- System design for high-availability services
- Bachelor's degree in Computer Science or equivalent

Nice to have: Kafka, GraphQL, mentoring junior engineers, leading small teams.`

export default function JobInput({ mode, onModeChange, value, onChange, disabled }) {
  const { copy } = useApp()
  return (
    <div className="card spotlight flex flex-col p-5 sm:p-6" onMouseMove={spotlight}>
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-accent/15 text-sm font-bold text-accent">2</span>
        <h2 className="text-lg font-semibold">{copy.job.title}</h2>
        <div className="ml-auto grid grid-cols-2 gap-1 rounded-xl bg-surface-2 p-1" role="tablist" aria-label="Job input type">
          {[["text", FileText, copy.job.paste], ["url", Link2, copy.job.url]].map((tab) => {
            const [id, TabIcon, label] = tab
            return (
              <button key={id} role="tab" aria-selected={mode === id} onClick={() => onModeChange(id)}
                className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition", mode === id ? "bg-surface text-fg shadow-sm" : "text-muted hover:text-fg")}>
                <TabIcon size={13} />{label}
              </button>
            )
          })}
        </div>
      </div>

      {mode === "text" ? (
        <textarea
          className="field thin-scroll min-h-[260px] flex-1 resize-none leading-relaxed"
          placeholder={copy.job.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          aria-label="Job description"
        />
      ) : (
        <div className="grid min-h-[260px] flex-1 content-center gap-3">
          <input
            type="url"
            className="field"
            placeholder={copy.job.urlPlaceholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            aria-label="Job posting URL"
          />
          <p className="text-xs text-muted">Some sites (like LinkedIn) block automated reading — if a link fails, switch to “{copy.job.paste}”.</p>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between text-xs text-muted">
        <button type="button" onClick={() => { onModeChange("text"); onChange(SAMPLE_JOB) }} className="flex items-center gap-1.5 font-semibold text-accent transition hover:underline" disabled={disabled}>
          <Wand2 size={13} /> {copy.job.sample}
        </button>
        {mode === "text" && <span>{value.length.toLocaleString()} chars</span>}
      </div>
    </div>
  )
}
