import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, Mail, CheckCircle } from "lucide-react"
import { authApi } from "@/service"
import hmsLogo from "../../assets/hms-logo-t-256.svg"
import "../../styles/login.css"

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            await authApi.forgotPassword(email)
            setSuccess(true)
        } catch (err) {
            setError(err.message || "Failed to send reset email")
        } finally {
            setLoading(false)
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

                        {success ? (
                            <div className="login-form">
                                <div className="login-success-message">
                                    <CheckCircle className="login-success-icon" size={48} />
                                    <h3 className="login-success-title">Check Your Email</h3>
                                    <p className="login-success-text">
                                        If an account exists with <strong>{email}</strong>, you will receive a password reset link shortly.
                                    </p>
                                    <p className="login-success-note">
                                        Didn&apos;t receive an email? Check your spam folder or try again.
                                    </p>
                                </div>
                                <Link to="/login" className="login-back-link">
                                    <ArrowLeft size={16} />
                                    Back to Login
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="login-form-header">
                                    <h2 className="login-form-title">Forgot Password?</h2>
                                    <p className="login-form-subtitle">
                                        Enter your email address and we&apos;ll send you a link to reset your password.
                                    </p>
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
                                                autoComplete="email"
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
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <Mail size={16} style={{ marginRight: '0.5rem' }} />
                                                    Send Reset Link
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

export default ForgotPasswordPage
