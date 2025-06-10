import { useCallback } from "react"
import { generateSSORedirectUrl } from "../utils/ssoUtils"
import { FiLogIn } from "react-icons/fi"

/**
 * A button component that redirects to the SSO server for authentication
 */
const SSOLoginButton = ({ className, buttonText = "Login with SSO" }) => {
  const handleSSOLogin = useCallback(() => {
    // Get the current hostname and protocol to build the redirect URL
    const protocol = window.location.protocol
    const hostname = window.location.hostname
    const port = window.location.port ? `:${window.location.port}` : ""

    // Build the redirect URL to this application's SSO endpoint
    const redirectUrl = `${protocol}//${hostname}${port}/sso`

    // Generate the SSO server URL and redirect
    const ssoUrl = generateSSORedirectUrl(redirectUrl)
    window.location.href = ssoUrl
  }, [])

  return (
    <button
      onClick={handleSSOLogin}
      className={`group px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-600 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-blue-400/20 flex items-center justify-center relative overflow-hidden ${className}`}
    >
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
      <FiLogIn className="mr-2 relative" />
      <span className="relative">{buttonText}</span>
    </button>
  )
}

export default SSOLoginButton
