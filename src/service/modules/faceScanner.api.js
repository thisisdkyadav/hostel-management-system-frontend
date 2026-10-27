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

  /**
   * ZKTeco accounts — an account owns the shared username/password and
   * contains the scanners (devices) that authenticate with it.
   */

  /** List accounts (each with scannerCount + scanners[]) */
  getAccounts: () => {
    return apiClient.get("/face-scanner/accounts")
  },

  /** @param {string} id - Account ID */
  getAccount: (id) => {
    return apiClient.get(`/face-scanner/accounts/${id}`)
  },

  /**
   * Create an account. Blank username + password => generated.
   * @param {Object} data - { name, username?, password? }
   * @returns {Promise} data: { account, credentials: { username, password } }
   */
  createAccount: (data) => {
    return apiClient.post("/face-scanner/accounts", data)
  },

  /**
   * Update an account
   * @param {string} id - Account ID
   * @param {Object} data - { name?, isActive?, username?, password? } (username + password go together)
   */
  updateAccount: (id, data) => {
    return apiClient.put(`/face-scanner/accounts/${id}`, data)
  },

  /**
   * Generate a new password for an account
   * @param {string} id - Account ID
   * @returns {Promise} data: { account, credentials: { username, password } }
   */
  regenerateAccountPassword: (id) => {
    return apiClient.post(`/face-scanner/accounts/${id}/regenerate-password`)
  },

  /**
   * Delete an account (409 while it still has scanners)
   * @param {string} id - Account ID
   */
  deleteAccount: (id) => {
    return apiClient.delete(`/face-scanner/accounts/${id}`)
  },
}

export default faceScannerApi
