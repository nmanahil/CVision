import { useEffect } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useApp } from "@/context/app-context"

export function Toasts() {
  const { toasts } = useApp()
  return createPortal(
    <div className="pointer-events-none fixed bottom-5 left-1/2 z-[100] flex -translate-x-1/2 flex-col items-center gap-2" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "glass animate-pop-in rounded-full border px-4 py-2 text-sm font-medium shadow-card",
            t.kind === "error" ? "border-bad/40 text-bad" : "border-line text-fg",
          )}
        >
          {t.message}
        </div>
      ))}
    </div>,
    document.body,
  )
}

/** Centered modal (default) or right-side drawer. Closes on Escape / backdrop click. */
export function Overlay({ open, onClose, title, side = false, children, width = "max-w-md" }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null
  return createPortal(
    <div className={cn("fixed inset-0 z-50 flex", !side && "items-center justify-center p-4")} role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 animate-pop-in bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          "card relative flex min-h-0 flex-col overflow-hidden",
          side
            ? "animate-slide-left ml-auto h-full w-full max-w-md rounded-none border-y-0 border-r-0"
            : cn("animate-pop-in max-h-full w-full", width),
        )}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-base font-semibold">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted transition hover:bg-surface-2 hover:text-fg" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="thin-scroll min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
