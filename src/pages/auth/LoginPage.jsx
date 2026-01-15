import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthProvider"
import LoginWithGoogle from "../../components/LoginWithGoogle"
import { ArrowRight } from "lucide-react"
import hmsLogo from "../../assets/hms-logo-t-256.svg"
import "../../styles/login.css"

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
    <div className="login-page">
      <div className="login-bg-container">
        {/* Large background blobs */}
        <div className="login-blob-1"></div>
        <div className="login-blob-2"></div>
        <div className="login-blob-3"></div>
        <div className="login-blob-4"></div>

        {/* Medium size floating elements */}
        <div className="login-blob-5"></div>
        <div className="login-blob-6"></div>
        <div className="login-blob-7"></div>
        <div className="login-blob-8"></div>
        <div className="login-blob-9"></div>

        {/* Smaller dynamic elements */}
        <div className="login-blob-10"></div>
        <div className="login-blob-11"></div>
        <div className="login-blob-12"></div>
        <div className="login-blob-13"></div>
        <div className="login-blob-14"></div>

        {/* Fast moving tiny elements */}
        <div className="login-blob-15"></div>
        <div className="login-blob-16"></div>
        <div className="login-blob-17"></div>
        <div className="login-blob-18"></div>
        <div className="login-blob-19"></div>

        {/* Floating elements with float animation */}
        <div className="login-blob-20"></div>
        <div className="login-blob-21"></div>
        <div className="login-blob-22"></div>
        <div className="login-blob-23"></div>
        <div className="login-blob-24"></div>
      </div>

      <div className="login-content-container">
        <div className="login-card-wrapper">
          <div className="login-card">
            <div className="login-logo-section">
              <img src={hmsLogo} className="login-logo" alt="HMS Logo" />
            </div>

            {error && (
              <div className="login-error">
                <p className="login-error-text">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="login-form-group">
                <label htmlFor="email" className="login-form-label">
                  Email Address
                </label>
                <div className="login-input-wrapper">
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="login-input"
                  />
                  <div className="login-input-line"></div>
                </div>
              </div>

              <div className="login-form-group">
                <label htmlFor="password" className="login-form-label">
                  Password
                </label>
                <div className="login-input-wrapper">
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="login-input"
                  />
                  <div className="login-input-line"></div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="login-submit-button"
              >
                <span className="login-button-shimmer"></span>
                <span className="login-button-content">
                  {loading ? (
                    <>
                      <svg className="login-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Logging in...
                    </>
                  ) : (
                    <>
                      Login
                      <ArrowRight className="login-button-icon" size={16} />
                    </>
                  )}
                </span>
              </button>
            </form>

            <div className="login-google-section">
              <LoginWithGoogle callback={handleGoogleCallback} />
            </div>

            <p className="login-forgot-password" onClick={handleForgotPassword}>
              Forgot your password?
            </p>
          </div>
        </div>
      </div>

      {showForgotPasswordMsg && (
        <div className="login-modal-overlay">
          <div className="login-modal">
            <div className="login-modal-header">
              <h3 className="login-modal-title">Forgot Password</h3>
              <button onClick={() => setShowForgotPasswordMsg(false)} className="login-modal-close">
                <svg xmlns="http://www.w3.org/2000/svg" className="login-modal-close-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <p className="login-modal-text">Please contact the administrator to reset your password.</p>
            <div className="login-modal-footer">
              <button
                onClick={() => setShowForgotPasswordMsg(false)}
                className="login-modal-close-button"
              >
                <span className="login-modal-button-shimmer"></span>
                <span className="login-modal-button-text">Close</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LoginPage
