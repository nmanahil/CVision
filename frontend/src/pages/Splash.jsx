import { useState } from "react"

export default function Splash({ onEnter }) {
  const [screen, setScreen] = useState("landing") // "landing" | "theme"
  const [leaving, setLeaving] = useState(null)

  const handleLandingClick = () => {
    if (screen !== "landing") return
    setScreen("theme")
  }

  const pick = (theme) => {
    if (leaving) return
    setLeaving(theme)
    setTimeout(() => onEnter(theme), 650)
  }

  if (screen === "landing") {
    return (
      <div
        onClick={handleLandingClick}
        className="relative flex flex-col items-center justify-center h-screen w-screen overflow-hidden select-none cursor-pointer"
        style={{ background: "linear-gradient(160deg, #0f0c29 0%, #302b63 50%, #24243e 100%)" }}
      >
        {/* bg blobs */}
        <div className="absolute w-96 h-96 rounded-full opacity-20 animate-pulse-slow"
          style={{ background: "radial-gradient(circle,#f48fb1,transparent)", top: "-5%", left: "-5%" }} />
        <div className="absolute w-80 h-80 rounded-full opacity-20 animate-pulse-slow"
          style={{ background: "radial-gradient(circle,#ce93d8,transparent)", bottom: "-5%", right: "-5%" }} />

        <div className="flex flex-col items-center text-center px-6 z-10 animate-fade-in-up">
          <div className="text-7xl mb-6">🚀</div>
          <h1 className="text-6xl md:text-7xl font-black mb-4 tracking-tight" style={{ color: "#fff" }}>
            CV<span style={{ background: "linear-gradient(135deg,#f48fb1,#ce93d8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>ision</span>
          </h1>
          <p className="text-lg md:text-xl font-medium mb-2" style={{ color: "#ffffffcc" }}>
            your AI-powered career bestie
          </p>
          <p className="text-sm mb-12" style={{ color: "#ffffff66" }}>
            match jobs · analyse your CV · get hired
          </p>
          <div className="flex flex-col items-center gap-2 animate-bounce">
            <p className="text-sm tracking-widest uppercase" style={{ color: "#ffffff55" }}>click anywhere to start</p>
            <span className="text-2xl">↓</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="relative flex flex-col items-center justify-center h-screen w-screen overflow-hidden select-none"
      style={{ background: "linear-gradient(160deg, #fce4ec 0%, #f8bbd0 40%, #e1bee7 100%)" }}
    >
      <div className="absolute w-80 h-80 rounded-full animate-pulse-slow"
        style={{ background: "radial-gradient(circle,#f48fb180,transparent)", top: "5%", left: "5%" }} />
      <div className="absolute w-64 h-64 rounded-full animate-pulse-slow"
        style={{ background: "radial-gradient(circle,#b39ddb60,transparent)", bottom: "10%", right: "8%" }} />

      <div className={`flex flex-col items-center text-center px-6 z-10 w-full max-w-lg ${leaving ? "animate-float-up" : "animate-fade-in-up"}`}>
        <div className="text-6xl mb-3">✨</div>
        <h1 className="text-4xl font-black mb-2 tracking-tight" style={{ color: "#880e4f" }}>pick your vibe</h1>
        <p className="text-sm mb-8 font-medium" style={{ color: "#880e4f99" }}>choose how CVision talks to you 👇</p>

        <div className="flex gap-4 w-full">
          <button
            onClick={() => pick("pookie")}
            className="flex-1 rounded-3xl p-6 flex flex-col items-center gap-2 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
            style={{ background: "linear-gradient(145deg,#fce4ec,#f8bbd0)", border: "2px solid #f48fb1" }}
          >
            <span className="text-5xl">🎀</span>
            <span className="text-xl font-black" style={{ color: "#880e4f" }}>Pookie Mode</span>
            <span className="text-xs font-medium" style={{ color: "#ad1457" }}>girl's girl energy, soft pink vibes ✨</span>
          </button>

          <button
            onClick={() => pick("bro")}
            className="flex-1 rounded-3xl p-6 flex flex-col items-center gap-2 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
            style={{ background: "linear-gradient(145deg,#eceff1,#cfd8dc)", border: "2px solid #90a4ae" }}
          >
            <span className="text-5xl">🗿</span>
            <span className="text-xl font-black" style={{ color: "#263238" }}>Bro Mode</span>
            <span className="text-xs font-medium" style={{ color: "#455a64" }}>no cap, straight facts, locked in 💪</span>
          </button>
        </div>

        <p className="text-xs mt-6" style={{ color: "#ad145780" }}>tap a card to enter</p>
      </div>
    </div>
  )
}
