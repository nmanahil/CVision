import { useState } from "react"
import Splash from "./pages/Splash"
import Chat from "./pages/Chat"
import "./index.css"

export default function App() {
  const [view, setView]   = useState("splash")
  const [theme, setTheme] = useState(null)

  const handleEnter = (chosen) => {
    setTheme(chosen)
    setView("chat")
  }

  return view === "splash"
    ? <Splash onEnter={handleEnter} />
    : <Chat theme={theme} onChangeTheme={() => setView("splash")} />
}
