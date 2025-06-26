import { baseUrl, fetchOptions } from "../constants/appConstants"

export const complaintApi = {
  createComplaint: async (complaintData) => {
    try {
      const response = await fetch(`${baseUrl}/complaint`, {
        method: "POST",
        ...fetchOptions,
        body: JSON.stringify(complaintData),
      })

      if (!response.ok) {
        throw new Error("Failed to create complaint")
      }

      return await response.json()
    } catch (error) {
      console.error("Error creating complaint:", error)
      throw error
    }
  },

  updateStatus: async (complaintId, status) => {
    try {
      const response = await fetch(`${baseUrl}/complaint/${complaintId}/status`, {
        method: "PUT",
        ...fetchOptions,
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error("Failed to update complaint status")
      }

      return await response.json()
    } catch (error) {
      console.error("Error updating complaint status:", error)
      throw error
    }
  },

  updateComplaintResolutionNotes: async (complaintId, resolutionNotes) => {
    try {
      const response = await fetch(`${baseUrl}/complaint/${complaintId}/resolution-notes`, {
        method: "PUT",
        ...fetchOptions,
        body: JSON.stringify({ resolutionNotes }),
      })

      if (!response.ok) {
        throw new Error("Failed to update complaint resolution notes")
      }

      return await response.json()
    } catch (error) {
      console.error("Error updating complaint resolution notes:", error)
      throw error
    }
  },
}
