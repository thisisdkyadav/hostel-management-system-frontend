/**
 * Hostel Gate API Module
 * Handles hostel gate management
 */

import apiClient from "../core/apiClient"

const ROUTE = "/admin"

export const hostelGateApi = {
  /**
   * Get all hostel gates
   */
  getAllHostelGates: () => {
    return apiClient.get(`${ROUTE}/hostel-gate/all`)
  },

  /**
   * Create hostel gate
   * @param {Object} gateData - Gate data
   */
  createHostelGate: (gateData) => {
    return apiClient.post(`${ROUTE}/hostel-gate`, gateData)
  },

  /**
   * Update hostel gate
   * @param {string} id - Gate ID
   * @param {Object} gateData - Updated gate data
   */
  updateHostelGate: (id, gateData) => {
    return apiClient.put(`${ROUTE}/hostel-gate/${id}`, gateData)
  },

  /**
   * Delete hostel gate
   * @param {string} id - Gate ID
   */
  deleteHostelGate: (id) => {
    return apiClient.delete(`${ROUTE}/hostel-gate/${id}`)
  },

  /**
   * Get hostel gate profile
   * @param {string} hostelId - Hostel ID
   */
  getHostelGateProfile: (hostelId) => {
    return apiClient.get(`/hostel-gate/${hostelId}`)
  },
}

export default hostelGateApi
