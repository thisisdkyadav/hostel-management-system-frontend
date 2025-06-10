import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "../contexts/AuthProvider"
import { FiLogIn, FiArrowRight } from "react-icons/fi"

const SSOLogin = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")
  const navigate = useNavigate()
  const { loginWithSSO, getHomeRoute } = useAuth()
  const [error, setError] = useState(null)
  const [status, setStatus] = useState("Authenticating...")

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError("No token provided")
        return
      }

      try {
        setStatus("Verifying credentials...")
        await new Promise((resolve) => setTimeout(resolve, 500)) // Small delay for visual feedback

        const user = await loginWithSSO(token)

        setStatus("Login successful! Redirecting...")
        await new Promise((resolve) => setTimeout(resolve, 800)) // Small delay for visual feedback

        navigate(getHomeRoute())
      } catch (err) {
        console.error("SSO verification error:", err)
        setError(err.message || "Failed to authenticate with SSO")
      }
    }

    verifyToken()
  }, [token, navigate, loginWithSSO, getHomeRoute])

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white overflow-hidden">
        {/* Header */}
        <header className="w-full py-6 px-6 md:px-8 lg:px-12">
          <div className="max-w-screen-xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-3 group">
              <div className="relative overflow-hidden transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-md">
                <img src="/IITILogo.png" alt="IIT Indore Logo" className="h-6 md:h-8 z-10 relative" />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 opacity-0 group-hover:opacity-50 transition-opacity duration-300 rounded-lg"></div>
              </div>
              <div className="text-gray-800">
                <h1 className="text-sm md:text-base font-bold">IIT INDORE</h1>
                <p className="text-xs md:text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Halls of Residence</p>
              </div>
            </div>
          </div>
        </header>

        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Top section gradients */}
          <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-red-100/60 to-transparent"></div>
          <div className="absolute bottom-0 right-0 w-full h-64 bg-gradient-to-t from-red-100/50 to-transparent"></div>

          {/* Large background blobs */}
          <div className="absolute -top-40 left-20 w-[50rem] h-[50rem] bg-gradient-to-tr from-red-300/15 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -right-20 w-[45rem] h-[45rem] bg-gradient-to-br from-red-200/20 to-transparent rounded-full animate-[pulse_15s_ease-in-out_infinite] blur-2xl"></div>
          <div className="absolute top-1/4 left-0 w-[35rem] h-[35rem] bg-gradient-to-bl from-orange-200/15 to-transparent rounded-full animate-[pulse_18s_ease-in-out_infinite_1s] blur-xl"></div>

          {/* Medium size floating elements */}
          <div className="absolute top-20 left-1/4 w-56 h-56 bg-red-400/10 rounded-full animate-[pulse_10s_ease-in-out_infinite] blur-md"></div>
          <div className="absolute bottom-1/5 right-1/5 w-60 h-60 bg-red-300/15 rounded-full animate-[pulse_12s_ease-in-out_infinite_0.5s] blur-lg"></div>

          {/* Smaller dynamic elements */}
          <div className="absolute bottom-40 left-1/4 w-20 h-20 bg-red-400/20 rounded-full animate-bounce blur-sm"></div>
          <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-orange-400/20 rounded-full animate-[ping_5s_ease-in-out_infinite] blur-sm"></div>
          <div className="absolute top-1/2 left-80 w-12 h-12 bg-red-500/15 rounded-full animate-[ping_6s_ease-in-out_infinite_0.5s] blur-sm"></div>
        </div>

        {/* Error Content */}
        <div className="w-full max-w-screen-xl px-6 md:px-8 lg:px-12 mx-auto flex flex-col lg:flex-row items-center justify-between mt-12 relative z-10">
          <div className="lg:w-1/2 text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-800 mb-6 animate-slideUp tracking-tight">
              Authentication
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500 mt-2">Error</span>
            </h1>

            <p className="text-gray-600 text-lg md:text-xl mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed animate-fadeIn">{error}</p>

            <div className="flex flex-wrap justify-center lg:justify-start gap-4 animate-fadeIn">
              <button
                onClick={() => navigate("/login")}
                className="group px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white text-lg font-medium rounded-xl hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-red-400/20 flex items-center relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                <span className="relative">Return to Login</span>
                <FiArrowRight className="ml-3 transform transition-transform duration-300 group-hover:translate-x-1.5 relative" />
              </button>
            </div>
          </div>

          <div className="lg:w-1/2 mt-16 lg:mt-0 flex justify-center lg:justify-end animate-fadeIn">
            <div className="relative w-full max-w-md">
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-red-200/60 rounded-full z-0 animate-pulse blur-md"></div>
              <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-red-100/60 rounded-full z-0 animate-pulse blur-md"></div>
              <div className="absolute top-1/2 -left-10 w-24 h-24 bg-red-300/40 rounded-full z-0 animate-bounce blur-sm"></div>
              <div className="absolute top-1/4 -right-8 w-20 h-20 bg-orange-300/40 rounded-full z-0 animate-bounce blur-sm"></div>

              <div className="rounded-2xl overflow-hidden shadow-2xl p-8 backdrop-blur-md bg-white/90 relative z-10 border border-red-100/80 hover:border-red-200/90 hover:shadow-2xl hover:bg-white/95 transition-all duration-500">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>

                <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Authentication Failed</h2>
                <p className="text-gray-600 text-center mb-6">Please try again or contact support if the issue persists.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-indigo-50 to-blue-100 overflow-hidden">
      {/* Header */}
      <header className="w-full py-6 px-6 md:px-8 lg:px-12">
        <div className="max-w-screen-xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3 group">
            <div className="relative overflow-hidden transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-md">
              <img src="/IITILogo.png" alt="IIT Indore Logo" className="h-6 md:h-8 z-10 relative" />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 opacity-0 group-hover:opacity-50 transition-opacity duration-300 rounded-lg"></div>
            </div>
            <div className="text-gray-800">
              <h1 className="text-sm md:text-base font-bold">IIT INDORE</h1>
              <p className="text-xs md:text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Halls of Residence</p>
            </div>
          </div>
        </div>
      </header>

      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Top section gradients */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-100/60 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-full h-64 bg-gradient-to-t from-indigo-100/50 to-transparent"></div>

        {/* Large background blobs - spread across the page */}
        <div className="absolute -top-40 left-20 w-[50rem] h-[50rem] bg-gradient-to-tr from-indigo-300/15 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-20 w-[45rem] h-[45rem] bg-gradient-to-br from-blue-200/20 to-transparent rounded-full animate-[pulse_15s_ease-in-out_infinite] blur-2xl"></div>
        <div className="absolute top-1/4 left-0 w-[35rem] h-[35rem] bg-gradient-to-bl from-purple-200/15 to-transparent rounded-full animate-[pulse_18s_ease-in-out_infinite_1s] blur-xl"></div>
        <div className="absolute bottom-1/3 -right-10 w-[38rem] h-[38rem] bg-gradient-to-tl from-cyan-200/15 to-transparent rounded-full animate-[pulse_20s_ease-in-out_infinite_2s] blur-2xl"></div>

        {/* Medium size floating elements - distributed evenly */}
        <div className="absolute top-20 left-1/4 w-56 h-56 bg-blue-400/10 rounded-full animate-[pulse_10s_ease-in-out_infinite] blur-md"></div>
        <div className="absolute bottom-1/5 right-1/5 w-60 h-60 bg-indigo-300/15 rounded-full animate-[pulse_12s_ease-in-out_infinite_0.5s] blur-lg"></div>
        <div className="absolute top-1/3 left-40 w-48 h-48 bg-blue-300/15 rounded-full animate-[pulse_8s_ease-in-out_infinite_1s] blur-md"></div>
        <div className="absolute bottom-1/4 right-1/3 w-52 h-52 bg-purple-300/10 rounded-full animate-[pulse_11s_ease-in-out_infinite_2s] blur-md"></div>
        <div className="absolute top-2/3 right-20 w-44 h-44 bg-indigo-300/12 rounded-full animate-[pulse_9s_ease-in-out_infinite_3s] blur-md"></div>

        {/* Smaller dynamic elements - spread throughout */}
        <div className="absolute bottom-40 left-1/4 w-20 h-20 bg-indigo-400/20 rounded-full animate-bounce blur-sm"></div>
        <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-cyan-400/20 rounded-full animate-[ping_5s_ease-in-out_infinite] blur-sm"></div>
        <div className="absolute top-1/2 left-80 w-12 h-12 bg-blue-500/15 rounded-full animate-[ping_6s_ease-in-out_infinite_0.5s] blur-sm"></div>
        <div className="absolute bottom-1/5 right-60 w-24 h-24 bg-violet-300/15 rounded-full animate-[bounce_7s_ease-in-out_infinite] blur-sm"></div>
        <div className="absolute top-60 left-60 w-18 h-18 bg-blue-300/20 rounded-full animate-[bounce_8s_ease-in-out_infinite_1.5s] blur-sm"></div>

        {/* Fast moving tiny elements */}
        <div className="absolute top-20 right-1/3 w-8 h-8 bg-blue-400/20 rounded-full animate-[ping_4s_ease-in-out_infinite] blur-sm"></div>
        <div className="absolute bottom-1/4 left-1/4 w-10 h-10 bg-indigo-500/15 rounded-full animate-[bounce_5s_ease-in-out_infinite] blur-sm"></div>
      </div>

      {/* Main content */}
      <div className="w-full max-w-screen-xl px-6 md:px-8 lg:px-12 mx-auto flex flex-col lg:flex-row items-center justify-between mt-12 relative z-10">
        <div className="lg:w-1/2 text-center lg:text-left">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-800 mb-6 animate-slideUp tracking-tight">
            Logging you into
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-2 hover:from-indigo-600 hover:to-blue-600 transition-colors duration-500">Hostel Management System</span>
          </h1>

          <p className="text-gray-600 text-lg md:text-xl mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed animate-fadeIn">Please wait while we securely authenticate your credentials and prepare your personalized dashboard.</p>

          <div className="flex flex-wrap justify-center lg:justify-start gap-4 animate-fadeIn">
            <div className="px-8 py-4 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-600 text-lg font-medium rounded-xl shadow-lg flex items-center">
              <div className="w-5 h-5 border-2 border-blue-100 border-t-blue-600 rounded-full animate-spin mr-3"></div>
              <span>{status}</span>
            </div>
          </div>
        </div>

        <div className="lg:w-1/2 mt-16 lg:mt-0 flex justify-center lg:justify-end animate-fadeIn">
          <div className="relative w-full max-w-md">
            {/* Enhanced decorative elements */}
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-blue-200/60 rounded-full z-0 animate-pulse blur-md"></div>
            <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-indigo-200/60 rounded-full z-0 animate-pulse blur-md"></div>
            <div className="absolute top-1/2 -left-10 w-24 h-24 bg-blue-300/40 rounded-full z-0 animate-bounce blur-sm"></div>
            <div className="absolute top-1/4 -right-8 w-20 h-20 bg-indigo-300/40 rounded-full z-0 animate-bounce blur-sm"></div>

            <div className="rounded-2xl overflow-hidden shadow-2xl p-8 backdrop-blur-md bg-white/90 relative z-10 transition-all duration-500 border border-blue-100/80 hover:border-blue-200/90 hover:shadow-2xl hover:bg-white/95">
              <div className="flex flex-col items-center">
                <img src="/IITILogo.png" alt="IIT Indore Logo" className="h-16 mb-6" />

                <div className="relative w-20 h-20 mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-blue-100 opacity-30"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin"></div>
                  <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin" style={{ animationDuration: "1.5s" }}></div>
                  <div className="absolute inset-4 rounded-full border-4 border-transparent border-t-blue-400 animate-spin" style={{ animationDuration: "2s", animationDirection: "reverse" }}></div>
                </div>

                <h2 className="text-xl font-semibold text-gray-800 mb-2">{status}</h2>
                <p className="text-gray-600 text-center">This will only take a moment</p>

                <div className="mt-6 w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 animate-pulse rounded-full" style={{ width: "60%" }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SSOLogin
