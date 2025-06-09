import { baseUrl, fetchOptions } from "../constants/appConstants"

const route = "/admin"

export const hostelGateApi = {
  getAllHostelGates: async () => {
    const response = await fetch(`${baseUrl}${route}/hostel-gate/all`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch hostel gates")
    }

    return response.json()
  },

  createHostelGate: async (gateData) => {
    const response = await fetch(`${baseUrl}${route}/hostel-gate`, {
      method: "POST",
      ...fetchOptions,
      body: JSON.stringify(gateData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to create hostel gate")
    }

    return response.json()
  },

  updateHostelGate: async (id, gateData) => {
    const response = await fetch(`${baseUrl}${route}/hostel-gate/${id}`, {
      method: "PUT",
      ...fetchOptions,
      body: JSON.stringify(gateData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to update hostel gate")
    }

    return response.json()
  },

  deleteHostelGate: async (id) => {
    const response = await fetch(`${baseUrl}${route}/hostel-gate/${id}`, {
      method: "DELETE",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to delete hostel gate")
    }

    return response.json()
  },
}
