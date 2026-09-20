const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000"

const SID_KEY = "cvision.sid"
const TOKEN_KEY = "cvision.token"

function safeStorage() {
  try { return window.localStorage } catch { return null }
}

export function getSessionId() {
  const store = safeStorage()
  let sid = store?.getItem(SID_KEY)
  if (!sid) {
    sid = crypto.randomUUID()
    store?.setItem(SID_KEY, sid)
  }
  return sid
}

export const tokenStore = {
  get: () => safeStorage()?.getItem(TOKEN_KEY) || null,
  set: (t) => safeStorage()?.setItem(TOKEN_KEY, t),
  clear: () => safeStorage()?.removeItem(TOKEN_KEY),
}

function headers(extra = {}) {
  const h = { "X-Session-Id": getSessionId(), ...extra }
  const token = tokenStore.get()
  if (token) h.Authorization = `Bearer ${token}`
  return h
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

async function request(path, options = {}) {
  let res
  try {
    res = await fetch(`${API}${path}`, { ...options, headers: headers(options.headers) })
  } catch {
    throw new ApiError("Can't reach the CVision backend. Make sure it's running.", 0)
  }
  let data = null
  try { data = await res.json() } catch { /* non-JSON body */ }
  if (!res.ok) throw new ApiError(data?.error || `Request failed (${res.status})`, res.status)
  return data
}

const json = (body) => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
})

export const api = {
  aiStatus: () => request("/api/ai/status"),

  uploadCv(file) {
    const fd = new FormData()
    fd.append("cv", file)
    return request("/upload_cv", { method: "POST", body: fd })
  },
  analyzeJob(jobDescription) {
    const fd = new FormData()
    fd.append("job_description", jobDescription)
    return request("/analyze_job", { method: "POST", body: fd })
  },
  recommendJobs: () => request("/recommend_jobs"),
  compareJobs: (jobs) => request("/compare_jobs", json({ jobs })),

  register: (body) => request("/api/auth/register", json(body)),
  login: (body) => request("/api/auth/login", json(body)),
  demoLogin: (candidate) => request("/api/auth/demo", json({ candidate })),
  demoCandidates: () => request("/api/auth/demo_candidates"),
  me: () => request("/api/auth/me"),

  history: () => request("/api/history"),
  historyItem: (id) => request(`/api/history/${id}`),
  deleteHistoryItem: (id) => request(`/api/history/${id}`, { method: "DELETE" }),
}

/**
 * Stream a Co-Pilot reply. Calls onDelta(text) per chunk and resolves with the model name.
 * Abort with the AbortSignal to stop generation.
 */
export async function streamChat({ message, history, tone, signal, onDelta, onStatus }) {
  let res
  try {
    res = await fetch(`${API}/chat`, {
      ...json({ message, history, tone }),
      headers: headers({ "Content-Type": "application/json" }),
      signal,
    })
  } catch (err) {
    if (err.name === "AbortError") throw err
    throw new ApiError("Can't reach the CVision backend. Make sure it's running.", 0)
  }
  if (!res.ok) {
    let msg = `Request failed (${res.status})`
    try { msg = (await res.json()).error || msg } catch { /* ignore */ }
    throw new ApiError(msg, res.status)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""
  let model = null
  for (;;) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const events = buffer.split("\n\n")
    buffer = events.pop()
    for (const evt of events) {
      const line = evt.trim()
      if (!line.startsWith("data:")) continue
      const payload = JSON.parse(line.slice(5))
      if (payload.error) throw new ApiError(payload.error, 502)
      if (payload.status) onStatus?.(payload.status)
      if (payload.model) { model = payload.model; onStatus?.(null) }
      if (payload.delta) onDelta(payload.delta)
    }
  }
  return model
}
