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

  // GET /student-profile/editable
  /**
     * response
     * {
  "success": true,
  "data": {
    // Only contains editable fields, may include:
    "name": "John Doe",
    "profileImage": "https://example.com/profile123.jpg",
    "gender": "Male",
    "dateOfBirth": "2000-01-15",
    "address": "123 Campus Avenue"
  },
  "editableFields": [
    // List of fields the student can edit
    "profileImage",
    "dateOfBirth",
    "address"
  ]
}
     */
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

  /**
 * 
 * data = {
  // Only include fields you want to update
  "name": "John Smith",
  "profileImage": "https://example.com/newprofile.jpg",
  "gender": "Male", // Must be "Male", "Female", or "Other"
  "dateOfBirth": "2000-01-20", // Format: YYYY-MM-DD
  "address": "456 University Lane"
}
 */

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
}
