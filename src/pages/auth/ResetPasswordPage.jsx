import { useState, useEffect } from "react"
import { Link, useSearchParams, useNavigate } from "react-router-dom"
import { ArrowLeft, ArrowRight, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react"
import { authApi } from "@/service"
import AuthLayout, { AuthSpinner } from "../../components/auth/AuthLayout"

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams()
    const token = searchParams.get("token")
    const navigate = useNavigate()

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [verifying, setVerifying] = useState(true)
    const [error, setError] = useState(null)
    const [tokenError, setTokenError] = useState(null)
    const [success, setSuccess] = useState(false)
    const [user, setUser] = useState(null)

    // Verify token on mount
    useEffect(() => {
        const verifyToken = async () => {
            try {
                const response = await authApi.verifyResetToken(token)
                setUser(response.user)
                setVerifying(false)
            } catch (err) {
                setTokenError(err.message || "Invalid or expired reset link")
                setVerifying(false)
            }
        }

        if (token) {
            verifyToken()
        } else {
            setTokenError("No reset token provided")
            setVerifying(false)
        }
    }, [token])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)

        // Validate passwords match
        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        // Validate password length
        if (password.length < 6) {
            setError("Password must be at least 6 characters long")
            return
        }

        setLoading(true)

        try {
            await authApi.resetPassword(token, password)
            setSuccess(true)
            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate("/login")
            }, 3000)
        } catch (err) {
            setError(err.message || "Failed to reset password")
        } finally {
            setLoading(false)
        }
    }

    // Loading state while verifying token
    if (verifying) {
        return (
            <AuthLayout>
                <div className="login-loading-state">
                    <AuthSpinner size="large" />
                    <p className="login-loading-text" role="status" aria-live="polite">Verifying reset link...</p>
                </div>
            </AuthLayout>
        )
    }

    // Token error state
    if (tokenError) {
        return (
            <AuthLayout>
                            <div className="login-error-state">
                                <AlertCircle className="login-error-icon" size={48} />
                                <h3 className="login-error-title">Invalid Reset Link</h3>
                                <p className="login-error-description">{tokenError}</p>
                                <p className="login-error-help">
                                    The password reset link may have expired or already been used. Please request a new one.
                                </p>
                            </div>
                            <Link to="/forgot-password" className="login-submit-button" style={{ textDecoration: 'none', marginTop: '1.5rem' }}>
                                <span className="login-button-shimmer"></span>
                                <span className="login-button-content">
                                    Request New Link
                                    <ArrowRight className="login-button-icon" size={16} />
                                </span>
                            </Link>
                            <Link to="/login" className="login-back-link">
                                <ArrowLeft size={16} />
                                Back to Login
                            </Link>
            </AuthLayout>
        )
    }

    return (
        <AuthLayout>
                        {success ? (
                            <div className="login-form">
                                <div className="login-success-message">
                                    <CheckCircle className="login-success-icon" size={48} />
                                    <h3 className="login-success-title">Password Reset Successful!</h3>
                                    <p className="login-success-text">
                                        Your password has been successfully reset. You will be redirected to the login page shortly.
                                    </p>
                                </div>
                                <Link to="/login" className="login-submit-button" style={{ textDecoration: 'none', marginTop: '1.5rem' }}>
                                    <span className="login-button-shimmer"></span>
                                    <span className="login-button-content">
                                        Go to Login
                                        <ArrowRight className="login-button-icon" size={16} />
                                    </span>
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="login-form-header">
                                    <h2 className="login-form-title">Reset Password</h2>
                                    {user && (
                                        <p className="login-form-subtitle">
                                            Enter a new password for <strong>{user.email}</strong>
                                        </p>
                                    )}
                                </div>

                                {error && (
                                    <div className="login-error">
                                        <p className="login-error-text">{error}</p>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="login-form">
                                    <div className="login-form-group">
                                        <label htmlFor="password" className="login-form-label">
                                            New Password
                                        </label>
                                        <div className="login-input-wrapper">
                                            <input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Enter new password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                minLength={6}
                                                className="login-input login-input-with-icon"
                                                autoComplete="new-password"
                                            />
                                            {/* Reachable by keyboard: it was tabIndex={-1}, which left
                                                the only way to check what you typed being a mouse. */}
                                            <button
                                                type="button"
                                                className="login-password-toggle"
                                                onClick={() => setShowPassword(!showPassword)}
                                                aria-label={showPassword ? "Hide password" : "Show password"}
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                            <div className="login-input-line"></div>
                                        </div>
                                    </div>

                                    <div className="login-form-group">
                                        <label htmlFor="confirmPassword" className="login-form-label">
                                            Confirm Password
                                        </label>
                                        <div className="login-input-wrapper">
                                            <input
                                                id="confirmPassword"
                                                type={showConfirmPassword ? "text" : "password"}
                                                placeholder="Confirm new password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required
                                                minLength={6}
                                                className="login-input login-input-with-icon"
                                                autoComplete="new-password"
                                            />
                                            <button
                                                type="button"
                                                className="login-password-toggle"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                            >
                                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
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
                                                    Resetting...
                                                </>
                                            ) : (
                                                <>
                                                    Reset Password
                                                    <ArrowRight className="login-button-icon" size={16} />
                                                </>
                                            )}
                                        </span>
                                    </button>
                                </form>

                                <Link to="/login" className="login-back-link">
                                    <ArrowLeft size={16} />
                                    Back to Login
                                </Link>
                            </>
                        )}
        </AuthLayout>
    )
}

export default ResetPasswordPage
