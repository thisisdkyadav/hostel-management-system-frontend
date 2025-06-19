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

  updateBulkFamilyMembers: async (familyMembersData) => {
    try {
      const response = await fetch(`${baseUrl}/family/bulk-update`, {
        method: "POST",
        ...fetchOptions,
        body: JSON.stringify(familyMembersData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update bulk family members")
      }

      return response.json()
    } catch (error) {
      console.error("Error updating bulk family members:", error)
      throw error
    }
  },

  addHostelGate: async (hostelGateData) => {
    try {
      const response = await fetch(`${baseUrl}/admin/hostel-gate`, {
        method: "POST",
        ...fetchOptions,
        body: JSON.stringify(hostelGateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to add hostel gate")
      }

      return response.json()
    } catch (error) {
      console.error("Error adding hostel gate:", error)
      throw error
    }
  },

  getAllHostelGates: async () => {
    try {
      const response = await fetch(`${baseUrl}/admin/hostel-gate/all`, {
        method: "GET",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch all hostel gates")
      }

      return response.json()
    } catch (error) {
      console.error("Error fetching all hostel gates:", error)
      throw error
    }
  },

  updateHostelGate: async (hostelGateId, hostelGateData) => {
    try {
      const response = await fetch(`${baseUrl}/admin/hostel-gate/${hostelGateId}`, {
        method: "PUT",
        ...fetchOptions,
        body: JSON.stringify(hostelGateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update hostel gate")
      }

      return response.json()
    } catch (error) {
      console.error("Error updating hostel gate:", error)
      throw error
    }
  },

  deleteHostelGate: async (hostelGateId) => {
    try {
      const response = await fetch(`${baseUrl}/admin/hostel-gate/${hostelGateId}`, {
        method: "DELETE",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete hostel gate")
      }

      return response.json()
    } catch (error) {
      console.error("Error deleting hostel gate:", error)
      throw error
    }
  },

  getStudentEditPermissions: async () => {
    return await adminApi.getConfig("studentEditableFields")
  },

  updateStudentEditPermissions: async (permissions) => {
    // Extract just the allowed fields to match the expected API format
    const allowedFields = permissions.filter((permission) => permission.allowed).map((permission) => permission.field)

    return await adminApi.updateConfig("studentEditableFields", allowedFields)
  },

  // General config management functions
  getConfig: async (key) => {
    try {
      const response = await fetch(`${baseUrl}/config/${key}`, {
        method: "GET",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Failed to fetch config for key: ${key}`)
      }

      return response.json()
    } catch (error) {
      console.error(`Error fetching config for key ${key}:`, error)
      throw error
    }
  },

  updateConfig: async (key, value) => {
    try {
      const response = await fetch(`${baseUrl}/config/${key}`, {
        method: "PUT",
        ...fetchOptions,
        body: JSON.stringify({ value }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Failed to update config for key: ${key}`)
      }

      return response.json()
    } catch (error) {
      console.error(`Error updating config for key ${key}:`, error)
      throw error
    }
  },
}

export default adminApi
