/**
 * Authentication API Module
 * Handles all authentication-related API calls
 */

import apiClient from "../core/apiClient"

export const authApi = {
  /**
   * Verify current user authentication
   */
  verify: () => {
    return apiClient.get("/auth/user")
  },

  /**
   * Login with email and password
   * @param {Object} credentials - { email, password }
   */
  login: (credentials) => {
    return apiClient.post("/auth/login", credentials)
  },

  /**
   * Login with Google OAuth token
   * @param {string} token - Google OAuth token
   */
  loginWithGoogle: (token) => {
    return apiClient.post("/auth/google", { token })
  },

  /**
   * Verify SSO token
   * @param {string} token - SSO token
   */
  verifySSOToken: (token) => {
    return apiClient.post("/auth/verify-sso-token", { token })
  },

  /**
   * Logout current user
   */
  logout: () => {
    return apiClient.get("/auth/logout")
  },

  /**
   * Change user password
   * @param {string} oldPassword - Current password
   * @param {string} newPassword - New password
   */
  changePassword: (oldPassword, newPassword) => {
    return apiClient.post("/auth/update-password", { oldPassword, newPassword })
  },

  /**
   * Get user's active devices/sessions
   */
  getUserDevices: () => {
    return apiClient.get("/auth/user/devices")
  },

  /**
   * Update pinned sidebar tabs for current user
   * @param {string[]} pinnedTabs - Array of pinned tab paths
   */
  updatePinnedTabs: (pinnedTabs) => {
    return apiClient.patch("/auth/user/pinned-tabs", { pinnedTabs })
  },

  /**
   * Logout from a specific device
   * @param {string} sessionId - Session ID to logout from
   */
  logoutFromDevice: (sessionId) => {
    return apiClient.post(`/auth/user/devices/logout/${sessionId}`)
  },

  /**
   * Redirect to wellness portal
   */
  redirectToWellness: () => {
    return apiClient.get("/sso/redirect", {
      params: { redirectTo: "https://wellness.iitb.ac.in" },
    })
  },

  // ========== Password Reset ==========

  /**
   * Request password reset email
   * @param {string} email - User email
   */
  forgotPassword: (email) => {
    return apiClient.post("/auth/forgot-password", { email })
  },

  /**
   * Verify password reset token
   * @param {string} token - Reset token
   */
  verifyResetToken: (token) => {
    return apiClient.get(`/auth/reset-password/${token}`)
  },

  /**
   * Reset password with token
   * @param {string} token - Reset token
   * @param {string} password - New password
   */
  resetPassword: (token, password) => {
    return apiClient.post("/auth/reset-password", { token, password })
  },
}

export default authApi
