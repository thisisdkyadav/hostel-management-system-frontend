import { baseUrl, fetchOptions } from "../constants/appConstants"

export const IDcardApi = {
  getIDcard: async (userId) => {
    try {
      const response = await fetch(`${baseUrl}/student/${userId}/id-card`, {
        ...fetchOptions,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch ID card")
      }

      return response.json()
    } catch (error) {
      console.error("Error fetching ID card:", error)
      throw error
    }
  },

  updateIDcard: async (userId, front, back) => {
    try {
      const response = await fetch(`${baseUrl}/student/${userId}/id-card`, {
        ...fetchOptions,
        method: "POST",
        body: JSON.stringify({ front, back }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update ID card")
      }

      return response.json()
    } catch (error) {
      console.error("Error updating ID card:", error)
      throw error
    }
  },
}
