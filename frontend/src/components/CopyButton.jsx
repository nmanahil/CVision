import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { useApp } from "@/context/app-context"
import { cn } from "@/lib/utils"

export default function CopyButton({ text, label = "Copy", className, iconOnly = false }) {
  const { toast, copy } = useApp()
  const [done, setDone] = useState(false)
  async function onClick() {
    try {
      await navigator.clipboard.writeText(text)
      setDone(true)
      toast(copy.toast.copied)
      setTimeout(() => setDone(false), 1600)
    } catch {
      toast("Couldn't access the clipboard", "error")
    }
  }
  return (
    <button onClick={onClick} className={cn("btn btn-ghost !px-2.5 !py-1.5 text-xs", className)} aria-label={label}>
      {done ? <Check size={14} className="text-good" /> : <Copy size={14} />}
      {!iconOnly && (done ? "Copied" : label)}
    </button>
  )
}
