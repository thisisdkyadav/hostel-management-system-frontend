/**
 * ID Card API Module
 * Handles student ID card operations
 */

import apiClient from "../core/apiClient"

export const idCardApi = {
  /**
   * Get ID card for user
   * @param {string} userId - User ID
   */
  getIDcard: (userId) => {
    return apiClient.get(`/student/${userId}/id-card`)
  },

  /**
   * Update ID card
   * @param {string} userId - User ID
   * @param {string} front - Front image URL
   * @param {string} back - Back image URL
   */
  updateIDcard: (userId, front, back) => {
    return apiClient.post(`/student/${userId}/id-card`, { front, back })
  },
}

export default idCardApi
