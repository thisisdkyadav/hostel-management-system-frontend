import { baseUrl, fetchOptions } from "../constants/appConstants"

export const studentUndertakingApi = {
  // Get pending undertakings that require student's attention
  getPendingUndertakings: async () => {
    try {
      const response = await fetch(`${baseUrl}/undertaking/student/undertakings/pending`, {
        method: "GET",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch pending undertakings")
      }

      return response.json()
    } catch (error) {
      console.error("Error fetching pending undertakings:", error)
      throw error
    }
  },

  // Get undertakings that the student has already accepted
  getAcceptedUndertakings: async () => {
    try {
      const response = await fetch(`${baseUrl}/undertaking/student/undertakings/accepted`, {
        method: "GET",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch accepted undertakings")
      }

      return response.json()
    } catch (error) {
      console.error("Error fetching accepted undertakings:", error)
      throw error
    }
  },

  // Get detailed information about a specific undertaking
  getUndertakingDetails: async (undertakingId) => {
    try {
      const response = await fetch(`${baseUrl}/undertaking/student/undertakings/${undertakingId}`, {
        method: "GET",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch undertaking details")
      }

      return response.json()
    } catch (error) {
      console.error("Error fetching undertaking details:", error)
      throw error
    }
  },

  // Accept an undertaking
  acceptUndertaking: async (undertakingId) => {
    try {
      const response = await fetch(`${baseUrl}/undertaking/student/undertakings/${undertakingId}/accept`, {
        method: "POST",
        ...fetchOptions,
        body: JSON.stringify({ accepted: true }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to accept undertaking")
      }

      return response.json()
    } catch (error) {
      console.error("Error accepting undertaking:", error)
      throw error
    }
  },
}
