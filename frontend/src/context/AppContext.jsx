import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { AppContext } from "./app-context"
import { VOICES } from "@/lib/voice"

function read(key, fallback) {
  try { return window.localStorage.getItem(key) || fallback } catch { return fallback }
}
function write(key, value) {
  try { window.localStorage.setItem(key, value) } catch { /* private mode */ }
}

export function AppProvider({ children }) {
  const [voice, setVoiceState] = useState(() => (read("cvision.voice", "pro") in VOICES ? read("cvision.voice", "pro") : "pro"))
  const [mode, setModeState] = useState(() => read("cvision.mode", "light")) // light | dark | system
  const [toasts, setToasts] = useState([])
  const toastId = useRef(0)

  // Apply theme to <html>
  useEffect(() => {
    const root = document.documentElement
    root.dataset.voice = voice
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const apply = () => root.classList.toggle("dark", mode === "dark" || (mode === "system" && media.matches))
    apply()
    media.addEventListener("change", apply)
    return () => media.removeEventListener("change", apply)
  }, [voice, mode])

  const setVoice = useCallback((v) => { setVoiceState(v); write("cvision.voice", v) }, [])
  const setMode = useCallback((m) => { setModeState(m); write("cvision.mode", m) }, [])

  const toast = useCallback((message, kind = "ok") => {
    const id = ++toastId.current
    setToasts((t) => [...t.slice(-2), { id, message, kind }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }, [])

  const value = useMemo(
    () => ({ voice, setVoice, mode, setMode, copy: VOICES[voice], toasts, toast }),
    [voice, setVoice, mode, setMode, toasts, toast],
  )
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
