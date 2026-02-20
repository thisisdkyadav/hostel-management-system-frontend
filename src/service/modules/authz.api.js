/**
 * AuthZ API Module (Layer-3)
 */

import apiClient from "../core/apiClient"

export const authzApi = {
  getCatalog: () => apiClient.get("/authz/catalog"),

  getMyAuthz: () => apiClient.get("/authz/me"),

  getUsersByRole: (role = "", params = {}) => {
    const endpoint = role ? `/authz/users/${encodeURIComponent(role)}` : "/authz/users"
    return apiClient.get(endpoint, { params })
  },

  getUserAuthz: (userId) => apiClient.get(`/authz/user/${userId}`),

  updateUserAuthz: (userId, payload) => apiClient.put(`/authz/user/${userId}`, payload),

  resetUserAuthz: (userId, payload = {}) => apiClient.post(`/authz/user/${userId}/reset`, payload),
}

export default authzApi
