import { baseUrl, fetchOptions } from "../constants/appConstants"

export const liveCheckInOutApi = {
  /**
   * Get live check-in/out entries with filters
   */
  getEntries: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          queryParams.append(key, value)
        }
      })

      const response = await fetch(`${baseUrl}/live-checkinout/entries?${queryParams.toString()}`, {
        method: "GET",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch check-in/out entries")
      }

      return response.json()
    } catch (error) {
      console.error("Error fetching check-in/out entries:", error)
      throw error
    }
  },

  /**
   * Get hostel-wise statistics
   */
  getHostelWiseStats: async () => {
    try {
      const response = await fetch(`${baseUrl}/live-checkinout/stats/hostel-wise`, {
        method: "GET",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch hostel-wise stats")
      }

      return response.json()
    } catch (error) {
      console.error("Error fetching hostel-wise stats:", error)
      throw error
    }
  },

  /**
   * Get recent activity
   */
  getRecentActivity: async (limit = 50) => {
    try {
      const response = await fetch(`${baseUrl}/live-checkinout/recent?limit=${limit}`, {
        method: "GET",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch recent activity")
      }

      return response.json()
    } catch (error) {
      console.error("Error fetching recent activity:", error)
      throw error
    }
  },

  /**
   * Get time-based analytics
   */
  getTimeBasedAnalytics: async (date = null) => {
    try {
      const url = date ? `${baseUrl}/live-checkinout/analytics/time-based?date=${date}` : `${baseUrl}/live-checkinout/analytics/time-based`

      const response = await fetch(url, {
        method: "GET",
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch time-based analytics")
      }

      return response.json()
    } catch (error) {
      console.error("Error fetching time-based analytics:", error)
      throw error
    }
  },
}

export default liveCheckInOutApi
