/**
 * Face Scanner API Module
 * Handles face scanner device management
 */

import apiClient from "../core/apiClient"

export const faceScannerApi = {
  /**
   * Get all face scanners
   * @param {Object} filters - Optional filters (type, direction, hostelId, isActive)
   */
  getAllScanners: (filters = {}) => {
    return apiClient.get("/face-scanner", { params: filters })
  },

  /**
   * Get scanner by ID
   * @param {string} id - Scanner ID
   */
  getScannerById: (id) => {
    return apiClient.get(`/face-scanner/${id}`)
  },

  /**
   * Create new face scanner
   * @param {Object} data - Scanner data (name, type, direction, hostelId)
   */
  createScanner: (data) => {
    return apiClient.post("/face-scanner", data)
  },

  /**
   * Update face scanner
   * @param {string} id - Scanner ID
   * @param {Object} data - Update data (name, type, direction, hostelId, isActive)
   */
  updateScanner: (id, data) => {
    return apiClient.put(`/face-scanner/${id}`, data)
  },

  /**
   * Delete face scanner
   * @param {string} id - Scanner ID
   */
  deleteScanner: (id) => {
    return apiClient.delete(`/face-scanner/${id}`)
  },

  /**
   * Regenerate scanner password
   * @param {string} id - Scanner ID
   */
  regeneratePassword: (id) => {
    return apiClient.post(`/face-scanner/${id}/regenerate-password`)
  },
}

export default faceScannerApi
