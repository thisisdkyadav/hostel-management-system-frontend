import { baseUrl, fetchOptions } from "../constants/appConstants"

export const adminApi = {
  getFamilyDetails: async (userId) => {
    try {
      const response = await fetch(`${baseUrl}/family/${userId}`, {
        method: "GET",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch family details")
      }

      return response.json()
    } catch (error) {
      console.error("Error fetching family details:", error)
      throw error
    }
  },

  addFamilyMember: async (userId, familyMemberData) => {
    try {
      const response = await fetch(`${baseUrl}/family/${userId}`, {
        method: "POST",
        ...fetchOptions,
        body: JSON.stringify(familyMemberData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to add family member")
      }

      return response.json()
    } catch (error) {
      console.error("Error adding family member:", error)
      throw error
    }
  },

  updateFamilyMember: async (memberId, familyMemberData) => {
    try {
      const response = await fetch(`${baseUrl}/family/${memberId}`, {
        method: "PUT",
        ...fetchOptions,
        body: JSON.stringify(familyMemberData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update family member")
      }

      return response.json()
    } catch (error) {
      console.error("Error updating family member:", error)
      throw error
    }
  },

  deleteFamilyMember: async (memberId) => {
    try {
      const response = await fetch(`${baseUrl}/family/${memberId}`, {
        method: "DELETE",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete family member")
      }

      return response.json()
    } catch (error) {
      console.error("Error deleting family member:", error)
      throw error
    }
  },
}

export default adminApi
