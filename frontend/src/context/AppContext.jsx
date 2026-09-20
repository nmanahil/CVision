import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { AppContext } from "./app-context"
import { api, tokenStore } from "@/lib/api"
import { VOICES } from "@/lib/voice"

function read(key, fallback) {
  try { return window.localStorage.getItem(key) || fallback } catch { return fallback }
}
function write(key, value) {
  try { window.localStorage.setItem(key, value) } catch { /* private mode */ }
}

export function AppProvider({ children }) {
  const [voice, setVoiceState] = useState(() => (read("cvision.voice", "pro") in VOICES ? read("cvision.voice", "pro") : "pro"))
  const [mode, setModeState] = useState(() => read("cvision.mode", "system")) // light | dark | system
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(!tokenStore.get())
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

  // Restore session
  useEffect(() => {
    if (!tokenStore.get()) return
    api.me()
      .then((d) => setUser(d.user))
      .catch(() => tokenStore.clear())
      .finally(() => setAuthReady(true))
  }, [])

  const setVoice = useCallback((v) => { setVoiceState(v); write("cvision.voice", v) }, [])
  const setMode = useCallback((m) => { setModeState(m); write("cvision.mode", m) }, [])

  const toast = useCallback((message, kind = "ok") => {
    const id = ++toastId.current
    setToasts((t) => [...t.slice(-2), { id, message, kind }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }, [])

  const signIn = useCallback(({ token, user: u }) => {
    tokenStore.set(token)
    setUser(u)
  }, [])
  const signOut = useCallback(() => {
    tokenStore.clear()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ voice, setVoice, mode, setMode, copy: VOICES[voice], user, authReady, signIn, signOut, toasts, toast }),
    [voice, setVoice, mode, setMode, user, authReady, signIn, signOut, toasts, toast],
  )
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
