import { useState } from "react"

const API = "http://127.0.0.1:5000"

function Badge({ text, color }) {
  const colors = {
    green: "bg-green-100 text-green-800",
    red: "bg-red-100 text-red-800",
    blue: "bg-blue-100 text-blue-800",
  }
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mr-1 mb-1 ${colors[color]}`}>
      {text}
    </span>
  )
}

function ScoreRing({ score }) {
  const color = score >= 70 ? "text-green-400" : score >= 40 ? "text-yellow-400" : "text-red-400"
  return <div className={`text-5xl font-bold ${color}`}>{score}%</div>
}

export default function Upload() {
  const [file, setFile] = useState(null)
  const [cvSkills, setCvSkills] = useState([])
  const [inputMode, setInputMode] = useState("text") // "text" | "url"
  const [jobInput, setJobInput] = useState("")
  const [scrapedPreview, setScrapedPreview] = useState(null)
  const [matchResult, setMatchResult] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [activeTab, setActiveTab] = useState("match")
  const [loading, setLoading] = useState("")
  const [error, setError] = useState("")

  const handleUpload = async () => {
    if (!file) return setError("Please select a CV file first.")
    setError("")
    setLoading("upload")
    const formData = new FormData()
    formData.append("cv", file)
    try {
      const res = await fetch(`${API}/upload_cv`, { method: "POST", body: formData })
      const data = await res.json()
      if (data.error) return setError(data.error)
      setCvSkills(data.skills || [])
    } catch {
      setError("Failed to connect to backend.")
    } finally {
      setLoading("")
    }
  }

  const handleAnalyze = async () => {
    if (!jobInput.trim()) return setError(inputMode === "url" ? "Please enter a job URL." : "Please paste a job description.")
    if (!cvSkills.length) return setError("Upload your CV first.")
    setError("")
    setScrapedPreview(null)
    setLoading("analyze")
    const formData = new FormData()
    formData.append("job_description", jobInput.trim())
    try {
      const res = await fetch(`${API}/analyze_job`, { method: "POST", body: formData })
      const data = await res.json()
      if (data.error) return setError(data.error)
      setMatchResult(data.match_result)
      if (data.scraped_preview) setScrapedPreview(data.scraped_preview)
      setActiveTab("match")
    } catch {
      setError("Failed to analyze job.")
    } finally {
      setLoading("")
    }
  }

  const handleRecommend = async () => {
    if (!cvSkills.length) return setError("Upload your CV first.")
    setError("")
    setLoading("recommend")
    try {
      const res = await fetch(`${API}/recommend_jobs`)
      const data = await res.json()
      if (data.error) return setError(data.error)
      setRecommendations(data.recommendations || [])
      setActiveTab("recommend")
    } catch {
      setError("Failed to get recommendations.")
    } finally {
      setLoading("")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 p-6 text-white">
      <div className="max-w-3xl mx-auto">

        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-1">CVision 🚀</h1>
          <p className="text-slate-300 text-sm">AI-powered resume analyser & job recommender</p>
        </div>

        <div className="bg-white/10 backdrop-blur rounded-2xl p-6 mb-6 space-y-5">

          {/* Step 1 */}
          <div>
            <p className="text-sm font-semibold text-slate-300 mb-2">Step 1 — Upload your CV</p>
            <div className="flex gap-3">
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={(e) => setFile(e.target.files[0])}
                className="flex-1 text-sm text-slate-200 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:text-white file:cursor-pointer cursor-pointer"
              />
              <button
                onClick={handleUpload}
                disabled={loading === "upload"}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {loading === "upload" ? "Uploading..." : "Upload"}
              </button>
            </div>
            {cvSkills.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-slate-400 mb-1">Skills detected from your CV:</p>
                <div>{cvSkills.map((s, i) => <Badge key={i} text={s} color="blue" />)}</div>
              </div>
            )}
          </div>

          {/* Step 2 */}
          <div>
            <p className="text-sm font-semibold text-slate-300 mb-2">Step 2 — Analyse a job or get recommendations</p>

            {/* Toggle */}
            <div className="flex gap-1 bg-white/10 rounded-lg p-1 w-fit mb-3">
              <button
                onClick={() => { setInputMode("text"); setJobInput("") }}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${inputMode === "text" ? "bg-indigo-600 text-white" : "text-slate-300 hover:text-white"}`}
              >
                Paste Description
              </button>
              <button
                onClick={() => { setInputMode("url"); setJobInput("") }}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${inputMode === "url" ? "bg-indigo-600 text-white" : "text-slate-300 hover:text-white"}`}
              >
                🔗 Job URL
              </button>
            </div>

            {inputMode === "text" ? (
              <textarea
                placeholder="Paste the job description here..."
                className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-sm text-white placeholder-slate-400 h-28 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={jobInput}
                onChange={(e) => setJobInput(e.target.value)}
              />
            ) : (
              <div className="space-y-2">
                <input
                  type="url"
                  placeholder="https://www.linkedin.com/jobs/view/... or any job posting URL"
                  className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={jobInput}
                  onChange={(e) => setJobInput(e.target.value)}
                />
                <p className="text-xs text-slate-400">
                  Works with most job sites — LinkedIn, Indeed, Glassdoor, company career pages, etc.
                </p>
              </div>
            )}

            <div className="flex gap-3 mt-3">
              <button
                onClick={handleAnalyze}
                disabled={loading === "analyze"}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {loading === "analyze" ? "Analysing..." : "Analyse Job Match"}
              </button>
              <button
                onClick={handleRecommend}
                disabled={loading === "recommend"}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {loading === "recommend" ? "Loading..." : "Recommend Jobs"}
              </button>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>

        {/* Results */}
        {(matchResult || recommendations.length > 0) && (
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6">

            <div className="flex gap-2 mb-5">
              {matchResult && (
                <button
                  onClick={() => setActiveTab("match")}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium ${activeTab === "match" ? "bg-indigo-600" : "bg-white/10 hover:bg-white/20"}`}
                >
                  Job Match
                </button>
              )}
              {recommendations.length > 0 && (
                <button
                  onClick={() => setActiveTab("recommend")}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium ${activeTab === "recommend" ? "bg-emerald-600" : "bg-white/10 hover:bg-white/20"}`}
                >
                  Recommendations
                </button>
              )}
            </div>

            {activeTab === "match" && matchResult && (
              <div className="space-y-5">

                {/* Scraped preview */}
                {scrapedPreview && (
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <p className="text-xs text-slate-400 font-medium mb-1">📄 Extracted from URL (preview)</p>
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-4">{scrapedPreview}</p>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <ScoreRing score={matchResult.match_percentage} />
                  <div>
                    <p className="font-semibold text-lg">Match Score</p>
                    <p className="text-slate-300 text-sm">
                      {matchResult.match_percentage >= 70
                        ? "Great fit! You match most requirements."
                        : matchResult.match_percentage >= 40
                        ? "Decent match. A few skills to pick up."
                        : "Low match. Focus on the missing skills below."}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-green-400 mb-1">Matched Skills</p>
                  {matchResult.matched_skills.length
                    ? matchResult.matched_skills.map((s, i) => <Badge key={i} text={s} color="green" />)
                    : <p className="text-slate-400 text-sm">None matched.</p>}
                </div>

                <div>
                  <p className="text-sm font-semibold text-red-400 mb-1">Missing Skills</p>
                  {matchResult.missing_skills.length
                    ? matchResult.missing_skills.map((s, i) => <Badge key={i} text={s} color="red" />)
                    : <p className="text-slate-400 text-sm">No missing skills!</p>}
                </div>

                {matchResult.improvement_suggestions.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-yellow-400 mb-2">Suggestions to Improve</p>
                    <ul className="space-y-2">
                      {matchResult.improvement_suggestions.map((s, i) => (
                        <li key={i} className="flex gap-2 text-sm text-slate-200">
                          <span className="text-yellow-400 mt-0.5">💡</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === "recommend" && recommendations.length > 0 && (
              <div className="space-y-4">
                <p className="text-sm text-slate-300">Top job roles based on your CV skills:</p>
                {recommendations.map((job, i) => (
                  <div key={i} className="bg-white/10 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-base">{job.title}</p>
                        <p className="text-slate-400 text-xs">{job.description}</p>
                      </div>
                      <ScoreRing score={job.match_percentage} />
                    </div>

                    <div>
                      <p className="text-xs text-green-400 font-medium mb-1">You have</p>
                      <div>
                        {job.matched_skills.length
                          ? job.matched_skills.map((s, j) => <Badge key={j} text={s} color="green" />)
                          : <span className="text-slate-400 text-xs">None</span>}
                      </div>
                    </div>

                    {job.missing_skills.length > 0 && (
                      <div>
                        <p className="text-xs text-red-400 font-medium mb-1">Still needed</p>
                        <div>{job.missing_skills.map((s, j) => <Badge key={j} text={s} color="red" />)}</div>
                      </div>
                    )}

                    {job.suggestions.length > 0 && (
                      <div>
                        <p className="text-xs text-yellow-400 font-medium mb-1">How to close the gap</p>
                        <ul className="space-y-1">
                          {job.suggestions.map((s, j) => (
                            <li key={j} className="text-xs text-slate-300 flex gap-1">
                              <span className="text-yellow-400">💡</span>{s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  )
}
