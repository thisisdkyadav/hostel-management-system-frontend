import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthProvider"
import LoginWithGoogle from "../../components/LoginWithGoogle"
import { ArrowRight } from "lucide-react"

const LoginPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showForgotPasswordMsg, setShowForgotPasswordMsg] = useState(false)
  const { user, login, loading, error, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      const from = calculateHomeRoute(user)
      navigate(from, { replace: true })
    }
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const userData = await login({ email, password })
      const from = userData ? calculateHomeRoute(userData) : "/login"
      navigate(from, { replace: true })
    } catch (err) {
      console.error("Login failed:", err)
    }
  }

  const handleGoogleCallback = async (token) => {
    try {
      const userData = await loginWithGoogle(token)
      const from = userData ? calculateHomeRoute(userData) : "/login"
      navigate(from, { replace: true })
    } catch (err) {
      console.error("Google login failed:", err)
    }
  }

  const handleForgotPassword = () => {
    setShowForgotPasswordMsg(true)
  }

  const calculateHomeRoute = (user) => {
    switch (user.role) {
      case "Student":
        return "/student"
      case "Warden":
        return "/warden"
      case "Security":
        return "/guard"
      case "Hostel Gate":
        return "/hostel-gate"
      case "Admin":
        return "/admin"
      case "Super Admin":
        return "/super-admin"
      case "Maintenance Staff":
        return "/maintenance"
      case "Associate Warden":
        return "/associate-warden"
      case "Hostel Supervisor":
        return "/hostel-supervisor"
      default:
        return "/login"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Enhanced background decorative elements - matching homepage */}
      <div className="fixed inset-0 overflow-hidden">
        {/* Top and bottom gradients */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-100/60 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-full h-64 bg-gradient-to-t from-indigo-100/50 to-transparent"></div>

        {/* Large background blobs - matching homepage distribution */}
        <div className="absolute -top-40 left-20 w-[50rem] h-[50rem] bg-gradient-to-tr from-indigo-300/15 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-20 w-[45rem] h-[45rem] bg-gradient-to-br from-blue-200/20 to-transparent rounded-full animate-[pulse_15s_ease-in-out_infinite] blur-2xl"></div>
        <div className="absolute top-1/4 left-0 w-[35rem] h-[35rem] bg-gradient-to-bl from-purple-200/15 to-transparent rounded-full animate-[pulse_18s_ease-in-out_infinite_1s] blur-xl"></div>
        <div className="absolute bottom-1/3 -right-10 w-[38rem] h-[38rem] bg-gradient-to-tl from-cyan-200/15 to-transparent rounded-full animate-[pulse_20s_ease-in-out_infinite_2s] blur-2xl"></div>

        {/* Medium floating elements */}
        <div className="absolute top-20 left-1/4 w-56 h-56 bg-blue-400/10 rounded-full animate-[pulse_10s_ease-in-out_infinite] blur-md"></div>
        <div className="absolute bottom-1/5 right-1/5 w-60 h-60 bg-indigo-300/15 rounded-full animate-[pulse_12s_ease-in-out_infinite_0.5s] blur-lg"></div>
        <div className="absolute top-1/3 left-40 w-48 h-48 bg-blue-300/15 rounded-full animate-[pulse_8s_ease-in-out_infinite_1s] blur-md"></div>
        <div className="absolute bottom-1/4 right-1/3 w-52 h-52 bg-purple-300/10 rounded-full animate-[pulse_11s_ease-in-out_infinite_2s] blur-md"></div>

        {/* Small dynamic elements */}
        <div className="absolute bottom-40 left-1/4 w-20 h-20 bg-indigo-400/20 rounded-full animate-bounce blur-sm"></div>
        <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-cyan-400/20 rounded-full animate-[ping_5s_ease-in-out_infinite] blur-sm"></div>
        <div className="absolute top-1/2 left-80 w-12 h-12 bg-blue-500/15 rounded-full animate-[ping_6s_ease-in-out_infinite_0.5s] blur-sm"></div>
        <div className="absolute bottom-1/5 right-60 w-24 h-24 bg-violet-300/15 rounded-full animate-[bounce_7s_ease-in-out_infinite] blur-sm"></div>

        {/* Floating elements with custom float animation */}
        <div className="absolute top-1/4 right-1/5 w-14 h-14 bg-blue-300/20 rounded-full blur-sm animate-[float_8s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-1/3 left-1/5 w-18 h-18 bg-indigo-300/15 rounded-full blur-sm animate-[float_12s_ease-in-out_infinite_2s]"></div>
      </div>

      {/* Main content container */}
      <div className="relative z-10 min-h-screen flex justify-center items-center py-8 px-3 sm:py-10 sm:px-6">
        <div className="w-full max-w-sm sm:max-w-md">
          <div className="backdrop-blur-lg bg-white/90 rounded-2xl sm:rounded-3xl shadow-2xl border border-blue-100/80 hover:border-blue-200/90 transition-all duration-500 p-8 sm:p-8 md:p-8 relative overflow-hidden">
            {/* Decorative elements for card */}
            <div className="absolute -top-4 -left-4 w-20 h-20 sm:w-32 sm:h-32 bg-blue-200/30 rounded-full z-0 animate-pulse blur-md"></div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 sm:w-40 sm:h-40 bg-indigo-200/30 rounded-full z-0 animate-pulse blur-md"></div>

            {/* Logo and Title */}
            <div className="flex flex-col items-center relative z-10 mb-5 sm:mb-8">
              <img src="/IITILogo.png" className="h-12 sm:h-14 md:h-16 mb-3 sm:mb-6 transition-all duration-500 transform hover:scale-105" alt="IIT Logo" />
              <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-extrabold text-lg sm:text-xl md:text-2xl tracking-tight text-center">Hostel Management System</h1>
            </div>

            {/* Error Message - Fixed sizing and spacing */}
            {error && (
              <div className="bg-red-50/80 backdrop-blur-sm border-l-4 border-red-500 text-red-700 p-3 sm:p-4 rounded-lg sm:rounded-xl mb-4 sm:mb-6 animate-fadeIn shadow-sm" role="alert">
                {/* <p className="font-medium text-sm sm:text-base">Login Error</p> */}
                <p className="text-sm sm:text-base">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-5 relative z-10">
              <div className="group">
                <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5 transition-all group-focus-within:text-blue-600">
                  Email Address
                </label>
                <div className="relative">
                  <input id="email" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full p-2.5 sm:p-3 md:p-3.5 text-sm sm:text-base rounded-lg sm:rounded-xl bg-blue-50/50 border border-blue-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-300"
                  />
                  <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 group-focus-within:w-full"></div>
                </div>
              </div>

              <div className="group">
                <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 transition-all group-focus-within:text-blue-600">
                  Password
                </label>
                <div className="relative">
                  <input id="password" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full p-2.5 sm:p-3 md:p-3.5 text-sm sm:text-base rounded-lg sm:rounded-xl bg-blue-50/50 border border-blue-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-300"
                  />
                  <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 group-focus-within:w-full"></div>
                </div>
              </div>

              {/* Login Button with responsive sizing */}
              <button type="submit" disabled={loading} className="group w-full relative px-5 sm:px-8 py-2.5 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm sm:text-base md:text-lg font-medium rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-indigo-600 transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-blue-400/20 mt-3 sm:mt-6" >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                <span className="flex items-center justify-center relative">
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Logging in...
                    </>
                  ) : (
                    <>
                      Login
                      <ArrowRight className="ml-2 sm:ml-3 transform transition-transform duration-300 group-hover:translate-x-1.5" size={16} />
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* Google Login */}
            <div className="w-full relative z-10 mt-6 sm:mt-8 flex justify-center">
              <LoginWithGoogle callback={handleGoogleCallback} />
            </div>

            {/* Forgot Password */}
            <p className="text-center text-gray-600 mt-4 sm:mt-8 text-xs sm:text-sm cursor-pointer hover:text-blue-600 transition-colors duration-300 relative z-10" onClick={handleForgotPassword}>
              Forgot your password?
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPasswordMsg && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-3 sm:p-4">
          <div className="bg-white/90 backdrop-blur-md p-4 sm:p-7 rounded-xl sm:rounded-2xl shadow-2xl max-w-xs sm:max-w-sm w-full animate-fadeIn border border-blue-100/80">
            <div className="flex justify-between items-start mb-4 sm:mb-5">
              <h3 className="font-bold text-base sm:text-lg text-gray-800">Forgot Password</h3>
              <button onClick={() => setShowForgotPasswordMsg(false)} className="text-gray-500 hover:text-gray-700 transition-colors p-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <p className="text-gray-700 mb-5 sm:mb-6 text-sm sm:text-base">Please contact the administrator to reset your password.</p>
            <div className="flex justify-end">
              <button onClick={() => setShowForgotPasswordMsg(false)}
                className="group px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium text-sm sm:text-base rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-indigo-600 transition-all duration-300 relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                <span className="relative">Close</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LoginPage
