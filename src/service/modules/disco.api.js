/**
 * DisCo (Disciplinary Committee) API Module
 * Handles disciplinary action operations
 */

import apiClient from "../core/apiClient"

export const discoApi = {
  /**
   * Add DisCo action
   * @param {Object} data - DisCo action data
   */
  addDisCoAction: (data) => {
    return apiClient.post("/disco/add", data)
  },

  /**
   * Get DisCo actions by student
   * @param {string} studentId - Student ID
   */
  getDisCoActionsByStudent: (studentId) => {
    return apiClient.get(`/disco/${studentId}`)
  },

  /**
   * Update DisCo action
   * @param {string} disCoId - DisCo action ID
   * @param {Object} data - Updated data
   */
  updateDisCoAction: (disCoId, data) => {
    return apiClient.put(`/disco/update/${disCoId}`, data)
  },

  /**
   * Delete DisCo action
   * @param {string} disCoId - DisCo action ID
   */
  deleteDisCoAction: (disCoId) => {
    return apiClient.delete(`/disco/${disCoId}`)
  },
}

export default discoApi
