/**
 * User API Module
 * Handles user search and management
 */

import apiClient from "../core/apiClient"

export const userApi = {
  /**
   * Search users
   * @param {string} query - Search query
   * @param {string} role - Role filter
   */
  searchUsers: (query, role) => {
    const params = {}
    if (query) params.query = query
    if (role && role !== "all") params.role = role
    return apiClient.get("/users/search", { params })
  },

  /**
   * Get users by role
   * @param {string} role - User role
   */
  getUsersByRole: (role) => {
    return apiClient.get("/users/by-role", { params: { role } })
  },

  /**
   * Get user by ID
   * @param {string} userId - User ID
   */
  getUserById: (userId) => {
    return apiClient.get(`/users/${userId}`)
  },

  /**
   * Bulk update passwords
   * @param {Array} passwordUpdates - Array of { userId, newPassword }
   */
  bulkUpdatePasswords: (passwordUpdates) => {
    return apiClient.post("/users/bulk-password-update", { passwordUpdates })
  },
}

export default userApi
