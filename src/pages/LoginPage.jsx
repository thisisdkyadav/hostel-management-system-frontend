import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthProvider"
import LoginWithGoogle from "../components/LoginWithGoogle"
import { FaArrowRight } from "react-icons/fa"

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white overflow-hidden flex justify-center items-center">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Top section gradients */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-100/60 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-full h-64 bg-gradient-to-t from-indigo-100/50 to-transparent"></div>

        {/* Large background blobs */}
        <div className="absolute -top-40 left-20 w-[45rem] h-[45rem] bg-gradient-to-tr from-indigo-300/15 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-20 w-[40rem] h-[40rem] bg-gradient-to-br from-blue-200/20 to-transparent rounded-full animate-[pulse_15s_ease-in-out_infinite] blur-2xl"></div>

        {/* Medium floating elements */}
        <div className="absolute top-20 left-1/4 w-56 h-56 bg-blue-400/10 rounded-full animate-[pulse_10s_ease-in-out_infinite] blur-md"></div>
        <div className="absolute bottom-1/5 right-1/5 w-60 h-60 bg-indigo-300/15 rounded-full animate-[pulse_12s_ease-in-out_infinite_0.5s] blur-lg"></div>

        {/* Small dynamic elements */}
        <div className="absolute bottom-40 left-1/4 w-20 h-20 bg-indigo-400/20 rounded-full animate-bounce blur-sm"></div>
        <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-cyan-400/20 rounded-full animate-[ping_5s_ease-in-out_infinite] blur-sm"></div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md md:max-w-lg lg:max-w-xl px-6 py-10 mx-4">
        <div className="backdrop-blur-lg bg-white/90 rounded-3xl shadow-2xl border border-blue-100/80 hover:border-blue-200/90 transition-all duration-500 p-6 md:p-8 lg:p-10 overflow-hidden">
          {/* Decorative elements for card */}
          <div className="absolute -top-6 -left-6 w-32 h-32 bg-blue-200/30 rounded-full z-0 animate-pulse blur-md"></div>
          <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-indigo-200/30 rounded-full z-0 animate-pulse blur-md"></div>

          {/* Logo and Title */}
          <div className="flex flex-col items-center relative z-10 mb-8">
            <img src="/IITILogo.png" className="h-16 mb-6 transition-all duration-500 transform hover:scale-105" alt="IIT Logo" />
            <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-extrabold text-2xl tracking-tight">Hostel Management System</h1>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50/80 backdrop-blur-sm border-l-4 border-red-500 text-red-700 p-4 rounded-xl mb-6 animate-fadeIn shadow-sm" role="alert">
              <p className="font-medium">Login Error</p>
              <p>{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <div className="group">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5 transition-all group-focus-within:text-blue-600">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-300"
                />
                <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 group-focus-within:w-full"></div>
              </div>
            </div>

            <div className="group">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5 transition-all group-focus-within:text-blue-600">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-300"
                />
                <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 group-focus-within:w-full"></div>
              </div>
            </div>

            {/* Login Button with animated gradient */}
            <button
              type="submit"
              disabled={loading}
              className="group w-full relative px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-lg font-medium rounded-xl hover:from-blue-700 hover:to-indigo-600 transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-blue-400/20 mt-6"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
              <span className="flex items-center justify-center relative">
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </>
                ) : (
                  <>
                    Login
                    <FaArrowRight className="ml-3 transform transition-transform duration-300 group-hover:translate-x-1.5" />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white/80 text-gray-500 backdrop-blur-sm">Or continue with</span>
            </div>
          </div>

          {/* Google Login */}
          <div className="space-y-4 relative z-10">
            <LoginWithGoogle callback={handleGoogleCallback} className="group w-full bg-white/90 text-gray-700 border border-gray-200 py-3.5 rounded-xl font-medium hover:bg-gray-50/90 hover:border-gray-300 hover:shadow-lg transition-all flex items-center justify-center relative overflow-hidden" />
          </div>

          {/* Forgot Password */}
          <p className="text-center text-gray-600 mt-8 text-sm cursor-pointer hover:text-blue-600 transition-colors duration-300 relative z-10" onClick={handleForgotPassword}>
            Forgot your password?
          </p>

          {/* Forgot Password Modal */}
          {showForgotPasswordMsg && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
              <div className="bg-white/90 backdrop-blur-md p-7 rounded-2xl shadow-2xl max-w-sm w-full animate-fadeIn border border-blue-100/80">
                <div className="flex justify-between items-start mb-5">
                  <h3 className="font-bold text-lg text-gray-800">Forgot Password</h3>
                  <button onClick={() => setShowForgotPasswordMsg(false)} className="text-gray-500 hover:text-gray-700 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <p className="text-gray-700 mb-6">Please contact the administrator to reset your password.</p>
                <div className="flex justify-end">
                  <button onClick={() => setShowForgotPasswordMsg(false)} className="group px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-600 transition-all duration-300 relative overflow-hidden">
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                    <span className="relative">Close</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LoginPage
