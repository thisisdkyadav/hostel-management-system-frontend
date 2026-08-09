import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, Mail, CheckCircle } from "lucide-react"
import { authApi } from "@/service"
import AuthLayout, { AuthSpinner } from "../../components/auth/AuthLayout"

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
        <AuthLayout>
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
                                                    <AuthSpinner />
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
        </AuthLayout>
    )
}

export default ForgotPasswordPage
