import { Fragment } from "react"

// Small, XSS-safe Markdown renderer for Co-Pilot replies: builds React elements only.
const INLINE = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*\s][^*]*\*|_[^_\s][^_]*_|\[[^\]]+\]\(https?:\/\/[^)\s]+\))/g

function inline(text, keyBase) {
  return text.split(INLINE).map((part, i) => {
    const key = `${keyBase}-${i}`
    if (!part) return null
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={key} className="font-semibold">{part.slice(2, -2)}</strong>
    if (part.startsWith("`") && part.endsWith("`")) return <code key={key} className="rounded bg-fg/10 px-1.5 py-0.5 font-mono text-[0.85em]">{part.slice(1, -1)}</code>
    if ((part.startsWith("*") && part.endsWith("*")) || (part.startsWith("_") && part.endsWith("_"))) return <em key={key}>{part.slice(1, -1)}</em>
    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/)
    if (link) return <a key={key} href={link[2]} target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-2">{link[1]}</a>
    return <Fragment key={key}>{part}</Fragment>
  })
}

function parseBlocks(src) {
  const lines = src.replace(/\r/g, "").split("\n")
  const blocks = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (/^```/.test(line)) {
      const code = []
      i++
      while (i < lines.length && !/^```/.test(lines[i])) code.push(lines[i++])
      i++
      blocks.push({ type: "code", text: code.join("\n") })
    } else if (/^#{1,4}\s/.test(line)) {
      blocks.push({ type: "h", level: line.match(/^#+/)[0].length, text: line.replace(/^#+\s/, "") })
      i++
    } else if (/^\s*[-*•]\s+/.test(line)) {
      const items = []
      while (i < lines.length && /^\s*[-*•]\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*[-*•]\s+/, ""))
      blocks.push({ type: "ul", items })
    } else if (/^\s*\d+[.)]\s+/.test(line)) {
      const items = []
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*\d+[.)]\s+/, ""))
      blocks.push({ type: "ol", items })
    } else if (/^>\s?/.test(line)) {
      const quote = []
      while (i < lines.length && /^>\s?/.test(lines[i])) quote.push(lines[i++].replace(/^>\s?/, ""))
      blocks.push({ type: "quote", text: quote.join(" ") })
    } else if (/^\s*---+\s*$/.test(line)) {
      blocks.push({ type: "hr" })
      i++
    } else if (!line.trim()) {
      i++
    } else {
      const para = []
      while (i < lines.length && lines[i].trim() && !/^(```|#{1,4}\s|\s*[-*•]\s+|\s*\d+[.)]\s+|>\s?|\s*---+\s*$)/.test(lines[i])) para.push(lines[i++])
      blocks.push({ type: "p", text: para.join("\n") })
    }
  }
  return blocks
}

export default function Markdown({ text }) {
  const blocks = parseBlocks(text || "")
  return (
    <div className="space-y-2.5 text-[0.9rem] leading-relaxed">
      {blocks.map((b, i) => {
        const k = `b${i}`
        switch (b.type) {
          case "h":
            return <p key={k} className={b.level <= 2 ? "text-base font-semibold" : "font-semibold"}>{inline(b.text, k)}</p>
          case "ul":
            return <ul key={k} className="ml-5 list-disc space-y-1 marker:text-accent">{b.items.map((it, j) => <li key={j}>{inline(it, `${k}-${j}`)}</li>)}</ul>
          case "ol":
            return <ol key={k} className="ml-5 list-decimal space-y-1 marker:font-semibold marker:text-accent">{b.items.map((it, j) => <li key={j}>{inline(it, `${k}-${j}`)}</li>)}</ol>
          case "quote":
            return <blockquote key={k} className="border-l-2 border-accent/60 pl-3 text-muted">{inline(b.text, k)}</blockquote>
          case "code":
            return <pre key={k} className="thin-scroll overflow-x-auto rounded-xl bg-fg/[0.07] p-3 font-mono text-xs">{b.text}</pre>
          case "hr":
            return <hr key={k} className="border-line" />
          default:
            return <p key={k} className="whitespace-pre-line">{inline(b.text, k)}</p>
        }
      })}
    </div>
  )
}
