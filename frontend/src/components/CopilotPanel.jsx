import { useCallback, useEffect, useRef, useState } from "react"
import { ArrowUp, Bot, Cpu, Mail, Mic, RotateCcw, Square, Target, Trash2, Wand2, X } from "lucide-react"
import Markdown from "@/components/Markdown"
import CopyButton from "@/components/CopyButton"
import { streamChat } from "@/lib/api"
import { prettyModel } from "@/lib/hooks"
import { useApp } from "@/context/app-context"
import { cn } from "@/lib/utils"

const CHIP_ICONS = { wand: Wand2, mic: Mic, mail: Mail, target: Target }

export default function CopilotPanel({ open, onClose, hasCv, hasJob, messages, setMessages }) {
  const { copy, voice, user } = useApp()
  const [input, setInput] = useState("")
  const [busy, setBusy] = useState(false)
  const [model, setModel] = useState(null)
  const abortRef = useRef(null)
  const scrollRef = useRef(null)
  const stickRef = useRef(true)
  const inputRef = useRef(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el && stickRef.current) el.scrollTop = el.scrollHeight
  }, [messages, open])

  useEffect(() => { if (open) inputRef.current?.focus() }, [open])
  useEffect(() => () => abortRef.current?.abort(), [])

  const onScroll = () => {
    const el = scrollRef.current
    stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80
  }

  const send = useCallback(async (text, baseMessages = messages) => {
    const message = text.trim()
    if (!message || busy) return
    stickRef.current = true
    const history = baseMessages.filter((m) => !m.error).map((m) => ({ role: m.role, content: m.content }))
    setMessages([...baseMessages, { role: "user", content: message }, { role: "assistant", content: "", streaming: true }])
    setInput("")
    setBusy(true)
    const ctrl = new AbortController()
    abortRef.current = ctrl

    const patchLast = (fn) => setMessages((ms) => ms.map((m, i) => (i === ms.length - 1 ? fn(m) : m)))
    try {
      const used = await streamChat({
        message, history, tone: voice, signal: ctrl.signal,
        onDelta: (d) => patchLast((m) => ({ ...m, content: m.content + d })),
        onStatus: (status) => patchLast((m) => ({ ...m, status })),
      })
      if (used) setModel(used)
      patchLast((m) => ({ ...m, streaming: false }))
    } catch (err) {
      if (err.name === "AbortError") patchLast((m) => ({ ...m, streaming: false, content: m.content || "_Stopped._" }))
      else patchLast((m) => ({ ...m, streaming: false, error: true, content: err.message }))
    } finally {
      setBusy(false)
      abortRef.current = null
    }
  }, [busy, messages, setMessages, voice])

  const regenerate = () => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user")
    if (!lastUser) return
    const idx = messages.lastIndexOf(lastUser)
    send(lastUser.content, messages.slice(0, idx))
  }

  const ready = hasCv
  const name = user?.name?.split(" ")[0]

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden" onClick={onClose} />}
      <aside
        className={cn(
          "card flex-col overflow-hidden",
          open ? "flex" : "hidden",
          "fixed inset-x-3 bottom-3 top-20 z-40 animate-slide-up",
          "lg:sticky lg:inset-auto lg:top-[84px] lg:z-10 lg:h-[calc(100vh-100px)] lg:animate-fade-up",
        )}
        aria-label="Career Co-Pilot"
      >
        <header className="flex items-center gap-3 border-b border-line p-4">
          <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-accent to-accent-2 text-white shadow-glow">
            <Bot size={20} />
            <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-surface bg-good" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">{copy.copilot.title}</p>
            <p className="flex items-center gap-1 truncate text-xs text-muted">
              <Cpu size={11} /> {model ? prettyModel(model) : "Gemini"} · {hasJob ? "CV + job in context" : "CV in context"}
            </p>
          </div>
          {messages.length > 0 && (
            <button onClick={() => { abortRef.current?.abort(); setMessages([]) }} className="rounded-lg p-2 text-muted transition hover:bg-surface-2 hover:text-fg" aria-label="Clear conversation" title="Clear conversation"><Trash2 size={16} /></button>
          )}
          <button onClick={onClose} className="rounded-lg p-2 text-muted transition hover:bg-surface-2 hover:text-fg" aria-label="Close Co-Pilot"><X size={17} /></button>
        </header>

        <div ref={scrollRef} onScroll={onScroll} className="thin-scroll flex-1 space-y-4 overflow-y-auto p-4" aria-live="polite">
          <div className="flex gap-2.5">
            <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-accent/15 text-accent"><Bot size={15} /></span>
            <div className="rounded-2xl rounded-tl-md bg-surface-2 px-3.5 py-2.5 text-sm leading-relaxed">{ready ? copy.copilot.greeting(name) : copy.copilot.greetingNoCv}</div>
          </div>

          {messages.map((m, i) => (
            <div key={i} className={cn("group flex gap-2.5 animate-fade-up", m.role === "user" && "flex-row-reverse")}>
              {m.role === "assistant" && <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-accent/15 text-accent"><Bot size={15} /></span>}
              <div className={cn("max-w-[88%] min-w-0", m.role === "user" && "text-right")}>
                <div className={cn(
                  "inline-block rounded-2xl px-3.5 py-2.5 text-left",
                  m.role === "user" ? "rounded-tr-md bg-gradient-to-br from-accent to-accent-2 text-sm text-white" : m.error ? "rounded-tl-md border border-bad/30 bg-bad/10 text-sm text-bad" : "rounded-tl-md bg-surface-2",
                )}>
                  {m.role === "user" ? <span className="whitespace-pre-wrap">{m.content}</span>
                    : m.streaming && !m.content ? (
                      <span className="flex items-center gap-2 py-1.5">
                        <span className="flex gap-1">{[0, 1, 2].map((d) => <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted" style={{ animationDelay: `${d * 140}ms` }} />)}</span>
                        {m.status && <span className="animate-fade-up text-xs text-muted">{m.status}</span>}
                      </span>
                    )
                    : <div className={cn(m.streaming && "caret")}><Markdown text={m.content} /></div>}
                </div>
                {m.role === "assistant" && !m.streaming && !m.error && (
                  <div className="mt-1 flex gap-1 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
                    <CopyButton text={m.content} iconOnly className="!bg-transparent !border-transparent" />
                    {i === messages.length - 1 && <button onClick={regenerate} className="btn btn-ghost !border-transparent !bg-transparent !px-2.5 !py-1.5 text-xs" aria-label="Regenerate response"><RotateCcw size={14} /></button>}
                  </div>
                )}
                {m.error && i === messages.length - 1 && <button onClick={regenerate} className="mt-1 text-xs font-semibold text-accent hover:underline">Try again</button>}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-line p-3">
          {messages.length === 0 && ready && (
            <div className="mb-3 grid grid-cols-2 gap-2">
              {copy.copilot.chips.map((c, i) => {
                const Icon = CHIP_ICONS[c.icon]
                return (
                  <button key={c.label} onClick={() => send(c.prompt)} disabled={busy}
                    className="lift animate-fade-up flex items-center gap-2 rounded-xl border border-line bg-surface-2/60 px-3 py-2.5 text-left text-xs font-semibold" style={{ animationDelay: `${i * 60}ms` }}>
                    <Icon size={15} className="shrink-0 text-accent" /> {c.label}
                  </button>
                )
              })}
            </div>
          )}
          <form onSubmit={(e) => { e.preventDefault(); send(input) }} className="flex items-end gap-2">
            <textarea
              ref={inputRef} rows={1} value={input} disabled={!ready}
              onChange={(e) => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px` }}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input) } }}
              placeholder={ready ? copy.copilot.placeholder : "Upload your CV to start"}
              className="field thin-scroll max-h-[140px] flex-1 resize-none !py-2.5"
              aria-label="Message the Co-Pilot"
            />
            {busy ? (
              <button type="button" onClick={() => abortRef.current?.abort()} className="btn btn-ghost !h-11 !w-11 !p-0" aria-label="Stop generating"><Square size={15} fill="currentColor" /></button>
            ) : (
              <button type="submit" disabled={!ready || !input.trim()} className="btn btn-primary !h-11 !w-11 !p-0" aria-label="Send message"><ArrowUp size={18} /></button>
            )}
          </form>
        </div>
      </aside>
    </>
  )
}
