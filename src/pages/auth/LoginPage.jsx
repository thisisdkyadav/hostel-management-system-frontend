import { useState, useEffect } from "react"
import { useNavigate, Link, useSearchParams } from "react-router-dom"
import { useAuth } from "../../contexts/AuthProvider"
import LoginWithGoogle from "../../components/LoginWithGoogle"
import { ArrowRight } from "lucide-react"
import { getDefaultHomeRoute, getPostLoginRedirect } from "../../utils/authRedirect"
import AuthLayout, { AuthSpinner } from "../../components/auth/AuthLayout"

const LoginPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { user, login, loading, error, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const getRedirectDestination = (currentUser) => {
    return getPostLoginRedirect(searchParams, getDefaultHomeRoute(currentUser))
  }

  useEffect(() => {
    if (user) {
      navigate(getRedirectDestination(user), { replace: true })
    }
  }, [user, navigate, searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const userData = await login({ email, password })
      const from = userData ? getRedirectDestination(userData) : "/login"
      navigate(from, { replace: true })
    } catch (err) {
      console.error("Login failed:", err)
    }
  }

  const handleGoogleCallback = async (token) => {
    try {
      const userData = await loginWithGoogle(token)
      const from = userData ? getRedirectDestination(userData) : "/login"
      navigate(from, { replace: true })
    } catch (err) {
      console.error("Google login failed:", err)
    }
  }

  return (
    <AuthLayout>
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
                    autoComplete="email"
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
                    autoComplete="current-password"
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
                      <AuthSpinner />
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

            <Link to="/forgot-password" className="login-forgot-password">
              Forgot your password?
            </Link>
    </AuthLayout>
  )
}

export default LoginPage
