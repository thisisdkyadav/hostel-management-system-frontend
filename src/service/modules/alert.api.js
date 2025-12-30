/**
 * Alert API Module
 * Handles alert operations
 */

import apiClient from "../core/apiClient"

export const alertApi = {
  /**
   * Send alert
   * @param {string} alertType - Type of alert
   * @param {string} triggeredBy - Who triggered the alert
   */
  sendAlert: (alertType, triggeredBy) => {
    return apiClient.post("/alerts/create", { alertType, triggeredBy })
  },

  /**
   * Get alerts for a user
   * @param {string} userId - User ID
   */
  getAlerts: (userId) => {
    return apiClient.get(`/alerts/${userId}`)
  },
}

export default alertApi
