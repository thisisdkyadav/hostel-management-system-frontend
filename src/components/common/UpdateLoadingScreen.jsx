import { useEffect, useState } from "react"

const UpdateLoadingScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState("Updating application...")

  useEffect(() => {
    // Simulate update progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 10
        if (newProgress >= 100) {
          clearInterval(interval)
          setMessage("Update complete!")

          // Allow the 100% state to display briefly before completion
          setTimeout(() => {
            if (onComplete) onComplete()
          }, 500)

          return 100
        }
        return newProgress
      })
    }, 300)

    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <div className="fixed inset-0 bg-white bg-opacity-95 z-50 flex flex-col items-center justify-center">
      <div className="w-64 text-center">
        <div className="mb-4">
          <img src="/IITILogo.png" alt="Logo" className="w-16 h-16 mx-auto animate-pulse" />
        </div>
        <div className="mb-2 text-lg font-medium text-gray-800">{message}</div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="mt-2 text-sm text-gray-500">Please don't close this window</div>
      </div>
    </div>
  )
}

export default UpdateLoadingScreen
