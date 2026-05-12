/**
 * AuthZ API Module (Layer-3)
 */

import { goApiClient } from "../core/apiClient"

export const authzApi = {
  getCatalog: () => goApiClient.get("/authz/catalog"),

  getMyAuthz: () => goApiClient.get("/authz/me"),

  getUsersByRole: (role = "", params = {}) => {
    const endpoint = role ? `/authz/users/${encodeURIComponent(role)}` : "/authz/users"
    return goApiClient.get(endpoint, { params })
  },

  getUserAuthz: (userId) => goApiClient.get(`/authz/user/${userId}`),

  updateUserAuthz: (userId, payload) => goApiClient.put(`/authz/user/${userId}`, payload),

  resetUserAuthz: (userId, payload = {}) => goApiClient.post(`/authz/user/${userId}/reset`, payload),
}

export default authzApi
