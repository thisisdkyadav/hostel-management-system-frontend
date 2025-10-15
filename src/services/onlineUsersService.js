import { baseUrl, fetchOptions } from "../constants/appConstants"

export const onlineUsersService = {
  /**
   * Get all currently online users
   * @param {Object} params - Query parameters { role, hostelId, page, limit }
   * @returns {Promise<Object>} Online users data
   */
  getOnlineUsers: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    const url = `${baseUrl}/online-users${queryString ? `?${queryString}` : ""}`

    const response = await fetch(url, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch online users")
    }

    return response.json()
  },

  /**
   * Get online users statistics
   * @returns {Promise<Object>} Online users statistics
   */
  getOnlineStats: async () => {
    const response = await fetch(`${baseUrl}/online-users/stats`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch online statistics")
    }

    return response.json()
  },

  /**
   * Get online status of specific user
   * @param {String} userId - User ID
   * @returns {Promise<Object>} User online status
   */
  getOnlineUserByUserId: async (userId) => {
    const response = await fetch(`${baseUrl}/online-users/${userId}`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch user online status")
    }

    return response.json()
  },

  /**
   * Get session history of specific user
   * @param {String} userId - User ID
   * @param {Object} params - Query parameters { page, limit }
   * @returns {Promise<Object>} User session history
   */
  getUserSessionHistory: async (userId, params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    const url = `${baseUrl}/online-users/history/${userId}${queryString ? `?${queryString}` : ""}`

    const response = await fetch(url, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch session history")
    }

    return response.json()
  },
}

export default onlineUsersService
