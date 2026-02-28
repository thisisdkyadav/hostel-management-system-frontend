/**
 * Authentication API Module
 * Handles all authentication-related API calls
 */

import apiClient from "../core/apiClient"

const unwrapStandardResponse = (response) => {
  if (
    response &&
    typeof response === "object" &&
    typeof response.success === "boolean" &&
    Object.prototype.hasOwnProperty.call(response, "data")
  ) {
    return response.data
  }

  return response
}

export const authApi = {
  /**
   * Verify current user authentication
   */
  verify: () => {
    return apiClient.get("/auth/user").then(unwrapStandardResponse)
  },

  /**
   * Login with email and password
   * @param {Object} credentials - { email, password }
   */
  login: (credentials) => {
    return apiClient.post("/auth/login", credentials).then(unwrapStandardResponse)
  },

  /**
   * Login with Google OAuth token
   * @param {string} token - Google OAuth token
   */
  loginWithGoogle: (token) => {
    return apiClient.post("/auth/google", { token }).then(unwrapStandardResponse)
  },

  /**
   * Verify SSO token
   * @param {string} token - SSO token
   */
  verifySSOToken: (token) => {
    return apiClient.post("/auth/verify-sso-token", { token }).then(unwrapStandardResponse)
  },

  /**
   * Logout current user
   */
  logout: () => {
    return apiClient.get("/auth/logout").then(unwrapStandardResponse)
  },

  /**
   * Change user password
   * @param {string} oldPassword - Current password
   * @param {string} newPassword - New password
   */
  changePassword: (oldPassword, newPassword) => {
    return apiClient.post("/auth/update-password", { oldPassword, newPassword }).then(unwrapStandardResponse)
  },

  /**
   * Get user's active devices/sessions
   */
  getUserDevices: () => {
    return apiClient.get("/auth/user/devices").then(unwrapStandardResponse)
  },

  /**
   * Update pinned sidebar tabs for current user
   * @param {string[]} pinnedTabs - Array of pinned tab paths
   */
  updatePinnedTabs: (pinnedTabs) => {
    return apiClient.patch("/auth/user/pinned-tabs", { pinnedTabs }).then(unwrapStandardResponse)
  },

  /**
   * Logout from a specific device
   * @param {string} sessionId - Session ID to logout from
   */
  logoutFromDevice: (sessionId) => {
    return apiClient.post(`/auth/user/devices/logout/${sessionId}`).then(unwrapStandardResponse)
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
    return apiClient.post("/auth/forgot-password", { email }).then(unwrapStandardResponse)
  },

  /**
   * Verify password reset token
   * @param {string} token - Reset token
   */
  verifyResetToken: (token) => {
    return apiClient.get(`/auth/reset-password/${token}`).then(unwrapStandardResponse)
  },

  /**
   * Reset password with token
   * @param {string} token - Reset token
   * @param {string} password - New password
   */
  resetPassword: (token, password) => {
    return apiClient.post("/auth/reset-password", { token, password }).then(unwrapStandardResponse)
  },
}

export default authApi
