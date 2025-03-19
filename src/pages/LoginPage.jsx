import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import IITI_Logo from "../assets/logos/IITILogo.png"
import { useAuth } from "../contexts/AuthProvider"
import LoginWithGoogle from "../components/LoginWithGoogle"

const LoginPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showForgotPasswordMsg, setShowForgotPasswordMsg] = useState(false)
  const { login, loading, error, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || "/"

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await login({ email, password })
      navigate(from, { replace: true })
    } catch (err) {
      console.error("Login failed:", err)
    }
  }

  const handleGoogleCallback = async (token) => {
    try {
      await loginWithGoogle(token)
      navigate(from, { replace: true })
    } catch (err) {
      console.error("Google login failed:", err)
    }
  }

  const handleForgotPassword = () => {
    setShowForgotPasswordMsg(true)
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-100 to-blue-200">
      <div className="bg-white p-8 rounded-[20px] shadow-[0px_1px_20px_rgba(0,0,0,0.06)] w-96">
        <img src={IITI_Logo} className="h-28 mx-auto mb-6" alt="IIT Logo" />

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full h-10 p-3 mb-4 border border-gray-300 rounded-[12px] bg-blue-50 focus:outline-none focus:ring-1 focus:ring-[#1360AB]" />

          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full h-10 p-3 mb-4 border border-gray-300 rounded-[12px] bg-blue-50 focus:outline-none focus:ring-1 focus:ring-[#1360AB]" />

          <button type="submit" disabled={loading} className={`w-full bg-[#1360AB] h-10 text-white py-2 rounded-[12px] font-medium hover:bg-[#0F4C81] transition ${loading ? "opacity-70 cursor-not-allowed" : ""}`}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <hr className="my-4 border-gray-300" />

        {/* <button onClick={() => handleGoogleLogin()} className="w-full bg-[#1360AB] text-white py-2 h-10 rounded-[12px] font-medium hover:bg-[#0F4C81] transition">
          Sign in with Google
        </button> */}
        <LoginWithGoogle callback={handleGoogleCallback} className="w-full bg-[#1360AB] text-white py-2 h-10 rounded-[12px] font-medium hover:bg-[#0F4C81] transition" />

        <p className="text-center text-gray-500 mt-4 text-sm cursor-pointer hover:underline" onClick={handleForgotPassword}>
          Forgot Password ?
        </p>

        {showForgotPasswordMsg && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm">
              <h3 className="font-bold text-lg mb-2">Forgot Password</h3>
              <p className="text-gray-700 mb-4">Please contact the administrator to reset your password.</p>
              <div className="text-right">
                <button onClick={() => setShowForgotPasswordMsg(false)} className="bg-[#1360AB] text-white px-4 py-2 rounded hover:bg-[#0F4C81]">
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
