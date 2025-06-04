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
}
