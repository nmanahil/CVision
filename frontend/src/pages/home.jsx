import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

function Home() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-slate-900 to-slate-700 text-white text-center px-4">

      <h1 className="text-5xl font-bold mb-4">
        Welcome to CVision 🚀
      </h1>

      <p className="text-lg text-gray-300 mb-8 max-w-xl">
        AI-powered resume analysis to help you match jobs, improve your CV,
        and land your dream role faster.
      </p>

      <Button
        className="text-lg px-6 py-4"
        onClick={() => navigate("/upload")}
      >
        Get Started
      </Button>

    </div>
  )
}

export default Home