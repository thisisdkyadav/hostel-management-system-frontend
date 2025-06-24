import { baseUrl, fetchOptions } from "../constants/appConstants"

export const studentProfileApi = {
  // get student profile
  getStudentProfile: async () => {
    const response = await fetch(`${baseUrl}/student-profile/`, {
      method: "GET",
      ...fetchOptions,
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch student profile")
    }
    return response.json()
  },

  getEditableProfile: async () => {
    const response = await fetch(`${baseUrl}/student-profile/editable`, {
      method: "GET",
      ...fetchOptions,
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch editable profile")
    }
    return response.json()
  },

  updateProfile: async (data) => {
    const response = await fetch(`${baseUrl}/student-profile/`, {
      method: "PUT",
      ...fetchOptions,
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to update profile")
    }
    return response.json()
  },

  // get family details
  getFamilyMembers: async () => {
    const response = await fetch(`${baseUrl}/student-profile/family-members`, {
      method: "GET",
      ...fetchOptions,
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch family members")
    }
    return response.json()
  },

  // add family member
  addFamilyMember: async (data) => {
    const response = await fetch(`${baseUrl}/student-profile/family-members`, {
      method: "POST",
      ...fetchOptions,
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to add family member")
    }
    return response.json()
  },

  // update family member
  updateFamilyMember: async (id, data) => {
    const response = await fetch(`${baseUrl}/student-profile/family-members/${id}`, {
      method: "PUT",
      ...fetchOptions,
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to update family member")
    }
    return response.json()
  },

  // delete family member
  deleteFamilyMember: async (id) => {
    const response = await fetch(`${baseUrl}/student-profile/family-members/${id}`, {
      method: "DELETE",
      ...fetchOptions,
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to delete family member")
    }
    return response.json()
  },

  // get health details
  getHealthDetails: async () => {
    const response = await fetch(`${baseUrl}/student-profile/health`, {
      method: "GET",
      ...fetchOptions,
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch health details")
    }
    return response.json()
  },
}
