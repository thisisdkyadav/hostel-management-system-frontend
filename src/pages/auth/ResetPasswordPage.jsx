import { useState, useEffect } from "react"
import { Link, useSearchParams, useNavigate } from "react-router-dom"
import { ArrowLeft, ArrowRight, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react"
import { authApi } from "@/service"
import hmsLogo from "../../assets/hms-logo-t-256.svg"
import "../../styles/login.css"

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
            <div className="login-page">
                <div className="login-bg-container">
                    <div className="login-blob-1"></div>
                    <div className="login-blob-2"></div>
                    <div className="login-blob-3"></div>
                    <div className="login-blob-4"></div>
                </div>
                <div className="login-content-container">
                    <div className="login-card-wrapper">
                        <div className="login-card">
                            <div className="login-logo-section">
                                <img src={hmsLogo} className="login-logo" alt="HMS Logo" />
                            </div>
                            <div className="login-loading-state">
                                <svg className="login-spinner-large" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p className="login-loading-text">Verifying reset link...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Token error state
    if (tokenError) {
        return (
            <div className="login-page">
                <div className="login-bg-container">
                    <div className="login-blob-1"></div>
                    <div className="login-blob-2"></div>
                    <div className="login-blob-3"></div>
                    <div className="login-blob-4"></div>
                    <div className="login-blob-5"></div>
                    <div className="login-blob-6"></div>
                </div>
                <div className="login-content-container">
                    <div className="login-card-wrapper">
                        <div className="login-card">
                            <div className="login-logo-section">
                                <img src={hmsLogo} className="login-logo" alt="HMS Logo" />
                            </div>
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
                        </div>
                    </div>
                </div>
            </div>
        )
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
                                            <button
                                                type="button"
                                                className="login-password-toggle"
                                                onClick={() => setShowPassword(!showPassword)}
                                                tabIndex={-1}
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
                                                tabIndex={-1}
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
                                                    <svg className="login-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
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
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ResetPasswordPage
