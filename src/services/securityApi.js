import { fetchOptions, baseUrl } from "../constants/appConstants"

export const securityApi = {
  getSecurityInfo: async () => {
    const response = await fetch(`${baseUrl}/security`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch security info")
    }

    return response.json()
  },

  getVisitors: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString()
    const url = `${baseUrl}/security/visitors${queryParams ? `?${queryParams}` : ""}`

    const response = await fetch(url, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch visitors")
    }

    return response.json()
  },

  addVisitor: async (visitorData) => {
    const response = await fetch(`${baseUrl}/security/visitors`, {
      method: "POST",
      ...fetchOptions,
      body: JSON.stringify(visitorData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to add visitor")
    }

    return response.json()
  },

  updateVisitor: async (visitorId, visitorData) => {
    const response = await fetch(`${baseUrl}/security/visitors/${visitorId}`, {
      method: "PUT",
      ...fetchOptions,
      body: JSON.stringify(visitorData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to update visitor")
    }

    return response.json()
  },

  addStudentEntry: async (entryData) => {
    const response = await fetch(`${baseUrl}/security/entries`, {
      method: "POST",
      ...fetchOptions,
      body: JSON.stringify(entryData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to add student entry")
    }

    return response.json()
  },

  getRecentStudentEntries: async () => {
    const response = await fetch(`${baseUrl}/security/entries/recent`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch recent student entries")
    }

    return response.json()
  },

  updateStudentEntry: async (entryData) => {
    const response = await fetch(`${baseUrl}/security/entries/${entryData._id}`, {
      method: "PUT",
      ...fetchOptions,
      body: JSON.stringify(entryData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to update student entry")
    }

    return response.json()
  },

  getStudentEntries: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString()
    const url = `${baseUrl}/security/entries${queryParams ? `?${queryParams}` : ""}`

    const response = await fetch(url, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch student entries")
    }

    return response.json()
  },

  deleteStudentEntry: async (entryId) => {
    const response = await fetch(`${baseUrl}/security/entries/${entryId}`, {
      method: "DELETE",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to delete student entry")
    }

    return response.json()
  },

  deleteVisitor: async (visitorId) => {
    const response = await fetch(`${baseUrl}/security/visitors/${visitorId}`, {
      method: "DELETE",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to delete visitor")
    }

    return response.json()
  },

  verifyQRCode: async (email, encryptedData) => {
    const response = await fetch(`${baseUrl}/security/verify-qr`, {
      method: "POST",
      ...fetchOptions,
      body: JSON.stringify({ email, encryptedData }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to verify QR code")
    }

    return response.json()
  },
}
