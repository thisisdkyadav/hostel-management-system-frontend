/**
 * Authentication API Module
 * Handles all authentication-related API calls
 */

import { goApiClient } from "../core/apiClient"

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
    return goApiClient.get("/auth/user").then(unwrapStandardResponse)
  },

  /**
   * Login with email and password
   * @param {Object} credentials - { email, password }
   */
  login: (credentials) => {
    return goApiClient.post("/auth/login", credentials).then(unwrapStandardResponse)
  },

  /**
   * Login with Google OAuth token
   * @param {string} token - Google OAuth token
   */
  loginWithGoogle: (token) => {
    return goApiClient.post("/auth/google", { token }).then(unwrapStandardResponse)
  },

  /**
   * Verify SSO token
   * @param {string} token - SSO token
   */
  verifySSOToken: (token) => {
    return goApiClient.post("/auth/verify-sso-token", { token }).then(unwrapStandardResponse)
  },

  /**
   * Logout current user
   */
  logout: () => {
    return goApiClient.get("/auth/logout").then(unwrapStandardResponse)
  },

  /**
   * Change user password
   * @param {string} oldPassword - Current password
   * @param {string} newPassword - New password
   */
  changePassword: (oldPassword, newPassword) => {
    return goApiClient.post("/auth/update-password", { oldPassword, newPassword }).then(unwrapStandardResponse)
  },

  /**
   * Get user's active devices/sessions
   */
  getUserDevices: () => {
    return goApiClient.get("/auth/user/devices").then(unwrapStandardResponse)
  },

  /**
   * Update pinned sidebar tabs for current user
   * @param {string[]} pinnedTabs - Array of pinned tab paths
   */
  updatePinnedTabs: (pinnedTabs) => {
    return goApiClient.patch("/auth/user/pinned-tabs", { pinnedTabs }).then(unwrapStandardResponse)
  },

  /**
   * Logout from a specific device
   * @param {string} sessionId - Session ID to logout from
   */
  logoutFromDevice: (sessionId) => {
    return goApiClient.post(`/auth/user/devices/logout/${sessionId}`).then(unwrapStandardResponse)
  },

  /**
   * Redirect to wellness portal
   */
  redirectToWellness: () => {
    return goApiClient.get("/sso/redirect", {
      params: { redirectTo: "https://wellness.iitb.ac.in" },
    })
  },

  // ========== Password Reset ==========

  /**
   * Request password reset email
   * @param {string} email - User email
   */
  forgotPassword: (email) => {
    return goApiClient.post("/auth/forgot-password", { email }).then(unwrapStandardResponse)
  },

  /**
   * Verify password reset token
   * @param {string} token - Reset token
   */
  verifyResetToken: (token) => {
    return goApiClient.get(`/auth/reset-password/${token}`).then(unwrapStandardResponse)
  },

  /**
   * Reset password with token
   * @param {string} token - Reset token
   * @param {string} password - New password
   */
  resetPassword: (token, password) => {
    return goApiClient.post("/auth/reset-password", { token, password }).then(unwrapStandardResponse)
  },
}

export default authApi
