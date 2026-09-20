import { useEffect, useRef, useState } from "react"

/** Animate a number from its previous value to `target` (ease-out). */
export function useCountUp(target, duration = 1100) {
  const [value, setValue] = useState(0)
  const from = useRef(0)
  const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  useEffect(() => {
    if (reduce) return
    const start = performance.now()
    const begin = from.current
    let raf
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(begin + (target - begin) * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
      else from.current = target
    }
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); from.current = target }
  }, [target, duration, reduce])
  return reduce ? target : value
}

/** True after first paint, so CSS transitions play from the initial state. */
export function useMounted(delay = 60) {
  const [m, setM] = useState(false)
  useEffect(() => {
    const id = setTimeout(() => setM(true), delay)
    return () => clearTimeout(id)
  }, [delay])
  return m
}

/** Friendly label for a Gemini model id, e.g. "gemini-3.8-flash" → "Gemini 3.8 Flash". */
export function prettyModel(id) {
  if (!id) return ""
  return id.split("-").map((p) => (/^\d/.test(p) ? p : p[0].toUpperCase() + p.slice(1))).join(" ")
}
