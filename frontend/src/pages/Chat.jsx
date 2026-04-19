import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import confetti from "canvas-confetti"

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000"

const THEMES = {
  pookie: {
    pageBackground: "linear-gradient(160deg, #fff7fb 0%, #fde7f3 45%, #f6dff7 100%)",
    shellBackground: "rgba(255, 250, 253, 0.82)",
    shellBorder: "1px solid rgba(244, 143, 177, 0.45)",
    shellShadow: "0 24px 80px rgba(173, 20, 87, 0.12)",
    headerBackground: "rgba(255, 240, 246, 0.92)",
    headerBorder: "1px solid rgba(244, 143, 177, 0.28)",
    inputPanelBackground: "rgba(255, 240, 246, 0.92)",
    inputPanelBorder: "1px solid rgba(244, 143, 177, 0.24)",
    panel: "#fff5fa",
    panelAlt: "#fde7f2",
    botBubble: "#fff0f6",
    botText: "#6f3555",
    userBubble: "linear-gradient(135deg,#f8bbd0,#f48fb1)",
    userText: "#fffafd",
    inputBackground: "#fff9fc",
    inputBorder: "#efb4cb",
    inputText: "#6f3555",
    inputMuted: "#ad6f8d",
    accent: "linear-gradient(135deg,#f48fb1,#ce93d8)",
    accentSolid: "#ec8eb3",
    accentSoft: "#f7d5e4",
    subAccent: "#8e6280",
    successBg: "#dff4e8",
    successText: "#34785a",
    successBorder: "#8cc9ab",
    errorBg: "#ffe5ee",
    errorText: "#c25478",
    errorBorder: "#f3a8c2",
    infoBg: "#f2e5fb",
    infoText: "#8b64ad",
    infoBorder: "#d5b3ee",
    peachBg: "#fff0e1",
    peachText: "#c27b47",
    peachBorder: "#efba90",
    recommendationCard: "rgba(255, 246, 250, 0.95)",
    recommendationBorder: "1px solid rgba(244, 143, 177, 0.2)",
    title: "#8d2457",
    subtitle: "#a56486",
    status: "#d36b93",
    topRibbon: "🎀 ✨ 🎀 ♡ 🎀 ✨ 🎀",
    sideEmoji: "🎀",
    avatar: "🎀",
    statusText: "online • ready to slay 💅",
  },
  bro: {
    pageBackground: "linear-gradient(160deg, #edf2f7 0%, #dde7f3 45%, #d4dfef 100%)",
    shellBackground: "rgba(248, 251, 255, 0.84)",
    shellBorder: "1px solid rgba(96, 125, 139, 0.35)",
    shellShadow: "0 24px 80px rgba(25, 42, 70, 0.14)",
    headerBackground: "rgba(235, 242, 250, 0.94)",
    headerBorder: "1px solid rgba(96, 125, 139, 0.22)",
    inputPanelBackground: "rgba(235, 242, 250, 0.94)",
    inputPanelBorder: "1px solid rgba(96, 125, 139, 0.2)",
    panel: "#f5f8fc",
    panelAlt: "#e4edf7",
    botBubble: "#e7eef7",
    botText: "#284056",
    userBubble: "linear-gradient(135deg,#7895b2,#4f6f92)",
    userText: "#f8fbff",
    inputBackground: "#fbfdff",
    inputBorder: "#adc0d4",
    inputText: "#284056",
    inputMuted: "#5c738a",
    accent: "linear-gradient(135deg,#7895b2,#4f6f92)",
    accentSolid: "#5d7a9b",
    accentSoft: "#d7e3ef",
    subAccent: "#54697e",
    successBg: "#d9efe5",
    successText: "#316b55",
    successBorder: "#8cbba7",
    errorBg: "#f1e3e7",
    errorText: "#9d5f72",
    errorBorder: "#d1a8b4",
    infoBg: "#dfe8f6",
    infoText: "#4c6e9d",
    infoBorder: "#a8bddd",
    peachBg: "#ece7de",
    peachText: "#8b7554",
    peachBorder: "#ccb99c",
    recommendationCard: "rgba(243, 247, 252, 0.98)",
    recommendationBorder: "1px solid rgba(96, 125, 139, 0.16)",
    title: "#26374a",
    subtitle: "#64788f",
    status: "#5c7da4",
    topRibbon: "🗿 ⚡ 🗿 ⚙️ 🗿 ⚡ 🗿",
    sideEmoji: "🗿",
    avatar: "🗿",
    statusText: "online • locked in bro mode 💪",
  },
}

