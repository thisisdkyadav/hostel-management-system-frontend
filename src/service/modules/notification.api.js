/**
 * Notification API Module
 * Handles notification operations
 */

import apiClient from "../core/apiClient"

export const notificationApi = {
  /**
   * Get notifications with optional query params
   * @param {string} queryParams - Query string
   */
  getNotifications: (queryParams = "") => {
    return apiClient.get("/notification", { queryString: queryParams })
  },

  /**
   * Get notification statistics
   */
  getNotificationStats: () => {
    return apiClient.get("/notification/stats")
  },

  /**
   * Create new notification
   * @param {Object} data - Notification data
   */
  createNotification: (data) => {
    return apiClient.post("/notification", data)
  },

  /**
   * Get active notifications count
   */
  getActiveNotificationsCount: () => {
    return apiClient.get("/notification/active-count")
  },
}

export default notificationApi
