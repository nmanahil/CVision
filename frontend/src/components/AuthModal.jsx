import { useEffect, useState } from "react"
import { Eye, EyeOff, Loader2, Lock, Mail, User, Zap } from "lucide-react"
import { Overlay } from "@/components/ui/kit"
import { api } from "@/lib/api"
import { useApp } from "@/context/app-context"
import { cn } from "@/lib/utils"

export default function AuthModal({ open, onClose, onAuthed }) {
  const { signIn, toast, copy } = useApp()
  const [mode, setMode] = useState("signin")
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [showPw, setShowPw] = useState(false)
  const [busy, setBusy] = useState(null) // "form" | demo key
  const [error, setError] = useState("")
  const [demos, setDemos] = useState([])

  useEffect(() => {
    if (!open) return
    setError("")
    api.demoCandidates().then((d) => setDemos(d.candidates)).catch(() => {})
  }, [open])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function finish(res) {
    signIn(res)
    toast(copy.toast.signedIn(res.user.name.split(" ")[0]))
    onClose()
    onAuthed?.(res.user)
  }

  async function submit(e) {
    e.preventDefault()
    setError("")
    setBusy("form")
    try {
      const res = mode === "signin"
        ? await api.login({ email: form.email, password: form.password })
        : await api.register(form)
      await finish(res)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(null)
    }
  }

  async function demo(key) {
    setError("")
    setBusy(key)
    try { await finish(await api.demoLogin(key)) } catch (err) { setError(err.message) } finally { setBusy(null) }
  }

  return (
    <Overlay open={open} onClose={onClose} title={mode === "signin" ? "Welcome back" : "Create your account"}>
      <div className="p-5">
        <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-surface-2 p-1" role="tablist">
          {[["signin", "Sign in"], ["register", "Register"]].map(([id, label]) => (
            <button key={id} role="tab" aria-selected={mode === id} onClick={() => { setMode(id); setError("") }}
              className={cn("rounded-lg py-2 text-sm font-semibold transition", mode === id ? "bg-surface shadow-sm" : "text-muted hover:text-fg")}>
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "register" && (
            <label className="relative block">
              <span className="sr-only">Full name</span>
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input className="field !pl-10" placeholder="Full name" autoComplete="name" value={form.name} onChange={set("name")} required />
            </label>
          )}
          <label className="relative block">
            <span className="sr-only">Email</span>
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input className="field !pl-10" type="email" placeholder="Email address" autoComplete="email" value={form.email} onChange={set("email")} required />
          </label>
          <label className="relative block">
            <span className="sr-only">Password</span>
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              className="field !px-10" type={showPw ? "text" : "password"} placeholder={mode === "register" ? "Password (8+ characters)" : "Password"}
              autoComplete={mode === "signin" ? "current-password" : "new-password"} value={form.password} onChange={set("password")} required minLength={mode === "register" ? 8 : undefined}
            />
            <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-fg" aria-label={showPw ? "Hide password" : "Show password"}>
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </label>
          {error && <p className="animate-pop-in rounded-lg border border-bad/30 bg-bad/10 px-3 py-2 text-sm text-bad" role="alert">{error}</p>}
          <button type="submit" disabled={busy !== null} className="btn btn-primary w-full">
            {busy === "form" && <Loader2 size={16} className="animate-spin" />}
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        {demos.length > 0 && (
          <div className="mt-6">
            <div className="mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-muted">
              <span className="h-px flex-1 bg-line" /> or try a demo candidate <span className="h-px flex-1 bg-line" />
            </div>
            <div className="grid gap-2">
              {demos.map((d) => (
                <button key={d.key} onClick={() => demo(d.key)} disabled={busy !== null}
                  className="lift flex items-center gap-3 rounded-xl border border-line bg-surface-2/60 p-3 text-left disabled:opacity-60">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-sm font-bold text-white">
                    {busy === d.key ? <Loader2 size={16} className="animate-spin" /> : d.name[0]}
                  </span>
                  <span className="flex-1"><span className="block text-sm font-semibold">{d.name}</span><span className="block text-xs text-muted">{d.role}</span></span>
                  <Zap size={15} className="text-accent" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Overlay>
  )
}
