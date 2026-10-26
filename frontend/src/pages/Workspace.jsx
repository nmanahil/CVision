import { useCallback, useState } from "react"
import confetti from "canvas-confetti"
import { ArrowRight, BarChart3, Bot, GitCompare, Rocket, ShieldCheck } from "lucide-react"
import Navbar from "@/components/Navbar"
import UploadZone from "@/components/UploadZone"
import JobInput from "@/components/JobInput"
import AnalyzingView from "@/components/AnalyzingView"
import ResultsView from "@/components/results/ResultsView"
import CopilotPanel from "@/components/CopilotPanel"
import CompareModal from "@/components/CompareModal"
import { api } from "@/lib/api"
import { analysisToMarkdown, downloadText, reportFilename } from "@/lib/report"
import { useApp } from "@/context/app-context"
import { cn } from "@/lib/utils"

const MAX_CV_BYTES = 10 * 1024 * 1024

const FEATURES = [
  { icon: BarChart3, label: "Compatibility gauge" },
  { icon: ShieldCheck, label: "ATS bot simulation" },
  { icon: Rocket, label: "Upskilling roadmap" },
  { icon: Bot, label: "Career Co-Pilot" },
]

export default function Workspace() {
  const { copy, toast } = useApp()

  const [cv, setCv] = useState(null) // { filename, skills, cv_score }
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const [jobMode, setJobMode] = useState("text")
  const [jobText, setJobText] = useState("")
  const [stage, setStage] = useState("input") // input | analyzing | results
  const [result, setResult] = useState(null) // { analysis, scan_id, ai_error }
  const [resultKey, setResultKey] = useState(0)
  const [analyzeError, setAnalyzeError] = useState("")
  const [retrying, setRetrying] = useState(false)
  const [messages, setMessages] = useState([])
  const [copilotOpen, setCopilotOpen] = useState(false)
  const [compareOpen, setCompareOpen] = useState(false)

  const showResult = useCallback((data) => {
    setResult(data)
    setResultKey((k) => k + 1)
    setStage("results")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  async function upload(file) {
    const ext = file.name.split(".").pop().toLowerCase()
    if (!["pdf", "docx"].includes(ext)) return setUploadError("Only PDF or DOCX files are supported.")
    if (file.size > MAX_CV_BYTES) return setUploadError("That file is over 10 MB.")
    setUploading(true)
    setUploadError("")
    try {
      const d = await api.uploadCv(file)
      setCv({ filename: d.filename, skills: d.skills, cv_score: d.cv_score })
      setResult(null)
      setStage("input")
      setMessages([])
    } catch (e) {
      setUploadError(e.message)
    } finally {
      setUploading(false)
    }
  }

  async function analyze({ retry = false } = {}) {
    setAnalyzeError("")
    if (retry) { setRetrying(true); toast(copy.toast.retry) } else setStage("analyzing")
    try {
      const d = await api.analyzeJob(jobText.trim())
      if (!retry) setMessages([])
      showResult(d)
      if (d.analysis.ai && d.analysis.overall_score >= 80) setTimeout(() => confetti({ particleCount: 130, spread: 80, origin: { y: 0.55 } }), 700)
      if (d.analysis.ai && window.innerWidth >= 1024) setCopilotOpen(true)
    } catch (e) {
      if (retry) toast(e.message, "error")
      else { setAnalyzeError(e.message); setStage("input") }
    } finally {
      setRetrying(false)
    }
  }

  function newScan() {
    setStage("input")
    setResult(null)
    setJobText("")
    setAnalyzeError("")
    setMessages([])
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function exportReport() {
    const a = result.analysis
    downloadText(reportFilename(a), analysisToMarkdown(a, { cv_filename: cv?.filename }))
    toast(copy.toast.exported)
  }

  const canAnalyze = !!cv && jobText.trim().length > 0 && !uploading
  const dock = copilotOpen && !!cv

  return (
    <>
      <Navbar
        stage={stage}
        hasCv={!!cv}
        copilotOpen={copilotOpen}
        onToggleCopilot={() => setCopilotOpen((o) => !o)}
        onHome={newScan}
      />

      <main className={cn("mx-auto max-w-[1500px] gap-6 px-4 py-6 sm:px-6 sm:py-8", dock && "lg:grid lg:grid-cols-[minmax(0,1fr)_400px]")}>
        <div className="min-w-0">
          {stage === "input" && (
            <div className="mx-auto max-w-6xl">
              <div className="animate-fade-up mx-auto mb-10 max-w-3xl text-center">
                <span className="chip mx-auto border-accent/30 bg-accent/10 text-accent">{copy.hero.eyebrow}</span>
                <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
                  {copy.hero.title} <span className="text-gradient">{copy.hero.titleAccent}</span>
                </h1>
                <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">{copy.hero.sub}</p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {FEATURES.map((f, i) => {
                    const FeatureIcon = f.icon
                    return (
                      <span key={f.label} className="chip animate-pop-in border-line bg-surface/70 !py-1.5 text-muted" style={{ animationDelay: `${300 + i * 90}ms` }}><FeatureIcon size={13} className="text-accent" /> {f.label}</span>
                    )
                  })}
                </div>
              </div>

              <div className="animate-fade-up grid gap-5 md:grid-cols-2" style={{ animationDelay: "120ms" }}>
                <UploadZone cv={cv} uploading={uploading} error={uploadError} onFile={upload} />
                <JobInput mode={jobMode} onModeChange={(m) => { setJobMode(m); setJobText("") }} value={jobText} onChange={setJobText} />
              </div>

              <div className="mt-8 flex flex-col items-center gap-3">
                {analyzeError && <p className="animate-pop-in max-w-xl rounded-xl border border-bad/30 bg-bad/10 px-4 py-2.5 text-center text-sm text-bad" role="alert">{analyzeError}</p>}
                <button
                  onClick={() => analyze()}
                  disabled={!canAnalyze}
                  className={cn("btn btn-primary !rounded-2xl !px-8 !py-3.5 text-base", canAnalyze && "animate-pulse-glow")}
                >
                  {copy.analyze} <ArrowRight size={18} />
                </button>
                {!canAnalyze && <p className="text-sm text-muted">{copy.analyzeNeed}</p>}
                {cv && (
                  <button onClick={() => setCompareOpen(true)} className="flex items-center gap-1.5 text-sm font-semibold text-accent transition hover:underline">
                    <GitCompare size={15} /> Not sure which job? Compare several
                  </button>
                )}
              </div>
            </div>
          )}

          {stage === "analyzing" && <AnalyzingView />}

          {stage === "results" && result && (
            <ResultsView
              key={resultKey}
              result={result}
              aiError={result.ai_error}
              retrying={retrying}
              onRetry={() => analyze({ retry: true })}
              onNewScan={newScan}
              onExport={exportReport}
              onCompare={() => setCompareOpen(true)}
            />
          )}
        </div>

        {cv && (
          <CopilotPanel
            open={copilotOpen}
            onClose={() => setCopilotOpen(false)}
            hasCv={!!cv}
            hasJob={stage === "results"}
            messages={messages}
            setMessages={setMessages}
          />
        )}
      </main>

      <CompareModal open={compareOpen} onClose={() => setCompareOpen(false)} />
    </>
  )
}