const COPY = {
  pookie: {
    intro1: "heyyy welcome to CVision!! 👋🎀",
    intro2: "i'm your AI career bestie — literally here to make your job hunt less painful and way more slay 💅",
    intro3: "before we get into it... what's your name, gorgeous? 👀",
    nameReply: (name) => `omggg ${name}!! that name eats so bad 💖`,
    uploadPrompt: (name) => `okay ${name} here's the vibe — drop your CV and i'll analyse it, match you to jobs, and spill exactly which skills you're missing ✨`,
    uploadPrompt2: "upload your CV below (PDF or DOCX) and let's get you hired, pookie 🎀",
    needFile: "bestie i need your CV file, not the text 😭 tap the upload button for me",
    noSkills: "hmm i couldn't detect any skills from that CV 👀 make sure it's not a scanned image, babe",
    gotCv: (name) => `purrrr got your CV ${name} 💖`,
    foundYou: "here's what i found on you:",
    nextChoice: "okay now — do you want me to analyse a specific job or recommend roles based on your skills? 👇",
    analyseStart: "analyse a job",
    analysePrompt: "bettt! paste the job description or drop a URL — use the toggle to switch 🔗",
    recommendStart: "recommend me jobs",
    invalidChoice: "say 'analyse job' or 'recommend me jobs' babe, those are literally the two options rn 😭",
    scrapeHit: "got it! i scraped the job posting for you 🕵️‍♀️",
    breakdown: "here's your full breakdown:",
    glowup: "here's your glow-up plan, diva 💅",
    repeatChoice: "wanna analyse another job or get role recs? 👇",
    recommendationsIntro: (name) => `okay ${name} based on your skills, here are your top matches, pretty girl 🎯`,
    drumroll: "drumroll please... 🥁",
    analyseAgain: "wanna analyse a specific job now? hit the button below 👇",
    backendDown: "babe the backend is not responding 😭 make sure Flask is running!",
    backendNo: "backend said no 😭 make sure Flask is running!",
    backendGhosted: "the backend ghosted me 😭 make sure Flask is running!",
    uploadError: (error) => `upload issue bestie: ${error}`,
    genericError: (error) => `job check issue bestie: ${error}`,
    recommendationError: (error) => `recommendation issue bestie: ${error}`,
    skillsBarLabel: "locked in skills",
    reuploadLabel: "re-upload CV",
    cvMissingNudge: "you can totally test the errors too princess — try asking for job analysis before uploading a CV and i'll guide you 👀",
    cvMissingAction: "analyse without CV",
    askUploadAgain: "need to swap your resume? tap re-upload CV anytime 💖",
    roast: (score) => {
      if (score >= 90) return "yeah… this CV is eating ✨ at this point, they'd be lucky to have you"
      if (score >= 75) return "oh this? this is solid 🔥 now we're talking."
      if (score >= 50) return "okay wait… this is kinda decent 👀 you're not cooked… but you're not hired yet either"
      return "girl… i won't lie, this is looking a little cooked 💀 BUT we can fix it."
    },
    deflections: [
      "bestie i'm literally just a CV bot 💀 ask me about jobs, resumes, or skills",
      "girl i only do career tea here 😭 hit me with something job-related",
      "that's not really my lane babe — i'm locked in on CVs and job apps only 🎯",
      "lmaooo i wish i could help but i'm on career bestie duty only fr",
      "not my vibe, pretty girl — ask me about jobs tho! 🚀",
    ],
  },
  bro: {
    intro1: "yo welcome to CVision!! 👋🗿",
    intro2: "i'm your AI career bro — here to make the job hunt less painful and more locked in 💪",
    intro3: "before we lock in... what's your name, bro? 👀",
    nameReply: (name) => `yooo ${name}!! solid name, bro 🔥`,
    uploadPrompt: (name) => `aight ${name}, here's the move — drop your CV and i'll analyse it, match you to roles, and tell you exactly what skills you're missing`,
    uploadPrompt2: "upload your CV below (PDF or DOCX) and let's get to work 🗿",
    needFile: "bro i need the actual CV file, not just text 😭 hit the upload button",
    noSkills: "hmm couldn't detect any skills from that CV 👀 make sure it's not a scanned image, bro",
    gotCv: (name) => `bet, got your CV ${name} ✅`,
    foundYou: "here's what i found:",
    nextChoice: "now pick a lane — analyse a specific job or get role recommendations based on your skills 👇",
    analyseStart: "analyse a job",
    analysePrompt: "say less. paste the job description or drop the URL — use the toggle to switch 🔗",
    recommendStart: "recommend me jobs",
    invalidChoice: "say 'analyse job' or 'recommend me jobs', bro — those are the two options rn",
    scrapeHit: "got it. scraped the job post 🕵️",
    breakdown: "here's the full breakdown:",
    glowup: "here's the upgrade plan, bro 💪",
    repeatChoice: "you wanna analyse another job or get more role recs? 👇",
    recommendationsIntro: (name) => `aight ${name}, based on your skills here are your top matches 🎯`,
    drumroll: "drumroll real quick... 🥁",
    analyseAgain: "wanna analyse a specific job now? hit the button below 👇",
    backendDown: "bro the backend isn't responding 😭 make sure Flask is running!",
    backendNo: "backend said no 😭 make sure Flask is running!",
    backendGhosted: "backend ghosted hard 😭 make sure Flask is running!",
    uploadError: (error) => `upload issue, bro: ${error}`,
    genericError: (error) => `job check issue, bro: ${error}`,
    recommendationError: (error) => `recommendation issue, bro: ${error}`,
    skillsBarLabel: "locked in skills",
    reuploadLabel: "re-upload CV",
    cvMissingNudge: "you can test the guardrails too — try job analysis before uploading a CV and i'll call it out",
    cvMissingAction: "analyse without CV",
    askUploadAgain: "need to swap resumes? hit re-upload CV whenever",
    roast: (score) => {
      if (score >= 90) return "yeah… this CV is eating ✨ at this point, they'd be lucky to have you"
      if (score >= 75) return "oh this? this is solid 🔥 now we're talking, bro."
      if (score >= 50) return "okay wait… this is kinda decent 👀 you're not cooked… but you're not hired yet either"
      return "bro… i won't lie, this is looking a little cooked 💀 BUT we can fix it."
    },
    deflections: [
      "bro i'm literally just a CV bot 💀 ask me about jobs, resumes, or skills",
      "nah that's outside the playbook — i only handle career stuff here",
      "not my department, bro. i'm locked in on CVs and job matching only 🎯",
      "wish i could help but i'm on career mode only rn",
      "ask me something job-related and we're good 🚀",
    ],
  },
}

