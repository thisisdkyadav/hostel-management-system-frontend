import { baseUrl, fetchOptions } from "../constants/appConstants"

export const accessControlApi = {
  // List Users by Role
  getUsersByRole: async (role, queryParams = {}) => {
    const { page = 1, limit = 10 } = queryParams
    try {
      const url = new URL(`${baseUrl}/permissions/users${role ? `/${role}` : ""}`)
      url.searchParams.append("page", page)
      url.searchParams.append("limit", limit)

      const response = await fetch(url, {
        method: "GET",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch users by role")
      }

      return response.json()
    } catch (error) {
      console.error("Error fetching users by role:", error)
      throw error
    }
  },

  // Get User Permissions
  getUserPermissions: async (userId) => {
    try {
      const response = await fetch(`${baseUrl}/permissions/user/${userId}`, {
        method: "GET",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch user permissions")
      }

      return response.json()
    } catch (error) {
      console.error("Error fetching user permissions:", error)
      throw error
    }
  },

  // Update User Permissions
  updateUserPermissions: async (userId, permissions) => {
    try {
      const response = await fetch(`${baseUrl}/permissions/user/${userId}`, {
        method: "PUT",
        ...fetchOptions,
        body: JSON.stringify({ permissions }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update user permissions")
      }

      return response.json()
    } catch (error) {
      console.error("Error updating user permissions:", error)
      throw error
    }
  },

  // Reset User Permissions
  resetUserPermissions: async (userId) => {
    try {
      const response = await fetch(`${baseUrl}/permissions/user/${userId}/reset`, {
        method: "POST",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to reset user permissions")
      }

      return response.json()
    } catch (error) {
      console.error("Error resetting user permissions:", error)
      throw error
    }
  },
}

export default accessControlApi
