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

  uploadH2Form: async (imageData) => {
    const response = await fetch(`${baseUrl}/upload/h2-form`, {
      method: "POST",
      credentials: "include",
      body: imageData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to upload H2 form")
    }

    return response.json()
  },

  uploadPaymentScreenshot: async (imageData, userId) => {
    const response = await fetch(`${baseUrl}/upload/payment-screenshot`, {
      method: "POST",
      credentials: "include",
      body: imageData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to upload payment screenshot")
    }

    return response.json()
  },

  uploadLostAndFoundImage: async (imageData) => {
    const response = await fetch(`${baseUrl}/upload/lost-and-found-image`, {
      method: "POST",
      credentials: "include",
      body: imageData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to upload lost and found image")
    }

    return response.json()
  },
}
