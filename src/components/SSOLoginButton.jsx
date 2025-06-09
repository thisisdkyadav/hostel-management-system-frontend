import { useCallback } from "react"
import { generateSSORedirectUrl } from "../utils/ssoUtils"

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
    <button onClick={handleSSOLogin} className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${className}`}>
      {buttonText}
    </button>
  )
}

export default SSOLoginButton