const borderDecorations = [
  { top: "7%", left: "4%" },
  { top: "19%", left: "10%" },
  { top: "33%", left: "5%" },
  { top: "49%", left: "11%" },
  { top: "65%", left: "6%" },
  { top: "81%", left: "9%" },
  { top: "12%", right: "4%" },
  { top: "28%", right: "10%" },
  { top: "44%", right: "6%" },
  { top: "60%", right: "11%" },
  { top: "76%", right: "5%" },
  { top: "88%", right: "10%" },
  { top: "3%", left: "20%" },
  { top: "3%", left: "40%" },
  { top: "3%", left: "61%" },
  { top: "3%", left: "82%" },
  { bottom: "3%", left: "18%" },
  { bottom: "3%", left: "39%" },
  { bottom: "3%", left: "62%" },
  { bottom: "3%", left: "83%" },
]

function getCopy(themeName) {
  return COPY[themeName] || COPY.pookie
}

function getDeflection(copy) {
  return copy.deflections[Math.floor(Math.random() * copy.deflections.length)]
}

function getScoreColor(score, theme) {
  if (score >= 70) return theme.successText
  if (score >= 40) return theme.peachText
  return theme.errorText
}

function isJobRelated(text) {
  const keywords = [
    "job", "cv", "resume", "skill", "career", "role", "work", "hire", "match",
    "recommend", "url", "link", "description", "upload", "analyse", "analyze",
    "missing", "improve", "suggestion", "experience", "python", "react", "aws",
    "developer", "engineer", "analyst", "data", "cloud", "frontend", "backend",
  ]
  return keywords.some((k) => text.toLowerCase().includes(k))
}

function TypingIndicator({ theme }) {
  return (
    <div className="flex items-center gap-1 px-4 py-3 rounded-2xl rounded-tl-sm w-fit" style={{ background: theme.botBubble }}>
      <span className="w-2 h-2 rounded-full dot-1" style={{ background: theme.accentSolid }} />
      <span className="w-2 h-2 rounded-full dot-2" style={{ background: theme.accentSolid }} />
      <span className="w-2 h-2 rounded-full dot-3" style={{ background: theme.accentSolid }} />
    </div>
  )
}

function BotBubble({ text, children, theme }) {
  return (
    <div className="flex items-end gap-2 animate-bubble">
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 mb-1 shadow-sm" style={{ background: theme.accent, color: "#fff" }}>
        {theme.avatar}
      </div>
      <div
        className="max-w-xs md:max-w-md lg:max-w-lg rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed"
        style={{ background: theme.botBubble, color: theme.botText, border: `1px solid ${theme.inputBorder}` }}
      >
        {text && <span style={{ whiteSpace: "pre-line" }}>{text}</span>}
        {children}
      </div>
    </div>
  )
}

function UserBubble({ text, theme }) {
  return (
    <div className="flex justify-end animate-bubble">
      <div className="max-w-xs md:max-w-md rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed shadow-sm" style={{ background: theme.userBubble, color: theme.userText }}>
        {text}
      </div>
    </div>
  )
}

function Badge({ text, color, theme }) {
  const styles = {
    green: { background: theme.successBg, color: theme.successText, border: `1px solid ${theme.successBorder}` },
    red: { background: theme.errorBg, color: theme.errorText, border: `1px solid ${theme.errorBorder}` },
    blue: { background: theme.infoBg, color: theme.infoText, border: `1px solid ${theme.infoBorder}` },
    peach: { background: theme.peachBg, color: theme.peachText, border: `1px solid ${theme.peachBorder}` },
  }

  return (
    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium mr-1 mb-1" style={styles[color] || styles.blue}>
      {text}
    </span>
  )
}

