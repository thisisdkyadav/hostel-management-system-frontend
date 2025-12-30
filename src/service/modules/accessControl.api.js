/**
 * Access Control API Module
 * Handles user permissions management
 */

import apiClient from "../core/apiClient"

export const accessControlApi = {
  /**
   * Get users by role
   * @param {string} role - User role
   * @param {Object} queryParams - { page, limit }
   */
  getUsersByRole: (role, queryParams = {}) => {
    const { page = 1, limit = 10 } = queryParams
    const endpoint = role ? `/permissions/users/${role}` : "/permissions/users"
    return apiClient.get(endpoint, { params: { page, limit } })
  },

  /**
   * Get user permissions
   * @param {string} userId - User ID
   */
  getUserPermissions: (userId) => {
    return apiClient.get(`/permissions/user/${userId}`)
  },

  /**
   * Update user permissions
   * @param {string} userId - User ID
   * @param {Object} permissions - Permissions object
   */
  updateUserPermissions: (userId, permissions) => {
    return apiClient.put(`/permissions/user/${userId}`, { permissions })
  },

  /**
   * Reset user permissions to default
   * @param {string} userId - User ID
   */
  resetUserPermissions: (userId) => {
    return apiClient.post(`/permissions/user/${userId}/reset`)
  },
}

export default accessControlApi
