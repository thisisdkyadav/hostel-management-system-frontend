import { baseUrl, fetchOptions } from "../constants/appConstants"

const route = "/admin"

export const healthApi = {
  // Get student health information
  getStudentHealth: async (userId) => {
    try {
      const response = await fetch(`${baseUrl}${route}/student/health/${userId}`, {
        method: "GET",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch student health")
      }

      return response.json()
    } catch (error) {
      console.error("Error fetching student health:", error)
      throw error
    }
  },

  // Update student health information
  updateStudentHealth: async (userId, healthData) => {
    try {
      const response = await fetch(`${baseUrl}${route}/student/health/${userId}`, {
        method: "PUT",
        ...fetchOptions,
        body: JSON.stringify(healthData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update student health")
      }

      return response.json()
    } catch (error) {
      console.error("Error updating student health:", error)
      throw error
    }
  },

  // Get insurance claims for a student
  getInsuranceClaims: async (userId) => {
    try {
      const response = await fetch(`${baseUrl}${route}/insurance-claims/${userId}`, {
        method: "GET",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch insurance claims")
      }

      return response.json()
    } catch (error) {
      console.error("Error fetching insurance claims:", error)
      throw error
    }
  },

  // Create a new insurance claim
  createInsuranceClaim: async (claimData) => {
    try {
      const response = await fetch(`${baseUrl}${route}/insurance-claims`, {
        method: "POST",
        ...fetchOptions,
        body: JSON.stringify(claimData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create insurance claim")
      }

      return response.json()
    } catch (error) {
      console.error("Error creating insurance claim:", error)
      throw error
    }
  },

  // Update an insurance claim
  updateInsuranceClaim: async (claimId, claimData) => {
    try {
      const response = await fetch(`${baseUrl}${route}/insurance-claims/${claimId}`, {
        method: "PUT",
        ...fetchOptions,
        body: JSON.stringify(claimData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update insurance claim")
      }

      return response.json()
    } catch (error) {
      console.error("Error updating insurance claim:", error)
      throw error
    }
  },

  // Delete an insurance claim
  deleteInsuranceClaim: async (claimId) => {
    try {
      const response = await fetch(`${baseUrl}${route}/insurance-claims/${claimId}`, {
        method: "DELETE",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete insurance claim")
      }

      return response.json()
    } catch (error) {
      console.error("Error deleting insurance claim:", error)
      throw error
    }
  },

  // Get all insurance providers
  getInsuranceProviders: async () => {
    try {
      const response = await fetch(`${baseUrl}${route}/insurance-providers`, {
        method: "GET",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch insurance providers")
      }

      return response.json()
    } catch (error) {
      console.error("Error fetching insurance providers:", error)
      throw error
    }
  },
}
