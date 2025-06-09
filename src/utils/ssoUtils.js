/**
 * Generates a URL to redirect to the SSO server for authentication
 * @param {string} redirectUrl - The URL to redirect back to after SSO authentication
 * @returns {string} - The SSO server URL with redirect parameter
 */
export const generateSSORedirectUrl = (redirectUrl) => {
  // Get the SSO server URL from environment variables or use a default
  const ssoServerUrl = import.meta.env.VITE_SSO_SERVER_URL || "http://localhost:3000"

  // Create the redirect URL with the current application URL as the redirect_to parameter
  const encodedRedirectUrl = encodeURIComponent(redirectUrl)
  return `${ssoServerUrl}/api/auth/redirect?redirect_to=${encodedRedirectUrl}`
}

/**
 * Extracts and validates an SSO token from the URL query parameters
 * @returns {string|null} - The SSO token or null if not found
 */
export const extractSSOTokenFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get("token")
}
