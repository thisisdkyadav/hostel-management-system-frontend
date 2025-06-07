import { baseUrl, fetchOptions } from "../constants/appConstants"

const route = "/admin"

export const insuranceProviderApi = {
  getInsuranceProviders: async () => {
    const response = await fetch(`${baseUrl}${route}/insurance-providers`, {
      method: "GET",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch insurance providers")
    }

    return response.json()
  },

  createInsuranceProvider: async (providerData) => {
    const response = await fetch(`${baseUrl}${route}/insurance-providers`, {
      method: "POST",
      ...fetchOptions,
      body: JSON.stringify(providerData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to create insurance provider")
    }

    return response.json()
  },

  updateInsuranceProvider: async (id, providerData) => {
    const response = await fetch(`${baseUrl}${route}/insurance-providers/${id}`, {
      method: "PUT",
      ...fetchOptions,
      body: JSON.stringify(providerData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to update insurance provider")
    }

    return response.json()
  },

  deleteInsuranceProvider: async (id) => {
    const response = await fetch(`${baseUrl}${route}/insurance-providers/${id}`, {
      method: "DELETE",
      ...fetchOptions,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to delete insurance provider")
    }

    return response.json()
  },
}
