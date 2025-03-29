import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthProvider"
import LoginWithGoogle from "../components/LoginWithGoogle"

const LoginPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showForgotPasswordMsg, setShowForgotPasswordMsg] = useState(false)
  const { user, login, loading, error, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    console.log("user", user)

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
      console.log(from, "from")
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
      case "Admin":
        return "/admin"
      case "Maintenance Staff":
        return "/maintenance"
      default:
        return "/login"
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-100 to-blue-200 p-4">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-[0_10px_40px_rgba(19,96,171,0.15)] w-full max-w-md transition-all duration-300 border border-gray-100">
        <div className="flex flex-col items-center">
          <img src="/IITILogo.png" className="h-20 sm:h-28 mb-4 sm:mb-6 transition-all duration-300" alt="IIT Logo" />
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Hostel Management System</h1>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 animate-fadeIn" role="alert">
            <p className="font-medium">Login Error</p>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input id="email" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-3 rounded-lg bg-blue-50 border border-gray-300 focus:border-[#1360AB] focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 rounded-lg bg-blue-50 border border-gray-300 focus:border-[#1360AB] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>

          <button type="submit" disabled={loading} className={`w-full bg-[#1360AB] text-white py-3 rounded-lg font-medium hover:bg-[#0F4C81] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg ${loading ? "opacity-70 cursor-not-allowed" : ""}`}>
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </span>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <LoginWithGoogle callback={handleGoogleCallback} className="w-full bg-white text-gray-700 border border-gray-300 py-3 rounded-lg font-medium hover:bg-gray-50 hover:shadow-md transition-all flex items-center justify-center" />

        <p className="text-center text-gray-600 mt-6 text-sm cursor-pointer hover:text-[#1360AB]" onClick={handleForgotPassword}>
          Forgot your password?
        </p>

        {showForgotPasswordMsg && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full animate-fadeIn">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg text-gray-800">Forgot Password</h3>
                <button onClick={() => setShowForgotPasswordMsg(false)} className="text-gray-500 hover:text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-700 mb-6">Please contact the administrator to reset your password.</p>
              <div className="flex justify-end">
                <button onClick={() => setShowForgotPasswordMsg(false)} className="bg-[#1360AB] text-white px-4 py-2 rounded-lg hover:bg-[#0F4C81] transition-all">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LoginPage
