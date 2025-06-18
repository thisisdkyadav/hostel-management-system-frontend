import { baseUrl, fetchOptions } from "../constants/appConstants"

export const userApi = {
  searchUsers: async (query, role) => {
    try {
      const params = new URLSearchParams()
      if (query) params.append("query", query)
      if (role && role !== "all") params.append("role", role)

      const response = await fetch(`${baseUrl}/users/search?${params.toString()}`, {
        method: "GET",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to search users")
      }

      return response.json()
    } catch (error) {
      console.error("Error searching users:", error)
      throw error
    }
  },

  getUsersByRole: async (role) => {
    try {
      const response = await fetch(`${baseUrl}/users/by-role?role=${encodeURIComponent(role)}`, {
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

  getUserById: async (userId) => {
    try {
      const response = await fetch(`${baseUrl}/users/${userId}`, {
        method: "GET",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch user")
      }

      return response.json()
    } catch (error) {
      console.error("Error fetching user:", error)
      throw error
    }
  },

  bulkUpdatePasswords: async (passwordUpdates) => {
    try {
      const response = await fetch(`${baseUrl}/users/bulk-password-update`, {
        method: "POST",
        ...fetchOptions,
        body: JSON.stringify({ passwordUpdates }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update passwords")
      }

      return response.json()
    } catch (error) {
      console.error("Error updating passwords in bulk:", error)
      throw error
    }
  },
}

export default userApi