export default function Chat({ theme: selectedTheme = "pookie", onChangeTheme }) {
  const theme = useMemo(() => THEMES[selectedTheme] || THEMES.pookie, [selectedTheme])
  const copy = useMemo(() => getCopy(selectedTheme), [selectedTheme])

  const [messages, setMessages] = useState([])
  const [step, setStep] = useState("name")
  const [userName, setUserName] = useState("")
  const [cvSkills, setCvSkills] = useState([])
  const [cvScore, setCvScore] = useState(null)
  const [inputText, setInputText] = useState("")
  const [inputMode, setInputMode] = useState("text")
  const [isTyping, setIsTyping] = useState(false)
  const [hasUploadedCv, setHasUploadedCv] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [compareJobs, setCompareJobs] = useState([{ label: "", description: "" }, { label: "", description: "" }])
  const [showCompare, setShowCompare] = useState(false)
  const [compareResults, setCompareResults] = useState(null)
  const [compareLoading, setCompareLoading] = useState(false)
  const fileInputRef = useRef(null)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const didInit = useRef(false)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  useEffect(() => {
    if (didInit.current) return
    didInit.current = true
    botSay(copy.intro1, 400)
    botSay(copy.intro2, 1600)
    botSay(copy.intro3, 2900)
  }, [copy])

  function botSay(text, delay = 0, extra = null) {
    setTimeout(() => {
      setIsTyping(true)
      setTimeout(() => {
        setIsTyping(false)
        setMessages((prev) => [...prev, { from: "bot", text, extra }])
      }, 800)
    }, delay)
  }

  function userSay(text) {
    setMessages((prev) => [...prev, { from: "user", text }])
  }

  function openUploadPicker() {
    fileInputRef.current?.click()
  }

  function promptMissingCv() {
    botSay(copy.genericError("Upload CV first"))
    botSay(copy.cvMissingNudge, 900)
  }

  const handleSend = () => {
    const val = inputText.trim()
    if (!val) return
    setInputText("")

    if (step === "name") {
      const name = val.split(" ")[0]
      setUserName(name)
      userSay(val)
      botSay(copy.nameReply(name), 300)
      botSay(copy.uploadPrompt(name), 1500)
      botSay(copy.uploadPrompt2, 2800)
      setStep("cv")
      return
    }

    if (step === "job_input") {
      handleJobAnalysis(val)
      return
    }

    if (step === "cv") {
      userSay(val)
      botSay(copy.needFile)
      return
    }

    if (!isJobRelated(val)) {
      userSay(val)
      botSay(getDeflection(copy))
      return
    }

    const lower = val.toLowerCase()

    if (lower.includes("upload") || lower.includes("change cv") || lower.includes("replace cv") || lower.includes("reupload")) {
      userSay(val)
      botSay(copy.askUploadAgain)
      openUploadPicker()
      return
    }

    if (lower.includes("recommend")) {
      userSay(val)
      handleRecommend()
      return
    }

    if (lower.includes("analyse") || lower.includes("analyze") || lower.includes("job") || lower.includes("description") || lower.includes("url")) {
      userSay(val)
      if (!hasUploadedCv) {
        promptMissingCv()
        return
      }
      botSay(copy.analysePrompt, 300)
      setStep("job_input")
      return
    }

    userSay(val)
    botSay(getDeflection(copy))
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    e.target.value = ""
    if (!file) return
    userSay(`📎 ${file.name}`)
    setIsTyping(true)

    const formData = new FormData()
    formData.append("cv", file)

    try {
      const res = await fetch(`${API}/upload_cv`, { method: "POST", body: formData })
      const data = await res.json()
      setIsTyping(false)

      if (data.error) {
        setHasUploadedCv(false)
        setCvSkills([])
        botSay(copy.uploadError(data.error))
        return
      }

      const skills = data.skills || []
      const score = data.cv_score || null
      setCvSkills(skills)
      setCvScore(score)
      setHasUploadedCv(true)

      if (skills.length === 0) {
        botSay(copy.noSkills)
        return
      }

      botSay(copy.gotCv(userName), 200)
      if (score) botSay(copy.roast(score.score), 1000, { type: "cv_score", score })
      botSay(copy.foundYou, score ? 2200 : 1400, { type: "skills", skills })
      botSay(copy.nextChoice, score ? 3400 : 2600)
      setStep("job_mode")
    } catch {
      setIsTyping(false)
      botSay(copy.backendDown)
    }
  }

  const handleJobMode = (mode) => {
    if (mode === "analyse") {
      userSay(copy.analyseStart)
      if (!hasUploadedCv) {
        promptMissingCv()
        return
      }
      botSay(copy.analysePrompt, 300)
      setStep("job_input")
    } else {
      userSay(copy.recommendStart)
      handleRecommend()
    }
  }

  const handleJobModeFromText = (val) => {
    const lower = val.toLowerCase()
    if (lower.includes("analys") || lower.includes("job") || lower.includes("url") || lower.includes("description") || lower.includes("1")) {
      userSay(val)
      if (!hasUploadedCv) {
        promptMissingCv()
        return
      }
      botSay(copy.analysePrompt, 300)
      setStep("job_input")
    } else if (lower.includes("recommend") || lower.includes("suggest") || lower.includes("2")) {
      userSay(val)
      handleRecommend()
    } else if (lower.includes("upload") || lower.includes("change cv") || lower.includes("replace cv") || lower.includes("reupload")) {
      userSay(val)
      botSay(copy.askUploadAgain)
      openUploadPicker()
    } else {
      userSay(val)
      botSay(copy.invalidChoice)
    }
  }

  const handleJobAnalysis = async (val) => {
    userSay(val)
    setIsTyping(true)

    const formData = new FormData()
    formData.append("job_description", val)

    try {
      const res = await fetch(`${API}/analyze_job`, { method: "POST", body: formData })
      const data = await res.json()
      setIsTyping(false)

      if (data.error) {
        botSay(copy.genericError(data.error))
        return
      }

      const r = data.match_result
      let t = 300
      if (data.scraped_preview) {
        botSay(copy.scrapeHit, 200)
        t = 1400
      }
      if (r.match_percentage >= 70) {
        setTimeout(() => confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } }), t + 200)
      }
      botSay(copy.roast(r.match_percentage), t)
      botSay(copy.breakdown, t + 1000, { type: "match", result: r })
      if (r.improvement_suggestions.length > 0) {
        botSay(copy.glowup, t + 2200, { type: "suggestions", suggestions: r.improvement_suggestions })
      }
      botSay(copy.repeatChoice, t + 3400)
      setStep("job_mode")
    } catch {
      setIsTyping(false)
      botSay(copy.backendNo)
    }
  }

  const handleRecommend = async () => {
    if (!hasUploadedCv) {
      promptMissingCv()
      return
    }

    setIsTyping(true)
    try {
      const res = await fetch(`${API}/recommend_jobs`)
      const data = await res.json()
      setIsTyping(false)

      if (data.error) {
        botSay(copy.recommendationError(data.error))
        return
      }

      botSay(copy.recommendationsIntro(userName), 300)
      botSay(copy.drumroll, 1400, { type: "recommendations", recommendations: data.recommendations || [] })
      botSay(copy.analyseAgain, 2800)
      setStep("job_mode")
    } catch {
      setIsTyping(false)
      botSay(copy.backendGhosted)
    }
  }

  const handleSubmit = (e) => {
    e?.preventDefault()
    const val = inputText.trim()
    if (!val) return
    if (step === "job_mode") {
      setInputText("")
      handleJobModeFromText(val)
      return
    }
    handleSend()
  }

  const handleCopy = useCallback((text) => {
    navigator.clipboard.writeText(text).catch(() => {})
  }, [])

  const handleShare = useCallback((result) => {
    const text = `My CV match score: ${result.match_percentage}%\n✅ Matched: ${result.matched_skills.join(", ")}\n❌ Missing: ${result.missing_skills.join(", ")}\n\nAnalysed with CVision 🚀`
    if (navigator.share) {
      navigator.share({ title: "CVision Results", text }).catch(() => {})
    } else {
      navigator.clipboard.writeText(text).catch(() => {})
      alert("Results copied to clipboard!")
    }
  }, [])

  const handleCompare = async () => {
    if (!hasUploadedCv) { promptMissingCv(); return }
    const valid = compareJobs.filter(j => j.description.trim())
    if (valid.length < 2) return
    setCompareLoading(true)
    try {
      const res = await fetch(`${API}/compare_jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobs: valid }),
      })
      const data = await res.json()
      setCompareResults(data.comparisons || [])
    } catch { /* ignore */ }
    setCompareLoading(false)
  }

  function renderExtra(extra) {
    if (!extra) return null

    if (extra.type === "cv_score") {
      const s = extra.score
      const pct = s.score
      const col = pct >= 70 ? theme.successText : pct >= 40 ? theme.peachText : theme.errorText
      const radius = 28
      const circ = 2 * Math.PI * radius
      const dash = (pct / 100) * circ
      return (
        <div className="mt-2 rounded-xl p-3 space-y-2" style={{ background: theme.panel, border: `1px solid ${theme.inputBorder}` }}>
          <div className="flex items-center gap-3">
            <svg width="72" height="72" viewBox="0 0 72 72">
              <circle cx="36" cy="36" r={radius} fill="none" stroke={theme.accentSoft} strokeWidth="7" />
              <circle cx="36" cy="36" r={radius} fill="none" stroke={col} strokeWidth="7"
                strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
                transform="rotate(-90 36 36)" style={{ transition: "stroke-dasharray 1s ease" }} />
              <text x="36" y="41" textAnchor="middle" fontSize="14" fontWeight="bold" fill={col}>{pct}</text>
            </svg>
            <div>
              <p className="text-sm font-bold" style={{ color: theme.title }}>CV Score</p>
              <p className="text-xs" style={{ color: theme.subtitle }}>{s.word_count} words · {s.skill_count} skills · {s.sections_found.length} sections</p>
              {s.has_quantified_achievements && <p className="text-xs" style={{ color: theme.successText }}>✅ quantified achievements</p>}
            </div>
          </div>
          {s.tips.length > 0 && (
            <ul className="space-y-1">
              {s.tips.map((tip, i) => (
                <li key={i} className="text-xs flex gap-1.5" style={{ color: theme.botText }}>
                  <span style={{ color: theme.peachText }}>💡</span>{tip}
                </li>
              ))}
            </ul>
          )}
        </div>
      )
    }

    if (extra.type === "skills") {
      return (
        <div className="mt-2">
          {extra.skills.map((s, i) => <Badge key={i} text={s} color="blue" theme={theme} />)}
        </div>
      )
    }

    if (extra.type === "match") {
      const r = extra.result
      const col = getScoreColor(r.match_percentage, theme)
      const shareText = `CV match: ${r.match_percentage}%\n✅ ${r.matched_skills.join(", ")}\n❌ ${r.missing_skills.join(", ")}\n\nCVision 🚀`
      return (
        <div className="mt-2 space-y-2">
          <div className="flex items-center gap-3">
            <div className="text-4xl font-black" style={{ color: col }}>{r.match_percentage}%</div>
            <div className="flex gap-1.5">
              <button
                onClick={() => handleCopy(shareText)}
                className="px-2 py-1 rounded-lg text-xs font-medium"
                style={{ background: theme.accentSoft, color: theme.title, border: `1px solid ${theme.inputBorder}` }}
                title="Copy results"
              >📋 copy</button>
              <button
                onClick={() => handleShare(r)}
                className="px-2 py-1 rounded-lg text-xs font-medium"
                style={{ background: theme.accentSoft, color: theme.title, border: `1px solid ${theme.inputBorder}` }}
                title="Share results"
              >🔗 share</button>
            </div>
          </div>
          {r.matched_skills.length > 0 && (
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: theme.successText }}>✅ you got these</p>
              {r.matched_skills.map((s, i) => <Badge key={i} text={s} color="green" theme={theme} />)}
            </div>
          )}
          {r.missing_skills.length > 0 && (
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: theme.errorText }}>❌ missing these</p>
              {r.missing_skills.map((s, i) => <Badge key={i} text={s} color="red" theme={theme} />)}
            </div>
          )}
        </div>
      )
    }

    if (extra.type === "suggestions") {
      return (
        <ul className="mt-2 space-y-1.5">
          {extra.suggestions.map((s, i) => (
            <li key={i} className="flex gap-2 text-xs" style={{ color: theme.botText }}>
              <span style={{ color: theme.peachText }} className="flex-shrink-0">💡</span>
              {s}
            </li>
          ))}
        </ul>
      )
    }

    if (extra.type === "recommendations") {
      return (
        <div className="mt-2 space-y-3">
          {extra.recommendations.map((job, i) => (
            <div key={i} className="rounded-xl p-3 space-y-1.5" style={{ background: theme.recommendationCard, border: theme.recommendationBorder }}>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-sm" style={{ color: theme.title }}>{job.title}</p>
                  <p className="text-xs" style={{ color: theme.subtitle }}>{job.description}</p>
                </div>
                <span className="text-2xl font-black flex-shrink-0" style={{ color: getScoreColor(job.match_percentage, theme) }}>
                  {job.match_percentage}%
                </span>
              </div>
              {job.matched_skills.length > 0 && (
                <div>{job.matched_skills.map((s, j) => <Badge key={j} text={s} color="green" theme={theme} />)}</div>
              )}
              {job.missing_skills.length > 0 && (
                <div>
                  <p className="text-xs mb-0.5" style={{ color: theme.errorText }}>still need:</p>
                  {job.missing_skills.map((s, j) => <Badge key={j} text={s} color="red" theme={theme} />)}
                </div>
              )}
            </div>
          ))}
        </div>
      )
    }

    return null
  }

  const btnBase = "rounded-2xl text-sm font-semibold transition-all active:scale-95"
  const showReupload = step !== "name"

  function renderInput() {
    const uploadButton = (
      <>
        <input ref={fileInputRef} type="file" accept=".pdf,.docx" className="hidden" onChange={handleFileChange} />
        <button
          type="button"
          onClick={openUploadPicker}
          className={`py-3 ${btnBase} flex items-center justify-center gap-2 shadow-sm`}
          style={{ background: theme.accent, color: "#fff" }}
        >
          📎 {hasUploadedCv ? copy.reuploadLabel : "upload your CV"}
        </button>
      </>
    )

    if (step === "cv") {
      return (
        <div className="space-y-3">
          {uploadButton}
          <button
            type="button"
            onClick={() => handleJobMode("analyse")}
            className={`w-full py-2.5 ${btnBase}`}
            style={{ background: theme.panelAlt, color: theme.title, border: `1px solid ${theme.inputBorder}` }}
          >
            ⚠️ {copy.cvMissingAction}
          </button>
        </div>
      )
    }

    if (step === "job_mode") {
      return (
        <div className="space-y-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleJobMode("analyse")}
              className={`flex-1 py-2.5 ${btnBase}`}
              style={{ background: theme.panelAlt, color: theme.title, border: `1px solid ${theme.inputBorder}` }}
            >
              🔍 analyse a job
            </button>
            <button
              type="button"
              onClick={() => handleJobMode("recommend")}
              className={`flex-1 py-2.5 ${btnBase}`}
              style={{ background: theme.accentSoft, color: theme.title, border: `1px solid ${theme.inputBorder}` }}
            >
              ✨ recommend me jobs
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {uploadButton}
            <button
              type="button"
              onClick={() => handleJobMode("analyse")}
              className={`py-3 ${btnBase}`}
              style={{ background: theme.panel, color: theme.title, border: `1px solid ${theme.inputBorder}` }}
            >
              ⚠️ {copy.cvMissingAction}
            </button>
          </div>
        </div>
      )
    }

    if (step === "job_input") {
      return (
        <div className="space-y-2">
          {showReupload && (
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={openUploadPicker}
                className={`px-4 py-2 ${btnBase}`}
                style={{ background: theme.accentSoft, color: theme.title, border: `1px solid ${theme.inputBorder}` }}
              >
                📎 {copy.reuploadLabel}
              </button>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept=".pdf,.docx" className="hidden" onChange={handleFileChange} />
          <div className="flex gap-1 rounded-xl p-1 w-fit" style={{ background: theme.panelAlt, border: `1px solid ${theme.inputBorder}` }}>
            <button
              type="button"
              onClick={() => setInputMode("text")}
              className="px-3 py-1 rounded-lg text-xs font-medium transition-colors"
              style={inputMode === "text" ? { background: theme.accentSolid, color: "#fff" } : { color: theme.inputMuted }}
            >
              📝 paste text
            </button>
            <button
              type="button"
              onClick={() => setInputMode("url")}
              className="px-3 py-1 rounded-lg text-xs font-medium transition-colors"
              style={inputMode === "url" ? { background: theme.accentSolid, color: "#fff" } : { color: theme.inputMuted }}
            >
              🔗 job URL
            </button>
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2">
            {inputMode === "text" ? (
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit()
                  }
                }}
                placeholder="paste the job description here..."
                rows={3}
                className="flex-1 rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2"
                style={{ background: theme.inputBackground, color: theme.inputText, border: `1px solid ${theme.inputBorder}`, caretColor: theme.accentSolid }}
              />
            ) : (
              <input
                ref={inputRef}
                type="url"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit()
                }}
                placeholder="https://linkedin.com/jobs/view/..."
                className="flex-1 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2"
                style={{ background: theme.inputBackground, color: theme.inputText, border: `1px solid ${theme.inputBorder}`, caretColor: theme.accentSolid }}
              />
            )}
            <button type="submit" className={`px-4 ${btnBase} text-lg flex-shrink-0 shadow-sm`} style={{ background: theme.accent, color: "#fff" }}>
              →
            </button>
          </form>
        </div>
      )
    }

    return (
      <div className="space-y-2">
        {showReupload && (
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={openUploadPicker}
              className={`px-4 py-2 ${btnBase}`}
              style={{ background: theme.accentSoft, color: theme.title, border: `1px solid ${theme.inputBorder}` }}
            >
              📎 {copy.reuploadLabel}
            </button>
          </div>
        )}
        <input ref={fileInputRef} type="file" accept=".pdf,.docx" className="hidden" onChange={handleFileChange} />
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={step === "name" ? "type your name..." : "ask about jobs, CVs, skills, recommendations..."}
            className="flex-1 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2"
            style={{ background: theme.inputBackground, color: theme.inputText, border: `1px solid ${theme.inputBorder}`, caretColor: theme.accentSolid }}
          />
          <button type="submit" className={`px-4 ${btnBase} text-lg shadow-sm`} style={{ background: theme.accent, color: "#fff" }}>
            →
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden animate-slide-in" style={{ background: darkMode ? "#0f0f0f" : theme.pageBackground }}>
      {borderDecorations.map((style, index) => (
        <span key={index} className="absolute pointer-events-none text-2xl md:text-3xl animate-float-deco opacity-80" style={{ ...style, animationDelay: `${(index % 6) * 240}ms` }}>
          {theme.sideEmoji}
        </span>
      ))}

      <div className="min-h-screen px-4 py-5 md:px-8 md:py-7">
        <div
          className="mx-auto flex flex-col h-[calc(100vh-40px)] max-w-5xl rounded-[32px] overflow-hidden backdrop-blur-xl"
          style={{ background: theme.shellBackground, border: theme.shellBorder, boxShadow: theme.shellShadow }}
        >
          <div className="px-6 pt-4 pb-2 text-center text-sm tracking-[0.3em] flex-shrink-0" style={{ color: theme.subtitle }}>
            {theme.topRibbon}
          </div>

          <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0" style={{ background: theme.headerBackground, borderTop: theme.headerBorder, borderBottom: theme.headerBorder }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-base flex-shrink-0 shadow-sm" style={{ background: theme.accent, color: "#fff" }}>
              {theme.avatar}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold" style={{ color: theme.title }}>CVision</p>
              <p className="text-xs" style={{ color: theme.status }}>{theme.statusText}</p>
            </div>
            <div className="flex items-center gap-2">
              {hasUploadedCv && (
                <button
                  onClick={() => setShowCompare(v => !v)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium"
                  style={{ background: theme.accentSoft, color: theme.title, border: `1px solid ${theme.inputBorder}` }}
                  title="Compare jobs"
                >↔️ compare</button>
              )}
              <button
                onClick={() => setDarkMode(v => !v)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-base"
                style={{ background: theme.panelAlt, border: `1px solid ${theme.inputBorder}` }}
                title="Toggle dark mode"
              >{darkMode ? "☀️" : "🌙"}</button>
              {onChangeTheme && (
                <button
                  onClick={onChangeTheme}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-base"
                  style={{ background: theme.panelAlt, border: `1px solid ${theme.inputBorder}` }}
                  title="Change theme"
                >🎨</button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto chat-scroll px-5 py-5 md:px-6 md:py-6 space-y-3" style={{ background: darkMode ? "rgba(0,0,0,0.6)" : "transparent" }}>
            {messages.map((msg, i) =>
              msg.from === "bot"
                ? <BotBubble key={i} text={msg.text} theme={theme}>{renderExtra(msg.extra)}</BotBubble>
                : <UserBubble key={i} text={msg.text} theme={theme} />
            )}

            {isTyping && (
              <div className="flex items-end gap-2 animate-bubble">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 shadow-sm" style={{ background: theme.accent, color: "#fff" }}>
                  {theme.avatar}
                </div>
                <TypingIndicator theme={theme} />
              </div>
            )}

            {step !== "name" && (
              <div className="rounded-2xl px-4 py-3 text-xs space-y-1" style={{ background: theme.panel, border: `1px solid ${theme.inputBorder}`, color: theme.subtitle }}>
                <p>{hasUploadedCv ? `${copy.skillsBarLabel}: ${cvSkills.slice(0, 8).join(" • ") || "CV uploaded"}` : "No CV uploaded yet."}</p>
                <p>{copy.askUploadAgain}</p>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <div className="px-5 py-4 md:px-6 md:py-5 flex-shrink-0" style={{ background: theme.inputPanelBackground, borderTop: theme.inputPanelBorder }}>
            {showCompare ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold" style={{ color: theme.title }}>↔️ Compare Jobs</p>
                  <button onClick={() => { setShowCompare(false); setCompareResults(null) }} className="text-xs" style={{ color: theme.subtitle }}>close ×</button>
                </div>
                {compareJobs.map((job, i) => (
                  <div key={i} className="space-y-1">
                    <input
                      placeholder={`Job ${i + 1} label (e.g. Google SWE)`}
                      value={job.label}
                      onChange={e => setCompareJobs(prev => prev.map((j, idx) => idx === i ? { ...j, label: e.target.value } : j))}
                      className="w-full rounded-xl px-3 py-2 text-xs focus:outline-none"
                      style={{ background: theme.inputBackground, color: theme.inputText, border: `1px solid ${theme.inputBorder}` }}
                    />
                    <textarea
                      placeholder={`Paste job ${i + 1} description...`}
                      value={job.description}
                      onChange={e => setCompareJobs(prev => prev.map((j, idx) => idx === i ? { ...j, description: e.target.value } : j))}
                      rows={2}
                      className="w-full rounded-xl px-3 py-2 text-xs resize-none focus:outline-none"
                      style={{ background: theme.inputBackground, color: theme.inputText, border: `1px solid ${theme.inputBorder}` }}
                    />
                  </div>
                ))}
                <div className="flex gap-2">
                  <button
                    onClick={() => setCompareJobs(prev => [...prev, { label: "", description: "" }])}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium"
                    style={{ background: theme.panelAlt, color: theme.title, border: `1px solid ${theme.inputBorder}` }}
                  >+ add job</button>
                  <button
                    onClick={handleCompare}
                    disabled={compareLoading}
                    className="flex-1 py-1.5 rounded-xl text-xs font-semibold disabled:opacity-50"
                    style={{ background: theme.accent, color: "#fff" }}
                  >{compareLoading ? "comparing..." : "compare ↔️"}</button>
                </div>
                {compareResults && (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {compareResults.map((r, i) => {
                      const col = getScoreColor(r.match_percentage, theme)
                      return (
                        <div key={i} className="rounded-xl p-2.5 flex items-center gap-3" style={{ background: theme.panel, border: `1px solid ${theme.inputBorder}` }}>
                          <span className="text-xl font-black flex-shrink-0" style={{ color: col }}>{r.match_percentage}%</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate" style={{ color: theme.title }}>{r.label}</p>
                            <p className="text-xs" style={{ color: theme.successText }}>✅ {r.matched_skills.slice(0, 4).join(", ")}{r.matched_skills.length > 4 ? " +more" : ""}</p>
                            {r.missing_skills.length > 0 && <p className="text-xs" style={{ color: theme.errorText }}>❌ {r.missing_skills.slice(0, 3).join(", ")}{r.missing_skills.length > 3 ? " +more" : ""}</p>}
                          </div>
                          <button
                            onClick={() => handleCopy(`${r.label}: ${r.match_percentage}%\n✅ ${r.matched_skills.join(", ")}\n❌ ${r.missing_skills.join(", ")}`)}
                            className="text-xs px-2 py-1 rounded-lg flex-shrink-0"
                            style={{ background: theme.accentSoft, color: theme.title }}
                          >📋</button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ) : renderInput()}
          </div>
        </div>
      </div>
    </div>
  )
}
