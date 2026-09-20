import { useRef, useState } from "react"
import { CheckCircle2, FileText, Lightbulb, Loader2, RefreshCw, UploadCloud } from "lucide-react"
import { spotlight, scoreTone, toneText } from "@/lib/ui"
import { useApp } from "@/context/app-context"
import { useMounted } from "@/lib/hooks"
import { cn } from "@/lib/utils"

function HealthRing({ value }) {
  const mounted = useMounted()
  const r = 26, c = 2 * Math.PI * r
  const tone = scoreTone(value)
  return (
    <svg width="68" height="68" viewBox="0 0 68 68" className="shrink-0" role="img" aria-label={`CV health ${value} out of 100`}>
      <circle cx="34" cy="34" r={r} fill="none" stroke="currentColor" strokeWidth="6" className="text-line" />
      <circle cx="34" cy="34" r={r} fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round"
        strokeDasharray={`${mounted ? (value / 100) * c : 0} ${c}`} transform="rotate(-90 34 34)"
        className={cn(toneText[tone], "transition-[stroke-dasharray] duration-1000 ease-out")} />
      <text x="34" y="39" textAnchor="middle" fontSize="16" fontWeight="700" fill="currentColor">{value}</text>
    </svg>
  )
}

export default function UploadZone({ cv, uploading, error, onFile }) {
  const { copy } = useApp()
  const inputRef = useRef(null)
  const [drag, setDrag] = useState(false)
  const [showTips, setShowTips] = useState(false)

  const pick = (file) => file && onFile(file)
  const onDrop = (e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files?.[0]) }

  return (
    <div className="card spotlight p-5 sm:p-6" onMouseMove={spotlight}>
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-accent/15 text-sm font-bold text-accent">1</span>
        <h2 className="text-lg font-semibold">{copy.cv.title}</h2>
      </div>

      <input ref={inputRef} type="file" accept=".pdf,.docx" className="hidden" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = "" }} />

      {!cv ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          disabled={uploading}
          className={cn(
            "group relative grid min-h-[260px] w-full place-items-center rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-300",
            drag ? "scale-[1.02] border-accent bg-accent/10" : "border-line bg-surface-2/50 hover:border-accent/60 hover:bg-accent/[0.06]",
          )}
        >
          {uploading ? (
            <div className="animate-pop-in">
              <Loader2 size={34} className="mx-auto animate-spin text-accent" />
              <p className="mt-3 font-medium">{copy.cv.reading}</p>
            </div>
          ) : (
            <div>
              <span className={cn("mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-accent to-accent-2 text-white shadow-glow transition-transform duration-300", drag ? "-translate-y-2 scale-110" : "group-hover:-translate-y-1 group-hover:rotate-3")}>
                <UploadCloud size={30} />
              </span>
              <p className="mt-4 font-semibold">{drag ? copy.cv.dropActive : copy.cv.drop}</p>
              <p className="mt-1 text-sm text-muted">{copy.cv.hint}</p>
            </div>
          )}
        </button>
      ) : (
        <div className="animate-fade-up space-y-4">
          <div className="flex items-center gap-3 rounded-2xl border border-good/30 bg-good/10 p-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-good/20 text-good"><FileText size={20} /></span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{cv.filename}</p>
              <p className="flex items-center gap-1 text-xs text-good"><CheckCircle2 size={12} /> {copy.cv.skillsFound(cv.skills.length)}</p>
            </div>
            <button onClick={() => inputRef.current?.click()} disabled={uploading} className="btn btn-ghost !px-3 !py-1.5 text-xs">
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />} {copy.cv.replace}
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {cv.skills.slice(0, 24).map((s, i) => (
              <span key={s} className="chip animate-pop-in border-accent/25 bg-accent/10 text-accent" style={{ animationDelay: `${i * 35}ms` }}>{s}</span>
            ))}
            {cv.skills.length > 24 && <span className="chip bg-surface-2 text-muted">+{cv.skills.length - 24}</span>}
          </div>

          {cv.cv_score && (
            <div className="rounded-2xl border border-line bg-surface-2/50 p-3">
              <div className="flex items-center gap-3">
                <HealthRing value={cv.cv_score.score} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">CV health</p>
                  <p className="text-xs text-muted">{cv.cv_score.word_count} words · {cv.cv_score.sections_found.length} sections{cv.cv_score.has_quantified_achievements ? " · quantified impact ✓" : ""}</p>
                </div>
                {cv.cv_score.tips.length > 0 && (
                  <button onClick={() => setShowTips((s) => !s)} className="btn btn-ghost !px-3 !py-1.5 text-xs" aria-expanded={showTips}>
                    <Lightbulb size={14} /> {cv.cv_score.tips.length} tips
                  </button>
                )}
              </div>
              {showTips && (
                <ul className="animate-fade-up mt-3 space-y-2 border-t border-line pt-3">
                  {cv.cv_score.tips.map((t) => <li key={t} className="flex gap-2 text-xs text-muted"><Lightbulb size={13} className="mt-0.5 shrink-0 text-warn" />{t}</li>)}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {error && <p className="animate-pop-in mt-3 rounded-lg border border-bad/30 bg-bad/10 px-3 py-2 text-sm text-bad" role="alert">{error}</p>}
    </div>
  )
}
