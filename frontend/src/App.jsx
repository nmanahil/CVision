import { useEffect } from "react"
import { AppProvider } from "@/context/AppContext"
import { useApp } from "@/context/app-context"
import Workspace from "@/pages/Workspace"
import { Toasts } from "@/components/ui/kit"

const SPARKLES = [
  { e: "✨", top: "14%", left: "6%", d: "0s" }, { e: "💖", top: "30%", left: "92%", d: "1.2s" },
  { e: "🎀", top: "58%", left: "3%", d: "2.1s" }, { e: "⭐", top: "72%", left: "94%", d: "0.6s" },
  { e: "💅", top: "88%", left: "10%", d: "1.6s" }, { e: "✨", top: "8%", left: "84%", d: "2.6s" },
]

function Atmosphere() {
  const { voice } = useApp()

  // Cursor-following glow in the background
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let raf = 0
    const move = (e) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        document.documentElement.style.setProperty("--mx", `${e.clientX}px`)
        document.documentElement.style.setProperty("--my", `${e.clientY}px`)
      })
    }
    window.addEventListener("pointermove", move, { passive: true })
    return () => { window.removeEventListener("pointermove", move); cancelAnimationFrame(raf) }
  }, [])

  return (
    <>
      <div className="bg-atmosphere" aria-hidden />
      <div className="bg-grid" aria-hidden />
      {voice === "genz" && SPARKLES.map((s, i) => (
        <span key={i} aria-hidden className="pointer-events-none fixed -z-0 animate-float select-none text-2xl opacity-60" style={{ top: s.top, left: s.left, animationDelay: s.d }}>{s.e}</span>
      ))}
    </>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Atmosphere />
      <Workspace />
      <Toasts />
    </AppProvider>
  )
}
