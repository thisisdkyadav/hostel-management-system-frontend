/**
 * Student Profile API Module
 * Handles student profile, family members, and health details
 */

import apiClient from "../core/apiClient"

export const studentProfileApi = {
  /**
   * Get editable profile fields
   */
  getEditableProfile: () => {
    return apiClient.get("/students/profile/editable")
  },

  /**
   * Update student profile
   * @param {Object} data - Profile data to update
   */
  updateProfile: (data) => {
    return apiClient.put("/students/profile/", data)
  },

  /**
   * Get family members
   */
  getFamilyMembers: () => {
    return apiClient.get("/students/profile/family-members")
  },

  /**
   * Add family member
   * @param {Object} data - Family member data
   */
  addFamilyMember: (data) => {
    return apiClient.post("/students/profile/family-members", data)
  },

  /**
   * Update family member
   * @param {string} id - Family member ID
   * @param {Object} data - Updated family member data
   */
  updateFamilyMember: (id, data) => {
    return apiClient.put(`/students/profile/family-members/${id}`, data)
  },

  /**
   * Delete family member
   * @param {string} id - Family member ID
   */
  deleteFamilyMember: (id) => {
    return apiClient.delete(`/students/profile/family-members/${id}`)
  },

  /**
   * Get health details
   */
  getHealthDetails: () => {
    return apiClient.get("/students/profile/health")
  },
}

export default studentProfileApi
