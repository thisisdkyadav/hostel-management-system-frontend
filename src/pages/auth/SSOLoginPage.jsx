import { useEffect, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { useAuth } from "../../contexts/AuthProvider"
import { getDefaultHomeRoute, getPostLoginRedirect } from "../../utils/authRedirect"
import AuthLayout, { AuthSpinner } from "../../components/auth/AuthLayout"

/**
 * Where an SSO redirect lands. Shows for about a second while the token is
 * exchanged, then forwards to wherever the user was headed.
 *
 * Both states share one shell now. They used to be two near-identical 100-line
 * copies of the whole page — the same layout, the same forty hand-written
 * background blobs, differing only in whether the palette said blue or red.
 */

const SSOLoginPage = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")
  const navigate = useNavigate()
  const { loginWithSSO } = useAuth()
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

        navigate(getPostLoginRedirect(searchParams, getDefaultHomeRoute(user)), { replace: true })
      } catch (err) {
        console.error("SSO verification error:", err)
        setError(err.message || "Failed to authenticate with SSO")
      }
    }

    verifyToken()
  }, [token, navigate, loginWithSSO, searchParams])

  if (error) {
    return (
      <AuthLayout>
        <div className="login-error-state">
          <AlertCircle className="login-error-icon" size={48} />
          <h3 className="login-error-title">Authentication Failed</h3>
          <p className="login-error-description">{error}</p>
          <p className="login-error-help">Sign in again, or contact support if this keeps happening.</p>
        </div>
        <Link to="/login" className="login-back-link">
          <ArrowLeft size={16} />
          Back to Login
        </Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="login-loading-state">
        <AuthSpinner size="large" />
        {/* The status changes while the page sits still, so it has to be
            announced rather than just redrawn. */}
        <p className="login-loading-text" role="status" aria-live="polite">
          {status}
        </p>
      </div>
    </AuthLayout>
  )
}

export default SSOLoginPage
