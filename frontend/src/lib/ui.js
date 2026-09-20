/** Props for a card that glows under the cursor. Spread onto an element with class "spotlight". */
export function spotlight(e) {
  const r = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty("--px", `${e.clientX - r.left}px`)
  e.currentTarget.style.setProperty("--py", `${e.clientY - r.top}px`)
}

export const SEVERITY = {
  critical: "bg-bad/15 text-bad border-bad/30",
  major: "bg-warn/15 text-warn border-warn/30",
  minor: "bg-accent/12 text-accent border-accent/25",
}
export const URGENCY = {
  high: "bg-bad/15 text-bad border-bad/30",
  medium: "bg-warn/15 text-warn border-warn/30",
  low: "bg-good/15 text-good border-good/30",
}

export function scoreTone(score) {
  if (score >= 75) return "good"
  if (score >= 50) return "warn"
  return "bad"
}
export const toneText = { good: "text-good", warn: "text-warn", bad: "text-bad" }
export const toneBg = { good: "bg-good", warn: "bg-warn", bad: "bg-bad" }
