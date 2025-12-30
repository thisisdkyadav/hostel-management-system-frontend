/**
 * Online Users API Module
 * Handles online user tracking and session history
 */

import apiClient from "../core/apiClient"

export const onlineUsersApi = {
  /**
   * Get all currently online users
   * @param {Object} params - { role, hostelId, page, limit }
   */
  getOnlineUsers: (params = {}) => {
    return apiClient.get("/online-users", { params })
  },

  /**
   * Get online users statistics
   */
  getOnlineStats: () => {
    return apiClient.get("/online-users/stats")
  },

  /**
   * Get online status of specific user
   * @param {string} userId - User ID
   */
  getOnlineUserByUserId: (userId) => {
    return apiClient.get(`/online-users/${userId}`)
  },

  /**
   * Get session history of specific user
   * @param {string} userId - User ID
   * @param {Object} params - { page, limit }
   */
  getUserSessionHistory: (userId, params = {}) => {
    return apiClient.get(`/online-users/history/${userId}`, { params })
  },
}

export default onlineUsersApi
