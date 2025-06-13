import { baseUrl, fetchOptions } from "../constants/appConstants"

export const uploadApi = {
  uploadProfileImage: async (imageData, userId) => {
    const response = await fetch(`${baseUrl}/upload/profile/${userId}`, {
      method: "POST",
      credentials: "include",
      body: imageData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to upload profile image")
    }

    return response.json()
  },

  uploadIDcard: async (imageData, side) => {
    const response = await fetch(`${baseUrl}/upload/student-id/${side}`, {
      method: "POST",
      credentials: "include",
      body: imageData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to upload ID card")
    }

    return response.json()
  },
}
