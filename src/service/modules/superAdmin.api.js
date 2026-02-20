/**
 * Super Admin API Module
 * Handles super admin operations
 */

import apiClient from "../core/apiClient"

export const superAdminApi = {
  // ==================== Profile ====================

  /**
   * Get current super admin profile
   */
  getMyProfile: () => {
    return apiClient.get("/super-admin/profile")
  },

  // ==================== Admin Management ====================

  /**
   * Get all admins
   */
  getAllAdmins: () => {
    return apiClient.get("/super-admin/admins")
  },

  /**
   * Create admin
   * @param {Object} adminData - Admin data
   */
  createAdmin: (adminData) => {
    return apiClient.post("/super-admin/admins", adminData)
  },

  /**
   * Update admin
   * @param {string} adminId - Admin ID
   * @param {Object} adminData - Updated admin data
   */
  updateAdmin: (adminId, adminData) => {
    return apiClient.put(`/super-admin/admins/${adminId}`, adminData)
  },

  /**
   * Delete admin
   * @param {string} adminId - Admin ID
   */
  deleteAdmin: (adminId) => {
    return apiClient.delete(`/super-admin/admins/${adminId}`)
  },

  // ==================== API Key Management ====================

  /**
   * Get all API keys
   */
  getAllApiKeys: () => {
    return apiClient.get("/super-admin/api-clients")
  },

  /**
   * Create API key
   * @param {Object} keyData - API key data
   */
  createApiKey: (keyData) => {
    return apiClient.post("/super-admin/api-clients", keyData)
  },

  /**
   * Update API key status
   * @param {string} keyId - API key ID
   * @param {boolean} isActive - Active status
   */
  updateApiKeyStatus: (keyId, isActive) => {
    return apiClient.put(`/super-admin/api-clients/${keyId}`, { isActive })
  },

  /**
   * Delete API key
   * @param {string} keyId - API key ID
   */
  deleteApiKey: (keyId) => {
    return apiClient.delete(`/super-admin/api-clients/${keyId}`)
  },

  // ==================== Dashboard ====================

  /**
   * Get dashboard statistics
   */
  getDashboardStats: () => {
    return apiClient.get("/super-admin/dashboard")
  },
}

export default superAdminApi
