import { fetchOptions, baseUrl } from "../constants/appConstants"

export const hostelGateApi = {
  getHostelGateProfile: async (hostelId) => {
    const response = await fetch(`${baseUrl}/hostel-gate/${hostelId}`, {
      ...fetchOptions,
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch hostel gate profile")
    }
    return response.json()
  },
}
