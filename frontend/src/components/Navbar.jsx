import { useEffect, useRef, useState } from "react"
import { Check, Clock, LogIn, LogOut, Monitor, Moon, Palette, ScanSearch, Sun, Users, Sparkles, Bot } from "lucide-react"
import { useApp } from "@/context/app-context"
import { VOICES } from "@/lib/voice"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"

function useClickOutside(ref, onOutside, active) {
  useEffect(() => {
    if (!active) return
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onOutside() }
    const key = (e) => { if (e.key === "Escape") onOutside() }
    document.addEventListener("mousedown", handler)
    document.addEventListener("keydown", key)
    return () => { document.removeEventListener("mousedown", handler); document.removeEventListener("keydown", key) }
  }, [ref, onOutside, active])
}

function Popover({ trigger, children, align = "right", label }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useClickOutside(ref, () => setOpen(false), open)
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 items-center gap-2 rounded-xl border border-line bg-surface-2/70 px-3 text-sm font-medium transition hover:border-accent/50 hover:bg-accent/10"
        aria-haspopup="menu" aria-expanded={open} aria-label={label}
      >
        {trigger}
      </button>
      {open && (
        <div className={cn("card animate-pop-in absolute top-12 z-40 w-72 p-2", align === "right" ? "right-0" : "left-0")}>
          {typeof children === "function" ? children(() => setOpen(false)) : children}
        </div>
      )}
    </div>
  )
}

function SettingsMenu() {
  const { voice, setVoice, mode, setMode } = useApp()
  const modes = [
    { id: "light", label: "Light", icon: Sun },
    { id: "dark", label: "Dark", icon: Moon },
    { id: "system", label: "Auto", icon: Monitor },
  ]
  return (
    <Popover label="Theme settings" trigger={<><Palette size={17} /><span className="hidden lg:inline">Theme</span></>}>
      <div className="p-2">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">Voice</p>
        <div className="space-y-1.5">
          {Object.entries(VOICES).map(([id, v]) => (
            <button
              key={id}
              onClick={() => setVoice(id)}
              className={cn(
                "flex w-full items-start gap-3 rounded-xl border p-3 text-left transition",
                voice === id ? "border-accent bg-accent/10" : "border-line hover:border-accent/40 hover:bg-surface-2",
              )}
            >
              <span className={cn("mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border", voice === id ? "border-accent bg-accent text-white" : "border-line")}>
                {voice === id && <Check size={12} strokeWidth={3} />}
              </span>
              <span>
                <span className="block text-sm font-semibold">{v.label}</span>
                <span className="block text-xs text-muted">{v.blurb}</span>
              </span>
            </button>
          ))}
        </div>
        <p className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-wider text-muted">Appearance</p>
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-surface-2 p-1">
          {modes.map((m) => {
            const ModeIcon = m.icon
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={cn("flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition", mode === m.id ? "bg-surface text-fg shadow-sm" : "text-muted hover:text-fg")}
              >
                <ModeIcon size={13} />{m.label}
              </button>
            )
          })}
        </div>
      </div>
    </Popover>
  )
}

function UserMenu({ onSignIn, onDemoSwitch }) {
  const { user, signOut, toast, copy } = useApp()
  const [demos, setDemos] = useState([])
  useEffect(() => {
    if (user?.is_demo) api.demoCandidates().then((d) => setDemos(d.candidates)).catch(() => {})
  }, [user])

  if (!user) {
    return (
      <button onClick={onSignIn} className="btn btn-primary h-10 !px-4">
        <LogIn size={16} /> Sign in
      </button>
    )
  }
  const initials = user.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
  return (
    <Popover label="Account" trigger={
      <>
        <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-[11px] font-bold text-white">{initials}</span>
        <span className="hidden max-w-[110px] truncate md:inline">{user.name.split(" ")[0]}</span>
      </>
    }>
      {(close) => (
        <div className="p-2">
          <div className="px-2 pb-3 pt-1">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-muted">{user.is_demo ? "Demo candidate" : user.email}</p>
          </div>
          {user.is_demo && demos.length > 0 && (
            <>
              <p className="mb-1 flex items-center gap-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted"><Users size={12} /> Switch candidate</p>
              <div className="mb-2 space-y-0.5">
                {demos.map((d) => (
                  <button
                    key={d.key}
                    onClick={() => { close(); onDemoSwitch(d.key) }}
                    className={cn("flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm transition hover:bg-surface-2", d.name === user.name && "bg-accent/10")}
                  >
                    <span><span className="block font-medium">{d.name}</span><span className="block text-xs text-muted">{d.role}</span></span>
                    {d.name === user.name && <Check size={14} className="text-accent" />}
                  </button>
                ))}
              </div>
            </>
          )}
          <button
            onClick={() => { close(); signOut(); toast(copy.toast.signedOut) }}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-muted transition hover:bg-surface-2 hover:text-fg"
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      )}
    </Popover>
  )
}

const STEPS = ["Upload", "Target", "Insights"]

export default function Navbar({ stage, hasCv, copilotOpen, onToggleCopilot, onOpenHistory, onSignIn, onDemoSwitch, onHome }) {
  const active = stage === "results" ? 2 : stage === "analyzing" ? 1 : hasCv ? 1 : 0
  return (
    <header className="glass sticky top-0 z-30 border-b border-line">
      <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between gap-3 px-4 sm:px-6">
        <button onClick={onHome} className="group flex items-center gap-2.5" aria-label="CVision home">
          <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-accent to-accent-2 text-white shadow-glow transition group-hover:rotate-6 group-hover:scale-105">
            <ScanSearch size={19} />
          </span>
          <span className="text-lg font-bold tracking-tight">CV<span className="text-gradient">ision</span></span>
        </button>

        <ol className="hidden items-center gap-2 md:flex" aria-label="Progress">
          {STEPS.map((s, i) => (
            <li key={s} className="flex items-center gap-2">
              <span className={cn("flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold transition", i <= active ? "bg-accent/15 text-accent" : "text-muted")}>
                <span className={cn("grid h-4 w-4 place-items-center rounded-full text-[10px]", i < active ? "bg-accent text-white" : i === active ? "border border-accent" : "border border-line")}>
                  {i < active ? <Check size={10} strokeWidth={3.5} /> : i + 1}
                </span>
                {s}
              </span>
              {i < STEPS.length - 1 && <span className={cn("h-px w-6 transition-colors", i < active ? "bg-accent" : "bg-line")} />}
            </li>
          ))}
        </ol>

        <div className="flex items-center gap-2">
          {hasCv && (
            <button
              onClick={onToggleCopilot}
              className={cn("flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-medium transition", copilotOpen ? "border-accent bg-accent/15 text-accent" : "border-line bg-surface-2/70 hover:border-accent/50")}
              aria-pressed={copilotOpen}
            >
              <Bot size={17} /><span className="hidden lg:inline">Co-Pilot</span>
            </button>
          )}
          <button onClick={onOpenHistory} className="flex h-10 items-center gap-2 rounded-xl border border-line bg-surface-2/70 px-3 text-sm font-medium transition hover:border-accent/50 hover:bg-accent/10" aria-label="Scan history">
            <Clock size={17} /><span className="hidden lg:inline">History</span>
          </button>
          <SettingsMenu />
          <UserMenu onSignIn={onSignIn} onDemoSwitch={onDemoSwitch} />
        </div>
      </div>
    </header>
  )
}
